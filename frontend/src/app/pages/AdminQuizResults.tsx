<<<<<<< HEAD
import { useState, useMemo } from "react";
=======
import { useEffect, useMemo, useState } from "react";
>>>>>>> 93a29b2 (Progress fixed)
import { motion } from "motion/react";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  Award,
  Filter,
} from "lucide-react";
<<<<<<< HEAD
import {
  getQuizResults,
  getAllQuizExercises,
  type QuizResult,
} from "../utils/storage";

export function AdminQuizResults() {
  const [results] = useState<QuizResult[]>(getQuizResults());
  const [quizzes] = useState(getAllQuizExercises());
=======

type AdminResult = {
  id: number;
  profileId: number;
  userName: string;
  exerciseId: number;
  exerciseTitle: string;
  courseId: number;
  courseTitle: string;
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  timestamp: string;
  attemptNumber: number;
  answers?: Array<{
    questionId: number;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
};

type StudentOption = {
  id: number;
  name: string;
};

type CourseFilterOption = {
  id: number;
  name: string;
};

type QuizFilterOption = {
  id: number;
  title: string;
};

export function AdminQuizResults() {
  const [results, setResults] = useState<AdminResult[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [courses, setCourses] = useState<CourseFilterOption[]>([]);
  const [quizzes, setQuizzes] = useState<QuizFilterOption[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedStudentId, setSelectedStudentId] = useState<number | "all">("all");
  const [selectedCourseId, setSelectedCourseId] = useState<number | "all">("all");
>>>>>>> 93a29b2 (Progress fixed)
  const [selectedQuizId, setSelectedQuizId] = useState<number | "all">("all");
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "score">("date");

<<<<<<< HEAD
  // Filter and sort results
  const filteredResults = useMemo(() => {
    let filtered = selectedQuizId === "all" 
      ? results 
      : results.filter(r => r.exerciseId === selectedQuizId);
=======
  useEffect(() => {
    const loadAdminResults = async () => {
      const apiBase =
        import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
        `${window.location.protocol}//${window.location.hostname}:8000`;

      setIsLoading(true);
      setLoadError(null);

      try {
        const [
          resultsRes,
          profilesRes,
          quizzesRes,
          lessonsRes,
          coursesRes,
        ] = await Promise.all([
          fetch(`${apiBase}/api/results/`, { credentials: "include" }),
          fetch(`${apiBase}/api/profiles/`, { credentials: "include" }),
          fetch(`${apiBase}/api/quizzes/`, { credentials: "include" }),
          fetch(`${apiBase}/api/lessons/`, { credentials: "include" }),
          fetch(`${apiBase}/api/courses/`, { credentials: "include" }),
        ]);

        const responses = [resultsRes, profilesRes, quizzesRes, lessonsRes, coursesRes];
        const firstFailed = responses.find((res) => !res.ok);
        if (firstFailed) {
          const err = await firstFailed.json().catch(() => ({}));
          throw new Error(err.detail || "Failed to load admin quiz results.");
        }

        const backendResults = (await resultsRes.json()) as Array<{
          id: number;
          profile_id: number;
          quiz_id: number;
          score: number | null;
          passed: boolean;
          attempt_num: number;
          completed_at: string;
          number_correct: number;
          total_questions: number;
        }>;

        const backendProfiles = (await profilesRes.json()) as Array<{
          id: number;
          full_name?: string;
          email?: string;
        }>;

        const backendQuizzes = (await quizzesRes.json()) as Array<{
          id: number;
          lesson_id: number;
          title: string;
        }>;

        const backendLessons = (await lessonsRes.json()) as Array<{
          id: number;
          name: string;
          course_id?: number;
        }>;

        const backendCourses = (await coursesRes.json()) as Array<{
          id: number;
          name: string;
        }>;

        const profilesById = new Map(backendProfiles.map((profile) => [profile.id, profile]));
        const quizzesById = new Map(backendQuizzes.map((quiz) => [quiz.id, quiz]));
        const lessonsById = new Map(backendLessons.map((lesson) => [lesson.id, lesson]));
        const coursesById = new Map(backendCourses.map((course) => [course.id, course]));

        const mappedResults: AdminResult[] = backendResults.map((result) => {
          const profile = profilesById.get(result.profile_id);
          const quiz = quizzesById.get(result.quiz_id);
          const lesson = quiz ? lessonsById.get(quiz.lesson_id) : undefined;
          const resolvedCourseId = Number(lesson?.course_id ?? 0);
          const course = coursesById.get(resolvedCourseId);

          return {
            id: result.id,
            profileId: result.profile_id,
            userName: profile?.full_name || profile?.email || `Student #${result.profile_id}`,
            exerciseId: result.quiz_id,
            exerciseTitle: quiz?.title || `Quiz #${result.quiz_id}`,
            courseId: resolvedCourseId,
            courseTitle: course?.name || "Unknown Course",
            score: Number(result.score ?? 0),
            passed: result.passed,
            totalQuestions: result.total_questions,
            correctAnswers: result.number_correct,
            timestamp: result.completed_at,
            attemptNumber: result.attempt_num,
          };
        });

        const uniqueStudents = Array.from(
          new Map(
            mappedResults.map((result) => [result.profileId, { id: result.profileId, name: result.userName }]),
          ).values(),
        ).sort((a, b) => a.name.localeCompare(b.name));

        const uniqueCourses = Array.from(
          new Map(
            mappedResults
              .filter((result) => result.courseId > 0)
              .map((result) => [result.courseId, { id: result.courseId, name: result.courseTitle }]),
          ).values(),
        ).sort((a, b) => a.name.localeCompare(b.name));

        const uniqueQuizzes = Array.from(
          new Map(
            mappedResults.map((result) => [result.exerciseId, { id: result.exerciseId, title: result.exerciseTitle }]),
          ).values(),
        ).sort((a, b) => a.title.localeCompare(b.title));

        setResults(mappedResults);
        setStudents(uniqueStudents);
        setCourses(uniqueCourses);
        setQuizzes(uniqueQuizzes);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "Failed to load admin quiz results.");
        setResults([]);
        setStudents([]);
        setCourses([]);
        setQuizzes([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadAdminResults();
  }, []);

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let filtered = selectedStudentId === "all"
      ? results
      : results.filter((result) => result.profileId === selectedStudentId);

    if (selectedCourseId !== "all") {
      filtered = filtered.filter((result) => result.courseId === selectedCourseId);
    }

    if (selectedQuizId !== "all") {
      filtered = filtered.filter((result) => result.exerciseId === selectedQuizId);
    }
>>>>>>> 93a29b2 (Progress fixed)

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else {
        return b.score - a.score;
      }
    });

    return filtered;
<<<<<<< HEAD
  }, [results, selectedQuizId, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    const filtered = selectedQuizId === "all" 
      ? results 
      : results.filter(r => r.exerciseId === selectedQuizId);
=======
  }, [results, selectedStudentId, selectedCourseId, selectedQuizId, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    let filtered = selectedStudentId === "all"
      ? results
      : results.filter((result) => result.profileId === selectedStudentId);

    if (selectedCourseId !== "all") {
      filtered = filtered.filter((result) => result.courseId === selectedCourseId);
    }

    if (selectedQuizId !== "all") {
      filtered = filtered.filter((result) => result.exerciseId === selectedQuizId);
    }
>>>>>>> 93a29b2 (Progress fixed)

    const totalAttempts = filtered.length;
    const passedAttempts = filtered.filter(r => r.passed).length;
    const avgScore = totalAttempts > 0
      ? Math.round(filtered.reduce((sum, r) => sum + r.score, 0) / totalAttempts)
      : 0;
    const passRate = totalAttempts > 0
      ? Math.round((passedAttempts / totalAttempts) * 100)
      : 0;

    return {
      totalAttempts,
      passedAttempts,
      avgScore,
      passRate,
    };
<<<<<<< HEAD
  }, [results, selectedQuizId]);
=======
  }, [results, selectedStudentId, selectedCourseId, selectedQuizId]);
>>>>>>> 93a29b2 (Progress fixed)

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Student Quiz Results
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            View and analyze student quiz performance
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-neutral-400" />
<<<<<<< HEAD
            <div className="flex-1 flex items-center gap-4">
=======
            <div className="flex-1 flex items-center gap-4 flex-wrap">
              <select
                value={selectedStudentId === "all" ? "all" : String(selectedStudentId)}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedStudentId(value === "all" ? "all" : Number(value));
                }}
                className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100"
              >
                <option value="all">All Students</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                ))}
              </select>

              <select
                value={selectedCourseId === "all" ? "all" : String(selectedCourseId)}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedCourseId(value === "all" ? "all" : Number(value));
                }}
                className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100"
              >
                <option value="all">All Courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>

