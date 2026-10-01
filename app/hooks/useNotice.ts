import { useEffect, useRef, useState } from "react";
import type { Notice } from "../types/store";

export function useNotice() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  function toast(message: string, error = false) {
    setNotice({ message, error });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setNotice(null), 2600);
  }

  return { notice, toast };
}
