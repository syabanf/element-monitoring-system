"use client";
import { AlertTriangle } from "lucide-react";

export function ConfirmDialog({ open, message, onConfirm, onCancel, loading }: {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-[#E5DDD0] w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-[#B91C1C]" />
          </div>
          <div>
            <p className="text-[#1C1714] font-semibold">Confirm Delete</p>
            <p className="text-[#9C9285] text-sm mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-[#E5DDD0] text-[#5C5248] text-sm font-medium hover:bg-[#F5F3EE] transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2 rounded-lg bg-[#B91C1C] text-white text-sm font-medium hover:bg-[#991B1B] disabled:opacity-50 transition-colors">
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