>>>>>>> 93a29b2 (Progress fixed)
              <select
                value={selectedQuizId === "all" ? "all" : String(selectedQuizId)}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedQuizId(value === "all" ? "all" : Number(value));
                }}
                className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100"
              >
                <option value="all">All Quizzes</option>
<<<<<<< HEAD
                {quizzes.map(quiz => (
=======
                {quizzes.map((quiz) => (
>>>>>>> 93a29b2 (Progress fixed)
                  <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date" | "score")}
                className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100"
              >
                <option value="date">Sort by Date</option>
                <option value="score">Sort by Score</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Total Attempts"
            value={stats.totalAttempts.toString()}
            color="blue"
          />
          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            label="Passed Attempts"
            value={stats.passedAttempts.toString()}
            color="emerald"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Average Score"
            value={`${stats.avgScore}%`}
            color="purple"
          />
          <StatCard
            icon={<Award className="w-6 h-6" />}
            label="Pass Rate"
            value={`${stats.passRate}%`}
            color="pink"
          />
        </div>

        {/* Results List */}
        <div className="space-y-4">
<<<<<<< HEAD
          {filteredResults.length === 0 ? (
=======
          {isLoading ? (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-12 text-center border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
              Loading results...
            </div>
          ) : loadError ? (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-12 text-center border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400">
              {loadError}
            </div>
          ) : filteredResults.length === 0 ? (
>>>>>>> 93a29b2 (Progress fixed)
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-12 text-center border border-neutral-200 dark:border-neutral-800">
              <Users className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                No results yet
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Student quiz results will appear here
              </p>
            </div>
          ) : (
            filteredResults.map((result) => (
              <ResultCard
                key={`${result.exerciseId}-${result.timestamp}`}
                result={result}
                isExpanded={expandedResultId === `${result.exerciseId}-${result.timestamp}`}
                onToggleExpand={() =>
                  setExpandedResultId(
                    expandedResultId === `${result.exerciseId}-${result.timestamp}`
                      ? null
                      : `${result.exerciseId}-${result.timestamp}`
                  )
                }
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "blue" | "emerald" | "purple" | "pink";
};

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
    emerald: "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
    purple: "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
    pink: "bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400",
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
      <div className={`p-3 rounded-xl ${colorClasses[color]} w-fit mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
        {value}
      </p>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{label}</p>
    </div>
  );
}

type ResultCardProps = {
<<<<<<< HEAD
  result: QuizResult;
=======
  result: AdminResult;
>>>>>>> 93a29b2 (Progress fixed)
  isExpanded: boolean;
  onToggleExpand: () => void;
};

function ResultCard({ result, isExpanded, onToggleExpand }: ResultCardProps) {
  const date = new Date(result.timestamp);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {result.userName || "Current User"}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  result.passed
                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                    : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400"
                }`}
              >
                {result.passed ? "PASSED" : "FAILED"}
              </span>
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
              {result.exerciseTitle} • {result.courseTitle}
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {result.score}%
                </div>
              </div>
              <div className="flex flex-col text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">
                  {result.correctAnswers} / {result.totalQuestions} correct
                </span>
                <span className="text-neutral-500 dark:text-neutral-500">
                  Attempt #{result.attemptNumber} • {formattedDate}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onToggleExpand}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                result.passed
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                  : "bg-gradient-to-r from-red-500 to-red-600"
              }`}
              style={{ width: `${result.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && result.answers && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-6"
        >
          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Detailed Answers
          </h4>
          <div className="space-y-3">
            {result.answers.map((answer, idx) => (
              <div
                key={answer.questionId}
                className={`p-4 rounded-xl border-2 ${
                  answer.isCorrect
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                    : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                }`}
              >
                <div className="flex items-start gap-3">
                  {answer.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                      Question {idx + 1}
                    </p>
                    {!answer.isCorrect && (
                      <div className="text-sm space-y-1">
                        <p className="text-red-700 dark:text-red-400">
                          Student's answer:{" "}
                          <span className="font-semibold">
                            {answer.selectedAnswer || "No answer"}
                          </span>
                        </p>
                        <p className="text-emerald-700 dark:text-emerald-400">
                          Correct answer:{" "}
                          <span className="font-semibold">{answer.correctAnswer}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
