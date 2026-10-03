import { useEffect, useRef, useCallback } from "react";
import { Upload, X, FileImage, Camera } from "lucide-react";

interface ImageDropzoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export function ImageDropzone({ onFileSelect, selectedFile, onClear }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) onFileSelect(file);
    },
    [onFileSelect]
  );

  if (selectedFile) {
    const url = URL.createObjectURL(selectedFile);
    return (
      <div
        className="clinical-card"
        style={{
          overflow: "hidden",
          border: "1px solid var(--border-color)",
        }}
      >
        <div style={{ position: "relative", background: "var(--bg-surface-subtle)", padding: 12 }}>
          <img
            src={url}
            alt="Selected prescription document"
            style={{ width: "100%", maxHeight: 300, objectFit: "contain", display: "block" }}
          />
          <button
            onClick={onClear}
            style={{
              position: "absolute",
              top: 18,
              right: 18,
              width: 32,
              height: 32,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-color)",
              color: "var(--text-muted)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>
        <div
          style={{
            padding: "12px 18px",
            borderTop: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{selectedFile.name}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
              {(selectedFile.size / 1024).toFixed(0)} KB · Ready for OCR digitization
            </p>
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--accent-primary)",
              background: "var(--accent-subtle)",
              border: "1px solid var(--accent-border)",
              padding: "4px 10px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Change Image
          </button>
        </div>
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
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      style={{
        borderRadius: 8,
        border: "2px dashed var(--border-input)",
        background: "var(--bg-surface)",
        padding: "48px 32px",
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--accent-primary)";
        e.currentTarget.style.background = "var(--accent-subtle)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-input)";
        e.currentTarget.style.background = "var(--bg-surface)";
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
          width: 52,
          height: 52,
          borderRadius: 8,
          margin: "0 auto 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--accent-subtle)",
          border: "1px solid var(--accent-border)",
          color: "var(--accent-primary)",
        }}
      >
        <Upload size={22} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
        Drop prescription document or photograph here
      </p>
      <p style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
        or click to browse files · Supports JPG, PNG, WEBP high-resolution scans
      </p>
    </div>
  );
}
