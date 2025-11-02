import React, { useState, useEffect } from "react";

function VideoOfflinePlayer() {
  const [videoURL, setVideoURL] = useState(null);
  const [inputURL, setInputURL] = useState("");
  const [loading, setLoading] = useState(false);

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

  // ---- Store video (with redirect + proxy fallback) ----
  const storeVideoFromUrl = async (videoUrl, keyName) => {
    setLoading(true);
    const db = await getDB();
    let response;

    try {
      response = await fetch(videoUrl, { redirect: "follow" });
      if (!response.ok) throw new Error("Fetch failed: " + response.statusText);
    } catch (err) {
      console.warn("Direct fetch blocked by CORS, using proxy…");
      response = await fetch(
        `https://slave.ffdarkrayon.workers.dev/cors?url=${encodeURIComponent(videoUrl)}`
      );
    }

    const blob = await response.blob();
    const tx = db.transaction("videos", "readwrite");
    tx.objectStore("videos").put(blob, keyName);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => {
        console.log("✅ Video stored successfully as", keyName);
        setLoading(false);
        resolve();
      };
      tx.onerror = (e) => reject(e.target.error);
    });
  };

  // ---- Retrieve and create blob URL ----
  const loadVideoFromIndexedDB = async (keyName) => {
    const db = await getDB();
    const tx = db.transaction("videos", "readonly");
    const store = tx.objectStore("videos");
    const request = store.get(keyName);

    request.onsuccess = () => {
      const blob = request.result;
      if (!blob) {
        console.log("⚠️ No video found with key:", keyName);
        setVideoURL(null);
        return;
      }
      const url = URL.createObjectURL(blob);
      setVideoURL(url);
    };
  };

  // ---- UI handlers ----
  const handleStoreVideo = async () => {
    if (!inputURL.trim()) {
      alert("Please enter a video URL first!");
      return;
    }

    await storeVideoFromUrl(inputURL.trim(), "myVideo");
    await loadVideoFromIndexedDB("myVideo");
  };

  const handleLoadVideo = async () => {
    await loadVideoFromIndexedDB("myVideo");
  };

  // ---- Auto load on mount ----
  useEffect(() => {
    loadVideoFromIndexedDB("myVideo");
  }, []);

  return (
    <div
      style={{
        textAlign: "center",
        padding: "2rem",
        fontFamily: "sans-serif",
      }}
    >
      <h2>🎥 Offline Video Player</h2>
      <p>Enter any video download URL and store it for offline playback.</p>

      <div style={{ marginTop: "1rem" }}>
        <input
          type="text"
          placeholder="Enter video URL here..."
          value={inputURL}
          onChange={(e) => setInputURL(e.target.value)}
          style={{
            width: "60%",
            padding: "0.5rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginRight: "10px",
          }}
        />
        <button
          onClick={handleStoreVideo}
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            cursor: "pointer",
            background: "#0078ff",
            color: "white",
            border: "none",
            borderRadius: "8px",
          }}
        >
          {loading ? "Downloading..." : "Download & Store"}
        </button>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button
          onClick={handleLoadVideo}
          style={{
            padding: "0.5rem 1rem",
            cursor: "pointer",
            borderRadius: "8px",
          }}
        >
          Load Stored Video
        </button>
      </div>

      {videoURL ? (
        <div style={{ marginTop: "2rem" }}>
          <video
            src={videoURL}
            controls
            style={{
              width: "80%",
              maxWidth: "720px",
              borderRadius: "12px",
              marginTop: "1rem",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            }}
          />
        </div>
      ) : (
        <p style={{ marginTop: "2rem" }}>No video loaded yet</p>
      )}
    </div>
  );
}

export default VideoOfflinePlayer;
