import { useState } from "react";
import { ExternalLink, Check } from "lucide-react";
import { HELPFUL_LINKS, UDEMY_COURSES_LIST, USER_INFO } from "../data";

export function LearnMore() {
  // State to handle the interactive checkboxes for the user's progress on Udemy courses
  const [checkedCourses, setCheckedCourses] = useState<Record<number, boolean>>({});

  const toggleCourse = (index: number) => {
    setCheckedCourses(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-12">
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Learn More
        </h1>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        
        {/* Left Section: Helpful Links */}
        <div className="w-full xl:w-2/5 flex flex-col bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="bg-[#e61972] p-4">
            <h2 className="text-lg font-bold text-white tracking-wide">
              Things that may help you with the trainings!
            </h2>
          </div>
          
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-neutral-100 dark:bg-neutral-800/50 text-neutral-800 dark:text-neutral-200">
                <tr>
                  <th className="px-6 py-4 font-bold border-b border-neutral-200 dark:border-neutral-800 w-1/3">Topic</th>
                  <th className="px-6 py-4 font-bold border-b border-neutral-200 dark:border-neutral-800">Link to the material</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {HELPFUL_LINKS.map((item, idx) => (
                  <tr 
                    key={idx} 
                    className={idx % 2 === 0 ? "bg-white dark:bg-neutral-900" : "bg-neutral-50 dark:bg-neutral-800/20"}
                  >
                    <td className="px-6 py-4 font-semibold text-neutral-800 dark:text-neutral-200 whitespace-normal">
                      {item.topic}
                    </td>
                    <td className="px-6 py-4">
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[#e61972] hover:text-pink-800 dark:hover:text-pink-400 hover:underline flex items-center gap-1.5 transition-colors whitespace-normal break-all max-w-[200px] sm:max-w-xs"
                      >
                        {item.link}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Section: Udemy Courses Tracker */}
        <div className="w-full xl:w-3/5 flex flex-col bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="bg-[#e61972] p-4">
            <h2 className="text-lg font-bold text-white tracking-wide">
              Udemy Courses
            </h2>
          </div>
          
          <div className="w-full overflow-x-auto">
            <table className="w-full text-center text-sm border-collapse">
              <thead className="bg-[#e61972] text-white border-b-4 border-white dark:border-neutral-900">
                <tr>
                  <th className="px-6 py-4 font-bold border-r border-white/20 align-bottom min-w-[150px]">
                    <div className="bg-white text-[#e61972] py-2 px-4 rounded-md inline-block uppercase tracking-wider">
                      NAME
                    </div>
                  </th>
                  {UDEMY_COURSES_LIST.map((course, idx) => (
                    <th key={idx} className="px-3 py-4 font-medium border-r border-white/20 last:border-0 align-bottom w-32 min-w-[120px] max-w-[160px]">
                      <div className="text-xs leading-tight whitespace-normal break-words h-24 flex items-end justify-center pb-2">
                        {course}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-neutral-50 dark:bg-neutral-800/20">
                {/* User Row */}
                <tr>
                  <td className="px-6 py-6 font-bold text-neutral-900 dark:text-neutral-100 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                    {USER_INFO.name}
                  </td>
                  {UDEMY_COURSES_LIST.map((_, idx) => {
                    const isChecked = checkedCourses[idx] || false;
                    return (
                      <td key={idx} className="px-3 py-6 border-r border-neutral-200 dark:border-neutral-800 last:border-0 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors">
                        <button
                          onClick={() => toggleCourse(idx)}
                          className={`w-6 h-6 mx-auto rounded flex items-center justify-center border-2 transition-all ${
                            isChecked 
                              ? "bg-[#e61972] border-[#e61972] text-white" 
                              : "bg-white dark:bg-neutral-900 border-[#e61972] text-transparent hover:bg-pink-50 dark:hover:bg-pink-900/20"
                          }`}
                        >
                          <Check className="w-4 h-4" strokeWidth={3} />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
