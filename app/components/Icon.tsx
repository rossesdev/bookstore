const icons = {
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z M8 6h8 M8 10h6",
  bag: "M6 7h12l1 14H5L6 7Z M9 9V6a3 3 0 0 1 6 0v3",
  compass:
    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M16 8l-2.5 5.5L8 16l2.5-5.5L16 8Z",
  library: "M4 4v16 M9 3v17 M14 5v15 M19 2v18 M2 20h20",
  plus: "M12 5v14 M5 12h14",
  trash: "M3 6h18 M8 6V4h8v2 M6 6l1 15h10l1-15 M10 10v7 M14 10v7",
  x: "M18 6 6 18 M6 6l12 12",
  left: "M19 12H5 M12 19l-7-7 7-7",
  right: "M5 12h14 M12 5l7 7-7 7",
  check: "M20 6 9 17l-5-5",
  alert:
    "M12 9v4 M12 17h.01 M10.3 3.9 2.4 18a1.5 1.5 0 0 0 1.3 2.2h16.6a1.5 1.5 0 0 0 1.3-2.2l-7.9-14.1a1.5 1.5 0 0 0-2.6 0Z",
  sparkles:
    "M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z M19 16l.5 1.5L21 18l-1.5.5L19 20l-.5-1.5L17 18l1.5-.5L19 16Z",
} as const;
type IconName = keyof typeof icons;
export default function Icon({
  name,
  className = "w-5 h-5",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={icons[name]} />
    </svg>
  );
}
