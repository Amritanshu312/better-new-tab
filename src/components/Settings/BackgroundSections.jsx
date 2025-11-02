import { useEffect, useState, useCallback } from "react";
import { useVideo } from "../../context/VideoContext";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@headlessui/react";

const VideoQualityPopup = ({ selectedItem, onClose, onSelectQuality }) => {
  if (!selectedItem) return null;

  return (
    <div className="fixed inset-0 bg-[#000000b1] flex items-center justify-center z-50">
      <div className="bg-[#111111b3] backdrop-blur-2xl text-white px-6 py-4 rounded-2xl shadow-lg border border-[#ffffff0e] w-[90%] max-w-[300px]">
        <h2 className="text-base font-medium mb-4 text-center">
          Choose Video Quality
        </h2>
        <div className="flex justify-around">
          <Button
            onClick={() => onSelectQuality("HD")}
            className="px-6 py-2 text-sm bg-[#111111b3] border border-[#ffffff1b] rounded-md hover:bg-[#1818188b] transition"
          >
            HD
          </Button>
          <button
            onClick={() => onSelectQuality("4K")}
            className="px-6 text-sm bg-[#111111b3] border border-[#ffffff1b] rounded-md hover:bg-[#1818188b] transition"
          >
            4K
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-5 block mx-auto px-3 py-1 text-sm text-gray-400 hover:text-gray-200 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const BackgroundSections = ({ setIsSettingsToggled }) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { storeVideoFromUrl, deleteVideoFromIndexedDB, loading } = useVideo();

  const handleStoreVideo = async (inputURL) => {
    if (!inputURL?.trim()) return;

    toast.info("Downloading video... 🎬", { autoClose: 3000 });
    try {
      setSelectedItem(null);
      setIsSettingsToggled(false)
      await storeVideoFromUrl(inputURL.trim(), "myVideo");
      toast.success("Video set successfully ✅", { autoClose: 2000 });
    } catch (err) {
      console.error(err);
      toast.error("Failed to set video ❌", { autoClose: 2500 });
    }
  };

  const handleSelectQuality = (quality) => {
    const selectedDownload = selectedItem?.downloads?.find(
      (d) => d.quality === quality
    );
    if (selectedDownload?.url) {
      handleStoreVideo(selectedDownload.url);
    } else {
      toast.error(`${quality} version not available ❌`);
    }
  };


  // Debounce search input (wait 500ms after user stops typing)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchData("search");
      } else {
        fetchData("wallpapers");
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const fetchData = useCallback(
    async (type = "wallpapers") => {
      setLoadingData(true);
      try {
        const url =
          type === "search"
            ? `https://new-tab-ebon.vercel.app/api/search?q=${encodeURIComponent(
              searchQuery
            )}`
            : `https://new-tab-ebon.vercel.app/api/wallpapers?page=${page}&limit=53`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setData(data?.results || []);
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

  return (
    <div className="relative">
      {/* Popup Modal */}
      <VideoQualityPopup
        selectedItem={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSelectQuality={handleSelectQuality}
      />

      {/* Search + Next */}
      <div className="w-full h-8 mb-2 flex gap-2 ">
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
            if (!loadingData) setPage((prev) => prev > 1 ? prev - 1 : prev);
          }}
        >
          {loadingData ? "Loading..." : <><ChevronLeft size={18} /> Prev</>}
        </div>
        <div
          className={`flex gap-1 items-center border border-[#ffffff18] rounded-md px-5 bg-[#2e30374d] cursor-pointer transition ${loadingData ? "opacity-50 cursor-not-allowed" : "hover:bg-[#393b45]"
            }`}
          onClick={() => {
            if (!loadingData) setPage((prev) => prev + 1);
          }}
        >
          {loadingData ? "Loading..." : <>Next <ChevronRight size={18} /></>}
        </div>
      </div>

      {/* Wallpapers grid */}
      {loadingData ? (
        <div className="text-gray-400 text-center mt-10 animate-pulse">
          Loading wallpapers...
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2 mb-[40px] ">
          <button
            onClick={async () => {
              toast.info("Deleting stored video…");
              await deleteVideoFromIndexedDB();
              toast.success("Stored video Deleted ❌");
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
