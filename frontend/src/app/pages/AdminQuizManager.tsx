import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  ChevronDown, 
  ChevronUp,
  Image as ImageIcon,
  AlertCircle
} from "lucide-react";
import {
  getAllQuizExercises,
  createQuizExercise,
  updateQuizExercise,
  deleteQuizExercise,
  type QuizExerciseData,
  type QuizQuestion,
} from "../utils/storage";
import { MOCK_COURSES } from "../data";

export function AdminQuizManager() {
  const [quizzes, setQuizzes] = useState<QuizExerciseData[]>(getAllQuizExercises());
  const [isCreating, setIsCreating] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);
  const [expandedQuizId, setExpandedQuizId] = useState<number | null>(null);

  const refreshQuizzes = () => {
    setQuizzes(getAllQuizExercises());
  };

  const handleDeleteQuiz = (quizId: number) => {
    if (confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      deleteQuizExercise(quizId);
      refreshQuizzes();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Quiz Manager
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              Create, edit, and manage all quiz exercises
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create New Quiz
          </button>
        </div>

        {/* Quiz List */}
        <div className="space-y-4">
          {quizzes.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-12 text-center border border-neutral-200 dark:border-neutral-800">
              <AlertCircle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                No quizzes yet
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Create your first quiz to get started
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Quiz
              </button>
            </div>
          ) : (
            quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                isExpanded={expandedQuizId === quiz.id}
                onToggleExpand={() => setExpandedQuizId(expandedQuizId === quiz.id ? null : quiz.id)}
                onEdit={() => setEditingQuizId(quiz.id)}
                onDelete={() => handleDeleteQuiz(quiz.id)}
              />
            ))
          )}
        </div>

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {(isCreating || editingQuizId) && (
            <QuizEditorModal
              quiz={editingQuizId ? quizzes.find(q => q.id === editingQuizId) : undefined}
              onClose={() => {
                setIsCreating(false);
                setEditingQuizId(null);
              }}
              onSave={() => {
                refreshQuizzes();
                setIsCreating(false);
                setEditingQuizId(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

type QuizCardProps = {
  quiz: QuizExerciseData;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function QuizCard({ quiz, isExpanded, onToggleExpand, onEdit, onDelete }: QuizCardProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              {quiz.title}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              {quiz.description}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 text-xs font-medium rounded-lg">
                {quiz.courseTitle}
              </span>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-lg">
                {quiz.lessonTitle}
              </span>
              <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-lg">
                {quiz.questions.length} questions
              </span>
              <span className="px-2 py-1 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 text-xs font-medium rounded-lg">
                {quiz.passingScore}% to pass
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
              title="Edit quiz"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
              title="Delete quiz"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onToggleExpand}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Questions */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-neutral-200 dark:border-neutral-800"
          >
            <div className="p-6 bg-neutral-50 dark:bg-neutral-950 space-y-4">
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                Questions Preview
              </h4>
              {quiz.questions.map((question, idx) => (
                <div
                  key={question.id}
                  className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800"
                >
                  <div className="flex items-start gap-3">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 shrink-0">
                      {idx + 1}.
                    </span>
                    <div className="flex-1">
                      <p className="text-neutral-900 dark:text-neutral-100 mb-2">{question.question}</p>
                      {question.imageUrl && (
                        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 mb-2">
                          <ImageIcon className="w-4 h-4" />
                          <span>Has image</span>
                        </div>
                      )}
                      <ul className="space-y-1 text-sm">
                        {question.options.map((option, optIdx) => (
                          <li
                            key={optIdx}
                            className={`${
                              option === question.correctAnswer
                                ? "text-emerald-700 dark:text-emerald-400 font-semibold"
                                : "text-neutral-600 dark:text-neutral-400"
                            }`}
                          >
                            {option} {option === question.correctAnswer && "✓"}
                          </li>
                        ))}
                      </ul>
                      {question.explanation && (
                        <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2 italic">
                          Explanation: {question.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type QuizEditorModalProps = {
  quiz?: QuizExerciseData;
  onClose: () => void;
  onSave: () => void;
};

function QuizEditorModal({ quiz, onClose, onSave }: QuizEditorModalProps) {
  const isEditing = !!quiz;
  const [isSaving, setIsSaving] = useState(false);

  const nextQuizId = getAllQuizExercises().reduce((maxId, currentQuiz) => Math.max(maxId, currentQuiz.id), 0) + 1;
  
  const [formData, setFormData] = useState<Omit<QuizExerciseData, 'createdAt' | 'updatedAt'>>({
    id: quiz?.id || nextQuizId,
    title: quiz?.title || "",
    description: quiz?.description || "",
    courseId: quiz?.courseId || 0,
    courseTitle: quiz?.courseTitle || "",
    lessonTitle: quiz?.lessonTitle || "",
    passingScore: quiz?.passingScore || 70,
    questions: quiz?.questions || [],
  });

  const getNextQuestionId = () => {
    const maxFormQuestionId = formData.questions.reduce((maxId, question) => Math.max(maxId, question.id), 0);
    return maxFormQuestionId + 1;
  };

  const [currentQuestion, setCurrentQuestion] = useState<Partial<QuizQuestion>>({
    id: getNextQuestionId(),
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    imageUrl: "",
    explanation: "",
  });

  const handleAddQuestion = () => {
    if (!currentQuestion.question || currentQuestion.options?.some(o => !o.trim())) {
      alert("Please fill in the question and all options");
      return;
    }
    if (!currentQuestion.correctAnswer) {
      alert("Please select a correct answer");
      return;
    }

    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          id: currentQuestion.id || getNextQuestionId(),
          question: currentQuestion.question,
          options: currentQuestion.options || [],
          correctAnswer: currentQuestion.correctAnswer,
          imageUrl: currentQuestion.imageUrl || undefined,
          explanation: currentQuestion.explanation || undefined,
        } as QuizQuestion,
      ],
    });

    // Reset current question
    setCurrentQuestion({
      id: getNextQuestionId() + 1,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      imageUrl: "",
      explanation: "",
    });
  };

  const handleRemoveQuestion = (questionId: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter(q => q.id !== questionId),
    });
  };

  const handleSave = () => {
    if (!formData.title || !formData.description || !formData.courseId || !formData.courseTitle || !formData.lessonTitle) {
      alert("Please fill in all required fields");
      return;
    }
    if (formData.questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    const saveAsync = async () => {
      setIsSaving(true);
      try {
        const apiBase =
          import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
          `${window.location.protocol}//${window.location.hostname}:8000`;

        // Resolve lesson_id needed by backend quizzes table.
        const lessonsRes = await fetch(`${apiBase}/api/lessons/`);
        if (!lessonsRes.ok) {
          const err = await lessonsRes.json().catch(() => ({}));
          throw new Error(err.detail || "Failed to load lessons from backend.");
        }

        const lessons: Array<{ id: number; name: string; course_id?: number }> = await lessonsRes.json();
        const matchedLesson = lessons.find((lesson) => lesson.name === formData.lessonTitle);
        if (!matchedLesson) {
          throw new Error("No backend lesson matches the provided Lesson Title. Create/select a backend lesson first.");
        }

        if (isEditing) {
          // Keep existing behavior for edits in local storage.
          updateQuizExercise(formData.id, formData);
          onSave();
          return;
        }

        const createQuizRes = await fetch(`${apiBase}/api/quizzes/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lesson_id: matchedLesson.id,
            title: formData.title,
            passing_score: formData.passingScore,
          }),
        });

        if (!createQuizRes.ok) {
          const err = await createQuizRes.json().catch(() => ({}));
          throw new Error(err.detail || "Failed to create quiz in backend.");
        }

        const createdQuiz: { id: number; title: string; passing_score: number } = await createQuizRes.json();

        const createdQuestions: QuizQuestion[] = [];
        for (const question of formData.questions) {
          const createQuestionRes = await fetch(`${apiBase}/api/questions/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              quiz_id: createdQuiz.id,
              question_text: question.question,
              answers: question.options,
              correct_answer: question.correctAnswer,
            }),
          });

          if (!createQuestionRes.ok) {
            const err = await createQuestionRes.json().catch(() => ({}));
            throw new Error(err.detail || "Failed to create one of the questions in backend.");
          }

          const createdQuestion: { id: number } = await createQuestionRes.json();
          createdQuestions.push({
            ...question,
            id: createdQuestion.id,
          });
        }

        // Keep local storage in sync for existing UI lists, but with DB-generated IDs.
        createQuizExercise({
          ...formData,
          id: createdQuiz.id,
          title: createdQuiz.title,
          passingScore: createdQuiz.passing_score,
          questions: createdQuestions,
        });

        onSave();
      } catch (error) {
        alert(error instanceof Error ? error.message : "Failed to save quiz.");
      } finally {
        setIsSaving(false);
      }
    };

    void saveAsync();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 p-6 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {isEditing ? "Edit Quiz" : "Create New Quiz"}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Quiz Details */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Quiz Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Quiz Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100"
                placeholder="e.g., Digital Marketing Fundamentals Quiz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100"
                rows={2}
                placeholder="Brief description of the quiz"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Course *
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) => {
                    const parsedCourseId = Number(e.target.value);
                    const course = MOCK_COURSES.find(c => c.id === parsedCourseId);
                    setFormData({
                      ...formData,
                      courseId: parsedCourseId,
                      courseTitle: course?.title || "",
                    });
                  }}
                  className="w-full px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100"
                >
                  <option value="">Select a course</option>
                  {MOCK_COURSES.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  value={formData.lessonTitle}
                  onChange={(e) => setFormData({ ...formData, lessonTitle: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100"
                  placeholder="e.g., Introduction to AdOps"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Passing Score (%) *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.passingScore}
                onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) || 70 })}
                className="w-full px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Questions List */}
          {formData.questions.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Questions ({formData.questions.length})
              </h3>
              <div className="space-y-3">
                {formData.questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {idx + 1}. {q.question}
                      </p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                        Answer: {q.correctAnswer}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Question Form */}
          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Add Question</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Question Text *
                </label>
                <input
                  type="text"
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100"
                  placeholder="Enter your question"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Image URL (optional)
                </label>
                <input
                  type="text"
                  value={currentQuestion.imageUrl}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Options * (4 required)
                </label>
                <div className="space-y-2">
                  {currentQuestion.options?.map((option, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={currentQuestion.correctAnswer === option && option !== ""}
                        onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: option })}
                        className="w-4 h-4"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(currentQuestion.options || [])];
                          newOptions[idx] = e.target.value;
                          setCurrentQuestion({ ...currentQuestion, options: newOptions });
                        }}
                        className="flex-1 px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100"
                        placeholder={`Option ${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
                  Select the radio button next to the correct answer
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Explanation (optional)
                </label>
                <textarea
                  value={currentQuestion.explanation}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100"
                  rows={2}
                  placeholder="Explain why this is the correct answer"
                />
              </div>

              <button
                onClick={handleAddQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : isEditing ? "Update Quiz" : "Create Quiz"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
