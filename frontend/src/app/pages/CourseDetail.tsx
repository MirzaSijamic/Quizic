import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Play, FileText, PenTool, ShieldAlert, ChevronRight, Plus, X, Users } from "lucide-react";
import { MOCK_COURSES } from "../data";
import { ExerciseQuiz, type QuizExercise } from "../components/ExerciseQuiz";
import { getQuizExercisesByCourse, type QuizExerciseData } from "../utils/storage";

export function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Support inheriting Admin view state from previous page, but allow toggling here
  const [isAdminView, setIsAdminView] = useState(location.state?.isAdminView || false);
  const [, setForceRender] = useState(0);

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");

  const [showResourceModal, setShowResourceModal] = useState(false);
  const [activeLessonIdx, setActiveLessonIdx] = useState<number | null>(null);
  const [resourceType, setResourceType] = useState<"videos" | "materials" | "exercises">("videos");
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");

  const [activeQuiz, setActiveQuiz] = useState<QuizExercise | null>(null);
  const [storageQuizzes, setStorageQuizzes] = useState<QuizExerciseData[]>([]);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [quizLoadError, setQuizLoadError] = useState<string | null>(null);

  const course = MOCK_COURSES.find((c) => c.id === courseId);

  // Load quizzes from storage for this course
  useEffect(() => {
    if (courseId) {
      const quizzes = getQuizExercisesByCourse(courseId);
      setStorageQuizzes(quizzes);
    }
  }, [courseId]);

  // Helper to find quiz by lesson title
  const getQuizForLesson = (lessonTitle: string) => {
    return storageQuizzes.find(q => q.lessonTitle === lessonTitle);
  };

  const normalizeOptions = (answers: unknown): string[] => {
    if (Array.isArray(answers)) {
      return answers.map((value) => String(value));
    }

    if (answers && typeof answers === "object") {
      return Object.values(answers as Record<string, unknown>).map((value) => String(value));
    }

    return [];
  };

  const loadQuizFromBackend = async (
    rawQuizId: string,
    fallbackMeta: Pick<QuizExercise, "title" | "description">,
  ) => {
    const quizId = Number(rawQuizId);
    if (!Number.isInteger(quizId)) {
      throw new Error("Quiz ID is not numeric, cannot load this quiz from backend.");
    }

    const apiBase = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

    const [quizRes, questionsRes] = await Promise.all([
      fetch(`${apiBase}/api/quizzes/${quizId}`),
      fetch(`${apiBase}/api/questions/quiz/${quizId}`),
    ]);

    if (!quizRes.ok) {
      const err = await quizRes.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to load quiz from backend.");
    }

    if (!questionsRes.ok) {
      const err = await questionsRes.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to load quiz questions from backend.");
    }

    const quiz = await quizRes.json();
    const questions = await questionsRes.json();

    const mappedQuiz: QuizExercise = {
      id: String(quiz.id),
      title: quiz.title || fallbackMeta.title,
      description: fallbackMeta.description,
      questions: questions.map((q: any) => ({
        id: String(q.id),
        question: q.question_text,
        options: normalizeOptions(q.answers),
        correctAnswer: q.correct_answer,
      })),
      passingScore: quiz.passing_score,
      courseId: course!.id,
      courseTitle: course!.title,
    };

    setActiveQuiz(mappedQuiz);
  };

  const openQuiz = async (
    rawQuizId: string,
    fallbackQuiz: Pick<QuizExercise, "title" | "description" | "questions" | "passingScore" | "courseId" | "courseTitle" | "id">,
  ) => {
    setQuizLoadError(null);
    setIsLoadingQuiz(true);

    try {
      await loadQuizFromBackend(rawQuizId, {
        title: fallbackQuiz.title,
        description: fallbackQuiz.description,
      });
    } catch (error) {
      setQuizLoadError(error instanceof Error ? error.message : "Failed to load quiz from backend.");
      setActiveQuiz({
        id: fallbackQuiz.id,
        title: fallbackQuiz.title,
        description: fallbackQuiz.description,
        questions: fallbackQuiz.questions,
        passingScore: fallbackQuiz.passingScore,
        courseId: fallbackQuiz.courseId,
        courseTitle: fallbackQuiz.courseTitle,
      });
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-neutral-500">
        <ShieldAlert className="w-12 h-12 text-pink-500" />
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">Course not found</h2>
        <button
          onClick={() => navigate("/lessons")}
          className="text-pink-600 hover:underline flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Go back to Lessons
        </button>
      </div>
    );
  }

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;

    course.lessons.push({
      title: newLessonTitle,
      videos: [],
      materials: [],
      exercises: []
    });

    setNewLessonTitle("");
    setShowLessonModal(false);
    setForceRender(p => p + 1);
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceTitle.trim() || activeLessonIdx === null) return;

    course.lessons[activeLessonIdx][resourceType].push({
      title: resourceTitle,
      url: resourceUrl || "#"
    });

    setResourceTitle("");
    setResourceUrl("");
    setShowResourceModal(false);
    setForceRender(p => p + 1);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/lessons")}
          className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors bg-white dark:bg-neutral-900 px-4 py-2 rounded-full shadow-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lessons
        </button>

        <div className="flex items-center gap-3 bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <button
            onClick={() => setIsAdminView(false)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!isAdminView ? 'bg-white dark:bg-neutral-900 text-[#e61972] shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
          >
            Student View
          </button>
          <button
            onClick={() => setIsAdminView(true)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isAdminView ? 'bg-white dark:bg-neutral-900 text-[#e61972] shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
          >
            <Users className="w-4 h-4" /> Admin
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-4">
        <div className="flex flex-wrap gap-3 items-center text-xs font-semibold uppercase tracking-wider mb-2">
          <span className="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 px-3 py-1 rounded-full">
            {course.level}
          </span>
          <span className={`px-3 py-1 rounded-full ${course.status === 'Finished' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
            {course.status}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
          {course.title}
        </h1>
        <p className="text-neutral-500 max-w-2xl text-lg">
          Explore the lessons within this course to build your skills and complete the required materials.
        </p>
      </div>

      <div className="space-y-6">
        {course.lessons.map((lesson, idx) => {
          const hasLinks = lesson.videos.length > 0 || lesson.materials.length > 0 || lesson.exercises.length > 0;
          const hasStorageQuizzes = storageQuizzes.filter(q => q.lessonTitle === lesson.title).length > 0;

          return (
            <div key={idx} className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200 dark:border-neutral-800 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-3">
                  <span className="text-pink-500 bg-pink-50 dark:bg-pink-900/20 px-3 py-1 rounded-xl text-lg">{idx + 1}</span>
                  {lesson.title}
                </h2>
                
                {isAdminView && (
                  <button
                    onClick={() => {
                      setActiveLessonIdx(idx);
                      setResourceType("videos");
                      setShowResourceModal(true);
                    }}
                    className="flex items-center gap-1.5 text-sm font-medium text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 px-3 py-1.5 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Resource
                  </button>
                )}
              </div>
              
              {!hasLinks && !hasStorageQuizzes && !isAdminView ? (
                <p className="text-neutral-400 italic px-4 py-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl text-center border border-dashed border-neutral-200 dark:border-neutral-700">
                  No materials or exercises attached to this lesson.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Videos */}
                  {(lesson.videos.length > 0 || isAdminView) && (
                    <div className="space-y-3 bg-neutral-50 dark:bg-neutral-950 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                          <Play className="w-4 h-4 text-blue-500" />
                          Videos
                        </h3>
                        {isAdminView && (
                          <button
                            onClick={() => {
                              setActiveLessonIdx(idx);
                              setResourceType("videos");
                              setShowResourceModal(true);
                            }}
                            className="p-1 rounded-md text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <ul className="space-y-2">
                        {lesson.videos.map((link, lIdx) => (
                          <li key={lIdx}>
                            <a href={link.url} className="flex items-start gap-2 p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-neutral-700 dark:text-neutral-300 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group">
                              <ChevronRight className="w-4 h-4 mt-0.5 opacity-50 group-hover:opacity-100 shrink-0 text-blue-500" />
                              <span className="text-sm font-medium leading-snug">{link.title}</span>
                            </a>
                          </li>
                        ))}
                        {lesson.videos.length === 0 && isAdminView && (
                          <p className="text-xs text-neutral-400 italic py-2">No videos yet</p>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Materials */}
                  {(lesson.materials.length > 0 || isAdminView) && (
                    <div className="space-y-3 bg-neutral-50 dark:bg-neutral-950 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-500" />
                          Materials
                        </h3>
                        {isAdminView && (
                          <button
                            onClick={() => {
                              setActiveLessonIdx(idx);
                              setResourceType("materials");
                              setShowResourceModal(true);
                            }}
                            className="p-1 rounded-md text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <ul className="space-y-2">
                        {lesson.materials.map((link, lIdx) => (
                          <li key={lIdx}>
                            <a href={link.url} className="flex items-start gap-2 p-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 text-neutral-700 dark:text-neutral-300 hover:text-purple-700 dark:hover:text-purple-300 transition-colors group">
                              <ChevronRight className="w-4 h-4 mt-0.5 opacity-50 group-hover:opacity-100 shrink-0 text-purple-500" />
                              <span className="text-sm font-medium leading-snug">{link.title}</span>
                            </a>
                          </li>
                        ))}
                        {lesson.materials.length === 0 && isAdminView && (
                          <p className="text-xs text-neutral-400 italic py-2">No materials yet</p>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Exercises */}
                  {(lesson.exercises.length > 0 || hasStorageQuizzes || isAdminView) && (
                    <div className="space-y-3 bg-neutral-50 dark:bg-neutral-950 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                          <PenTool className="w-4 h-4 text-pink-500" />
                          Exercises
                        </h3>
                        {isAdminView && (
                          <button
                            onClick={() => {
                              setActiveLessonIdx(idx);
                              setResourceType("exercises");
                              setShowResourceModal(true);
                            }}
                            className="p-1 rounded-md text-pink-500 hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <ul className="space-y-2">
                        {/* Hardcoded exercises from data.ts */}
                        {lesson.exercises.map((link, lIdx) => (
                          <li key={lIdx}>
                            {link.quiz ? (
                              <button
                                onClick={() => {
                                  const fallbackQuiz = link.quiz!;
                                  openQuiz(fallbackQuiz.id || "", {
                                    ...fallbackQuiz,
                                  });
                                }}
                                className="w-full flex items-start gap-2 p-2 rounded-xl hover:bg-pink-50 dark:hover:bg-pink-900/20 text-neutral-700 dark:text-neutral-300 hover:text-pink-700 dark:hover:text-pink-300 transition-colors group"
                              >
                                <ChevronRight className="w-4 h-4 mt-0.5 opacity-50 group-hover:opacity-100 shrink-0 text-pink-500" />
                                <span className="text-sm font-medium leading-snug text-left">{link.title}</span>
                              </button>
                            ) : (
                              <a href={link.url} className="flex items-start gap-2 p-2 rounded-xl hover:bg-pink-50 dark:hover:bg-pink-900/20 text-neutral-700 dark:text-neutral-300 hover:text-pink-700 dark:hover:text-pink-300 transition-colors group">
                                <ChevronRight className="w-4 h-4 mt-0.5 opacity-50 group-hover:opacity-100 shrink-0 text-pink-500" />
                                <span className="text-sm font-medium leading-snug">{link.title}</span>
                              </a>
                            )}
                          </li>
                        ))}
                        
                        {/* Quizzes from localStorage/storage */}
                        {storageQuizzes
                          .filter(quiz => quiz.lessonTitle === lesson.title)
                          .map((quiz) => (
                            <li key={quiz.id}>
                              <button
                                onClick={() => {
                                  openQuiz(quiz.id, {
                                    id: quiz.id,
                                    title: quiz.title,
                                    description: quiz.description,
                                    questions: quiz.questions,
                                    passingScore: quiz.passingScore,
                                    courseId: quiz.courseId,
                                    courseTitle: quiz.courseTitle,
                                  });
                                }}
                                className="w-full flex items-start gap-2 p-2 rounded-xl hover:bg-pink-50 dark:hover:bg-pink-900/20 text-neutral-700 dark:text-neutral-300 hover:text-pink-700 dark:hover:text-pink-300 transition-colors group"
                              >
                                <ChevronRight className="w-4 h-4 mt-0.5 opacity-50 group-hover:opacity-100 shrink-0 text-pink-500" />
                                <span className="text-sm font-medium leading-snug text-left">
                                  {quiz.title}
                                  {isAdminView && (
                                    <span className="ml-2 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                                      FROM STORAGE
                                    </span>
                                  )}
                                </span>
                              </button>
                            </li>
                          ))}
                        
                        {lesson.exercises.length === 0 && storageQuizzes.filter(q => q.lessonTitle === lesson.title).length === 0 && isAdminView && (
                          <p className="text-xs text-neutral-400 italic py-2">No exercises yet</p>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Lesson Button */}
        {isAdminView && (
          <button
            onClick={() => setShowLessonModal(true)}
            className="w-full flex items-center justify-center gap-2 bg-neutral-50 dark:bg-neutral-800/50 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-3xl p-6 text-neutral-500 hover:text-pink-500 hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/10 transition-all font-medium"
          >
            <Plus className="w-6 h-6" /> Add New Lesson
          </button>
        )}
      </div>

      {/* Add Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-neutral-200 dark:border-neutral-800"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Add New Lesson</h3>
              <button onClick={() => setShowLessonModal(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddLesson} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Lesson Title</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="e.g. Introduction to Analytics"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-xl transition-colors shadow-sm"
                >
                  Create Lesson
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Resource Modal */}
      {showResourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-neutral-200 dark:border-neutral-800"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 capitalize">
                Add to {resourceType}
              </h3>
              <button onClick={() => setShowResourceModal(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddResource} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Resource Type</label>
                <select
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value as any)}
                  className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none capitalize"
                >
                  <option value="videos">Video</option>
                  <option value="materials">Material</option>
                  <option value="exercises">Exercise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={resourceTitle}
                  onChange={(e) => setResourceTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="e.g. Cheat Sheet PDF"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">URL (Optional)</label>
                <input
                  type="url"
                  value={resourceUrl}
                  onChange={(e) => setResourceUrl(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="https://..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowResourceModal(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-xl transition-colors shadow-sm"
                >
                  Add Resource
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Quiz Modal */}
      {activeQuiz && (
        <ExerciseQuiz
          exercise={activeQuiz}
          onClose={() => setActiveQuiz(null)}
          onComplete={(score, passed) => {
            console.log(`Quiz completed with score: ${score}%, passed: ${passed}`);
            // Here you could save the score to Supabase or local storage
          }}
        />
      )}

      {(isLoadingQuiz || quizLoadError) && (
        <div className="fixed bottom-4 right-4 z-40">
          {isLoadingQuiz && (
            <div className="px-4 py-3 rounded-xl bg-neutral-900 text-white text-sm shadow-lg">
              Loading quiz from backend...
            </div>
          )}
          {!isLoadingQuiz && quizLoadError && (
            <div className="px-4 py-3 rounded-xl bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 text-sm shadow-lg max-w-sm">
              {quizLoadError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}