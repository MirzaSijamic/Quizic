import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { ThemeProvider } from "./components/ThemeProvider";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Lessons } from "./pages/Lessons";
import { CourseDetail } from "./pages/CourseDetail";
import { Progress } from "./pages/Progress";
import { LearnMore } from "./pages/LearnMore";
import { AdminQuizManager } from "./pages/AdminQuizManager";
import { AdminQuizResults } from "./pages/AdminQuizResults";
import { OAuthCallback } from "./pages/OAuthCallback";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/oauth/callback",
    element: <OAuthCallback />,
  },
  {
    element: (
      <ThemeProvider>
        <Layout />
      </ThemeProvider>
    ),
    children: [
      { path: "home", element: <Home /> },
      { path: "lessons", element: <Lessons /> },
      { path: "lessons/:courseId", element: <CourseDetail /> },
      { path: "progress", element: <Progress /> },
      { path: "learn-more", element: <LearnMore /> },
      { path: "admin/quizzes", element: <AdminQuizManager /> },
      { path: "admin/results", element: <AdminQuizResults /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);