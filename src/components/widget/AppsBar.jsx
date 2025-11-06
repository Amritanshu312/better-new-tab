import React, { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import { useGeneralSettings } from "../../context/GeneralSettings";
import SearchBar from "../Search";
import { Plus, X } from "lucide-react";
import { motion } from "framer-motion"
/* 🧠 IndexedDB Helpers */
const openDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("AppBarDB", 2);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("websites")) {
        db.createObjectStore("websites", { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e);
  });
};

const saveToDB = async (data) => {
  const db = await openDB();
  const tx = db.transaction("websites", "readwrite");
  tx.objectStore("websites").add(data);
  await tx.done;
};

const getAllFromDB = async () => {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction("websites", "readonly");
    const store = tx.objectStore("websites");
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
  });
};

const deleteFromDB = async (id) => {
  const db = await openDB();
  const tx = db.transaction("websites", "readwrite");
  tx.objectStore("websites").delete(id);
  await tx.done;
};

/* 🌐 Fetch favicon (CORS-safe + Base64 caching) */
const fetchFaviconAsBase64 = async (siteUrl) => {
  try {
    const url = new URL(siteUrl);
    const directFavicon = `${url.origin}/favicon.ico`;

    try {
      // Try fetching direct favicon
      const res = await fetch(directFavicon);
      if (!res.ok) throw new Error("Direct favicon not found");
      const blob = await res.blob();
      const reader = new FileReader();
      return await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject("Failed to convert favicon");
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn("CORS or missing favicon → fallback to DuckDuckGo API:", err.message);
      const googleIcon = `https://slave.ffdarkrayon.workers.dev/image?url=https://icons.duckduckgo.com/ip3/${(url.origin.match(/^(?:https?:\/\/)?(?:www\.)?([^\/?#]+)/i) || [])[1]?.replace(/^www\./, "")}.ico`;
      const res = await fetch(googleIcon);
      const blob = await res.blob();
      const reader = new FileReader();
      return await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject("Failed to convert fallback favicon");
        reader.readAsDataURL(blob);
      });
    }
  } catch (err) {
    console.warn("Final fallback to default icon:", err);
    return "/icons/default.png";
  }
};

