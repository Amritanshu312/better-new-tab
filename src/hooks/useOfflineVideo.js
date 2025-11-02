import { useState, useEffect } from "react";

export function useOfflineVideo(keyName = "myVideo") {
  const [videoURL, setVideoURL] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- IndexedDB setup ---
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

  // --- Store video from URL (with proxy fallback) ---
  const storeVideoFromUrl = async (videoUrl) => {
    setLoading(true);
    const db = await getDB();
    let response;

    try {
      response = await fetch(videoUrl, { redirect: "follow" });
      if (!response.ok) throw new Error("Fetch failed: " + response.statusText);
    } catch (err) {
      console.warn("⚠️ Direct fetch blocked by CORS, using proxy…");
      response = await fetch(
        `https://slave.ffdarkrayon.workers.dev/cors?url=${encodeURIComponent(videoUrl)}`
      );
    }

    const blob = await response.blob();
    const tx = db.transaction("videos", "readwrite");
    tx.objectStore("videos").put(blob, keyName);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => {
        console.log("✅ Video stored successfully:", keyName);
        setLoading(false);
        resolve();
      };
      tx.onerror = (e) => reject(e.target.error);
    });
  };

  // --- Load video from IndexedDB ---
  const loadVideoFromIndexedDB = async () => {
    const db = await getDB();
    const tx = db.transaction("videos", "readonly");
    const request = tx.objectStore("videos").get(keyName);

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const blob = request.result;
        if (!blob) {
          console.log("⚠️ No video found with key:", keyName);
          setVideoURL(null);
          resolve(null);
          return;
        }
        const url = URL.createObjectURL(blob);
        setVideoURL(url);
        resolve(url);
      };
    });
  };

  // --- Auto-load video on mount ---
  useEffect(() => {
    loadVideoFromIndexedDB();
  }, []);

  return {
    videoURL,
    loading,
    storeVideoFromUrl,
    loadVideoFromIndexedDB,
  };
}
