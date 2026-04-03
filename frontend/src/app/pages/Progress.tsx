import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Award, Calendar, CheckCircle2, CircleDashed, ArrowLeft, Users } from "lucide-react";
import { USER_INFO, MOCK_COURSES } from "../data";
import { isStoredUserAdmin } from "../utils/auth";

type ProfileCourseRelation = {
  id: number;
  profile_id: number;
  course_id: number;
  completed: boolean | null;
};

type DbProfile = {
  id: number;
  full_name: string;
  email: string;
  role: string;
};

type ActiveStudentView = {
  name: string;
  role: string;
  startDate: string;
  graduationDate: string;
};

function getApiBase() {
  return (
    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
    `${window.location.protocol}//${window.location.hostname}:8000`
  );
}

async function getProfilesFromDb() {
  const response = await fetch(`${getApiBase()}/api/profiles/`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch profiles (${response.status}): ${errorText}`);
  }

  return (await response.json()) as DbProfile[];
}

async function getAllProfileCourses() {
  const response = await fetch(`${getApiBase()}/api/profile-courses/`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch all profile courses (${response.status}): ${errorText}`);
  }

  return (await response.json()) as ProfileCourseRelation[];
}

async function getCourseInfoPerStudent(profileId: number) {
  try {
    const response = await fetch(`${getApiBase()}/api/profile-courses/profile/${profileId}`, {
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    if (response.status === 404) {
      return [];
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch profile courses (${response.status}): ${errorText}`);
    }

    return (await response.json()) as ProfileCourseRelation[];
  } catch (error) {
    console.error("Error fetching profile courses:", error);
    return [];
  }
}

export function Progress() {
  const canAccessAdminView = isStoredUserAdmin();
  const [isAdminView, setIsAdminView] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [profileCourses, setProfileCourses] = useState<ProfileCourseRelation[]>([]);
  const [dbStudents, setDbStudents] = useState<DbProfile[]>([]);
  const [coursesByProfileId, setCoursesByProfileId] = useState<Record<number, ProfileCourseRelation[]>>({});

  const loggedUserId = localStorage.getItem("auth_user") ? JSON.parse(localStorage.getItem("auth_user")!) : null;
  const rawProfileId = loggedUserId?.user?.profile_id ?? loggedUserId?.profile_id;
  const loggedProfileId = Number(rawProfileId);
  const selectedDbStudent = dbStudents.find((profile) => profile.id === selectedStudentId) ?? null;

  useEffect(() => {
    if (!isAdminView) {
      return;
    }

    let isCancelled = false;

    Promise.all([getProfilesFromDb(), getAllProfileCourses()])
      .then(([profiles, relations]) => {
        if (isCancelled) {
          return;
        }

        const studentsOnly = profiles.filter((profile) => profile.role.toLowerCase() !== "admin");
        const grouped: Record<number, ProfileCourseRelation[]> = {};
        relations.forEach((relation) => {
          if (!grouped[relation.profile_id]) {
            grouped[relation.profile_id] = [];
          }
          grouped[relation.profile_id].push(relation);
        });

        setDbStudents(studentsOnly);
        setCoursesByProfileId(grouped);
      })
      .catch((error) => {
        console.error("Failed to load students for admin view:", error);
        if (!isCancelled) {
          setDbStudents([]);
          setCoursesByProfileId({});
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isAdminView]);

  useEffect(() => {
    const activeProfileId = isAdminView && selectedStudentId ? selectedStudentId : loggedProfileId;

    if (!Number.isFinite(activeProfileId) || activeProfileId <= 0) {
      console.warn("Profile id missing or invalid in auth_user:", loggedUserId);
      setProfileCourses([]);
      return;
    }

    getCourseInfoPerStudent(activeProfileId).then((courses) => {
      setProfileCourses(Array.isArray(courses) ? courses : []);
    });
  }, [isAdminView, loggedProfileId, selectedStudentId]);

  const finishedProfileCourseIds = profileCourses
    .filter((relation) => relation.completed === true)
    .map((relation) => relation.course_id);

  const unfinishedProfileCourseIds = profileCourses
    .filter((relation) => relation.completed !== true)
    .map((relation) => relation.course_id);

  const activeStudent: ActiveStudentView = isAdminView && selectedDbStudent
    ? {
        name: selectedDbStudent.full_name,
        role: selectedDbStudent.role,
        startDate: "-",
        graduationDate: "-",
      }
    : USER_INFO;

  const useBackendCounts = isAdminView && selectedStudentId ? true : profileCourses.length > 0;

  const finishedCourses = useBackendCounts
    ? MOCK_COURSES.filter((course) => finishedProfileCourseIds.includes(course.id))
    : MOCK_COURSES.filter((course) => course.status === "Finished");

  const unfinishedCourses = useBackendCounts
    ? MOCK_COURSES.filter((course) => unfinishedProfileCourseIds.includes(course.id))
    : MOCK_COURSES.filter((course) => course.status === "Unfinished");

  const progressBarKey = isAdminView ? selectedStudentId ?? "admin" : "user";

  const finishedCount = useBackendCounts ? finishedProfileCourseIds.length : finishedCourses.length;
  const unfinishedCount = useBackendCounts ? unfinishedProfileCourseIds.length : unfinishedCourses.length;
  const totalCourses = useBackendCounts ? finishedCount + unfinishedCount : MOCK_COURSES.length;
  const progressPercentage = totalCourses > 0 ? Math.round((finishedCount / totalCourses) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div className="flex items-center gap-4">
          {isAdminView && selectedStudentId && (
            <button 
              onClick={() => setSelectedStudentId(null)}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {isAdminView ? "Admin Dashboard" : "Progress Tracker"}
          </h1>
        </div>
        <div className="flex items-center gap-3 bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <button
            onClick={() => {
              setIsAdminView(false);
              setSelectedStudentId(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!isAdminView ? 'bg-white dark:bg-neutral-900 text-[#e61972] shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
          >
            My Progress
          </button>
          {canAccessAdminView && (
            <button
              onClick={() => setIsAdminView(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isAdminView ? 'bg-white dark:bg-neutral-900 text-[#e61972] shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
            >
              <Users className="w-4 h-4" /> Admin View
            </button>
          )}
        </div>
      </div>

      {isAdminView && canAccessAdminView && !selectedStudentId ? (
        // Admin View: List of Students
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dbStudents.map((student) => {
            const studentRelations = coursesByProfileId[student.id] ?? [];
            const studentCompleted = studentRelations.filter((relation) => relation.completed === true).length;
            const studentUnfinished = studentRelations.filter((relation) => relation.completed !== true).length;
            const studentTotal = studentCompleted + studentUnfinished;
            const studentProgress = studentTotal > 0 ? Math.round((studentCompleted / studentTotal) * 100) : 0;
            
            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedStudentId(student.id)}
                className="bg-white dark:bg-neutral-900 rounded-3xl p-6 cursor-pointer hover:shadow-lg transition-all border border-neutral-200 dark:border-neutral-800 flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 p-0.5 mb-4 group-hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center text-xl font-bold text-pink-600 dark:text-pink-400">
                    {student.full_name.charAt(0)}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{student.full_name}</h3>
                <p className="text-xs text-neutral-500 mb-4">{studentCompleted} finished, {studentUnfinished} unfinished</p>
                
                <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${studentProgress}%` }}
                    className="h-full bg-gradient-to-r from-pink-500 to-orange-400 rounded-full"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        // Detailed Progress View (used for both Student and Admin inspecting a Student)
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200 dark:border-neutral-800 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 p-1 mb-4">
                <div className="w-full h-full rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center text-3xl font-bold text-pink-600 dark:text-pink-400 shadow-inner">
                  {activeStudent?.name.charAt(0)}
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{activeStudent?.name}</h2>
              <p className="text-sm font-medium text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 px-4 py-1.5 rounded-full mt-2">
                {activeStudent?.role}
              </p>

              <div className="w-full h-px bg-neutral-100 dark:bg-neutral-800 my-6" />

              <div className="w-full space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-neutral-500">
                    <Calendar className="w-4 h-4" /> Start Date
                  </span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{activeStudent?.startDate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-neutral-500">
                    <Award className="w-4 h-4" /> Graduation Target
                  </span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{activeStudent?.graduationDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress & Courses */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200 dark:border-neutral-800">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Overall Progress</h3>
                  <p className="text-sm text-neutral-500 mt-1">
                    {isAdminView ? `${activeStudent?.name.split(' ')[0]} has ` : "You have "} 
                    completed {finishedCount} out of {totalCourses} courses
                  </p>
                </div>
                <span className="text-4xl font-black bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent">
                  {progressPercentage}%
                </span>
              </div>

              <div className="w-full h-4 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  key={progressBarKey}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-pink-500 to-orange-400 rounded-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Finished Courses */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Finished Courses
                </h3>
                <ul className="space-y-3">
                  {finishedCourses.map((course) => (
                    <motion.li
                      key={course.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-3 bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 p-4 rounded-2xl"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-emerald-900 dark:text-emerald-300 text-sm leading-snug mb-1">{course.title}</h4>
                        <span className="text-xs text-emerald-700/70 dark:text-emerald-400/70 uppercase tracking-wider font-semibold">{course.level}</span>
                      </div>
                    </motion.li>
                  ))}
                  {finishedCourses.length === 0 && (
                    <p className="text-sm text-neutral-500 italic p-4">No finished courses yet.</p>
                  )}
                </ul>
              </div>

              {/* Unfinished Courses */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                  <CircleDashed className="w-5 h-5 text-orange-500" /> Unfinished Courses
                </h3>
                <ul className="space-y-3">
                  {unfinishedCourses.map((course) => (
                    <motion.li
                      key={course.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-2xl"
                    >
                      <CircleDashed className="w-5 h-5 text-neutral-400 dark:text-neutral-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-neutral-700 dark:text-neutral-300 text-sm leading-snug mb-1">{course.title}</h4>
                        <span className="text-xs text-neutral-500 dark:text-neutral-500 uppercase tracking-wider font-semibold">{course.level}</span>
                      </div>
                    </motion.li>
                  ))}
                  {unfinishedCourses.length === 0 && (
                    <p className="text-sm text-neutral-500 italic p-4">All courses completed!</p>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
