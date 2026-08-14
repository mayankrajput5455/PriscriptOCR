"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PatientForm } from "@/components/forms/PatientForm";
import type { Patient } from "@/db/schema";
import { X } from "lucide-react";

interface PatientModalProps {
  patient?: Patient;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export function PatientModal({ patient, trigger, onSuccess }: PatientModalProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function handleClose() {
    setOpen(false);
  }

  function handleSuccess() {
    setOpen(false);
    onSuccess?.();
  }

  const modal = open && (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ isolation: "isolate" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        style={{ backdropFilter: "blur(6px)" }}
        onClick={handleClose}
      />

      {/* Modal panel */}
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl animate-fade-in"
        style={{
          background: "#0f172a",
          border: "1px solid #1e293b",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid #1e293b" }}
        >
          <div>
            <h2 className="text-base font-bold text-slate-50">
              {patient ? "Edit Patient" : "Add New Patient"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {patient
                ? "Update patient information"
                : "Register a new patient to the system"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <PatientForm
            patient={patient}
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger}
      </div>
      {mounted && createPortal(modal, document.body)}
    </>
  );
}
