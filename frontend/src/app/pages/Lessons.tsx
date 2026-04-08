<<<<<<< HEAD
import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { PlayCircle, ArrowRight, Plus, Users, X } from "lucide-react";
import { MOCK_COURSES, CourseLevel, Course } from "../data";
import { isStoredUserAdmin } from "../utils/auth";

async function createCourse(title: string, level: CourseLevel) {
  console.log("Create clicked with:", { title, level });
=======
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { PlayCircle, ArrowRight, Plus, Users, X } from "lucide-react";
import { CourseLevel, type Course } from "../data";
import { isStoredUserAdmin } from "../utils/auth";
import {
  fetchCoursesFromApi,
  fetchLessonsFromApi,
  fetchQuizzesFromApi,
  type CourseOption,
  type LessonOption,
  type QuizOption,
} from "../utils/storage";

const normalizeCourseLevel = (difficulty?: string | null): CourseLevel => {
  const normalized = (difficulty || "").trim().toLowerCase();

  if (normalized === "beginner") {
    return "Beginner";
  }

  if (normalized === "intermediate") {
    return "Intermediate";
  }

  if (normalized === "advanced") {
    return "Advanced";
  }

  return "Beginner";
};

const buildCoursesFromApi = (
  courses: CourseOption[],
  lessons: LessonOption[],
  quizzes: QuizOption[],
): Course[] => {
  const quizzesByLessonId = new Map<number, QuizOption[]>();

  for (const quiz of quizzes) {
    const lessonId = Number(quiz.lesson_id);
    if (!Number.isInteger(lessonId)) {
      continue;
    }

    const existing = quizzesByLessonId.get(lessonId);
    if (existing) {
      existing.push(quiz);
      continue;
    }

    quizzesByLessonId.set(lessonId, [quiz]);
  }

  return courses
    .map((course) => {
      const lessonsForCourse = lessons
        .filter((lesson) => Number(lesson.course_id) === Number(course.id))
        .sort((a, b) => a.id - b.id)
        .map((lesson) => {
          const lessonQuizzes = quizzesByLessonId.get(lesson.id) || [];

          return {
            title: lesson.name,
            videos: lesson.video_link
              ? [{ title: `${lesson.name} Video`, url: lesson.video_link }]
              : [],
            materials: lesson.material_link
              ? [{ title: `${lesson.name} Material`, url: lesson.material_link }]
              : [],
            exercises: lessonQuizzes.map((quiz) => ({
              title: quiz.title,
              url: "#",
              quiz: {
                id: quiz.id,
                title: quiz.title,
                description: `Quiz for ${lesson.name}`,
                questions: [],
                passingScore: quiz.passing_score,
                courseId: course.id,
                courseTitle: course.name,
              },
            })),
          };
        });

      return {
        id: course.id,
        title: course.name,
        level: normalizeCourseLevel(course.difficulty),
        status: "Unfinished", //Treba napraviti da se status dobija iz API-ja, ovo je samo placeholder
        lessons: lessonsForCourse,
      } satisfies Course;
    })
    .sort((a, b) => a.id - b.id);
};

async function createCourse(title: string, level: CourseLevel): Promise<void> {
>>>>>>> 93a29b2 (Progress fixed)
  const apiBase =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
    `${window.location.protocol}//${window.location.hostname}:8000`;

<<<<<<< HEAD
  try {
    const response = await fetch(`${apiBase}/api/courses/`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: title,
        difficulty: level,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Create failed (${response.status}): ${errorText}`);
    }

    const createdCourse = await response.json();
    console.log("Created course:", createdCourse);
  } catch (error) {
    console.error("Create course error:", error);
=======
  const response = await fetch(`${apiBase}/api/courses/`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: title,
      difficulty: level,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Create failed (${response.status}): ${errorText}`);
>>>>>>> 93a29b2 (Progress fixed)
  }
}

export function Lessons() {
  const navigate = useNavigate();
  const canAccessAdminView = isStoredUserAdmin();
<<<<<<< HEAD
  const [isAdminView, setIsAdminView] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseLevel, setNewCourseLevel] = useState<CourseLevel>("Beginner");
  const [, setForceRender] = useState(0);

  const levels: CourseLevel[] = ["Beginner", "Intermediate", "Advanced"];

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;

    const nextCourseId = MOCK_COURSES.reduce((maxId, course) => Math.max(maxId, course.id), 0) + 1;

    const newCourse: Course = {
      id: nextCourseId,
      title: newCourseTitle,
      level: newCourseLevel,
      status: "Unfinished",
      lessons: [],
    };

    MOCK_COURSES.push(newCourse);
    setNewCourseTitle("");
    setShowAddModal(false);
    setForceRender((prev) => prev + 1);
  };

