import { useRef, useState } from "react";

export function useCancellationForm(onCancel: (id: string) => void) {
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState(false);
  const reasonRef = useRef<HTMLTextAreaElement>(null);

  function openCancel(id: string) {
    setCancelId(id);
    setReason("");
    setReasonError(false);
  }

  function closeCancel() {
    setCancelId(null);
  }

  function confirmCancel() {
    if (!reason.trim()) {
      setReasonError(true);
      reasonRef.current?.focus();
      return;
    }
    if (cancelId) onCancel(cancelId);
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
  };
}
