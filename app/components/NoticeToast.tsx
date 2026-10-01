import type { Notice } from "../types/store";
import Icon from "./Icon";

export default function NoticeToast({ notice }: { notice: Notice | null }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`toast fixed bottom-6 right-6 z-50 max-w-[calc(100vw-3rem)] flex items-center gap-3 bg-surface-lowest text-content px-5 py-3 rounded-lg  border border-outline text-sm ${notice ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"}`}
    >
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center ${notice?.error ? "bg-error/10 text-error" : "bg-success/10 text-success"}`}
      >
        <Icon name={notice?.error ? "alert" : "check"} className="w-4 h-4" />
      </span>
      <span className="font-medium">{notice?.message}</span>
    </div>
  );
}
