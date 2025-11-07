import React, { useState, useCallback, useEffect } from "react";
import { Rnd } from "react-rnd";
import { X } from "lucide-react";
import { createStore, get, set, del, keys } from "idb-keyval";
import { toast } from "react-toastify";
import { useGeneralSettings } from "../context/GeneralSettings";
import PdfPopupViewer from "./PdfViewer";

/* 🗂 Two separate IndexedDB stores */
const metadataStore = createStore("pdf_metadata_db", "metadata_store");
const dataStore = createStore("pdf_data_db", "data_store");

const Images_Pdf_dumper = ({ locked, setLocked }) => {
  const [files, setFiles] = useState([]);
  const [zIndexOrder, setZIndexOrder] = useState(1);
  const { settings } = useGeneralSettings();

  /* 🧠 Load locked state */
  useEffect(() => {
    const lockedState = localStorage.getItem("is_image_locked");
    if (lockedState === "false") setLocked(false);
  }, [setLocked]);

  /* 🧠 Load only metadata from IndexedDB */
  useEffect(() => {
    const loadMetadata = async () => {
      const allKeys = await keys(metadataStore);
      const loaded = [];
      for (const key of allKeys) {
        const meta = await get(key, metadataStore);
        if (meta) loaded.push(meta);
      }
      setFiles(loaded);
      const maxZ = loaded.reduce((max, f) => Math.max(max, f.zIndex || 1), 1);
      setZIndexOrder(maxZ + 1);
    };
    loadMetadata();
  }, []);

  /* ✅ Save metadata + binary separately */
  const saveToDB = useCallback(async (fileObj) => {
    if (fileObj.type === "pdf") {
      const { src, ...metadata } = fileObj;
      await set(fileObj.id, metadata, metadataStore);
      if (src instanceof ArrayBuffer) {
        await set(fileObj.id, src, dataStore);
      }
    } else {
      await set(fileObj.id, fileObj, metadataStore);
    }
  }, []);

  /* ❌ Delete both metadata + binary */
  const deleteFromDB = useCallback(async (id) => {
    await del(id, metadataStore);
    await del(id, dataStore);
  }, []);

  /* 📦 File → Base64 (for images only) */
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

  /* 🧩 Add new files (images + PDFs) */
  const addNewFiles = useCallback(
    async (inputFiles) => {
      if (locked || inputFiles.length === 0) return;

      const newFiles = [];

      for (let idx = 0; idx < inputFiles.length; idx++) {
        const file = inputFiles[idx];
        const type = file.type.startsWith("image/")
          ? "image"
          : file.type === "application/pdf"
            ? "pdf"
            : "other";

        let src = null;

        if (type === "image") {
          src = await fileToBase64(file);
        } else if (type === "pdf") {
          src = await file.arrayBuffer();
        }

        const newFile = {
          id: `${Date.now()}-${idx}`,
          name: file.name,
          type,
          src,
          x: 100 + Math.random() * 200,
          y: 100 + Math.random() * 200,
          zIndex: zIndexOrder + idx,
          opacity: 1,
          width: type === "image" ? 220 : "",
          height: type === "image" ? 220 : 60,
          metadata: {
            size: file.size,
            lastModified: file.lastModified,
          },
        };

        await saveToDB(newFile);

        if (type === "pdf") newFile.src = null;
        newFiles.push(newFile);
      }

      setZIndexOrder((z) => z + newFiles.length);
      setFiles((prev) => [...prev, ...newFiles]);
    },
    [locked, zIndexOrder, fileToBase64, saveToDB]
  );

  /* 🧠 Load PDF binary from 2nd DB on-demand */
  const loadPdfBinary = useCallback(async (id) => {
    const binary = await get(id, dataStore);
    const meta = await get(id, metadataStore);
    if (!binary || !meta) return null;
    return { ...meta, src: binary };
  }, []);

  /* 🗑️ Delete file */
  const deleteFile = useCallback(
    async (id) => {
      await deleteFromDB(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
    },
    [deleteFromDB]
  );

  /* 🖱 Handle Drop (Drag-and-Drop Import) */
  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();

      if (locked) {
        toast.warning("🔒 Unlock the lock state from the bottom-right button to import new files.");
        return;
      }

      const items = e.dataTransfer.items
        ? Array.from(e.dataTransfer.items)
        : Array.from(e.dataTransfer.files);

      const files = [];

      for (const item of items) {
        const file =
          item.kind === "file" ? item.getAsFile() : item instanceof File ? item : null;
        if (
          file &&
          (file.type.startsWith("image/") || file.type === "application/pdf")
        ) {
          files.push(file);
        }
      }

      if (files.length > 0) {
        await addNewFiles(files);
      }
    },
    [locked, addNewFiles]
  );

  const handleDragOver = (e) => e.preventDefault();

  /* ✏️ Position, Resize, Opacity */
  const updateFile = useCallback(
    async (id, updates) => {
      setFiles((prev) => {
        const updated = prev.map((f) => (f.id === id ? { ...f, ...updates } : f));
        const changed = updated.find((f) => f.id === id);
        if (changed) set(changed.id, changed, metadataStore);
        return updated;
      });
    },
    []
  );

  const handlePositionChange = useCallback(
    (id, x, y) => updateFile(id, { x, y }),
    [updateFile]
  );

  const handleResize = useCallback(
    (id, width, height, x, y) => updateFile(id, { width, height, x, y }),
    [updateFile]
  );

  const handleOpacityChange = useCallback(
    (id, value) => updateFile(id, { opacity: parseFloat(value) }),
    [updateFile]
  );

  const bringToFront = useCallback(
    (id) => {
      const newZ = zIndexOrder + 1;
      updateFile(id, { zIndex: newZ });
      setZIndexOrder(newZ);
    },
    [zIndexOrder, updateFile]
  );

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
            border: settings.showBorder
              ? file.type === "pdf"
                ? "1px solid #ffffff24"
                : "2px solid #555"
              : "none",
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
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3/4 accent-blue-400 cursor-pointer"
                    />
                  </>
                )}
              </>
            ) : (
              <PdfPopupViewer
                deleteFile={deleteFile}
                file={file}
                locked={locked}
                loadPdfBinary={loadPdfBinary}
              />
            )}
          </div>
        </Rnd>
      ))}
    </div>
  );
};

export default Images_Pdf_dumper;
