import { createContext, useContext, useState, useEffect } from "react";

const VideoContext = createContext();

/* 🧠 Preload IndexedDB data before React mounts */
let preloadedVideoURL = null;

const preloadVideoFromIndexedDB = async (keyName = "myVideo") => {
  return new Promise((resolve) => {
    const request = indexedDB.open("VideoDB", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("videos")) {
        db.createObjectStore("videos");
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("videos", "readonly");
      const store = tx.objectStore("videos");
      const getReq = store.get(keyName);

      getReq.onsuccess = () => {
        const blob = getReq.result;
        if (blob) {
          const url = URL.createObjectURL(blob);
          preloadedVideoURL = url;
          resolve(url);
        } else {
          resolve(null);
        }
      };
      getReq.onerror = () => resolve(null);
    };
  });
};

// 🚀 Immediately preload video when this file is imported (before React runs)
preloadVideoFromIndexedDB();

export const VideoProvider = ({ children }) => {
  const [videoURL, setVideoURL] = useState(preloadedVideoURL);
  const [loading, setLoading] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(!preloadedVideoURL);

  // ---- IndexedDB Setup ----
  const getDB = () =>
    new Promise((resolve, reject) => {
      const request = indexedDB.open("VideoDB", 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("videos")) {
          db.createObjectStore("videos");
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

  // ---- Store Video ----
  const storeVideoFromUrl = async (videoUrl, keyName = "myVideo") => {
    if (!videoUrl) return;
    setLoading(true);
    const db = await getDB();
    let response;

    try {
      response = await fetch(videoUrl, { redirect: "follow" });
      if (!response.ok) throw new Error("Fetch failed: " + response.statusText);
    } catch {
      console.warn("⚠️ CORS issue, using proxy");
      response = await fetch(
        `https://slave.ffdarkrayon.workers.dev/cors?url=${encodeURIComponent(videoUrl)}`
      );
    }

    const blob = await response.blob();
    const tx = db.transaction("videos", "readwrite");
    tx.objectStore("videos").put(blob, keyName);

    tx.oncomplete = () => {
      console.log("✅ Stored video:", keyName);
      loadVideoFromIndexedDB(keyName);
      setLoading(false);
    };
  };

  // ---- Load Video ----
  const loadVideoFromIndexedDB = async (keyName = "myVideo") => {
    setLoadingVideo(true);
    const db = await getDB();
    const tx = db.transaction("videos", "readonly");
    const request = tx.objectStore("videos").get(keyName);

    request.onsuccess = () => {
      const blob = request.result;
      if (!blob) {
        console.log("⚠️ No video found");
        setVideoURL(null);
      } else {
        const url = URL.createObjectURL(blob);
        setVideoURL(url);
      }
      setLoadingVideo(false);
    };

    request.onerror = () => {
      console.error("❌ Failed to load video:", request.error);
      setLoadingVideo(false);
    };
  };

  const deleteVideoFromIndexedDB = async (keyName = "myVideo") => {
    const db = await getDB();
    const tx = db.transaction("videos", "readwrite");
    const store = tx.objectStore("videos");
    const request = store.delete(keyName);

    request.onsuccess = () => {
      console.log("🗑️ Deleted video:", keyName);
      setVideoURL(null);
    };
  };

  // 🪄 If nothing was preloaded, ensure it loads on mount
  useEffect(() => {
    if (!preloadedVideoURL) {
      loadVideoFromIndexedDB("myVideo");
    }
  }, []);

  return (
    <VideoContext.Provider
      value={{
        videoURL,
        loading,
        loadingVideo,
        storeVideoFromUrl,
        loadVideoFromIndexedDB,
        deleteVideoFromIndexedDB,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = () => useContext(VideoContext);
