"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPatient, updatePatient } from "@/actions/patients";
import type { Patient } from "@/db/schema";

interface PatientFormProps {
  patient?: Patient;
  onClose: () => void;
  onSuccess?: () => void;
}

const genders = ["Male", "Female", "Other"];

export function PatientForm({ patient, onClose, onSuccess }: PatientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);

    const result = patient
      ? await updatePatient(patient.id, formData)
      : await createPatient(formData);

    setLoading(false);

    if (result.success) {
      toast.success(patient ? "Patient updated!" : "Patient added successfully!");
      router.refresh();
      onSuccess?.();
    } else {
      toast.error(result.error ?? "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
          Full Name *
        </label>
        <input
          name="name"
          defaultValue={patient?.name}
          placeholder="e.g. Priya Sharma"
          required
          className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
        />
        {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
      </div>

      {/* Age + Gender row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Age *
          </label>
          <input
            name="age"
            type="number"
            min={0}
            max={150}
            defaultValue={patient?.age}
            placeholder="e.g. 35"
            required
            className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Gender *
          </label>
          <select
            name="gender"
            defaultValue={patient?.gender ?? ""}
            required
            className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
          >
            <option value="" disabled>Select...</option>
            {genders.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
          Phone Number *
        </label>
        <input
          name="phone"
          type="tel"
          defaultValue={patient?.phone}
          placeholder="e.g. 9876543210"
          required
          className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-400 text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-600/20"
        >
          {loading ? "Saving..." : patient ? "Save Changes" : "Add Patient"}
        </button>
      </div>
    </form>
  );
}
