import { useState } from "react";
import loginImg from "../../assets/logo.png";
import { ThemeProvider } from "../components/ThemeProvider";
import { motion } from "motion/react";

<<<<<<< HEAD
import { test } from "../utils/test";
=======
type CourseCompletionStatus = {
  course_id: number;
  total_quizzes: number;
  passed_quizzes: number;
  completed: boolean;
};

>>>>>>> 93a29b2 (Progress fixed)

export function Login() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
    `${window.location.protocol}//${window.location.hostname}:8000`;

  const handleMicrosoftLogin = () => {
    setIsRedirecting(true);
    const redirectAfterLogin = `${window.location.origin}/oauth/callback`;
    const authUrl = `${apiBaseUrl}/api/auth/microsoft/login?frontend_redirect=${encodeURIComponent(redirectAfterLogin)}`;
    window.location.href = authUrl;
  };

<<<<<<< HEAD
=======

>>>>>>> 93a29b2 (Progress fixed)
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-4 selection:bg-pink-500/30">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-3xl shadow-xl dark:shadow-2xl shadow-pink-900/5 dark:shadow-pink-900/10 border border-neutral-100 dark:border-neutral-800 p-8 sm:p-12 flex flex-col items-center gap-12"
        >
          {/* Logo Container */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-600 to-orange-500 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden bg-white shadow-inner flex items-center justify-center">
              <img 
                src={loginImg} 
                alt="eMedia Patch Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 text-center w-full">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Welcome to eMP Academy
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm px-4">
              Your central hub for learning and growing your digital marketing skills.
            </p>
            
            <button
              onClick={handleMicrosoftLogin}
              disabled={isRedirecting}
              className="mt-6 w-full flex items-center justify-center gap-3 bg-[#e61972] hover:bg-[#c71561] text-white py-4 px-6 rounded-xl font-semibold transition-all shadow-lg shadow-pink-600/25 hover:shadow-pink-600/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.55 21H3v-8.55h8.55V21zM21 21h-8.55v-8.55H21V21zm-9.45-9.45H3V3h8.55v8.55zm9.45 0h-8.55V3H21v8.55z" />
              </svg>
              {isRedirecting ? "Redirecting to Microsoft..." : "Sign in with Office365"}
            </button>

<<<<<<< HEAD
            <button
              onClick={test} // Replace with actual test function when needed
              className="mt-4 w-full flex items-center justify-center gap-3 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
            > test </button>

=======
>>>>>>> 93a29b2 (Progress fixed)
          </div>
        </motion.div>
        
        <div className="mt-8 text-neutral-400 dark:text-neutral-600 text-xs text-center">
          &copy; {new Date().getFullYear()} eMedia Patch. All rights reserved.
        </div>
      </div>
    </ThemeProvider>
  );
}