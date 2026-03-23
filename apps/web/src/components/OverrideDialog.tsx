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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>覆寫風險提醒</DialogTitle>
          <DialogDescription>
            您即將覆寫以下風險提醒，請說明原因。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-md border p-3 bg-muted/30">
            <p className="font-medium text-sm">{alert.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{alert.why}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="override-reason">覆寫原因</Label>
            <Textarea
              id="override-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="請說明為何覆寫此風險提醒..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={reason.trim().length < 2}
          >
            確認覆寫
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
