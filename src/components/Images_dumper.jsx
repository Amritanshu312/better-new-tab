import React, { useState, useCallback, useEffect } from "react";
import { Rnd } from "react-rnd";
import { Lock, Unlock, X } from "lucide-react";
import { get, set, del, keys } from "idb-keyval";
import clsx from "clsx";

const Images_dumper = ({ locked, setLocked }) => {
  const [images, setImages] = useState([]);
  const [zIndexOrder, setZIndexOrder] = useState(1);

  useEffect(() => {
    let locked_state = localStorage.getItem("is_image_locked");
    if (locked_state === "false") {
      setLocked(false);
    }
  }, []);

  // Load images from IndexedDB on mount
  useEffect(() => {
    const loadImages = async () => {
      const allKeys = await keys();
      const loaded = [];
      for (const key of allKeys) {
        const item = await get(key);
        if (item) loaded.push(item);
      }
      setImages(loaded);
      const maxZ = loaded.reduce((max, img) => Math.max(max, img.zIndex || 1), 1);
      setZIndexOrder(maxZ + 1);
    };
    loadImages();
  }, []);

  // ⚡ Save image in IndexedDB (Wrap in useCallback)
  const saveImageToDB = useCallback(async (img) => {
    await set(img.id, img);
  }, []);

  // ❌ Delete from DB (Wrap in useCallback)
  const deleteImageFromDB = useCallback(async (id) => {
    await del(id);
  }, []);

  // 🔄 Update image in memory + DB (Wrap in useCallback)
  const updateImage = useCallback(
    async (id, updates) => {
      setImages((prev) => {
        const updated = prev.map((img) =>
          img.id === id ? { ...img, ...updates } : img
        );
        // save only the updated one
        const changed = updated.find((img) => img.id === id);
        if (changed) saveImageToDB(changed);
        return updated;
      });
    },
    [saveImageToDB] // Dependency
  );

  // 🧠 Helper to convert File → base64 (Wrap in useCallback)
  const fileToBase64 = useCallback((file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    }),
    []
  );

  // ✨ NEW: Reusable function to add new images (from drop or paste)
  const addNewImages = useCallback(
    async (imageFiles) => {
      if (locked || imageFiles.length === 0) return;

      const newImages = await Promise.all(
        imageFiles.map(async (file, idx) => {
          const src = await fileToBase64(file);
          const newImg = {
            id: `${Date.now()}-${idx}`,
            src,
            // Pasted files might not have a name, so provide a fallback
            name: file.name || `Pasted Image ${Date.now()}`,
            x: 100 + Math.random() * 200,
            y: 100 + Math.random() * 200,
            width: 220,
            height: 220,
            opacity: 1,
            zIndex: zIndexOrder + idx,
          };
          await saveImageToDB(newImg);
          return newImg;
        })
      );

      setZIndexOrder((z) => z + newImages.length);
      setImages((prev) => [...prev, ...newImages]);
    },
    [locked, zIndexOrder, fileToBase64, saveImageToDB]
  );

  // 🖼 Handle drop (🔄 UPDATED: Use the new helper)
  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      // 🧠 If locked, the helper will catch it, but good to check early.
      if (locked) return;

      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));

      if (imageFiles.length > 0) {
        await addNewImages(imageFiles);
      }
    },
    [locked, addNewImages]
  );

  // ✨ NEW: Handle paste
  const handlePaste = useCallback(
    async (e) => {
      // 🧠 If locked, ignore
      if (locked) return;

      const items = Array.from(e.clipboardData.items);
      const imageFiles = [];

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault(); // Only prevent default if we're handling an image
        await addNewImages(imageFiles);
      }
    },
    [locked, addNewImages]
  );

  // ✨ NEW: useEffect to add the paste event listener
  useEffect(() => {
    // Attach the paste event listener to the document
    document.addEventListener("paste", handlePaste);

    // Cleanup function to remove the listener
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [handlePaste]); // Re-attach if handlePaste changes (it shouldn't, thanks to useCallback)

  const handleDragOver = (e) => e.preventDefault();

  const bringToFront = useCallback(
    (id) => {
      const newZ = zIndexOrder + 1;
      updateImage(id, { zIndex: newZ });
      setZIndexOrder(newZ);
    },
    [zIndexOrder, updateImage]
  );

  const toggleLock = useCallback(() => {
    setLocked((prev) => {
      const newLockedState = !prev;
      localStorage.setItem("is_image_locked", newLockedState);
      return newLockedState;
    });
  }, []); // No dependencies, as setLocked and localStorage are stable

  const handleOpacityChange = useCallback(
    (id, value) => {
      updateImage(id, { opacity: parseFloat(value) });
    },
    [updateImage]
  );

  const deleteImage = useCallback(
    async (id) => {
      await deleteImageFromDB(id);
      setImages((prev) => prev.filter((img) => img.id !== id));
    },
    [deleteImageFromDB]
  );

  const handlePositionChange = useCallback(
    (id, x, y) => {
      updateImage(id, { x, y });
    },
    [updateImage]
  );

  const handleResize = useCallback(
    (id, width, height, x, y) => {
      updateImage(id, { width, height, x, y });
    },
    [updateImage]
  );

  return (
    <div
      className="z-10 fixed w-full h-full top-0 left-0 overflow-hidden select-none"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    // We don't need onPaste here because we attached it to the document
    >
      {/* Images */}
      {images.map((img) => (
        <Rnd
          key={img.id}
          bounds="parent"
          size={{ width: img.width, height: img.height }}
          position={{ x: img.x, y: img.y }}
          enableResizing={!locked}
          disableDragging={locked}
          onDragStart={() => bringToFront(img.id)}
          onResizeStart={() => bringToFront(img.id)}
          onDragStop={(e, d) => handlePositionChange(img.id, d.x, d.y)}
          onResizeStop={(e, dir, ref, delta, pos) =>
            handleResize(
              img.id,
              parseFloat(ref.style.width),
              parseFloat(ref.style.height),
              pos.x,
              pos.y
            )
          }
          style={{
            zIndex: img.zIndex,
            border: "2px solid #555",
            borderRadius: "12px",
            overflow: "hidden",
            opacity: img.opacity
          }}
        >
          <div className="relative w-full h-full">
            <img
              src={img.src}
              alt={img.name}
              className="w-full h-full object-cover"
              draggable={false}
            />

            {/* Delete Button */}
            {!locked && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteImage(img.id);
                }}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md"
              >
                <X size={14} />
              </button>
            )}

            {/* Opacity Slider */}
            {!locked && (
              <input
                type="range"
                min="0.08"
                max="1"
                step="0.01"
                value={img.opacity}
                onChange={(e) => handleOpacityChange(img.id, e.target.value)}
                onMouseDown={(e) => e.stopPropagation()} // prevent dragging
                onTouchStart={(e) => e.stopPropagation()}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3/4 accent-blue-400 cursor-pointer"
              />
            )}
          </div>
        </Rnd>
      ))}

      {/* Lock/Unlock Button */}
      <div className="absolute bottom-4 right-4 flex items-center gap-4">
        <button
          onClick={toggleLock}
          className={clsx("flex h-12 w-12 items-center justify-center text-white opacity-0 hover:opacity-100 bg-[#4e4d4e2e] rounded-xl hover:bg-[#5f5f5f50] transition-all", {
            "opacity-100": !locked
          })}
        >
          {locked ? <Lock size={18} /> : <Unlock size={18} />}
        </button>
      </div>
    </div>
  );
};

export default Images_dumper;