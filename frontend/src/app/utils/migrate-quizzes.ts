// Migration utility to load existing quiz data from data.ts into localStorage

import { MOCK_COURSES } from "../data";
import { createQuizExercise, getAllQuizExercises } from "./storage";

/**
 * Migrates quiz data from MOCK_COURSES to localStorage
 * This should be run once to initialize the quiz database
 */
export function migrateQuizzesToStorage(): void {
  // Check if quizzes already exist in storage
  const existingQuizzes = getAllQuizExercises();
  
  if (existingQuizzes.length > 0) {
    console.log("Quizzes already exist in storage. Skipping migration.");
    return;
  }

  let migratedCount = 0;

  // Iterate through all courses and lessons to find quizzes
  MOCK_COURSES.forEach((course) => {
    course.lessons.forEach((lesson) => {
      lesson.exercises.forEach((exercise) => {
        if (exercise.quiz) {
          const quiz = exercise.quiz;
          
          // Create quiz in storage
          try {
            createQuizExercise({
              id: quiz.id,
              title: quiz.title,
              description: quiz.description,
              courseId: quiz.courseId,
              courseTitle: quiz.courseTitle,
              lessonTitle: lesson.title,
              passingScore: quiz.passingScore || 70,
              questions: quiz.questions,
              createdBy: "system",
            });
            
            migratedCount++;
            console.log(`✓ Migrated quiz: ${quiz.title}`);
          } catch (error) {
            console.error(`✗ Failed to migrate quiz: ${quiz.title}`, error);
          }
        }
      });
    });
  });

  console.log(`\nMigration complete! Migrated ${migratedCount} quiz(es) to storage.`);
}

/**
 * Run this in the browser console to migrate quizzes:
 * import { migrateQuizzesToStorage } from './utils/migrate-quizzes';
 * migrateQuizzesToStorage();
 */
