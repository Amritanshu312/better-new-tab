import React from "react";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

export default function RevisionsTab({
  todayRevisions,
  upcomingRevisions,
  completeRevision,
  setViewTab,
}) {
  return (
    <>
      <div className="flex gap-3 mb-3">
        <button
          onClick={() => setViewTab("Study")}
          className="px-3 py-1 rounded-md text-sm bg-[#222]"
        >
          🧠 Study
        </button>
        <button
          onClick={() => setViewTab("Revisions")}
          className="px-3 py-1 rounded-md text-sm flex gap-2 items-center bg-blue-600"
        >
          📅 Revisions
        </button>
      </div>

      <div className="overflow-y-auto flex-1 space-y-4 no-scrollbar">
        <div>
          <h3 className="text-base font-semibold mb-2">📅 Today’s Revisions</h3>
          {todayRevisions.length ? (
            todayRevisions.map((r, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-2 bg-[#222] border border-[#333] rounded-md text-sm"
              >
                <span>{r.name}</span>
                <button
                  onClick={() => completeRevision(r, r.date)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-xs rounded-md"
                >
                  Done
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-xs">No revisions for today 🎉</p>
          )}
        </div>

        <div >
          <h3 className="text-base font-semibold mb-2">🔜 Upcoming Revisions</h3>
          {upcomingRevisions.length ? (
            upcomingRevisions.map((r, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-2 bg-[#111] border border-[#333] rounded-md text-sm"
              >
                <span>{r.name}</span>
                <span className="text-gray-300 text-xs">{formatDate(r.date)}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-xs">Nothing upcoming yet.</p>
          )}
        </div>
      </div>
    </>
  );
}
