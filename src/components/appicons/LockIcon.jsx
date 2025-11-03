import clsx from "clsx";
import { useCallback } from "react";
import { Lock, Unlock } from "lucide-react"; // ✅ Import icons

const LockIcon = ({ locked, setLocked }) => {
  const toggleLock = useCallback(() => {
    setLocked((prev) => {
      const newState = !prev;
      localStorage.setItem("is_image_locked", JSON.stringify(newState)); // ✅ store as string
      return newState;
    });
  }, [setLocked]); // ✅ dependency added

  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-4 z-50">
      <button
        onClick={toggleLock}
        className={clsx(
          "flex h-12 w-12 items-center justify-center text-white bg-[#4e4d4e2e] rounded-xl transition-all hover:bg-[#5f5f5f50]",
          !locked ? "opacity-100" : "opacity-0 hover:opacity-100"
        )}
      >
        {locked ? <Lock size={18} /> : <Unlock size={18} />}
      </button>
    </div>
  );
};

export default LockIcon;
