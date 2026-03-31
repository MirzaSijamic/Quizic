import { NavLink, Outlet, useNavigate } from "react-router";
import { Home, BookOpen, CheckCircle, Lightbulb, Moon, Sun, Menu, ChevronDown, User, LogOut, Settings, BarChart3 } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useState } from "react";
import loginImg from "../../assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Layout() {
  const { theme, setTheme } = useTheme();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any user data if stored (e.g., localStorage)
    // localStorage.removeItem('user');
    navigate('/');
  };

  const navLinks = [
    { to: "/home", icon: Home, label: "Home" },
    { to: "/lessons", icon: BookOpen, label: "Lessons & Materials" },
    { to: "/progress", icon: CheckCircle, label: "Progress Tracker" },
    { to: "/learn-more", icon: Lightbulb, label: "Learn More" },
  ];

  const adminLinks = [
    { to: "/admin/quizzes", icon: Settings, label: "Manage Quizzes" },
    { to: "/admin/results", icon: BarChart3, label: "View Results" },
  ];

  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-200 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-20 bg-neutral-800 dark:bg-neutral-950 border-r border-neutral-700 items-center py-6 gap-8 shrink-0 z-20">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `p-3 rounded-xl transition-all ${
                isActive
                  ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-700"
              }`
            }
            title={link.label}
          >
            <link.icon className="w-6 h-6" strokeWidth={2.5} />
          </NavLink>
        ))}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-neutral-800 dark:bg-neutral-950 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col pt-16
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="px-4 py-2 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-pink-600 text-white"
                    : "text-neutral-300 hover:bg-neutral-700 hover:text-white"
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </NavLink>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 md:px-8 shrink-0 z-30">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              className="md:hidden p-2 -ml-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white flex-shrink-0 flex items-center justify-center">
                <img src={loginImg} alt="eMedia Patch Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-lg hidden sm:block bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent">
                eMedia Patch
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-800 mx-1 sm:mx-2"></div>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 sm:gap-3 p-1 sm:pr-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full sm:rounded-full transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white font-medium text-sm overflow-hidden">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden sm:flex flex-col items-start leading-none">
                  <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    Mirza Sijamić
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">User</span>
                </div>
                <ChevronDown className="hidden sm:block w-4 h-4 text-neutral-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Admin Tools</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate('/admin/quizzes')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Manage Quizzes</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/admin/results')}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>View Student Results</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-neutral-50/50 dark:bg-neutral-950/50 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}