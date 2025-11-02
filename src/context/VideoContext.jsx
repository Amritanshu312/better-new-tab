import { createContext, useContext, useState, useEffect } from "react";

const VideoContext = createContext();

export const VideoProvider = ({ children }) => {
  const [videoURL, setVideoURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(true); // 👈 new flag

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
    setLoadingVideo(true); // 👈 start loading
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
      setLoadingVideo(false); // 👈 done
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

  useEffect(() => {
    loadVideoFromIndexedDB("myVideo");
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
