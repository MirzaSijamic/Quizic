import { motion } from "motion/react";
import { ExternalLink, Sparkles } from "lucide-react";
import { MENTORS } from "../data";

export function Home() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400 bg-clip-text text-transparent">
            Welcome!
          </h1>
          <Sparkles className="w-8 h-8 text-pink-500 shrink-0" />
        </div>
        
        <div className="space-y-6 text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm sm:text-base">
          <p>
            This Academy was founded in hopes all of our new members get the chance to build a solid platform to continue learning and building their skillset. 
            As mentors, it is our obligation to help them pave the way to success and provide them with a sense of a safe zone and good education!
          </p>
          
          <p>
            And to our newbies, we hope this Academy helps you reach your full potential!
            We also hope it makes you fall in love with everything that eMP does to make its employees well educated and ready to take over the world of Digital Marketing.
          </p>
          
          <p className="font-bold text-pink-600 dark:text-pink-500 text-lg flex items-center gap-2">
            Good luck! <span className="text-xl">🍀</span>
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col h-full"
        >
          <div className="border-b-2 border-neutral-100 dark:border-neutral-800 pb-4 mb-6">
            <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">Mentors</h2>
          </div>
          <ul className="space-y-4 flex-1">
            {MENTORS.map((mentor, idx) => (
              <li key={idx} className="flex justify-between items-center group">
                <span className="font-medium text-neutral-900 dark:text-neutral-300 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                  {mentor.name}
                </span>
                <span className="text-sm text-neutral-500 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
                  {mentor.title}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col h-full"
        >
          <div className="border-b-2 border-neutral-100 dark:border-neutral-800 pb-4 mb-6">
            <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
              Instructions / Links
              <span className="text-pink-600 dark:text-pink-500 font-bold ml-2 text-sm bg-pink-100 dark:bg-pink-900/30 px-3 py-1 rounded-full">
                READ ME!
              </span>
            </h2>
          </div>
          
          <div className="flex-1 space-y-6">
            <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 group hover:border-orange-300 dark:hover:border-orange-800 transition-colors">
              <h3 className="font-medium text-orange-800 dark:text-orange-400 mb-2 flex items-center justify-between">
                Sharepoint link
                <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </h3>
              <a 
                href="#"
                className="text-sm text-pink-600 dark:text-pink-500 hover:underline break-all block"
              >
                https://emediapatchcom.sharepoint.com/:f:/s/AdOpsAdTechTrainingMaterials/EjPaCO4jlLN...
              </a>
            </div>

            <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400 list-disc list-inside marker:text-pink-500">
              <li>Update Sharepoint with any materials you might have, sharing is caring!!</li>
              <li>Update Progress Tracker in timely manner, this helps us a lot!</li>
              <li>Record training session and upload to sharepoint!</li>
              <li>Make sure to leave notes and comment! Feel free to use notes option as well!</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
