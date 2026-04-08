import { useState } from "react";
import loginImg from "../../assets/logo.png";
import { ThemeProvider } from "../components/ThemeProvider";
import { motion } from "motion/react";

import * as test from "../utils/test";
import { set } from "date-fns";

type CourseCompletionStatus = {
  course_id: number;
  course_name: string;
  total_quizzes: number;
  passed_quizzes: number;
  completed: boolean;
};

type CourseInfo = {
    id: number;
    name: string;
    difficulty: string;
}

type AuthUser = {
    authenticated: boolean;
    user: {
    profile_id: number;
    role: string;
    id: string;
    email: string;
    display_name: string;
    };
};

export function Test() {
  const [courses, setCourses] = useState<CourseCompletionStatus[]>([]);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [corusesInfo, setCoursesInfo] = useState<CourseInfo | null>(null);

  const [passedCourses, setPassedCourses] = useState<CourseCompletionStatus[]>([]);

  const raw = localStorage.getItem("auth_user");
  const jason = JSON.parse(raw ?? "{}") as AuthUser;
  //console.log("Auth user:", jason["user"]["profile_id"]);
  const profileID = jason["user"]["profile_id"];

  const handleTestClick = async (ID: number) => {
    try {
      setIsLoadingCourses(true);
      setCoursesError(null);

      const data = await test.fetchCourses(ID); // await returned courses

      const passedCourses = data.filter(course => course.passed_quizzes > 0);
      console.log("Passed courses:", passedCourses);
      
      setPassedCourses(passedCourses); // store passed courses in React state
      

      setCourses(data); // store in React state

      // optional persistence
      //localStorage.setItem("course_completion_status", JSON.stringify(data));
      //console.log("Fetched courses:", data);
    } catch (err) {
      setCoursesError(err instanceof Error ? err.message : "Failed to load courses");
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const getCourseInfo = async (CourseID: number) => {
    try {
        const course = await test.getCourseInfo(CourseID);
        //console.log("Course info:", course);

        setCoursesInfo(course);
    } catch (err) {
      setCoursesError(err instanceof Error ? err.message : "Failed to load courses");
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-4 selection:bg-pink-500/30">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-3xl shadow-xl dark:shadow-2xl shadow-pink-900/5 dark:shadow-pink-900/10 border border-neutral-100 dark:border-neutral-800 p-8 sm:p-12 flex flex-col items-center gap-12"
        >

            {!isLoadingCourses && !coursesError && courses.length > 0 && (
              <div className="space-y-4">

                {passedCourses.map((course) => (
                  <div key={course.course_id} className="bg-gray-100 dark:bg-neutral-800 p-4 rounded-xl">
                    <h3 className="font-bold text-lg">{course.course_name}</h3>
                    <p>Total Quizzes: {course.total_quizzes}</p>
                    <p>Passed Quizzes: {course.passed_quizzes}</p>
                    <p>Completed: {course.completed ? "Yes" : "No"}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => handleTestClick(profileID)} // Replace with actual test function when needed
              className="mt-4 w-full flex items-center justify-center gap-3 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
            > test </button>

            <button
              onClick={() => getCourseInfo(1)} // Replace with actual test function when needed
              className="mt-4 w-full flex items-center justify-center gap-3 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
            > test2 </button>
        </motion.div>

        
        {corusesInfo && corusesInfo.id === corusesInfo.id && (
                      <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900 rounded-xl">
                        <h4 className="font-bold text-lg">{corusesInfo.name}</h4>
                        <p>Difficulty: {corusesInfo.difficulty}</p>
                      </div>
                    )}

        <div className="mt-8 text-neutral-400 dark:text-neutral-600 text-xs text-center">
          &copy; {new Date().getFullYear()} eMedia Patch. All rights reserved.
        </div>
      </div>
    </ThemeProvider>
  );
}