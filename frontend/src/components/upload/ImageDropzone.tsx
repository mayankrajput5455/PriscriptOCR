import { useEffect, useRef, useCallback } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

interface ImageDropzoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export function ImageDropzone({ onFileSelect, selectedFile, onClear }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) onFileSelect(file);
  }, [onFileSelect]);

  if (selectedFile) {
    const url = URL.createObjectURL(selectedFile);
    return (
      <div style={{ borderRadius: 16, border: "1px solid #1e293b", overflow: "hidden", background: "#0f172a" }}>
        <div style={{ position: "relative" }}>
          <img src={url} alt="Selected" style={{ width: "100%", maxHeight: 280, objectFit: "contain", display: "block" }} />
          <button
            onClick={onClear}
            style={{
              position: "absolute", top: 12, right: 12, width: 32, height: 32,
              borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(15,23,42,0.85)", border: "1px solid #334155", color: "#94a3b8",
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid #1e293b" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{selectedFile.name}</p>
          <p style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
            {(selectedFile.size / 1024).toFixed(0)} KB · Click or drag to replace
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      style={{
        borderRadius: 16, border: "2px dashed #334155",
        background: "rgba(30,41,59,0.3)", padding: "48px 32px",
        textAlign: "center", cursor: "pointer", transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#3b82f6";
        (e.currentTarget as HTMLDivElement).style.background = "rgba(59,130,246,0.05)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#334155";
        (e.currentTarget as HTMLDivElement).style.background = "rgba(30,41,59,0.3)";
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
      />
      <div
        style={{
          width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)",
        }}
      >
        <Upload size={24} color="#60a5fa" />
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>
        Drop prescription image here
      </p>
      <p style={{ fontSize: 13, color: "#64748b" }}>
        or click to browse · JPG, PNG, WEBP supported
      </p>
    </div>
  );
}
