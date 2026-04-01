import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronRight, ChevronLeft, CheckCircle, XCircle, Trophy, RotateCcw } from "lucide-react";

export type QuizQuestion = {
  id: number;
  question: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
};

export type QuizExercise = {
  id?: number;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore?: number; // percentage needed to pass (default 70)
  courseId?: number;
  courseTitle?: string; // Add course title
};

type ExerciseQuizProps = {
  exercise: QuizExercise;
  onClose: () => void;
  onComplete?: (score: number, passed: boolean) => void;
};

export function ExerciseQuiz({ exercise, onClose, onComplete }: ExerciseQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [backendResult, setBackendResult] = useState<{
    score: number;
    passed: boolean;
    number_correct: number;
    total_questions: number;
    attempt_num: number;
    passing_score: number;
  } | null>(null);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  const normalizeIntegerId = (value: unknown): number | null => {
    if (typeof value === "number" && Number.isInteger(value)) {
      return value;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();

      if (/^-?\d+$/.test(trimmed)) {
        const parsed = Number(trimmed);
        return Number.isInteger(parsed) ? parsed : null;
      }

      const match = trimmed.match(/-?\d+/);
      if (match) {
        const parsed = Number(match[0]);
        return Number.isInteger(parsed) ? parsed : null;
      }
    }

    return null;
  };

  const formatApiError = (errorData: unknown): string => {
    if (!errorData || typeof errorData !== "object") {
      return "Failed to submit quiz result";
    }

    const data = errorData as { detail?: unknown; error?: unknown; message?: unknown };

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      const messages = data.detail
        .map((entry) => {
          if (!entry || typeof entry !== "object") {
            return null;
          }

          const maybeValidation = entry as { loc?: unknown; msg?: unknown };
          if (typeof maybeValidation.msg !== "string") {
            return null;
          }

          if (Array.isArray(maybeValidation.loc)) {
            const field = maybeValidation.loc
              .filter((part): part is string | number => typeof part === "string" || typeof part === "number")
              .join(".");
            return field ? `${field}: ${maybeValidation.msg}` : maybeValidation.msg;
          }

          return maybeValidation.msg;
        })
        .filter((msg): msg is string => Boolean(msg));

      if (messages.length > 0) {
        return messages.join(" | ");
      }
    }

    if (typeof data.error === "string") {
      return data.error;
    }

    if (typeof data.message === "string") {
      return data.message;
    }

    return "Failed to submit quiz result";
  };

  const isQuizNotFoundError = (message: string): boolean => {
    const normalized = message.trim().toLowerCase();
    return normalized.includes("quiz not found") || normalized.includes("quiz_id") && normalized.includes("not found");
  };

  const currentQuestion = exercise.questions[currentQuestionIndex];
  const totalQuestions = exercise.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const passingScore = exercise.passingScore || 70;

  const calculateScore = () => {
    let correct = 0;
    exercise.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / totalQuestions) * 100);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setDirection("forward");
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setDirection("backward");
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    const localScore = calculateScore();
    const localPassed = localScore >= passingScore;
    const normalizedQuizId = normalizeIntegerId(exercise.id);

    if (!exercise.id) {
      // Local/fallback quizzes can still be completed even when they do not map to backend IDs.
      setSubmitError(null);
      setBackendResult(null);
      setShowResults(true);
      onComplete?.(localScore, localPassed);
      return;
    }

    if (normalizedQuizId === null) {
      setSubmitError("Quiz ID must be a valid integer to submit to backend.");
      return;
    }

    const payloadAnswers: { question_id: number; selected_answer: string }[] = [];
    for (const question of exercise.questions) {
      const selected = selectedAnswers[question.id];
      if (!selected) {
        setSubmitError("Please answer all questions before submitting.");
        return;
      }

      const normalizedQuestionId = normalizeIntegerId(question.id);
      if (normalizedQuestionId === null) {
        setSubmitError(`Question ID \"${String(question.id)}\" is invalid and cannot be submitted.`);
        return;
      }

      payloadAnswers.push({
        question_id: normalizedQuestionId,
        selected_answer: selected,
      });
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const apiBase = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

      const res = await fetch(`${apiBase}/api/results/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: 1,
          quiz_id: normalizedQuizId,
          answers: payloadAnswers,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const message = formatApiError(errorData);

        // Some quizzes are available only in frontend mock data and are not seeded in backend.
        // In that case, complete locally instead of blocking the user.
        if (isQuizNotFoundError(message)) {
          setBackendResult(null);
          setShowResults(true);
          onComplete?.(localScore, localPassed);
          return;
        }

        throw new Error(message);
      }

      const data = await res.json();
      setBackendResult(data);
      setShowResults(true);
      onComplete?.(data.score, data.passed);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unexpected error while submitting quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setSubmitError(null);
    setBackendResult(null);
  };

  const handleSelectAnswer = (option: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: option,
    });
  };

  const slideVariants = {
    enter: (direction: "forward" | "backward") => ({
      x: direction === "forward" ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: "forward" | "backward") => ({
      x: direction === "forward" ? -300 : 300,
      opacity: 0,
    }),
  };

  if (showResults) {
    const score = backendResult?.score ?? calculateScore();
    const passed = backendResult?.passed ?? (score >= passingScore);
    const correctCount = backendResult?.number_correct ?? Math.round((score / 100) * totalQuestions);
    const displayedPassingScore = backendResult?.passing_score ?? passingScore;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 p-8 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${passed ? 'bg-emerald-500' : 'bg-orange-500'}`}>
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {passed ? 'Congratulations!' : 'Keep Practicing!'}
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {exercise.title}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Score Display */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Your Score</span>
                <span className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{score}%</span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${passed ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-orange-500 to-orange-600'}`}
                />
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
                {correctCount} out of {backendResult?.total_questions ?? totalQuestions} questions correct • Passing score: {displayedPassingScore}%
              </p>
              {backendResult && (
                <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                  Attempt #{backendResult.attempt_num}
                </p>
              )}
            </div>
          </div>

          {/* Results Body */}
          <div className="p-8 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4">Review Answers</h3>
            <div className="space-y-4">
              {exercise.questions.map((q, idx) => {
                const userAnswer = selectedAnswers[q.id];
                const isCorrect = userAnswer === q.correctAnswer;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border-2 ${isCorrect ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'}`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                          {idx + 1}. {q.question}
                        </p>
                        {!isCorrect && (
                          <div className="text-sm space-y-1">
                            <p className="text-red-700 dark:text-red-400">
                              Your answer: <span className="font-semibold">{userAnswer || "No answer"}</span>
                            </p>
                            <p className="text-emerald-700 dark:text-emerald-400">
                              Correct answer: <span className="font-semibold">{q.correctAnswer}</span>
                            </p>
                          </div>
                        )}
                        {q.explanation && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 italic">
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-neutral-50 dark:bg-neutral-950">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Quiz
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-xl transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 p-6 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{exercise.title}</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{exercise.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%
                </span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="p-8 min-h-[400px] relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQuestionIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Question */}
              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                  {currentQuestion.question}
                </h3>

                {/* Image if exists */}
                {currentQuestion.imageUrl && (
                  <div className="mb-6 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
                    <img
                      src={currentQuestion.imageUrl}
                      alt="Question illustration"
                      className="w-full h-auto max-h-64 object-contain bg-neutral-50 dark:bg-neutral-950"
                    />
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === option;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(option)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? "bg-pink-50 dark:bg-pink-950/20 border-pink-500 dark:border-pink-600"
                          : "bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 hover:border-pink-300 dark:hover:border-pink-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "border-pink-500 bg-pink-500"
                              : "border-neutral-300 dark:border-neutral-600"
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className="text-neutral-900 dark:text-neutral-100 font-medium">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-neutral-50 dark:bg-neutral-950">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex gap-2">
            {exercise.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentQuestionIndex ? "forward" : "backward");
                  setCurrentQuestionIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentQuestionIndex
                    ? "bg-pink-500 w-6"
                    : selectedAnswers[exercise.questions[idx].id]
                    ? "bg-pink-300 dark:bg-pink-700"
                    : "bg-neutral-300 dark:bg-neutral-700"
                }`}
              />
            ))}
          </div>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length !== totalQuestions || isSubmitting}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
              <CheckCircle className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-xl transition-colors shadow-sm"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
        {submitError && (
          <div className="px-6 pb-6 bg-neutral-50 dark:bg-neutral-950">
            <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}