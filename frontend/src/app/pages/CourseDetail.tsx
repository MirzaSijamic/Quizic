import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { color, motion } from "motion/react";
import { ArrowLeft, Play, FileText, PenTool, ShieldAlert, ChevronRight, Plus, X, Users } from "lucide-react";
import { type Course, type CourseLevel } from "../data";
import { ExerciseQuiz, type QuizExercise } from "../components/ExerciseQuiz";
import {
  fetchCoursesFromApi,
  fetchLessonsFromApi,
  fetchQuizzesFromApi,
  getQuizExercisesByCourse,
  type CourseOption,
  type LessonOption,
  type QuizExerciseData,
  type QuizOption,
} from "../utils/storage";
import { isStoredUserAdmin } from "../utils/auth";

type CourseDetailLocationState = {
  isAdminView?: boolean;
  courseData?: Course;
};

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

const buildCourseFromApi = (
  course: CourseOption,
  lessons: LessonOption[],
  quizzes: QuizOption[],
): Course => {
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

  const courseLessons = lessons
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
    //status: "Unfinished",
    lessons: courseLessons,
  };
};

type VideoEmbedConfig =
  | { kind: "youtube"; src: string }
  | { kind: "vimeo"; src: string }
  | { kind: "html5"; sourceType: "video/mp4" | "video/webm" | "video/ogg" }
  | { kind: "unsupported" };

const resolveVideoEmbedConfig = (rawUrl: string): VideoEmbedConfig => {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname;

    if (host === "youtu.be") {
      const id = path.replace(/^\//, "").split("/")[0];
      if (id) {
        return { kind: "youtube", src: `https://www.youtube.com/embed/${id}` };
      }
    }

    if (host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
      const watchId = parsed.searchParams.get("v");
      if (watchId) {
        return { kind: "youtube", src: `https://www.youtube.com/embed/${watchId}` };
      }

      const segments = path.split("/").filter(Boolean);
      const embedIndex = segments.findIndex((segment) => segment === "embed" || segment === "shorts");
      if (embedIndex >= 0 && segments[embedIndex + 1]) {
        return { kind: "youtube", src: `https://www.youtube.com/embed/${segments[embedIndex + 1]}` };
      }
    }

    if (host.includes("vimeo.com")) {
      const segments = path.split("/").filter(Boolean);
      const videoIdx = segments.findIndex((segment) => segment === "video");
      const id = videoIdx >= 0 ? segments[videoIdx + 1] : segments[segments.length - 1];

      if (id && /^\d+$/.test(id)) {
        return { kind: "vimeo", src: `https://player.vimeo.com/video/${id}` };
      }
    }

    if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(path)) {
      const extension = path.split(".").pop()?.toLowerCase();
      if (extension === "webm") {
        return { kind: "html5", sourceType: "video/webm" };
      }

      if (extension === "ogg") {
        return { kind: "html5", sourceType: "video/ogg" };
      }

      return { kind: "html5", sourceType: "video/mp4" };
    }
  } catch {
    return { kind: "unsupported" };
  }

  return { kind: "unsupported" };
};

