import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Move } from "lucide-react";
import { useEffect } from "react";
import { toast } from "react-toastify";

const CustomizationIcon = ({ locked, isCustomizationState, setIsCustomizationState }) => {
  useEffect(() => {
    if (!isCustomizationState) {
      return
    }
    toast(
      <div className="z-40">
        <h4 className="font-semibold text-white">Customization State Is {isCustomizationState ? "Active" : "Inactive"}</h4>
        <p className="text-gray-300 text-sm">
          Customization mode is{" "}
          <span className={isCustomizationState ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
            {isCustomizationState ? "Active" : "Inactive"}
          </span>
          . {isCustomizationState
            ? "You can now move and adjust elements on this page, such as the Apps Bar, time, and more."
            : "Enable it to rearrange elements like the Apps Bar, time, and other components."}
        </p>
      </div>,
      {
        position: "top-right",
        autoClose: 4000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: "bg-[#333] text-white rounded-lg shadow-md",
      }
    );

  }, [isCustomizationState])


  return (
    <AnimatePresence>
      {!locked && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 40 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute bottom-36 right-4 flex z-10"
        >
          <button
            className={clsx(
              "flex h-12 w-12 items-center justify-center text-white bg-[#4e4d4e2e] rounded-xl hover:bg-[#5f5f5f50] transition-all",
              {
                "bg-[#4e4d4e]": isCustomizationState
              }
            )}
            onClick={() => setIsCustomizationState(prev => !prev)}
          >
            <Move size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomizationIcon;
