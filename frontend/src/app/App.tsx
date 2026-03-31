import { RouterProvider } from "react-router";
import { router } from "./routes";
import { useEffect } from "react";
import { migrateQuizzesToStorage } from "./utils/migrate-quizzes";

export default function App() {
  // Auto-migrate quizzes on first load
  useEffect(() => {
    migrateQuizzesToStorage();
  }, []);

  return <RouterProvider router={router} />;
}