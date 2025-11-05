import { useEffect, useState, useCallback } from "react";
import { useVideo } from "../../context/VideoContext";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const VideoQualityPopup = ({ selectedItem, onClose, onSelectQuality }) => {
  if (!selectedItem) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-[#1a1a1a]/90 backdrop-blur-2xl text-white px-6 py-5 rounded-2xl shadow-xl border border-white/10 w-[90%] max-w-[340px]"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 15 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold">Choose Quality</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Section 1: Live Wallpaper */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-3 text-center">
              🎞️ Live Wallpaper
            </h3>
            <div className="flex justify-around">
              {["HD", "4K"].map((quality) => (
                <button
                  key={quality}
                  onClick={() => onSelectQuality(quality)}
                  className="w-24 py-2 rounded-xl bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] border border-white/10 hover:border-white/25 hover:scale-[1.05] active:scale-[0.97] transition-all text-sm font-medium"
                >
                  {quality}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 mb-5" />

          {/* Section 2: Image Wallpaper */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3 text-center">
              🖼️ Wallpaper (Image Only)
            </h3>
            <div className="flex justify-around gap-2">
              {["HD", "2K", "4K"].map((quality) => (
                <button
                  key={quality + "-image"}
                  onClick={() =>
                    onSelectQuality(
                      quality,
                      selectedItem?.image.replace(
                        "364x205",
                        quality === "HD"
                          ? "1920x1080"
                          : quality === "2K"
                            ? "2560x1440"
                            : "3840x2160"
                      )
                    )
                  }
                  className="w-24 py-2 rounded-xl bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] border border-white/10 hover:border-white/25 hover:scale-[1.05] active:scale-[0.97] transition-all text-sm font-medium"
                >
                  {quality}
                </button>
              ))}
            </div>
          </div>

          {/* Cancel */}
          <button
            onClick={onClose}
            className="mt-6 block mx-auto text-gray-400 hover:text-gray-200 text-sm transition"
          >
            Cancel
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================================

const encodeData = (data) => {
  try {
    const str = JSON.stringify(data);
    const xorKey = 123;
    const utf8Bytes = new TextEncoder().encode(str);
    const xorBytes = utf8Bytes.map((b) => b ^ xorKey);
    const base64 = btoa(String.fromCharCode(...xorBytes));
    return base64;
  } catch (err) {
    console.error("Encoding error:", err);
    return null;
  }
};

const decodeData = (encoded) => {
  try {
    const xorKey = 123;
    const binaryStr = atob(encoded);
    const bytes = Uint8Array.from(binaryStr, (c) => c.charCodeAt(0) ^ xorKey);
    const decodedStr = new TextDecoder().decode(bytes);
    return JSON.parse(decodedStr);
  } catch (err) {
    console.error("Decoding error:", err);
    return null;
  }
};

// ============================================================

const BackgroundSections = ({ setIsSettingsToggled }) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    storeVideoFromUrl,
    storeImageFromUrl,
    deleteCurrentMedia,
    loading,
  } = useVideo();


  const handleStoreMedia = async (inputURL) => {
    if (!inputURL?.trim()) return;
    let url = inputURL.trim();

    toast.info("Fetching wallpaper info... 🎬", { autoClose: 2500 });
    setSelectedItem(null);
    setIsSettingsToggled(false);

    try {
      // Step 1: Try to detect MIME type using a HEAD request
      let contentType = null;
      try {
        const head = await fetch(url, { method: "HEAD" });
        if (head.ok) {
          contentType = head.headers.get("content-type");
        } else {
          console.warn("HEAD failed:", head.status, head.statusText);
        }
      } catch (err) {
        console.warn("HEAD request blocked by CORS, using proxy fallback");
      }

      // Step 2: If HEAD failed or returned null, retry via proxy
      if (!contentType) {
        const proxied = `https://slave.ffdarkrayon.workers.dev/cors?url=${encodeURIComponent(
          url
        )}`;
        try {
          const proxiedHead = await fetch(proxied, { method: "HEAD" });
          if (proxiedHead.ok) {
            contentType = proxiedHead.headers.get("content-type");
            url = proxied; // use proxied URL for actual fetch
          }
        } catch (err) {
          console.warn("Proxy HEAD also blocked:", err);
        }
      }

      // Step 3: Determine media type from contentType
      const isVideo = contentType?.startsWith("video");
      const isImage = contentType?.startsWith("image");

      // Step 4: Fetch via proxy if we still don’t have a valid URL or type
      if (!isVideo && !isImage) {
        const proxied = `https://slave.ffdarkrayon.workers.dev/cors?url=${encodeURIComponent(
          url
        )}`;
        url = proxied;
        console.log("⚠️ Unknown content-type, forcing proxy:", proxied);
      }

      // Step 5: Store the media (auto replaces previous)
      toast.info("Downloading wallpaper... ⏳", { autoClose: 2500 });

      if (isVideo) {
        await storeVideoFromUrl(url);
        toast.success("🎥 Video wallpaper set successfully ✅", { autoClose: 2000 });
      } else if (isImage) {
        await storeImageFromUrl(url);
        toast.success("🖼️ Image wallpaper set successfully ✅", { autoClose: 2000 });
      } else {
        // Fallback: guess by content length (large = video, small = image)
        try {
          const res = await fetch(url, { method: "HEAD" });
          const size = parseInt(res.headers.get("content-length") || "0", 10);
          if (size > 10_000_000) {
            await storeVideoFromUrl(url);
            toast.success("🎬 Video wallpaper set ✅", { autoClose: 2000 });
          } else {
            await storeImageFromUrl(url);
            toast.success("🖼️ Image wallpaper set ✅", { autoClose: 2000 });
          }
        } catch {
          toast.error("❌ Failed to detect wallpaper type. Try again.");
        }
      }
    } catch (err) {
      console.error("❌ handleStoreMedia Error:", err);
      toast.error("Failed to fetch wallpaper (CORS or network error) ❌", {
        autoClose: 3000,
      });
    }
  };



  const handleSelectQuality = (quality, url) => {
    if (url) {
      handleStoreMedia(url);
    } else {
      const selectedDownload = selectedItem?.downloads?.find(
        (d) => d.quality === quality
      );
      if (selectedDownload?.url) handleStoreMedia(selectedDownload.url);
      else toast.error(`${quality} version not available ❌`);
    }
  };

  // ============================================================

  const fetchData = useCallback(
    async (type = "wallpapers") => {
      if (type === "search") {
        setLoadingData(true);
        try {
          const url = `https://new-tab-ebon.vercel.app/api/search?q=${encodeURIComponent(
            searchQuery
          )}`;
          const res = await fetch(url);
          if (res.ok) {
            const json = await res.json();
            setData(json?.results || []);
          } else toast.error("Failed to load wallpapers ❌");
        } catch (err) {
          console.error(err);
          toast.error("Network error while fetching data ❌");
        } finally {
          setLoadingData(false);
        }
        return;
      }

      setLoadingData(true);
      try {
        const cacheRaw = localStorage.getItem("cache_wallpapers");
        const cache = cacheRaw ? decodeData(cacheRaw) : { pages: {}, timestamp: 0 };
        const isExpired = Date.now() - cache.timestamp > 60 * 1000 * 60 * 24 * 10;

        if (!isExpired && cache.pages[page]) {
          setData(cache.pages[page]);
          setLoadingData(false);
          return;
        }

        const url = `https://new-tab-ebon.vercel.app/api/wallpapers?page=${page}&limit=53`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          const results = json?.results?.slice(0, 53) || [];

          if (page <= 3) {
            const updatedCache = {
              pages: { ...cache.pages, [page]: results },
              timestamp: Date.now(),
            };
            const encoded = encodeData(updatedCache);
            if (encoded) localStorage.setItem("cache_wallpapers", encoded);
          }

          setData(results);
        } else {
          toast.error("Failed to load wallpapers ❌");
        }
      } catch (err) {
        console.error(err);
        toast.error("Network error while fetching data ❌");
      } finally {
        setLoadingData(false);
      }
    },
    [page, searchQuery]
  );

  useEffect(() => {
    fetchData("wallpapers");
  }, [page]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchQuery.trim()) fetchData("search");
      else fetchData("wallpapers");
    }, 500);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  // ============================================================

  return (
    <div className="relative">
      {/* Popup Modal */}
      <VideoQualityPopup
        selectedItem={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSelectQuality={handleSelectQuality}
      />

      {/* Search + Page Nav */}
      <div className="w-full h-8 mb-2 flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-full rounded-md px-4 border border-[#ffffff18] outline-none bg-[#2e30374d] text-white"
          placeholder="Search wallpapers..."
        />
        <div
          className={`flex gap-1 items-center border border-[#ffffff18] rounded-md px-5 bg-[#2e30374d] cursor-pointer transition ${loadingData ? "opacity-50 cursor-not-allowed" : "hover:bg-[#393b45]"
            }`}
          onClick={() => {
            if (!loadingData) setPage((prev) => (prev > 1 ? prev - 1 : prev));
          }}
        >
          {loadingData ? "Loading..." : (
            <>
              <ChevronLeft size={18} /> Prev
            </>
          )}
        </div>
        <div
          className={`flex gap-1 items-center border border-[#ffffff18] rounded-md px-5 bg-[#2e30374d] cursor-pointer transition ${loadingData ? "opacity-50 cursor-not-allowed" : "hover:bg-[#393b45]"
            }`}
          onClick={() => {
            if (!loadingData) setPage((prev) => prev + 1);
          }}
        >
          {loadingData ? "Loading..." : (
            <>
              Next <ChevronRight size={18} />
            </>
          )}
        </div>
      </div>

      {/* Wallpapers grid */}
      {loadingData ? (
        <div className="text-gray-400 text-center mt-10 animate-pulse">
          Loading wallpapers...
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2 mb-[40px]">
          <button
            onClick={async () => {
              toast.info("Deleting stored media…");
              await deleteCurrentMedia();
              toast.success("Stored wallpaper deleted ❌");
            }}
            disabled={loading}
            className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            {loading ? "Loading..." : "Reset To Default"}
          </button>

          {data.map((item, i) => (
            <div
              key={i}
              className="cursor-pointer transition-transform hover:scale-[1.02] bg-[#43444531] aspect-video"
              onClick={() => setSelectedItem(item)}
            >
              <img
                src={item?.image}
                alt={item?.title || ""}
                className="w-full h-full rounded-lg border border-[#ffffff20]"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BackgroundSections;
