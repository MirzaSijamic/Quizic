import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ThemeProvider } from "../components/ThemeProvider";

type SessionResponse = {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    display_name: string;
  };
};

export function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const reason = searchParams.get("reason");

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

  useEffect(() => {
    if (status === "error") {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_authenticated");
      return;
    }

    const checkSession = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
          credentials: "include",
        });

        if (!response.ok) {
          navigate("/", { replace: true });
          return;
        }

        const data = (await response.json()) as SessionResponse;
        if (data.authenticated) {
          localStorage.setItem("auth_authenticated", "true");
          localStorage.setItem("auth_user", JSON.stringify(data.user ?? null));
          navigate("/home", { replace: true });
          return;
        }

        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_authenticated");
        navigate("/", { replace: true });
      } catch {
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_authenticated");
        navigate("/", { replace: true });
      }
    };

    checkSession();
  }, [apiBaseUrl, navigate, status]);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 text-center shadow-sm">
          {status === "error" ? (
            <>
              <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                Sign-in failed
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                {reason ? `Reason: ${reason}` : "Please try signing in again."}
              </p>
              <button
                onClick={() => navigate("/", { replace: true })}
                className="w-full bg-[#e61972] hover:bg-[#c71561] text-white py-3 px-4 rounded-xl font-semibold"
              >
                Back to Login
              </button>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                Completing sign-in
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Verifying your Microsoft session...
              </p>
            </>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}