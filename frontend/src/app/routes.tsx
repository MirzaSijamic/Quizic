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
<<<<<<< HEAD
=======
import { Test } from "./pages/Test";
>>>>>>> 93a29b2 (Progress fixed)

type StoredAuthState = {
  authenticated?: boolean;
  user?: {
    role?: string;
  };
};

const readStoredAuthState = (): StoredAuthState | null => {
  try {
    const raw = localStorage.getItem("auth_user");
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as StoredAuthState;
  } catch {
    return null;
  }
};

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const authState = readStoredAuthState();
  const isAuthenticated = Boolean(authState?.authenticated);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const RequireAdmin = ({ children }: { children: JSX.Element }) => {
  const authState = readStoredAuthState();
  const isAuthenticated = Boolean(authState?.authenticated);
  const isAdmin = authState?.user?.role === "admin";

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

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
        <RequireAuth>
          <Layout />
        </RequireAuth>
      </ThemeProvider>
    ),
    children: [
      { path: "home", element: <Home /> },
      { path: "lessons", element: <Lessons /> },
      { path: "lessons/:courseId", element: <CourseDetail /> },
      { path: "progress", element: <Progress /> },
      { path: "learn-more", element: <LearnMore /> },
<<<<<<< HEAD
=======
      { path: "test", element: <Test /> },
>>>>>>> 93a29b2 (Progress fixed)
      {
        path: "admin/quizzes",
        element: (
          <RequireAdmin>
            <AdminQuizManager />
          </RequireAdmin>
        ),
      },
      {
        path: "admin/results",
        element: (
          <RequireAdmin>
            <AdminQuizResults />
          </RequireAdmin>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);