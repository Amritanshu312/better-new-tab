import { createContext, useContext, useState, useEffect } from "react";

const VideoContext = createContext();

/* 🧠 Preload IndexedDB before React mounts */
let preloadedMediaURL = null;
let preloadedMediaType = null; // "video" or "image"

/* --- Preload --- */
const preloadMediaFromIndexedDB = async () => {
  return new Promise((resolve) => {
    const request = indexedDB.open("MediaDB", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("videos")) db.createObjectStore("videos");
      if (!db.objectStoreNames.contains("images")) db.createObjectStore("images");
    };

    request.onsuccess = () => {
      const db = request.result;
      const txVideo = db.transaction("videos", "readonly");
      const storeVideo = txVideo.objectStore("videos");
      const getVideo = storeVideo.get("myVideo");

      getVideo.onsuccess = () => {
        if (getVideo.result) {
          preloadedMediaType = "video";
          preloadedMediaURL = URL.createObjectURL(getVideo.result);
          resolve({ url: preloadedMediaURL, type: "video" });
        } else {
          const txImg = db.transaction("images", "readonly");
          const storeImg = txImg.objectStore("images");
          const getImg = storeImg.get("myImage");

          getImg.onsuccess = () => {
            if (getImg.result) {
              preloadedMediaType = "image";
              preloadedMediaURL = getImg.result;
              resolve({ url: preloadedMediaURL, type: "image" });
            } else resolve({ url: null, type: null });
          };
        }
      };
    };
  });
};

// 🚀 Preload immediately before React renders
preloadMediaFromIndexedDB();

export const VideoProvider = ({ children }) => {
  const [mediaURL, setMediaURL] = useState(preloadedMediaURL);
  const [mediaType, setMediaType] = useState(preloadedMediaType); // "video" or "image"
  const [loading, setLoading] = useState(false);
  const [loadingMedia, setLoadingMedia] = useState(!preloadedMediaURL);

  /* --- Get DB --- */
  const getDB = () =>
    new Promise((resolve, reject) => {
      const request = indexedDB.open("MediaDB", 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("videos")) db.createObjectStore("videos");
        if (!db.objectStoreNames.contains("images")) db.createObjectStore("images");
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

  /* --- Delete All --- */
  const deleteAllMedia = async () => {
    const db = await getDB();
    const tx1 = db.transaction("videos", "readwrite");
    tx1.objectStore("videos").clear();
    const tx2 = db.transaction("images", "readwrite");
    tx2.objectStore("images").clear();
    setMediaURL(null);
    setMediaType(null);
    console.log("🗑️ Cleared both image & video");
  };

  /* --- Store Video --- */
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
    await deleteAllMedia();
    const tx = db.transaction("videos", "readwrite");
    tx.objectStore("videos").put(blob, keyName);

    tx.oncomplete = () => {
      const url = URL.createObjectURL(blob);
      setMediaURL(url);
      setMediaType("video");
      console.log("✅ Stored video, image replaced");
      setLoading(false);
    };
  };

  /* --- Store Image --- */
  const storeImageFromUrl = async (imageUrl, keyName = "myImage") => {
    if (!imageUrl) return;
    setLoading(true);
    const db = await getDB();
    let response;

    try {
      response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Image fetch failed");
    } catch {
      console.warn("⚠️ CORS issue, using proxy");
      response = await fetch(
        `https://slave.ffdarkrayon.workers.dev/cors?url=${encodeURIComponent(imageUrl)}`
      );
    }

    const blob = await response.blob();
    await deleteAllMedia();
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result; // Base64 string
      const tx = db.transaction("images", "readwrite");
      tx.objectStore("images").put(base64, keyName);

      tx.oncomplete = () => {
        setMediaURL(base64);
        setMediaType("image");
        console.log("🖼️ Stored image, video replaced");
        setLoading(false);
      };
    };
    reader.readAsDataURL(blob);
  };

  /* --- Load Media --- */
  const loadMediaFromIndexedDB = async () => {
    setLoadingMedia(true);
    const db = await getDB();

    // Try video first
    const txV = db.transaction("videos", "readonly");
    const getV = txV.objectStore("videos").get("myVideo");
    getV.onsuccess = () => {
      if (getV.result) {
        const url = URL.createObjectURL(getV.result);
        setMediaURL(url);
        setMediaType("video");
        setLoadingMedia(false);
      } else {
        // fallback to image
        const txI = db.transaction("images", "readonly");
        const getI = txI.objectStore("images").get("myImage");
        getI.onsuccess = () => {
          if (getI.result) {
            setMediaURL(getI.result);
            setMediaType("image");
          } else {
            setMediaURL(null);
            setMediaType(null);
          }
          setLoadingMedia(false);
        };
      }
    };
  };

  /* --- Delete Current Media --- */
  const deleteCurrentMedia = async () => {
    const db = await getDB();
    if (mediaType === "video") {
      const tx = db.transaction("videos", "readwrite");
      tx.objectStore("videos").clear();
      tx.oncomplete = () => {
        setMediaURL(null);
        setMediaType(null);
        console.log("🗑️ Deleted video");
      };
    } else if (mediaType === "image") {
      const tx = db.transaction("images", "readwrite");
      tx.objectStore("images").clear();
      tx.oncomplete = () => {
        setMediaURL(null);
        setMediaType(null);
        console.log("🗑️ Deleted image");
      };
    }
  };

  /* --- Load on mount if preloaded is empty --- */
  useEffect(() => {
    if (!preloadedMediaURL) loadMediaFromIndexedDB();
  }, []);

  return (
    <VideoContext.Provider
      value={{
        mediaURL,
        mediaType,
        loading,
        loadingMedia,
        storeVideoFromUrl,
        storeImageFromUrl,
        deleteCurrentMedia,
        loadMediaFromIndexedDB,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = () => useContext(VideoContext);
