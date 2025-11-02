import React, { useState, useCallback, useEffect } from "react";
import { Rnd } from "react-rnd";
import { Lock, Unlock, X, FileText } from "lucide-react";
import { get, set, del, keys } from "idb-keyval";
import clsx from "clsx";

const Images_dumper = ({ locked, setLocked }) => {
  const [files, setFiles] = useState([]);
  const [zIndexOrder, setZIndexOrder] = useState(1);

  // 🧠 Load locked state
  useEffect(() => {
    const lockedState = localStorage.getItem("is_image_locked");
    if (lockedState === "false") setLocked(false);
  }, []);

  // 🧠 Load all files (images + PDFs) from IndexedDB
  useEffect(() => {
    const loadFiles = async () => {
      const allKeys = await keys();
      const loaded = [];
      for (const key of allKeys) {
        const item = await get(key);
        if (item) loaded.push(item);
      }
      setFiles(loaded);
      const maxZ = loaded.reduce((max, f) => Math.max(max, f.zIndex || 1), 1);
      setZIndexOrder(maxZ + 1);
    };
    loadFiles();
  }, []);

  // ✅ Save to DB
  const saveToDB = useCallback(async (fileObj) => {
    await set(fileObj.id, fileObj);
  }, []);

  // ❌ Delete from DB
  const deleteFromDB = useCallback(async (id) => {
    await del(id);
  }, []);

  // 🔄 Update file data
  const updateFile = useCallback(
    async (id, updates) => {
      setFiles((prev) => {
        const updated = prev.map((f) => (f.id === id ? { ...f, ...updates } : f));
        const changed = updated.find((f) => f.id === id);
        if (changed) saveToDB(changed);
        return updated;
      });
    },
    [saveToDB]
  );

  // 📦 Convert File → base64
  const fileToBase64 = useCallback(
    (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      }),
    []
  );

  // 🧩 Add new files (images + PDFs)
  const addNewFiles = useCallback(
    async (inputFiles) => {
      if (locked || inputFiles.length === 0) return;

      const newFiles = await Promise.all(
        inputFiles.map(async (file, idx) => {
          const type = file.type.startsWith("image/")
            ? "image"
            : file.type === "application/pdf"
              ? "pdf"
              : "other";

          let src = null;
          if (type === "image") {
            src = await fileToBase64(file);
          } else if (type === "pdf") {
            const blob = await file.arrayBuffer();
            src = blob; // store ArrayBuffer for PDFs
          }

          const newFile = {
            id: `${Date.now()}-${idx}`,
            src,
            name: file.name || `File ${Date.now()}`,
            type,
            x: 100 + Math.random() * 200,
            y: 100 + Math.random() * 200,
            zIndex: zIndexOrder + idx,
            opacity: 1,
            width: type === "image" ? 220 : "",
            height: type === "image" ? 220 : 60,
          };

          await saveToDB(newFile);
          return newFile;
        })
      );

      setZIndexOrder((z) => z + newFiles.length);
      setFiles((prev) => [...prev, ...newFiles]);
    },
    [locked, zIndexOrder, fileToBase64, saveToDB]
  );

  // 🖱 Drop handler
  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      if (locked) return;

      const dropped = Array.from(e.dataTransfer.files);
      const supported = dropped.filter(
        (f) => f.type.startsWith("image/") || f.type === "application/pdf"
      );

      if (supported.length > 0) await addNewFiles(supported);
    },
    [locked, addNewFiles]
  );

  // 📋 Paste handler
  const handlePaste = useCallback(
    async (e) => {
      if (locked) return;
      const items = Array.from(e.clipboardData.items);
      const files = [];

      for (const item of items) {
        if (item.type.startsWith("image/") || item.type === "application/pdf") {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0) {
        e.preventDefault();
        await addNewFiles(files);
      }
    },
    [locked, addNewFiles]
  );

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const handleDragOver = (e) => e.preventDefault();

  const bringToFront = useCallback(
    (id) => {
      const newZ = zIndexOrder + 1;
      updateFile(id, { zIndex: newZ });
      setZIndexOrder(newZ);
    },
    [zIndexOrder, updateFile]
  );

  const toggleLock = useCallback(() => {
    setLocked((prev) => {
      const newState = !prev;
      localStorage.setItem("is_image_locked", newState);
      return newState;
    });
  }, []);

  const handleOpacityChange = useCallback(
    (id, value) => updateFile(id, { opacity: parseFloat(value) }),
    [updateFile]
  );

  const deleteFile = useCallback(
    async (id) => {
      await deleteFromDB(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
    },
    [deleteFromDB]
  );

  const handlePositionChange = useCallback(
    (id, x, y) => updateFile(id, { x, y }),
    [updateFile]
  );

  const handleResize = useCallback(
    (id, width, height, x, y) => updateFile(id, { width, height, x, y }),
    [updateFile]
  );

  // 🔗 Open PDF in new tab (recreate Blob URL for proper viewer)
  const openPDF = useCallback(async (file) => {
    let blob = null;
    if (file.src instanceof ArrayBuffer) {
      blob = new Blob([file.src], { type: "application/pdf" });
    } else {
      const res = await fetch(file.src);
      const arr = await res.arrayBuffer();
      blob = new Blob([arr], { type: "application/pdf" });
    }

    const url = URL.createObjectURL(blob);
    const viewer = window.open("", "_blank");
    if (viewer) {
      viewer.document.write(`
        <html>
          <head>
            <title>${file.name}</title>
            <style>
              html, body {
                margin: 0;
                padding: 0;
                background: #000;
                height: 100%;
              }
              iframe {
                border: none;
                width: 100%;
                height: 100%;
              }
            </style>
          </head>
          <body>
            <iframe src="${url}"></iframe>
          </body>
        </html>
      `);
    }
  }, []);

  return (
    <div
      className="z-10 fixed w-full h-full top-0 left-0 overflow-hidden select-none"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {files.map((file) => (
        <Rnd
          key={file.id}
          bounds="parent"
          size={{ width: file.width, height: file.height }}
          position={{ x: file.x, y: file.y }}
          enableResizing={!locked}
          disableDragging={locked}
          onDragStart={() => bringToFront(file.id)}
          onResizeStart={() => bringToFront(file.id)}
          onDragStop={(e, d) => handlePositionChange(file.id, d.x, d.y)}
          onResizeStop={(e, dir, ref, delta, pos) =>
            handleResize(
              file.id,
              parseFloat(ref.style.width),
              parseFloat(ref.style.height),
              pos.x,
              pos.y
            )
          }
          style={{
            zIndex: file.zIndex,
            border: file.type === "pdf" ? "1px solid #ffffff24" : "2px solid #555",
            borderRadius: "12px",
            overflow: "hidden",
            opacity: file.type === "image" ? file.opacity : 1,
            background: "transparent",
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center text-white">
            {file.type === "image" ? (
              <>
                <img
                  src={file.src}
                  alt={file.name}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                {!locked && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFile(file.id);
                      }}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md"
                    >
                      <X size={14} />
                    </button>

                    <input
                      type="range"
                      min="0.08"
                      max="1"
                      step="0.01"
                      value={file.opacity}
                      onChange={(e) => handleOpacityChange(file.id, e.target.value)}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3/4 accent-blue-400 cursor-pointer"
                    />
                  </>
                )}
              </>
            ) : (
              <>
                <div

                  className="w-full h-full flex items-center justify-center gap-2 cursor-pointer bg-[#00000056] backdrop-blur-lg hover:bg-[#0000006b] transition-all rounded-lg px-2"
                  title="Click to open PDF"
                >
                  <FileText size={32} className="text-red-400" onClick={() => openPDF(file)} />
                  <span className="truncate text-sm text-gray-200 font-medium px-2" onClick={() => openPDF(file)}>
                    {file.name}
                  </span>
                </div>

                {!locked && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFile(file.id);
                    }}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md"
                  >
                    <X size={14} />
                  </button>
                )}
              </>
            )}
          </div>
        </Rnd>
      ))}

      {/* 🔒 Lock / Unlock Button */}
      <div className="absolute bottom-4 right-4 flex items-center gap-4">
        <button
          onClick={toggleLock}
          className={clsx(
            "flex h-12 w-12 items-center justify-center text-white opacity-0 hover:opacity-100 bg-[#4e4d4e2e] rounded-xl hover:bg-[#5f5f5f50] transition-all",
            {
              "opacity-100": !locked,
            }
          )}
        >
          {locked ? <Lock size={18} /> : <Unlock size={18} />}
        </button>
      </div>
    </div>
  );
};

export default Images_dumper;
