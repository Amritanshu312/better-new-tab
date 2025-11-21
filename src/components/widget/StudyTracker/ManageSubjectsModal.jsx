import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Edit, Trash2, Search } from "lucide-react";
import { getAllFromDB, saveToDB, deleteFromDB } from "./db";

export default function ManageSubjectsModal({ setShowManageModal, chapters, setChapters }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [editingChapter, setEditingChapter] = useState(null);
  const [editName, setEditName] = useState("");

  const startEdit = (ch) => {
    setEditingChapter(ch);
    setEditName(ch.name);
  };

  const saveEdit = async () => {
    const updated = { ...editingChapter, name: editName };
    await saveToDB(updated);
    setEditingChapter(null);
    setChapters(await getAllFromDB());
  };

  const deleteChapter = async (id) => {
    await deleteFromDB(id);
    setChapters(await getAllFromDB());
  };

  const subjects = [...new Set(chapters.map((ch) => ch.subject.split(" ")[0]))];

  const filtered = chapters.filter((ch) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      ch.name.toLowerCase().includes(search) ||
      ch.subject.toLowerCase().includes(search);
    const matchesTab =
      activeTab === "All"
        ? true
        : activeTab === "User Created"
          ? ch.userCreated
          : ch.subject.startsWith(activeTab);
    return matchesSearch && matchesTab;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#000000b5] flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-[#1b1b1bcc] backdrop-blur-2xl text-white p-6 rounded-2xl border border-white/10 w-[90%] max-w-[500px] max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Manage Subjects</h2>
          <button onClick={() => setShowManageModal(false)}>
            <X size={18} className="text-gray-400 hover:text-white" />
          </button>
        </div>
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {["All", "User Created", ...subjects].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-sm rounded-md transition ${activeTab === tab ? "bg-blue-600" : "bg-[#222] hover:bg-[#2a2a2a]"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search chapters, subjects, or classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#222] border border-[#333] pl-8 pr-3 py-2 rounded-md text-sm"
          />
        </div>

        {/* Chapters List */}
        {filtered.length ? (
          filtered.map((ch) => (
            <div
              key={ch.id}
              className="flex justify-between items-center p-2 text-sm border-b border-[#333]"
            >
              {editingChapter?.id === ch.id ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-[#222] border border-[#333] rounded-md px-2 py-1 text-xs flex-1 mr-2"
                />
              ) : (
                <span className="flex-1 text-gray-200">
                  {ch.name} —{" "}
                  <span className="text-gray-400">{ch.subject}</span>
                </span>
              )}

              {editingChapter?.id === ch.id ? (
                <button
                  onClick={saveEdit}
                  className="text-green-400 text-xs px-2 py-1"
                >
                  Save
                </button>
              ) : (
                <>
                  <button
                    onClick={() => startEdit(ch)}
                    className="text-yellow-400 hover:text-yellow-300 mr-2"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => deleteChapter(ch.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm">No chapters found.</p>
        )}
      </motion.div>
    </motion.div>
  );
}
