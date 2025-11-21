import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { getAllFromDB, saveManyToDB } from "./db";

export default function AddCustomModal({ setShowAddModal, setChapters }) {
  const [newClass, setNewClass] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newChapters, setNewChapters] = useState("");

  const addCustom = async () => {
    if (!newClass || !newSubject || !newChapters) return alert("Fill all fields");
    const chapterList = newChapters.split(",").map((c) => c.trim());
    const data = chapterList.map((ch) => ({
      subject: `${newSubject} ${newClass}`,
      name: ch,
      done: false,
      revisions: [],
      userCreated: true,
    }));
    await saveManyToDB(data);
    setChapters(await getAllFromDB());
    setShowAddModal(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#000000b5] flex items-center justify-center z-50 font-[poppins]"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-[#1b1b1b97] backdrop-blur-2xl text-white p-6 rounded-2xl border border-[#cecece1b] w-[90%] max-w-[400px]"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Add Custom Subject</h2>
          <button onClick={() => setShowAddModal(false)}>
            <X size={18} className="text-gray-400 hover:text-white" />
          </button>
        </div>

        <div className="space-y-3">
          <input
            value={newClass}
            onChange={(e) => setNewClass(e.target.value)}
            placeholder="Enter Class"
            className="w-full bg-[#222] border border-[#333] px-3 py-2 rounded-md text-sm outline-none"
          />
          <input
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="Enter Subject"
            className="w-full bg-[#222] border border-[#333] outline-none px-3 py-2 rounded-md text-sm"
          />
          <textarea
            value={newChapters}
            onChange={(e) => setNewChapters(e.target.value)}
            placeholder="Enter chapters (separate multiple chapters with commas)"
            rows={3}
            className="w-full bg-[#222] border border-[#333] outline-none px-3 py-2 rounded-md text-sm resize-none"
          />
          <button
            onClick={addCustom}
            className="w-full py-2 bg-[#272828] hover:bg-[#333434] rounded-md text-sm"
          >
            Add
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
