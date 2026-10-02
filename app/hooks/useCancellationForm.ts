import { useRef, useState } from "react";

export function useCancellationForm(onCancel: (id: number) => Promise<boolean>) {
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const reasonRef = useRef<HTMLTextAreaElement>(null);

  function openCancel(id: number) {
    setCancelId(id);
    setReason("");
    setReasonError(false);
  }

  function closeCancel() {
    setCancelId(null);
  }

  async function confirmCancel() {
    if (cancelling) return;
    if (!reason.trim()) {
      setReasonError(true);
      reasonRef.current?.focus();
      return;
    }
    if (!cancelId) return;
    setCancelling(true);
    const cancelled = await onCancel(cancelId);
    setCancelling(false);
    if (!cancelled) return;
    setCancelId(null);
    setReason("");
    setReasonError(false);
  }

  return {
    cancelId,
    reason,
    setReason,
    reasonError,
    setReasonError,
    reasonRef,
    openCancel,
    closeCancel,
    confirmCancel,
    cancelling,
  };
}
