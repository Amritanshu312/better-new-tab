import { FileText, X } from "lucide-react";
import { useCallback } from "react";

const PdfPopupViewer = ({ deleteFile, file, locked, loadPdfBinary }) => {
  // 🧩 Load PDF from 2nd DB on-demand
  const openPDF = useCallback(async (file) => {
    let blob = null;

    // Lazy load binary data if not present
    if (!file.src && loadPdfBinary) {
      const fullFile = await loadPdfBinary(file.id);
      if (!fullFile) return;
      file = fullFile;
    }

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
  }, [loadPdfBinary]);

  return (
    <>
      <div
        className="w-full h-full flex items-center justify-center gap-2 cursor-pointer bg-[#00000056] backdrop-blur-lg hover:bg-[#0000006b] transition-all rounded-lg px-2"
        title="Click to open PDF"
      >
        <FileText size={32} className="text-red-400" onClick={() => openPDF(file)} />
        <span
          className="truncate text-sm text-gray-200 font-medium px-2"
          onClick={() => openPDF(file)}
        >
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
  );
};

export default PdfPopupViewer;