=======
  const [courses, setCourses] = useState<Course[]>([]);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [createCourseError, setCreateCourseError] = useState<string | null>(null);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseLevel, setNewCourseLevel] = useState<CourseLevel>("Beginner");

  const levels: CourseLevel[] = ["Beginner", "Intermediate", "Advanced"];

  const refreshCatalog = async () => {
    setIsLoadingCatalog(true);
    setCatalogError(null);

    try {
      const [coursesFromApi, lessonsFromApi, quizzesFromApi] = await Promise.all([
        fetchCoursesFromApi(),
        fetchLessonsFromApi(),
        fetchQuizzesFromApi(),
      ]);

      setCourses(buildCoursesFromApi(coursesFromApi, lessonsFromApi, quizzesFromApi));
    } catch (error) {
      setCatalogError(error instanceof Error ? error.message : "Failed to load courses and lessons.");
      setCourses([]);
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  useEffect(() => {
    void refreshCatalog();
  }, []);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;

    setCreateCourseError(null);
    setIsCreatingCourse(true);

    try {
      await createCourse(newCourseTitle.trim(), newCourseLevel);
      setNewCourseTitle("");
      setShowAddModal(false);
      await refreshCatalog();
    } catch (error) {
      setCreateCourseError(error instanceof Error ? error.message : "Failed to create course.");
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const courseCountLabel = isLoadingCatalog ? "Loading..." : `${courses.length} Courses Available`;

>>>>>>> 93a29b2 (Progress fixed)
  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Lessons and Materials
          </h1>
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-500 mt-2">
            <PlayCircle className="w-4 h-4 text-pink-500" />
<<<<<<< HEAD
            {MOCK_COURSES.length} Courses Available
=======
            {courseCountLabel}
>>>>>>> 93a29b2 (Progress fixed)
          </div>
        </div>

        <div className="flex items-center gap-3 bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <button
            onClick={() => setIsAdminView(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!isAdminView ? 'bg-white dark:bg-neutral-900 text-[#e61972] shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
          >
            Student View
          </button>
          {canAccessAdminView && (
            <button
              onClick={() => setIsAdminView(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isAdminView ? 'bg-white dark:bg-neutral-900 text-[#e61972] shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
            >
              <Users className="w-4 h-4" /> Admin View
            </button>
          )}
        </div>
      </div>

<<<<<<< HEAD
      <div className="space-y-16">
        {levels.map((level, idx) => {
          const coursesInLevel = MOCK_COURSES.filter((c) => c.level === level);
          if (coursesInLevel.length === 0 && !isAdminView) return null;

          return (
            <motion.section 
              key={level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-4">
                {level}
                <div className="h-px bg-neutral-200 dark:bg-neutral-800 flex-1" />
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {coursesInLevel.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => navigate(`/lessons/${course.id}`, { state: { isAdminView } })}
                    className="group relative flex flex-col items-start justify-between bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 text-left hover:border-pink-500 dark:hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/10 transition-all active:scale-95 duration-200 overflow-hidden min-h-[140px]"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                      <div className="bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400 p-2 rounded-full">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="z-10">
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors leading-snug">
                        {course.title}
                      </h3>
                      
                      <div className="mt-4 flex items-center gap-3 text-xs font-medium text-neutral-500">
                        {course.status === "Finished" ? (
                          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Finished
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-500 bg-orange-50 dark:bg-orange-500/10 px-2 py-1 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Pending
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <PlayCircle className="w-3.5 h-3.5" />
                          {course.lessons.length} lessons
                        </span>
                      </div>
                    </div>
                  </button>
                ))}

                {isAdminView && canAccessAdminView && (
                  <button
                    onClick={() => {
                      setNewCourseLevel(level);
                      setShowAddModal(true);
                    }}
                    className="flex flex-col items-center justify-center gap-2 bg-neutral-50 dark:bg-neutral-800/50 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 text-neutral-500 hover:text-pink-500 hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/10 transition-all min-h-[140px]"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="font-medium">Add Course</span>
                  </button>
                )}
              </div>
            </motion.section>
          );
        })}
      </div>
=======
      {isLoadingCatalog ? (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-12 text-center border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
          Loading courses, lessons, and quizzes...
        </div>
      ) : catalogError ? (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-12 text-center border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400">
          {catalogError}
        </div>
      ) : (
        <div className="space-y-16">
          {levels.map((level, idx) => {
            const coursesInLevel = courses.filter((course) => course.level === level);
            if (coursesInLevel.length === 0 && !isAdminView) return null;

            return (
              <motion.section
                key={level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-4">
                  {level}
                  <div className="h-px bg-neutral-200 dark:bg-neutral-800 flex-1" />
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {coursesInLevel.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => navigate(`/lessons/${course.id}`, { state: { isAdminView, courseData: course } })}
                      className="group relative flex flex-col items-start justify-between bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 text-left hover:border-pink-500 dark:hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/10 transition-all active:scale-95 duration-200 overflow-hidden min-h-[140px]"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                        <div className="bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400 p-2 rounded-full">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="z-10">
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors leading-snug">
                          {course.title}
                        </h3>

                        <div className="mt-4 flex items-center gap-3 text-xs font-medium text-neutral-500">
                          {course.status === "Finished" ? (
                            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Finished
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-500 bg-orange-50 dark:bg-orange-500/10 px-2 py-1 rounded-md">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> {course.status}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <PlayCircle className="w-3.5 h-3.5" />
                            {course.lessons.length} lessons
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}

                  {isAdminView && canAccessAdminView && (
                    <button
                      onClick={() => {
                        setNewCourseLevel(level);
                        setCreateCourseError(null);
                        setShowAddModal(true);
                      }}
                      className="flex flex-col items-center justify-center gap-2 bg-neutral-50 dark:bg-neutral-800/50 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 text-neutral-500 hover:text-pink-500 hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/10 transition-all min-h-[140px]"
                    >
                      <Plus className="w-6 h-6" />
                      <span className="font-medium">Add Course</span>
                    </button>
                  )}
                </div>
              </motion.section>
            );
          })}
        </div>
      )}
>>>>>>> 93a29b2 (Progress fixed)

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-neutral-200 dark:border-neutral-800"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Add New Course</h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="e.g. Advanced Analytics"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Level</label>
                <select
                  value={newCourseLevel}
                  onChange={(e) => setNewCourseLevel(e.target.value as CourseLevel)}
                  className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

<<<<<<< HEAD
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
=======
              {createCourseError && (
                <p className="text-xs text-red-600 dark:text-red-400">{createCourseError}</p>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={isCreatingCourse}
>>>>>>> 93a29b2 (Progress fixed)
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
<<<<<<< HEAD
                  onClick={() => createCourse(newCourseTitle, newCourseLevel)}
                  className="px-4 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-xl transition-colors shadow-sm"
                >
                  Create Course
=======
                  disabled={isCreatingCourse}
                  className="px-4 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-xl transition-colors shadow-sm"
                >
                  {isCreatingCourse ? "Creating..." : "Create Course"}
>>>>>>> 93a29b2 (Progress fixed)
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