export default function AppBars({ isCustomizationState }) {
  const { settings } = useGeneralSettings();
  const containerRef = useRef(null);

  const calculateCenter = (width = 606) => {
    const centerX = (window.innerWidth - width) / 2;
    const centerY = -(window.innerHeight - window.innerHeight * 0.1);
    return { x: centerX, y: centerY };
  };

  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem("appbarPosition");
    return saved ? JSON.parse(saved) : calculateCenter();
  });


  const [websites, setWebsites] = useState([]);
  const [staticList, setStaticList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newSite, setNewSite] = useState({ name: "", url: "" });
  const [loading, setLoading] = useState(false);

  const staticApps = [
    { name: "Reddit", icon: "/icons/reddit.png", link: "https://www.reddit.com" },
    { name: "YouTube", icon: "/icons/youtube.png", link: "https://www.youtube.com" },
    { name: "Telegram", icon: "/icons/telegram.png", link: "https://web.telegram.org" },
    { name: "Instagram", icon: "/icons/instagram.png", link: "https://www.instagram.com" },
    { name: "ChatGPT", icon: "/icons/chatgpt.webp", link: "https://chat.openai.com" },
    { name: "Inbox (3,779)", icon: "/icons/gmail.png", link: "https://mail.google.com" },
  ];

  /* 🧩 Load sites from IndexedDB & filter deleted static */
  useEffect(() => {
    const loadSites = async () => {
      const saved = await getAllFromDB();
      setWebsites(saved);

      const deletedStatic = JSON.parse(localStorage.getItem("deletedStaticSites") || "[]");
      const filteredStatic = staticApps.filter(app => !deletedStatic.includes(app.name));
      setStaticList(filteredStatic);
    };
    loadSites();
  }, []);



  /* Save drag position */
  useEffect(() => {
    localStorage.setItem("appbarPosition", JSON.stringify(position));
  }, [position]);

  const handleReset = () => {
    const element = containerRef.current;
    const rectWidth = element ? element.getBoundingClientRect().width : 400;
    const def = calculateCenter(rectWidth);
    setPosition(def);
    localStorage.removeItem("appbarPosition");
  };

  /* ➕ Add new site (with favicon caching) */
  const handleAddSite = async () => {
    if (!newSite.name || !newSite.url) return alert("Please enter both name and URL.");
    setLoading(true);

    const faviconBase64 = await fetchFaviconAsBase64(newSite.url);
    const data = {
      name: newSite.name,
      link: newSite.url,
      icon: faviconBase64,
    };

    await saveToDB(data);
    const saved = await getAllFromDB();
    setWebsites(saved);
    setNewSite({ name: "", url: "" });
    setShowModal(false);
    setLoading(false);
  };

  /* 🗑️ Handle delete for static/custom apps */
  const handleDelete = async (app) => {
    if (app.id) {
      // Delete custom-added site
      await deleteFromDB(app.id);
      const saved = await getAllFromDB();
      setWebsites(saved);
    } else {
      // Delete static app
      const deletedStatic = JSON.parse(localStorage.getItem("deletedStaticSites") || "[]");
      if (!deletedStatic.includes(app.name)) {
        deletedStatic.push(app.name);
        localStorage.setItem("deletedStaticSites", JSON.stringify(deletedStatic));
      }
      setStaticList(prev => prev.filter(a => a.name !== app.name));
    }
  };

  /* 🔁 Restore all static apps */
  const restoreDefaults = () => {
    localStorage.removeItem("deletedStaticSites");
    setStaticList(staticApps);
  };

  const allApps = [...staticList, ...websites];

  return (
    <>
      <Rnd
        bounds="window"
        size="auto"
        position={position}
        onDragStop={(e, d) => isCustomizationState && setPosition({ x: d.x, y: d.y })}
        enableResizing={false}
        disableDragging={!isCustomizationState}
        className="z-20"
      >
        <div ref={containerRef} className="relative">
          <div className="flex space-x-6 bg-black/10 rounded-2xl p-4 backdrop-blur-md">
            {allApps.map((app, index) => (
              <div key={index} className="flex flex-col items-center space-y-2 relative group">
                <a href={app.link} target="_blank" rel="noopener noreferrer" className="flex items-center flex-col">
                  <div className="bg-[#e5e7eb50] hover:bg-[#e5e7eb69] w-max cursor-pointer p-3 rounded-2xl shadow-md transition">
                    <img
                      src={app.icon}
                      alt={app.name}
                      className="w-8 h-8 object-contain rounded-md"
                    />
                  </div>
                  <p className="text-white text-sm font-medium">{app.name}</p>
                </a>

                {isCustomizationState && (
                  <button
                    onClick={() => handleDelete(app)}
                    className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={() => setShowModal(true)}
              className="bg-[#00000009] backdrop-blur-md hover:bg-[#0000000e] border border-[#ffffff52] h-[56px] w-[56px] rounded-2xl text-sm text-white flex items-center justify-center transition"
            >
              <Plus />
            </button>
          </div>


          {isCustomizationState && (
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex space-x-3">
              <button
                onClick={handleReset}
                className="text-white bg-[#1a1a1a52] backdrop-blur-lg hover:bg-[#1a1a1a7c] border border-[#ffffff0c] px-3 py-1 rounded-lg text-sm shadow-md transition"
              >
                Reset Position
              </button>
              <button
                onClick={restoreDefaults}
                className="text-white bg-[#1a1a1a52] backdrop-blur-lg hover:bg-[#1a1a1a7c] border border-[#ffffff0c] px-3 py-1 rounded-lg text-sm shadow-md transition"
              >
                Restore Defaults
              </button>
            </div>
          )}
        </div>
      </Rnd>

      {/* 🪟 Modal for Adding New Site */}
      {showModal && (
        <motion.div initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 130, damping: 15 }}
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="bg-[#1f1f1fdc] backdrop-blur-[6px] border border-[#ffffff20] rounded-xl shadow-2xl text-white font-['poppins'] overflow-hidden max-w-md w-full px-4 py-4">
            <h2 className="text-lg font-semibold mb-4">Add a New Website</h2>

            <div className="flex flex-col space-y-3">
              <input
                type="text"
                placeholder="Site Name"
                value={newSite.name}
                onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                className="p-2 rounded-md bg-[#1b191955] border border-[#ffffff1c] text-white focus:outline-none"
              />
              <input
                type="url"
                placeholder="Site URL (https://youtube.com/)"
                value={newSite.url}
                onChange={(e) => setNewSite({ ...newSite, url: e.target.value })}
                className="p-2 rounded-md bg-[#1b191955] border border-[#ffffff1c] text-white focus:outline-none"
              />

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 text-sm bg-[#11111155] border border-[#ffffff1b] rounded-md hover:bg-[#181818] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSite}
                  disabled={loading}
                  className="px-6 py-2 text-sm bg-[#111111b3] border border-[#ffffff1b] rounded-md hover:bg-[#1818188b] transition"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {settings.global_search ? <SearchBar /> : null}
    </>
  );
}
