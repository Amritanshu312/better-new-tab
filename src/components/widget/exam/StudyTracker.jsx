import React, { useState, useEffect, useCallback } from "react";
import { Rnd } from "react-rnd";
import { motion } from "framer-motion";
import { RotateCcw, Undo2, Filter, CalendarDays } from "lucide-react";

/* 🧠 IndexedDB Setup */
const openDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("StudyTrackerDB", 7);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("chapters")) {
        db.createObjectStore("chapters", { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e);
  });
};

const getAllFromDB = async () => {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction("chapters", "readonly");
    const store = tx.objectStore("chapters");
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
  });
};

const saveManyToDB = async (items) => {
  const db = await openDB();
  const tx = db.transaction("chapters", "readwrite");
  const store = tx.objectStore("chapters");
  items.forEach((i) => store.put(i));
  await tx.done;
};

const saveToDB = async (chapter) => {
  const db = await openDB();
  const tx = db.transaction("chapters", "readwrite");
  tx.objectStore("chapters").put(chapter);
  await tx.done;
};

/* 📘 Syllabus Data */
const syllabus = {
  "Class 11": {
    Physics: [
      "Physical World",
      "Units and Measurement",
      "Motion in a Straight Line",
      "Motion in a Plane",
      "Laws of Motion",
      "Work, Energy and Power",
      "System of Particles and Rotational Motion",
      "Gravitation",
      "Mechanical Properties of Solids",
      "Mechanical Properties of Fluids",
      "Thermal Properties of Matter",
      "Thermodynamics",
      "Kinetic Theory",
      "Oscillations",
      "Waves",
    ],
    Chemistry: [
      "Some Basic Concepts of Chemistry",
      "Structure of Atom",
      "Classification of Elements and Periodicity in Properties",
      "Chemical Bonding and Molecular Structure",
      "States of Matter",
      "Thermodynamics",
      "Equilibrium",
      "Redox Reactions",
      "Hydrogen",
      "The s-Block Elements",
      "The p-Block Elements",
      "Organic Chemistry: Some Basic Principles and Techniques",
      "Hydrocarbons",
      "Environmental Chemistry",
    ],
    Mathematics: [
      "Sets",
      "Relations and Functions",
      "Trigonometric Functions",
      "Principle of Mathematical Induction",
      "Complex Numbers and Quadratic Equations",
      "Linear Inequalities",
      "Permutations and Combinations",
      "Binomial Theorem",
      "Sequences and Series",
      "Straight Lines",
      "Conic Sections",
      "Introduction to Three Dimensional Geometry",
      "Limits and Derivatives",
      "Mathematical Reasoning",
      "Statistics",
      "Probability",
    ],
  },
  "Class 12": {
    Physics: [
      "Electric Charges and Fields",
      "Electrostatic Potential and Capacitance",
      "Current Electricity",
      "Moving Charges and Magnetism",
      "Electromagnetic Induction",
      "Alternating Current",
      "Ray Optics and Optical Instruments",
      "Wave Optics",
      "Dual Nature of Radiation and Matter",
      "Atoms",
      "Nuclei",
      "Semiconductor Electronics: Materials, Devices and Simple Circuits",
    ],
    Chemistry: [
      "The Solid State",
      "Solutions",
      "Electrochemistry",
      "Chemical Kinetics",
      "Surface Chemistry",
      "General Principles and Processes of Isolation of Elements",
      "The p-Block Elements",
      "The d- and f-Block Elements",
      "Coordination Compounds",
      "Haloalkanes and Haloarenes",
      "Alcohols, Phenols and Ethers",
      "Aldehydes, Ketones and Carboxylic Acids",
      "Amines",
      "Biomolecules",
      "Polymers",
      "Chemistry in Everyday Life",
    ],
    Mathematics: [
      "Relations and Functions",
      "Inverse Trigonometric Functions",
      "Matrices",
      "Determinants",
      "Continuity and Differentiability",
      "Applications of Derivatives",
      "Integrals",
      "Applications of Integrals",
      "Differential Equations",
      "Vector Algebra",
      "Three Dimensional Geometry",
      "Linear Programming",
      "Probability",
    ],
  },
};

