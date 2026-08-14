"use client";

import { useCallback, useState } from "react";
import { Upload, ImageIcon, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  disabled?: boolean;
}

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const MAX_SIZE_MB = 10;

export function ImageDropzone({
  onFileSelect,
  selectedFile,
  onClear,
  disabled,
}: ImageDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const validateAndSelect = useCallback(
    (file: File) => {
      setError(null);
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Only JPG, JPEG, and PNG files are supported.");
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`File size must be under ${MAX_SIZE_MB}MB.`);
        return;
      }
      const url = URL.createObjectURL(file);
      setPreview(url);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndSelect(file);
    },
    [validateAndSelect]
  );

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
  };

  const handleClear = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setError(null);
    onClear();
  };

  if (selectedFile && preview) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-800 group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview}
          alt="Prescription preview"
          style={{ width: "100%", height: "auto", maxHeight: 400, objectFit: "contain", display: "block" }}
        />
        {!disabled && (
          <button
            onClick={handleClear}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-gradient-to-t from-slate-900 to-transparent">
          <p className="text-xs text-slate-400 truncate">{selectedFile.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 min-h-[220px]",
          dragOver
            ? "border-blue-500 bg-blue-500/5"
            : "border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          className="hidden"
          onChange={handleInput}
          disabled={disabled}
        />
        <div
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
            dragOver ? "bg-blue-500/20 text-blue-400" : "bg-slate-700 text-slate-500"
          )}
        >
          {dragOver ? (
            <ImageIcon className="w-6 h-6" />
          ) : (
            <Upload className="w-6 h-6" />
          )}
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-300">
            {dragOver ? "Drop to upload" : "Upload Prescription Image"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Drag & drop or click to browse · JPG, PNG up to 10MB
          </p>
        </div>
      </label>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