export function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state as CourseDetailLocationState | null) || null;
  const canAccessAdminView = isStoredUserAdmin();

  // Support inheriting Admin view state from previous page, but allow toggling here
  const [isAdminView, setIsAdminView] = useState(
    canAccessAdminView && Boolean(locationState?.isAdminView),
  );
  const [course, setCourse] = useState<Course | null>(locationState?.courseData || null);
  const [courseLessonIds, setCourseLessonIds] = useState<number[]>([]);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [courseLoadError, setCourseLoadError] = useState<string | null>(null);

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);
  const [createLessonError, setCreateLessonError] = useState<string | null>(null);

  const [showResourceModal, setShowResourceModal] = useState(false);
  const [activeLessonIdx, setActiveLessonIdx] = useState<number | null>(null);
  const [resourceType, setResourceType] = useState<"videos" | "materials" | "exercises">("videos");
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [isEditingResource, setIsEditingResource] = useState(false);
  const [editingResourceIdx, setEditingResourceIdx] = useState<number | null>(null);
  const [isUpdatingResource, setIsUpdatingResource] = useState(false);
  const [updateResourceError, setUpdateResourceError] = useState<string | null>(null);


  /**
   * Course edit state is managed separately from lesson/resource creation since it has different form fields and API interactions, but could be expanded in the future to include more course-level properties if needed.
   */
  const [showCourseEditModal, setShowCourseEditModal] = useState(false);
  const [editCourseTitle, setEditCourseTitle] = useState("");
  const [editCourseLevel, setEditCourseLevel] = useState<CourseLevel>("Beginner");
  const [isUpdatingCourse, setIsUpdatingCourse] = useState(false);
  const [updateCourseError, setUpdateCourseError] = useState<string | null>(null);

  const [activeQuiz, setActiveQuiz] = useState<QuizExercise | null>(null);
  const [storageQuizzes, setStorageQuizzes] = useState<QuizExerciseData[]>([]);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [quizLoadError, setQuizLoadError] = useState<string | null>(null);

  const normalizedCourseIdParam = (courseId ?? "").trim();
  const strictNumericCourseId = Number(normalizedCourseIdParam);
  const extractedNumericCourseId = Number.parseInt(normalizedCourseIdParam.replace(/^[^0-9-]+/, ""), 10);

  const resolvedCourseId = Number.isInteger(strictNumericCourseId)
    ? strictNumericCourseId
    : Number.isInteger(extractedNumericCourseId)
    ? extractedNumericCourseId
    : null;

  useEffect(() => {
    const loadCourse = async () => {
      if (resolvedCourseId === null) {
        setCourse(null);
        setCourseLoadError("Course not found");
        setIsLoadingCourse(false);
        return;
      }

      setIsLoadingCourse(true);
      setCourseLoadError(null);

      try {
        const [courses, lessons, quizzes] = await Promise.all([
          fetchCoursesFromApi(),
          fetchLessonsFromApi(),
          fetchQuizzesFromApi(),
        ]);

        const matchedCourse = courses.find((entry) => Number(entry.id) === resolvedCourseId) || null;

        if (!matchedCourse) {
          setCourse(null);
          setCourseLessonIds([]);
          setCourseLoadError("Course not found");
          return;
        }

        const matchingLessonIds = lessons
          .filter((lesson) => Number(lesson.course_id) === Number(matchedCourse.id))
          .sort((a, b) => a.id - b.id)
          .map((lesson) => lesson.id);

        setCourseLessonIds(matchingLessonIds);
        setCourse(buildCourseFromApi(matchedCourse, lessons, quizzes));
      } catch (error) {
        setCourse(null);
        setCourseLessonIds([]);
        setCourseLoadError(error instanceof Error ? error.message : "Failed to load course data.");
      } finally {
        setIsLoadingCourse(false);
      }
    };

    void loadCourse();
  }, [resolvedCourseId]);

  // Load quizzes from storage for this course
  useEffect(() => {
    if (course) {
      const quizzes = getQuizExercisesByCourse(course.id);
      setStorageQuizzes(quizzes);
    } else {
      setStorageQuizzes([]);
    }
  }, [course]);

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

  const normalizeTitle = (value: string): string =>
    value.trim().toLowerCase().replace(/\s+/g, " ");

  const resolveBackendQuizIdByTitle = async (title: string): Promise<number | null> => {
    const apiBase =
      import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
      `${window.location.protocol}//${window.location.hostname}:8000`;
    const quizzesRes = await fetch(`${apiBase}/api/quizzes/`);

    if (!quizzesRes.ok) {
      return null;
    }

    const quizzes = await quizzesRes.json();
    if (!Array.isArray(quizzes)) {
      return null;
    }

    const normalizedTarget = normalizeTitle(title);
    const matchedQuiz = quizzes.find((quiz: any) => {
      if (!quiz || typeof quiz !== "object") {
        return false;
      }

      return typeof quiz.title === "string" && normalizeTitle(quiz.title) === normalizedTarget;
    });

    return matchedQuiz && Number.isInteger(matchedQuiz.id) ? matchedQuiz.id : null;
  };

  const loadQuizFromBackend = async (
    quizId: number,
    fallbackMeta: Pick<QuizExercise, "title" | "description">,
  ) => {
    const apiBase =
      import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
      `${window.location.protocol}//${window.location.hostname}:8000`;

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
      id: quiz.id,
      title: quiz.title || fallbackMeta.title,
      description: fallbackMeta.description,
      questions: questions.map((q: any) => ({
        id: q.id,
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
    rawQuizId: number,
    fallbackQuiz: Pick<QuizExercise, "title" | "description" | "questions" | "passingScore" | "courseId" | "courseTitle" | "id">,
  ) => {
    setQuizLoadError(null);
    setIsLoadingQuiz(true);

    try {
      let resolvedQuizId = rawQuizId;

      try {
        await loadQuizFromBackend(resolvedQuizId, {
          title: fallbackQuiz.title,
          description: fallbackQuiz.description,
        });
      } catch (primaryError) {
        const fallbackResolvedQuizId = await resolveBackendQuizIdByTitle(fallbackQuiz.title);
        if (fallbackResolvedQuizId === null || fallbackResolvedQuizId === resolvedQuizId) {
          throw primaryError;
        }

        resolvedQuizId = fallbackResolvedQuizId;
        await loadQuizFromBackend(resolvedQuizId, {
          title: fallbackQuiz.title,
          description: fallbackQuiz.description,
        });
      }
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

  if (isLoadingCourse) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-neutral-500">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">Loading course...</h2>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-neutral-500">
        <ShieldAlert className="w-12 h-12 text-pink-500" />
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
          {courseLoadError || "Course not found"}
        </h2>
        <button
          onClick={() => navigate("/lessons")}
          className="text-pink-600 hover:underline flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Go back to Lessons
        </button>
      </div>
    );
  }

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim() || !course) return;

    const apiBase =
      import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
      `${window.location.protocol}//${window.location.hostname}:8000`;

    setCreateLessonError(null);
    setIsCreatingLesson(true);

    try {
      const response = await fetch(`${apiBase}/api/lessons/`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_id: course.id,
          name: newLessonTitle.trim(),
          video_link: null,
          material_link: null,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to create lesson.");
      }

      const createdLesson = (await response.json()) as LessonOption;

      setCourse({
        ...course,
        lessons: [
          ...course.lessons,
          {
            title: createdLesson.name,
            videos: createdLesson.video_link
              ? [{ title: `${createdLesson.name} Video`, url: createdLesson.video_link }]
              : [],
            materials: createdLesson.material_link
              ? [{ title: `${createdLesson.name} Material`, url: createdLesson.material_link }]
              : [],
            exercises: [],
          },
        ],
      });
      setCourseLessonIds([...courseLessonIds, createdLesson.id]);

      setNewLessonTitle("");
      setShowLessonModal(false);
    } catch (error) {
      setCreateLessonError(error instanceof Error ? error.message : "Failed to create lesson.");
    } finally {
      setIsCreatingLesson(false);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceTitle.trim() || activeLessonIdx === null || !course) return;

    setUpdateResourceError(null);
    setIsUpdatingResource(true);

    const resourceLink = resourceUrl.trim() || "#";
    const selectedLessonId = courseLessonIds[activeLessonIdx];
    const shouldReplaceExisting = isEditingResource && editingResourceIdx !== null;

    if ((resourceType === "videos" || resourceType === "materials") && !Number.isInteger(selectedLessonId)) {
      setUpdateResourceError("Selected lesson could not be resolved for backend update.");
      setIsUpdatingResource(false);
      return;
    }

    if (resourceType === "videos" || resourceType === "materials") {
      const apiBase =
        import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
        `${window.location.protocol}//${window.location.hostname}:8000`;

      const payload =
        resourceType === "videos"
          ? { video_link: resourceLink }
          : { material_link: resourceLink };

      try {
        const response = await fetch(`${apiBase}/api/lessons/${selectedLessonId}`, {
          method: "PUT",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.detail || "Failed to update lesson resource.");
        }
      } catch (error) {
        setUpdateResourceError(error instanceof Error ? error.message : "Failed to update lesson resource.");
        setIsUpdatingResource(false);
        return;
      }
    }

    const updatedLessons = [...course.lessons];
    const resourceEntry = {
      title: resourceTitle,
      url: resourceLink,
    };

    const existingResources = [...updatedLessons[activeLessonIdx][resourceType]];
    const nextResources = shouldReplaceExisting
      ? existingResources.map((entry, idx) => (idx === editingResourceIdx ? resourceEntry : entry))
      : [...existingResources, resourceEntry];

    updatedLessons[activeLessonIdx] = {
      ...updatedLessons[activeLessonIdx],
      [resourceType]: nextResources,
    };

    setCourse({
      ...course,
      lessons: updatedLessons,
    });

    setResourceTitle("");
    setResourceUrl("");
    setIsEditingResource(false);
    setEditingResourceIdx(null);
    setShowResourceModal(false);
    setIsUpdatingResource(false);
  };

  const openCourseEditModal = () => {
    if (!course) return;
    setEditCourseTitle(course.title);
    setEditCourseLevel(course.level);
    setUpdateCourseError(null);
    setShowCourseEditModal(true);
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!course || !editCourseTitle.trim()) return;

    const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
      window.location.protocol + "//" +
      window.location.hostname + ":8000";

      setIsUpdatingCourse(true);
      setUpdateCourseError(null);

      try{
        const response = await fetch(apiBase + "/api/courses/" + String(course.id), {
          method: "PUT",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editCourseTitle.trim(),
            difficulty: editCourseLevel,
          }),
        });

        if(!response.ok){
          const err = await response.json().catch(() => ({}));
          throw new Error(err.detail || "Failed to update course.");
        }

        setCourse({
          ...course,
          title: editCourseTitle.trim(),
          level: editCourseLevel,
        });
        setShowCourseEditModal(false);
      }catch (error){
        setUpdateCourseError(error instanceof Error ? error.message: "Failed to update course.");
      }finally{
        setIsUpdatingCourse(false);
      }
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
          {canAccessAdminView && (
            <button
              onClick={() => setIsAdminView(true)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isAdminView ? 'bg-white dark:bg-neutral-900 text-[#e61972] shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
            >
              <Users className="w-4 h-4" /> Admin
            </button>
          )}
        </div>
      </div>



      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-4">
        <div className="flex flex-wrap gap-3 items-center text-xs font-semibold uppercase tracking-wider mb-2">
          <span className="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 px-3 py-1 rounded-full">
            {course.level}
          </span>
          {/* {course.status && (
            <span className={`px-3 py-1 rounded-full ${course.status === 'Finished' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
              {course.status}
            </span>
          )} */}
        </div>

          {isAdminView ? (
          <button
                    onClick={() => {
                      openCourseEditModal();
                    }}
                    className="flex items-center gap-1.5 text-sm font-medium text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 px-3 py-1.5 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors"
                  >
                    
                    <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                      {course.title} <span className="text-xs text-pink-500">(Click to Edit)</span>
                    </h1>

                  </button>
        ):
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
            {course.title}
          </h1>
        }

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
                      setResourceTitle("");
                      setResourceUrl("");
                      setIsEditingResource(false);
                      setEditingResourceIdx(null);
                      setUpdateResourceError(null);
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
                      <div className="mb-4">
                        <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                          <Play className="w-4 h-4 text-blue-500" />
                          Videos
                        </h3>
                      </div>
                      <ul className="space-y-2">
                        {lesson.videos.map((link, lIdx) => (
                          <li key={lIdx}>
                            {(() => {
                              const embedConfig = resolveVideoEmbedConfig(link.url);

                              return (
                                <div className="p-2 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-white dark:bg-neutral-900/60 space-y-2">
                                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                    <ChevronRight className="w-4 h-4 shrink-0 text-blue-500" />

                                    {isAdminView && (
                                    <button
                                      onClick={() => {
                                        setActiveLessonIdx(idx);
                                        setResourceType("videos");
                                        setResourceTitle(link.title);
                                        setResourceUrl(link.url);
                                        setIsEditingResource(true);
                                        setEditingResourceIdx(lIdx);
                                        setUpdateResourceError(null);
                                        setShowResourceModal(true);
                                      }}
                                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                      <span className="text-sm font-medium leading-snug">{link.title}</span>
                                    </button>
                                  )}


                                    {!isAdminView && (
                                      <span className="text-sm font-medium leading-snug">{link.title}</span>
                                    )}
                                    
                                  </div>

                                  {embedConfig.kind === "youtube" || embedConfig.kind === "vimeo" ? (
                                    <div className="w-full aspect-video overflow-hidden rounded-lg bg-black">
                                      <iframe
                                        src={embedConfig.src}
                                        title={link.title}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        allowFullScreen
                                      />
                                    </div>
                                  ) : embedConfig.kind === "html5" ? (
                                    <video controls className="w-full aspect-video rounded-lg bg-black object-contain">
                                      <source src={link.url} type={embedConfig.sourceType} />
                                    </video>
                                  ) : (
                                    <a
                                      href={link.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                      Open video link <a> </a>
                                    </a>
                                  )}

                                  
                                </div>
                              );
                            })()}
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
                      <div className="mb-4">
                        <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-500" />
                          Materials
                        </h3>
                      </div>
                      <ul className="space-y-2">
                        {lesson.materials.map((link, lIdx) => (
                          <li key={lIdx}>
                            {isAdminView ? (
                              <button
                                onClick={() => {
                                  setActiveLessonIdx(idx);
                                  setResourceType("materials");
                                  setResourceTitle(link.title);
                                  setResourceUrl(link.url);
                                  setIsEditingResource(true);
                                  setEditingResourceIdx(lIdx);
                                  setUpdateResourceError(null);
                                  setShowResourceModal(true);
                                }}
                                className="w-full text-left flex items-start gap-2 p-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 text-neutral-700 dark:text-neutral-300 hover:text-purple-700 dark:hover:text-purple-300 transition-colors group"
                              >
                                <ChevronRight className="w-4 h-4 mt-0.5 opacity-50 group-hover:opacity-100 shrink-0 text-purple-500" />
                                <span className="text-sm font-medium leading-snug">{link.title}</span>
                              </button>
                            ) : (
                              <a href={link.url} className="flex items-start gap-2 p-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 text-neutral-700 dark:text-neutral-300 hover:text-purple-700 dark:hover:text-purple-300 transition-colors group">
                                <ChevronRight className="w-4 h-4 mt-0.5 opacity-50 group-hover:opacity-100 shrink-0 text-purple-500" />
                                <span className="text-sm font-medium leading-snug">{link.title}</span>
                              </a>
                            )}
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
                      <div className="mb-4">
                        <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                          <PenTool className="w-4 h-4 text-pink-500" />
                          Exercises
                        </h3>
                      </div>
                      <ul className="space-y-2">
                        {/* Hardcoded exercises from data.ts */}
                        {lesson.exercises.map((link, lIdx) => (
                          <li key={lIdx}>
                            {link.quiz ? (
                              <button
                                onClick={() => {
                                  const fallbackQuiz = link.quiz!;
                                  openQuiz(fallbackQuiz.id || 0, {
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

      {/* Edit Course Modal */}
      {showCourseEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-neutral-200 dark:border-neutral-800"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Edit Course</h3>
              <button onClick={() => setShowCourseEditModal(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            
            
            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={editCourseTitle}
                  onChange={(e) => setEditCourseTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="e.g. Advanced Analytics"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Level</label>
                <select
                  value={editCourseLevel}
                  onChange={(e) => setEditCourseLevel(e.target.value as CourseLevel)}
                  className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {updateCourseError && (
                <p className="text-xs text-red-600 dark:text-red-400">{updateCourseError}</p>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={isUpdatingCourse}
                  onClick={() => setShowCourseEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingCourse}
                  className="px-4 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-xl transition-colors shadow-sm"
                >
                  {isUpdatingCourse ? "Updating..." : "Update Course"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

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

              {createLessonError && (
                <p className="text-xs text-red-600 dark:text-red-400">{createLessonError}</p>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={isCreatingLesson}
                  onClick={() => setShowLessonModal(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingLesson}
                  className="px-4 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-xl transition-colors shadow-sm"
                >
                  {isCreatingLesson ? "Creating..." : "Create Lesson"}
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
                  disabled={isEditingResource}
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

              {updateResourceError && (
                <p className="text-xs text-red-600 dark:text-red-400">{updateResourceError}</p>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={isUpdatingResource}
                  onClick={() => {
                    setShowResourceModal(false);
                    setIsEditingResource(false);
                    setEditingResourceIdx(null);
                    setResourceTitle("");
                    setResourceUrl("");
                    setUpdateResourceError(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingResource}
                  className="px-4 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-xl transition-colors shadow-sm"
                >
                  {isUpdatingResource ? "Saving..." : isEditingResource ? "Update Resource" : "Add Resource"}
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