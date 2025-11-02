import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Settings } from "lucide-react";

const SettingsIcon = ({ locked, setIsSettingsToggled }) => {
  return (
    <AnimatePresence>
      {!locked && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute bottom-20 right-4 flex z-10"
        >
          <button
            className={clsx(
              "flex h-12 w-12 items-center justify-center text-white bg-[#4e4d4e2e] rounded-xl hover:bg-[#5f5f5f50] transition-all"
            )}
            onClick={() => setIsSettingsToggled(prev => !prev)}
          >
            <Settings size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsIcon;