/* 📅 Date Helpers */
const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });



/* 🧠 Main Component */
export default function StudyTracker({ locked }) {
  const defaultSize = { width: 480, height: 620 };

  const calculateCenter = () => ({
    x: window.innerWidth / 1.32,
    y: -window.innerHeight / 1.8,
  });

  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem("studyTrackerPosition");
    return saved ? JSON.parse(saved) : calculateCenter();
  });

  const [size, setSize] = useState(() => {
    const saved = localStorage.getItem("studyTrackerSize");
    return saved ? JSON.parse(saved) : defaultSize;
  });

  const [viewTab, setViewTab] = useState("Study");
  const [selectedClass, setSelectedClass] = useState("Class 11");
  const [selectedSubject, setSelectedSubject] = useState("Physics");
  const [chapters, setChapters] = useState([]);
  const [todayRevisions, setTodayRevisions] = useState([]);
  const [upcomingRevisions, setUpcomingRevisions] = useState([]);
  const [filter, setFilter] = useState("All");

  /* 🧩 Load chapters into IndexedDB */
  useEffect(() => {
    const load = async () => {
      let saved = await getAllFromDB();
      const dbSubjects = [...new Set(saved.map((c) => c.subject))];
      const syllabusSubjects = Object.keys(syllabus)
        .map((cls) =>
          Object.keys(syllabus[cls]).map((sub) => `${sub} ${cls}`)
        )
        .flat();
      const mismatch =
        saved.length === 0 || dbSubjects.some((s) => !syllabusSubjects.includes(s));

      if (mismatch) {
        const db = await openDB();
        const tx = db.transaction("chapters", "readwrite");
        tx.objectStore("chapters").clear();
        await tx.done;

        const newData = Object.entries(syllabus).flatMap(([cls, subjects]) =>
          Object.entries(subjects).flatMap(([sub, topics]) =>
            topics.map((name) => ({
              subject: `${sub} ${cls}`,
              name,
              done: false,
              revisions: [],
            }))
          )
        );
        await saveManyToDB(newData);
        saved = await getAllFromDB();
      }
      setChapters(saved);
    };
    load();
  }, []);

  /* 📅 Update revision lists */
  useEffect(() => {
    const today = new Date().toDateString();
    const todayList = [];
    const upcomingList = [];
    chapters.forEach((ch) => {
      ch.revisions.forEach((rev) => {
        const date = new Date(rev);
        if (date.toDateString() === today) todayList.push({ ...ch, date: rev });
        else if (date > new Date()) upcomingList.push({ ...ch, date: rev });
      });
    });
    upcomingList.sort((a, b) => new Date(a.date) - new Date(b.date));
    setTodayRevisions(todayList);
    setUpcomingRevisions(upcomingList);
  }, [chapters]);

  /* 🧠 Generate next x² revision date based on progress */
  const generateNextRevision = async (chapter) => {
    const existing = await getAllFromDB();

    // Collect all used dates to avoid overlapping
    const usedDates = new Set();
    existing.forEach((ch) =>
      ch.revisions.forEach((r) => usedDates.add(new Date(r).toDateString()))
    );

    const today = new Date();

    // x = total revisions done so far + 1
    const revisionCount = chapter.totalRevisions || chapter.revisions.length || 0;
    const nextX = revisionCount + 1;
    const dayGap = Math.pow(nextX, 2);

    let nextDate = new Date(today);
    nextDate.setDate(today.getDate() + dayGap);

    // Avoid overlapping with other chapters
    while (usedDates.has(nextDate.toDateString())) {
      nextDate.setDate(nextDate.getDate() + 1);
    }

    return nextDate.toISOString();
  };

  /* ✅ When marking a chapter done the first time */
  const markComplete = async (chapter) => {
    // If never done before → schedule first 4 revisions (x = 1 → 4)
    if (!chapter.done) {
      const allRevisions = [];
      for (let x = 1; x <= 4; x++) {
        const fakeChap = { ...chapter, totalRevisions: x - 1, revisions: [] };
        const nextRev = await generateNextRevision(fakeChap);
        allRevisions.push(nextRev);
      }
      const updated = { ...chapter, done: true, revisions: allRevisions, totalRevisions: 4 };
      await saveToDB(updated);
      setChapters(await getAllFromDB());
    }
  };

  /* ✅ When you complete a revision — extend future x² chain */
  const completeRevision = async (chapter, date) => {
    // Remove the completed date
    const remaining = chapter.revisions.filter((r) => r !== date);
    const nextRevision = await generateNextRevision(chapter);

    const updated = {
      ...chapter,
      revisions: [...remaining, nextRevision],
      totalRevisions: (chapter.totalRevisions || 0) + 1,
    };

    // Sort future revisions chronologically
    updated.revisions.sort((a, b) => new Date(a) - new Date(b));

    await saveToDB(updated);
    setChapters(await getAllFromDB());
  };



  const revertComplete = async (chapter) => {
    const updated = { ...chapter, done: false, revisions: [] };
    await saveToDB(updated);
    setChapters(await getAllFromDB());
  };



  /* 🧭 Drag & Resize Save */
  const handleDragStop = useCallback((e, d) => {
    const newPos = { x: d.x, y: d.y };
    setPosition(newPos);
    localStorage.setItem("studyTrackerPosition", JSON.stringify(newPos));
  }, []);

  const handleResizeStop = useCallback((e, dir, ref, delta, newPos) => {
    const newSize = { width: ref.offsetWidth, height: ref.offsetHeight };
    setSize(newSize);
    setPosition(newPos);
    localStorage.setItem("studyTrackerSize", JSON.stringify(newSize));
    localStorage.setItem("studyTrackerPosition", JSON.stringify(newPos));
  }, []);

  const fullSubject = `${selectedSubject} ${selectedClass}`;
  const subjectChapters = chapters.filter((c) => c.subject === fullSubject);
  const filteredChapters =
    filter === "Completed"
      ? subjectChapters.filter((c) => c.done)
      : filter === "Incomplete"
        ? subjectChapters.filter((c) => !c.done)
        : subjectChapters;

  const total = subjectChapters.length;
  const completed = subjectChapters.filter((c) => c.done).length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const progressColor =
    progress < 40 ? "#ef4444" : progress < 80 ? "#eab308" : "#22c55e";

  const resetProgress = async () => {
    if (!window.confirm("Reset all progress?")) return;
    const reset = chapters.map((c) => ({ ...c, done: false, revisions: [] }));
    await saveManyToDB(reset);
    setChapters(await getAllFromDB());
  };

  /* UI */
  return (
    <Rnd
      size={size}
      position={position}
      onDragStop={!locked ? handleDragStop : undefined}
      onResizeStop={!locked ? handleResizeStop : undefined}
      bounds="window"
      dragHandleClassName={!locked ? "drag-handle" : ""}
      disableDragging={!!locked}
      enableResizing={!locked}
      minWidth={350}
      minHeight={450}
      className={`z-30 will-change-transform transform-gpu ${!!locked ? "pointer-events-auto" : ""
        }`}
    >
      <div
        className={`backdrop-blur-xl bg-[#1a1a1aaf] text-white font-[Poppins]
          w-full h-full p-4 rounded-2xl shadow-2xl border border-white/10 
          cursor-default flex flex-col ${!locked ? "cursor-move" : "cursor-default"}`}
      >
        {/* Header */}
        <div
          className={`flex justify-between items-center mb-3 select-none ${!locked ? "drag-handle cursor-move" : ""
            }`}
        >
          <h2 className="text-lg font-semibold tracking-wide">
            📚 Smart Study Tracker
          </h2>
          <button
            onClick={resetProgress}
            className="text-gray-300 hover:text-red-400 transition"
            title="Reset Progress"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-3">
          <button
            onClick={() => setViewTab("Study")}
            className={`px-3 py-1 rounded-md text-sm ${viewTab === "Study"
              ? "bg-blue-600 text-white"
              : "bg-[#222] text-gray-300 hover:bg-[#333]"
              }`}
          >
            🧠 Study
          </button>
          <button
            onClick={() => setViewTab("Revisions")}
            className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${viewTab === "Revisions"
              ? "bg-blue-600 text-white"
              : "bg-[#222] text-gray-300 hover:bg-[#333]"
              }`}
          >
            <CalendarDays size={16} /> Revisions
          </button>
        </div>

        {viewTab === "Study" ? (
          <>
            {/* Class + Subject Selectors */}
            <div className="flex gap-2 mb-2">
              {Object.keys(syllabus).map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3 py-1 text-sm rounded-md ${selectedClass === cls
                    ? "bg-blue-600 text-white"
                    : "bg-[#222] text-gray-300 hover:bg-[#333]"
                    }`}
                >
                  {cls}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mb-4">
              {Object.keys(syllabus[selectedClass]).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1 text-sm rounded-md ${selectedSubject === sub
                    ? "bg-blue-500 text-white"
                    : "bg-[#222] text-gray-300 hover:bg-[#333]"
                    }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            {/* Progress Bar + Filter */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex-1 mr-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>
                    {completed}/{total} Completed
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-[#333] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${progress}%`,
                      backgroundColor: progressColor,
                    }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full"
                  />
                </div>
              </div>
              <button
                onClick={() =>
                  setFilter((prev) =>
                    prev === "All"
                      ? "Incomplete"
                      : prev === "Incomplete"
                        ? "Completed"
                        : "All"
                  )
                }
                className="flex items-center gap-1 text-gray-300 hover:text-white transition text-sm"
              >
                <Filter size={16} /> {filter}
              </button>
            </div>

            {/* Chapters */}
            <div className="overflow-y-auto flex-1 space-y-3 scrollbar-thin scrollbar-thumb-[#444] pr-1">
              {filteredChapters.map((ch, i) => {
                return (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className={`flex justify-between items-center p-2 text-sm border rounded-lg ${ch.done
                      ? "border-green-400 bg-[#193820]"
                      : "border-[#333] bg-[#111]"
                      }`}
                  >
                    <div>
                      <span>{ch.name}</span>
                    </div>
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
                );
              })}
            </div>
          </>
        ) : (
          <>
            {/* Revisions Tab */}
            <div className="overflow-y-auto flex-1 space-y-5 scrollbar-thin scrollbar-thumb-[#444] pr-1">
              <div>
                <h3 className="text-base font-semibold mb-2">
                  📅 Today’s Revisions
                </h3>
                {todayRevisions.length ? (
                  todayRevisions.map((rev, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-2 text-sm bg-[#222] border border-[#333] rounded-lg"
                    >
                      <span>{rev.name}</span>
                      <button
                        onClick={() => completeRevision(rev, rev.date)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-xs"
                      >
                        Done
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-xs">
                    No revisions for today 🎉
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-base font-semibold mb-2">
                  🔜 Upcoming Revisions
                </h3>
                {upcomingRevisions.length ? (
                  upcomingRevisions.map((rev, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-2 text-sm bg-[#181818] border border-[#333] rounded-lg"
                    >
                      <span>{rev.name}</span>
                      <span className="text-gray-300 text-xs">
                        {formatDate(rev.date)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-xs">Nothing upcoming yet.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Rnd>
  );
}
