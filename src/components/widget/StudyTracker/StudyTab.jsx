import React from "react";
import { motion } from "framer-motion";
import { Filter, Undo2, CalendarDays } from "lucide-react";

export default function StudyTab({
  chapters,
  setChapters,
  selectedClass,
  selectedSubject,
  setSelectedClass,
  setSelectedSubject,
  filter,
  setFilter,
  markComplete,
  revertComplete,
  setViewTab,
}) {
  const allClasses = [...new Set(chapters.map((c) => c.subject.split(" ").slice(-1)[0]))];
  const currentSubjects = [
    ...new Set(
      chapters
        .filter((c) => c.subject.endsWith(selectedClass))
        .map((c) => c.subject.split(" ").slice(0, -1).join(" "))
    ),
  ];

  const filteredChapters = chapters.filter(
    (c) =>
      c.subject === `${selectedSubject} ${selectedClass}` &&
      (filter === "All" ? true : filter === "Completed" ? c.done : !c.done)
  );

  const total = filteredChapters.length;
  const completed = filteredChapters.filter((c) => c.done).length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const color = progress < 40 ? "#ef4444" : progress < 80 ? "#eab308" : "#22c55e";

  return (
    <>
      <div className="flex gap-3 mb-3">
        <button
          onClick={() => setViewTab("Study")}
          className="px-3 py-1 rounded-md text-sm bg-blue-600"
        >
          🧠 Study
        </button>
        <button
          onClick={() => setViewTab("Revisions")}
          className="px-3 py-1 rounded-md text-sm flex gap-2 items-center bg-[#222]"
        >
          <CalendarDays size={14} /> Revisions
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        {allClasses.map((cls) => (
          <button
            key={cls}
            onClick={() => setSelectedClass(cls)}
            className={`px-3 py-1 text-sm rounded-md ${selectedClass === cls ? "bg-blue-600" : "bg-[#222]"
              }`}
          >
            {cls}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {currentSubjects.map((sub) => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`px-3 py-1 text-sm rounded-md ${selectedSubject === sub ? "bg-blue-500" : "bg-[#222]"
              }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex-1 mr-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{completed}/{total} Completed</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-[#333] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%`, backgroundColor: color }}
              transition={{ duration: 0.6 }}
              className="h-full rounded-full"
            />
          </div>
        </div>
        <button
          onClick={() =>
            setFilter((f) =>
              f === "All" ? "Incomplete" : f === "Incomplete" ? "Completed" : "All"
            )
          }
          className="flex items-center gap-1 text-gray-300 text-sm"
        >
          <Filter size={14} /> {filter}
        </button>
      </div>

      {/* Chapters */}
      <div className="overflow-y-auto flex-1 space-y-2 pr-1 scrollbar-thin scrollbar-thumb-[#444]">
        {filteredChapters.map((ch, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className={`flex justify-between items-center p-2 text-sm border rounded-md ${ch.done ? "border-green-400 bg-[#163818]" : "border-[#333] bg-[#111]"
              }`}
          >
            <span>{ch.name}</span>
            {!ch.done ? (
              <button
                onClick={() => markComplete(ch)}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-md text-xs"
              >
                Done
              </button>
            ) : (
              <button
                onClick={() => revertComplete(ch)}
                className="flex items-center gap-1 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded-md text-xs"
              >
                <Undo2 size={12} /> Revert
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </>
  );
}
