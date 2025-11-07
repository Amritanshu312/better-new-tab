import React from "react";
import { BookOpen, Plus, RotateCcw } from "lucide-react";

export default function TrackerHeader({ resetAll, setShowAddModal, setShowManageModal }) {
  return (
    <div className="flex justify-between mb-3 items-center">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <BookOpen size={18} /> Study Tracker
      </h2>
      <div className="flex gap-2 items-center">
        <button
          onClick={() => setShowManageModal(true)}
          className="px-2 py-1 text-sm bg-[#333] hover:bg-[#444] rounded-md"
        >
          Manage
        </button>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#424141] hover:bg-[#494747] cursor-pointer rounded-full shadow-lg p-1"
        >
          <Plus size={18} />
        </button>
        <button onClick={resetAll} className="text-gray-300 hover:text-red-400 transition">
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
}
