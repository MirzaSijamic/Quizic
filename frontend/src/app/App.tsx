import { RouterProvider } from "react-router";
import { router } from "./routes";
import { useEffect } from "react";
import { migrateQuizzesToStorage } from "./utils/migrate-quizzes";
import DifyChatbot from "./components/DifyChatbot"; // Ensure path is correct

export default function App() {
  // Auto-migrate quizzes on first load
  useEffect(() => {
    migrateQuizzesToStorage();
  }, []);

  return (
    <>
      {/* The chatbot sits globally outside the router */}
      <DifyChatbot />
      
      {/* This renders your entire website logic */}
      <RouterProvider router={router} />
    </>
  );
}