import React, { useState, useEffect, useCallback } from "react";
import { Rnd } from "react-rnd";
import { motion, AnimatePresence } from "framer-motion";
import { openDB, getAllFromDB, saveToDB, saveManyToDB, deleteFromDB } from "./db";
import TrackerHeader from "./TrackerHeader";
import StudyTab from "./StudyTab";
import RevisionsTab from "./RevisionsTab";
import AddCustomModal from "./AddCustomModal";
import ManageSubjectsModal from "./ManageSubjectsModal";
import syllabus from "./syllabus";

export default function StudyTracker({ locked }) {
  const defaultSize = { width: 480, height: 620 };
  const calculateCenter = () => ({ x: window.innerWidth / 1.32, y: -window.innerHeight / 1.8 });
  const [position, setPosition] = useState(() => JSON.parse(localStorage.getItem("studyTrackerPosition")) || calculateCenter());
  const [size, setSize] = useState(() => JSON.parse(localStorage.getItem("studyTrackerSize")) || defaultSize);
  const [chapters, setChapters] = useState([]);
  const [selectedClass, setSelectedClass] = useState(localStorage.getItem("selectedClass") || "JEE");
  const [selectedSubject, setSelectedSubject] = useState(localStorage.getItem("selectedSubject") || "Physics");
  const [filter, setFilter] = useState("All");
  const [viewTab, setViewTab] = useState("Study");
  const [todayRevisions, setTodayRevisions] = useState([]);
  const [upcomingRevisions, setUpcomingRevisions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);

  // 🧩 Load syllabus into DB
  useEffect(() => {
    const load = async () => {
      let saved = await getAllFromDB();
      if (!saved.length) {
        const allData = Object.entries(syllabus).flatMap(([cls, subs]) =>
          Object.entries(subs).flatMap(([sub, topics]) =>
            topics.map((t) => ({ subject: `${sub} ${cls}`, name: t, done: false, revisions: [], userCreated: false }))
          )
        );
        await saveManyToDB(allData);
        saved = await getAllFromDB();
      }
      setChapters(saved);
    };
    load();
  }, []);

  // 📅 Revisions List
  useEffect(() => {
    const today = new Date().toDateString();
    const todayList = [];
    const upcomingList = [];

    chapters.forEach((ch) => {
      ch.revisions.forEach((r) => {
        const date = new Date(r);
        if (date.toDateString() === today) todayList.push({ ...ch, date: r });
        else if (date > new Date()) upcomingList.push({ ...ch, date: r });
      });
    });
    upcomingList.sort((a, b) => new Date(a.date) - new Date(b.date));
    setTodayRevisions(todayList);
    setUpcomingRevisions(upcomingList);
  }, [chapters]);

  // 🧠 Revision Logic
  const generateNextRevision = async (chapter) => {
    const all = await getAllFromDB();
    const usedDates = new Set();
    all.forEach((c) => c.revisions.forEach((r) => usedDates.add(new Date(r).toDateString())));
    const today = new Date();
    const count = chapter.totalRevisions || chapter.revisions.length || 0;
    const next = count + 1;
    const gap = Math.pow(next, 2);
    let nextDate = new Date(today);
    nextDate.setDate(today.getDate() + gap);
    while (usedDates.has(nextDate.toDateString())) nextDate.setDate(nextDate.getDate() + 1);
    return nextDate.toISOString();
  };

  const markComplete = async (chapter) => {
    if (!chapter.done) {
      const revs = [];
      for (let x = 1; x <= 4; x++) {
        const fake = { ...chapter, totalRevisions: x - 1, revisions: [] };
        revs.push(await generateNextRevision(fake));
      }
      const updated = { ...chapter, done: true, revisions: revs, totalRevisions: 4 };
      await saveToDB(updated);
      setChapters(await getAllFromDB());
    }
  };

  const completeRevision = async (chapter, date) => {
    const remaining = chapter.revisions.filter((r) => r !== date);
    const next = await generateNextRevision(chapter);
    const updated = {
      ...chapter,
      revisions: [...remaining, next].sort((a, b) => new Date(a) - new Date(b)),
      totalRevisions: (chapter.totalRevisions || 0) + 1,
    };
    await saveToDB(updated);
    setChapters(await getAllFromDB());
  };

  const revertComplete = async (chapter) => {
    await saveToDB({ ...chapter, done: false, revisions: [] });
    setChapters(await getAllFromDB());
  };

  const resetAll = async () => {
    if (!window.confirm("Reset all progress?")) return;
    const reset = chapters.map((c) => ({ ...c, done: false, revisions: [] }));
    await saveManyToDB(reset);
    setChapters(await getAllFromDB());
  };

  // Position Handlers
  const handleDragStop = useCallback((_, d) => {
    const pos = { x: d.x, y: d.y };
    setPosition(pos);
    localStorage.setItem("studyTrackerPosition", JSON.stringify(pos));
  }, []);

  const handleResizeStop = useCallback((_, __, ref, ___, newPos) => {
    const newSize = { width: ref.offsetWidth, height: ref.offsetHeight };
    setSize(newSize);
    setPosition(newPos);
    localStorage.setItem("studyTrackerSize", JSON.stringify(newSize));
    localStorage.setItem("studyTrackerPosition", JSON.stringify(newPos));
  }, []);

  return (
    <>
      <Rnd
        size={size}
        position={position}
        onDragStop={!locked ? handleDragStop : undefined}
        onResizeStop={!locked ? handleResizeStop : undefined}
        bounds="window"
        disableDragging={!!locked}
        enableResizing={!locked}
        minWidth={350}
        minHeight={450}
        className="z-30"
      >
        <div className="backdrop-blur-xl bg-[#1a1a1a3a] text-white font-[Poppins] w-full h-full p-4 rounded-2xl border border-white/10 flex flex-col relative ">
          <TrackerHeader
            resetAll={resetAll}
            setShowAddModal={setShowAddModal}
            setShowManageModal={setShowManageModal}
          />
          {viewTab === "Study" ? (
            <StudyTab
              chapters={chapters}
              setChapters={setChapters}
              selectedClass={selectedClass}
              selectedSubject={selectedSubject}
              setSelectedClass={setSelectedClass}
              setSelectedSubject={setSelectedSubject}
              filter={filter}
              setFilter={setFilter}
              markComplete={markComplete}
              revertComplete={revertComplete}
              setViewTab={setViewTab}
            />
          ) : (
            <RevisionsTab
              todayRevisions={todayRevisions}
              upcomingRevisions={upcomingRevisions}
              completeRevision={completeRevision}
              setViewTab={setViewTab}
            />
          )}
        </div>
      </Rnd>

      <AnimatePresence>
        {showAddModal && <AddCustomModal setShowAddModal={setShowAddModal} setChapters={setChapters} />}
        {showManageModal && (
          <ManageSubjectsModal
            setShowManageModal={setShowManageModal}
            chapters={chapters}
            setChapters={setChapters}
          />
        )}
      </AnimatePresence>
    </>
  );
}
