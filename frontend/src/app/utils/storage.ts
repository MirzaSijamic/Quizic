// Local storage utility for quiz results and user progress

export type QuizQuestion = {
  id: number;
  question: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
};

export type QuizExerciseData = {
  id: number;
  title: string;
  description: string;
  courseId: number;
  courseTitle: string;
  lessonTitle: string;
  passingScore: number;
  questions: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
};

export type QuizResult = {
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
  userId?: string;
  userName?: string;
  answers: Array<{
    questionId: number;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
};

export type LessonCompletion = {
  lessonId: number;
  lessonTitle: string;
  courseId: number;
  completedAt: string;
};

export type CourseProgress = {
  courseId: number;
  enrolledAt: string;
  completedAt?: string;
  status: 'active' | 'completed';
};

const STORAGE_KEYS = {
  QUIZ_RESULTS: 'academy_quiz_results',
  LESSON_COMPLETIONS: 'academy_lesson_completions',
  COURSE_PROGRESS: 'academy_course_progress',
  USER_PROFILE: 'academy_user_profile',
  QUIZ_EXERCISES: 'academy_quiz_exercises',
} as const;

const getApiBase = () =>
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  `${window.location.protocol}//${window.location.hostname}:8000`;

type BackendQuiz = {
  id: number;
  lesson_id: number;
  title: string;
  passing_score: number;
};

type BackendQuestion = {
  id: number;
  question_text: string;
  answers: unknown;
  correct_answer: string;
};

type BackendLesson = {
  id: number;
  name: string;
  course_id?: number;
};

export type LessonOption = {
  id: number;
  name: string;
  course_id?: number;
  video_link?: string | null;
  material_link?: string | null;
};

type BackendCourse = {
  id: number;
  name: string;
};

export type CourseOption = {
  id: number;
  name: string;
  difficulty?: string | null;
  completed?: boolean; // Add this field to represent completion status
};

export type QuizOption = {
  id: number;
  lesson_id: number;
  title: string;
  passing_score: number;
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

// ============================================
// QUIZ EXERCISE MANAGEMENT (Admin)
// ============================================

export function createQuizExercise(quiz: Omit<QuizExerciseData, 'createdAt' | 'updatedAt'>): QuizExerciseData {
  const quizzes = getAllQuizExercises();
  
  const newQuiz: QuizExerciseData = {
    ...quiz,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  quizzes.push(newQuiz);
  localStorage.setItem(STORAGE_KEYS.QUIZ_EXERCISES, JSON.stringify(quizzes));
  
  return newQuiz;
}

export function updateQuizExercise(quizId: number, updates: Partial<QuizExerciseData>): QuizExerciseData | null {
  const quizzes = getAllQuizExercises();
  const index = quizzes.findIndex(q => q.id === quizId);
  
  if (index === -1) return null;
  
  quizzes[index] = {
    ...quizzes[index],
    ...updates,
    id: quizzes[index].id, // Ensure ID doesn't change
    createdAt: quizzes[index].createdAt, // Preserve creation date
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(STORAGE_KEYS.QUIZ_EXERCISES, JSON.stringify(quizzes));
  
  return quizzes[index];
}

export function deleteQuizExercise(quizId: number): boolean {
  const quizzes = getAllQuizExercises();
  const filteredQuizzes = quizzes.filter(q => q.id !== quizId);
  
  if (filteredQuizzes.length === quizzes.length) return false;
  
  localStorage.setItem(STORAGE_KEYS.QUIZ_EXERCISES, JSON.stringify(filteredQuizzes));
  
  return true;
}

export function getAllQuizExercises(): QuizExerciseData[] {
  const stored = localStorage.getItem(STORAGE_KEYS.QUIZ_EXERCISES);
  return stored ? JSON.parse(stored) : [];
}

export function getQuizExerciseById(quizId: number): QuizExerciseData | null {
  return getAllQuizExercises().find(q => q.id === quizId) || null;
}

export function getQuizExercisesByCourse(courseId: number): QuizExerciseData[] {
  return getAllQuizExercises().filter(q => q.courseId === courseId);
}

export async function fetchAdminQuizzesFromApi(): Promise<QuizExerciseData[]> {
  const apiBase = getApiBase();

  const [quizzesRes, lessonsRes, coursesRes] = await Promise.all([
    fetch(`${apiBase}/api/quizzes/`, { credentials: "include" }),
    fetch(`${apiBase}/api/lessons/`, { credentials: "include" }),
    fetch(`${apiBase}/api/courses/`, { credentials: "include" }),
  ]);

  if (!quizzesRes.ok) {
    const err = await quizzesRes.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to load quizzes.");
  }

  if (!lessonsRes.ok) {
    const err = await lessonsRes.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to load lessons.");
  }

  if (!coursesRes.ok) {
    const err = await coursesRes.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to load courses.");
  }

  const backendQuizzes = (await quizzesRes.json()) as BackendQuiz[];
  const lessons = (await lessonsRes.json()) as BackendLesson[];
  const courses = (await coursesRes.json()) as BackendCourse[];

  return Promise.all(
    backendQuizzes.map(async (quiz) => {
      const lesson = lessons.find((entry) => entry.id === quiz.lesson_id);
      const course = courses.find((entry) => entry.id === lesson?.course_id);

      const questionsRes = await fetch(`${apiBase}/api/questions/quiz/${quiz.id}`, {
        credentials: "include",
      });

      const backendQuestions: BackendQuestion[] = questionsRes.ok
        ? ((await questionsRes.json()) as BackendQuestion[])
        : [];

      return {
        id: quiz.id,
        title: quiz.title,
        description: `Quiz for ${lesson?.name || "selected lesson"}`,
        courseId: lesson?.course_id ?? 0,
        courseTitle: course?.name || "Unknown Course",
        lessonTitle: lesson?.name || "Unknown Lesson",
        passingScore: quiz.passing_score,
        questions: backendQuestions.map((question) => ({
          id: question.id,
          question: question.question_text,
          options: normalizeOptions(question.answers),
          correctAnswer: question.correct_answer,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } satisfies QuizExerciseData;
    }),
  );
}

export async function fetchLessonsFromApi(): Promise<LessonOption[]> {
  const apiBase = getApiBase();
  const lessonsRes = await fetch(`${apiBase}/api/lessons/`, {
    credentials: "include",
  });

  if (!lessonsRes.ok) {
    const err = await lessonsRes.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to load lessons.");
  }

  return (await lessonsRes.json()) as LessonOption[];
}

export async function fetchCoursesFromApi(): Promise<CourseOption[]> {
  const apiBase = getApiBase();
  const coursesRes = await fetch(`${apiBase}/api/courses/`, {
    credentials: "include",
  });

  const responseJson = await coursesRes.json() as CourseOption[];
  //responseJson[0].completed = true; // Set the first course as completed for testing
  //console.log("Courses response:", responseJson);



  const courseCompletedRes = await fetch(`${apiBase}/api/profile-courses/profile/1/completion-status`, {
    credentials: "include",
  });

  //console.log("Course completion status response:", await courseCompletedRes.json());

  if (!coursesRes.ok) {
    const err = await coursesRes.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to load courses.");
  }

  const courseCompletedResJSON = await courseCompletedRes.json() as CourseOption[];
  //console.log("Course completion status parsed:", courseCompletedResJSON[0].completed);

  const combinedJson = responseJson.map((course, index) => ({
    ...course,
    completed: courseCompletedResJSON[index]?.completed,
  }));

  //console.log("Combined course data:", combinedJson);


  return combinedJson;
}

export async function fetchQuizzesFromApi(): Promise<QuizOption[]> {
  const apiBase = getApiBase();
  const quizzesRes = await fetch(`${apiBase}/api/quizzes/`, {
    credentials: "include",
  });

  if (!quizzesRes.ok) {
    const err = await quizzesRes.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to load quizzes.");
  }

  return (await quizzesRes.json()) as QuizOption[];
}

export async function deleteAdminQuizFromApi(quizId: number): Promise<void> {
  const apiBase = getApiBase();
  const res = await fetch(`${apiBase}/api/quizzes/${quizId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to delete quiz.");
  }
}

export async function saveAdminQuizToApi(
  formData: Omit<QuizExerciseData, 'createdAt' | 'updatedAt'>,
  options: { isEditing: boolean; originalQuestions: QuizQuestion[] },
): Promise<void> {
  const apiBase = getApiBase();

  const lessonsRes = await fetch(`${apiBase}/api/lessons/`, {
    credentials: "include",
  });
  if (!lessonsRes.ok) {
    const err = await lessonsRes.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to load lessons from backend.");
  }

  const lessons = (await lessonsRes.json()) as Array<{ id: number; name: string; course_id?: number }>;
  const matchedLesson = lessons.find(
    (lesson) => lesson.name === formData.lessonTitle && lesson.course_id === formData.courseId,
  ) || lessons.find((lesson) => lesson.name === formData.lessonTitle);

  if (!matchedLesson) {
    throw new Error("No backend lesson matches the provided Lesson Title. Create/select a backend lesson first.");
  }

  if (options.isEditing) {
    const updateQuizRes = await fetch(`${apiBase}/api/quizzes/${formData.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lesson_id: matchedLesson.id,
        title: formData.title,
        passing_score: formData.passingScore,
      }),
    });

    if (!updateQuizRes.ok) {
      const err = await updateQuizRes.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to update quiz in backend.");
    }

    const originalQuestionIds = new Set(options.originalQuestions.map((question) => question.id));
    const updatedQuestionIds = new Set(formData.questions.map((question) => question.id));

    for (const question of formData.questions) {
      if (originalQuestionIds.has(question.id)) {
        const updateQuestionRes = await fetch(`${apiBase}/api/questions/${question.id}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quiz_id: formData.id,
            question_text: question.question,
            answers: question.options,
            correct_answer: question.correctAnswer,
          }),
        });

        if (!updateQuestionRes.ok) {
          const err = await updateQuestionRes.json().catch(() => ({}));
          throw new Error(err.detail || "Failed to update one of the questions.");
        }
      } else {
        const createQuestionRes = await fetch(`${apiBase}/api/questions/`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quiz_id: formData.id,
            question_text: question.question,
            answers: question.options,
            correct_answer: question.correctAnswer,
          }),
        });

        if (!createQuestionRes.ok) {
          const err = await createQuestionRes.json().catch(() => ({}));
          throw new Error(err.detail || "Failed to create one of the questions.");
        }
      }
    }

    for (const originalQuestionId of originalQuestionIds) {
      if (updatedQuestionIds.has(originalQuestionId)) {
        continue;
      }

      const deleteQuestionRes = await fetch(`${apiBase}/api/questions/${originalQuestionId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!deleteQuestionRes.ok) {
        const err = await deleteQuestionRes.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to delete one of the removed questions.");
      }
    }

    return;
  }

  const createQuizRes = await fetch(`${apiBase}/api/quizzes/`, {
    method: "POST",
    credentials: "include",
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

  const createdQuiz: { id: number } = await createQuizRes.json();

  for (const question of formData.questions) {
    const createQuestionRes = await fetch(`${apiBase}/api/questions/`, {
      method: "POST",
      credentials: "include",
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
  }
}

// ============================================
// QUIZ RESULTS
// ============================================

export function saveQuizResult(result: QuizResult): void {
  const results = getQuizResults();
  results.push(result);
  localStorage.setItem(STORAGE_KEYS.QUIZ_RESULTS, JSON.stringify(results));
}

export function getQuizResults(): QuizResult[] {
  const stored = localStorage.getItem(STORAGE_KEYS.QUIZ_RESULTS);
  return stored ? JSON.parse(stored) : [];
}

export function getQuizResultsByExercise(exerciseId: number): QuizResult[] {
  return getQuizResults().filter(r => r.exerciseId === exerciseId);
}

export function getBestQuizScore(exerciseId: number): QuizResult | null {
  const results = getQuizResultsByExercise(exerciseId);
  if (results.length === 0) return null;
  return results.reduce((best, current) => 
    current.score > best.score ? current : best
  );
}

export function getQuizAttemptCount(exerciseId: number): number {
  return getQuizResultsByExercise(exerciseId).length;
}

// ============================================
// LESSON COMPLETIONS
// ============================================

export function markLessonComplete(completion: LessonCompletion): void {
  const completions = getLessonCompletions();
  
  // Avoid duplicates
  const exists = completions.some(
    c => c.lessonId === completion.lessonId
  );
  
  if (!exists) {
    completions.push(completion);
    localStorage.setItem(STORAGE_KEYS.LESSON_COMPLETIONS, JSON.stringify(completions));
  }
}

export function getLessonCompletions(): LessonCompletion[] {
  const stored = localStorage.getItem(STORAGE_KEYS.LESSON_COMPLETIONS);
  return stored ? JSON.parse(stored) : [];
}

export function isLessonCompleted(lessonId: number): boolean {
  return getLessonCompletions().some(c => c.lessonId === lessonId);
}

export function getCompletedLessonsByCourse(courseId: number): LessonCompletion[] {
  return getLessonCompletions().filter(c => c.courseId === courseId);
}

// ============================================
// COURSE PROGRESS
// ============================================

export function enrollInCourse(courseId: number): void {
  const progress = getCourseProgress();
  
  // Check if already enrolled
  const existing = progress.find(p => p.courseId === courseId);
  if (existing) return;
  
  progress.push({
    courseId,
    enrolledAt: new Date().toISOString(),
    status: 'active',
  });
  
  localStorage.setItem(STORAGE_KEYS.COURSE_PROGRESS, JSON.stringify(progress));
}

export function markCourseComplete(courseId: number): void {
  const progress = getCourseProgress();
  const course = progress.find(p => p.courseId === courseId);
  
  if (course) {
    course.status = 'completed';
    course.completedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.COURSE_PROGRESS, JSON.stringify(progress));
  }
}

export function getCourseProgress(): CourseProgress[] {
  const stored = localStorage.getItem(STORAGE_KEYS.COURSE_PROGRESS);
  return stored ? JSON.parse(stored) : [];
}

export function getCourseProgressById(courseId: number): CourseProgress | null {
  return getCourseProgress().find(p => p.courseId === courseId) || null;
}

// ============================================
// STATISTICS & ANALYTICS
// ============================================

export function getOverallStats() {
  const quizResults = getQuizResults();
  const lessonCompletions = getLessonCompletions();
  const courseProgress = getCourseProgress();
  
  const totalQuizzes = quizResults.length;
  const passedQuizzes = quizResults.filter(r => r.passed).length;
  const averageScore = totalQuizzes > 0
    ? Math.round(quizResults.reduce((sum, r) => sum + r.score, 0) / totalQuizzes)
    : 0;
  
  return {
    totalQuizzesAttempted: totalQuizzes,
    totalQuizzesPassed: passedQuizzes,
    averageQuizScore: averageScore,
    totalLessonsCompleted: lessonCompletions.length,
    totalCoursesEnrolled: courseProgress.length,
    totalCoursesCompleted: courseProgress.filter(p => p.status === 'completed').length,
  };
}

// ============================================
// CLEAR DATA (for testing/reset)
// ============================================

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

export function clearQuizResults(): void {
  localStorage.removeItem(STORAGE_KEYS.QUIZ_RESULTS);
}

export function exportData() {
  return {
    quizResults: getQuizResults(),
    lessonCompletions: getLessonCompletions(),
    courseProgress: getCourseProgress(),
    exportedAt: new Date().toISOString(),
  };
}

export function importData(data: ReturnType<typeof exportData>): void {
  if (data.quizResults) {
    localStorage.setItem(STORAGE_KEYS.QUIZ_RESULTS, JSON.stringify(data.quizResults));
  }
  if (data.lessonCompletions) {
    localStorage.setItem(STORAGE_KEYS.LESSON_COMPLETIONS, JSON.stringify(data.lessonCompletions));
  }
  if (data.courseProgress) {
    localStorage.setItem(STORAGE_KEYS.COURSE_PROGRESS, JSON.stringify(data.courseProgress));
  }
}