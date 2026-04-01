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