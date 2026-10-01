import type { MouseEvent, ReactNode } from "react";
import { href } from "../lib/navigation";
import type { View } from "../types/store";

export default function NavLink({
  view,
  current,
  navigate,
  children,
  className,
}: {
  view: View;
  current: View;
  navigate: (view: View) => void;
  children: ReactNode;
  className: string;
}) {
  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.button ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    navigate(view);
  }
  return (
    <a
      href={href(view)}
      onClick={onClick}
      aria-current={current === view ? "page" : undefined}
      className={className}
    >
      {children}
    </a>
  );
}
