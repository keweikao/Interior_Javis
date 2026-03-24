import { useState } from 'react';
import type { RiskAlert } from '@q-check/construction-knowledge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface OverrideDialogProps {
  alert: RiskAlert | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export function OverrideDialog({ alert, open, onClose, onSubmit }: OverrideDialogProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (reason.trim().length < 2) return;
    onSubmit(reason.trim());
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  if (!alert) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent
        className="sm:max-w-md"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E8E4DF',
          boxShadow: '0 8px 30px rgba(42,42,42,0.12), 0 2px 8px rgba(42,42,42,0.06)',
          borderRadius: '6px',
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-[#2A2A2A]">
            專業判斷
          </DialogTitle>
          <DialogDescription className="text-sm text-[#8A8580]">
            您即將以專業判斷處理以下風險提醒，請說明原因。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Alert detail card */}
          <div
            className="rounded-md p-4"
            style={{
              backgroundColor: '#F7F5F2',
              border: '1px solid #E8E4DF',
            }}
          >
            <p className="text-sm font-semibold text-[#2A2A2A]">{alert.title}</p>
            <p className="text-xs text-[#8A8580] mt-1.5 leading-relaxed">{alert.why}</p>
          </div>

          {/* Reason textarea */}
          <div className="space-y-2">
            <label
              htmlFor="override-reason"
              className="text-xs font-medium uppercase tracking-widest text-[#B5B0AA]"
            >
              判斷原因
            </label>
            <textarea
              id="override-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="請說明您的專業判斷依據..."
              rows={3}
              className="w-full text-sm p-3 rounded-md bg-white resize-y"
              style={{
                border: '1px solid #E8E4DF',
              }}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-md text-sm font-medium text-[#8A8580] hover:text-[#2A2A2A] hover:bg-[#F7F5F2] transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={reason.trim().length < 2}
            className="
              px-4 py-2 rounded-md text-sm font-semibold
              bg-[#B8763E] text-white
              hover:bg-[#9A6232]
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors cursor-pointer
            "
          >
            確認判斷
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
