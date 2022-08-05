import { useAsyncValueEffect } from "ergo-hex";
import React, { PointerEventHandler, useRef, useState } from "react";
import { VirtualizedScrollerDomain } from "./virtualized_scroller_domain";

export interface VirtualizedScrollerProps {
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
}

export function VirtualizedScroller({
  style,
  className,
  children,
}: VirtualizedScrollerProps) {
  const [domain] = useState(
    () =>
      new VirtualizedScrollerDomain(requestAnimationFrame, cancelAnimationFrame)
  );
  const divRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useAsyncValueEffect((y) => {
    const content = contentRef.current;

    if (content != null) {
      content.style.transform = `translate(0px, ${y}px)`;
    }
  }, domain.offsetY);

  return (
    <div
      ref={divRef}
      onTouchMove={(e) => {
        e.stopPropagation();
        e.preventDefault;
      }}
      onPointerDown={(e) => {
        document.body.style.overflow = "hidden";
        domain.pointerStart(e.clientY);
      }}
      onPointerMove={(e) => {
        domain.pointerMove(e.clientY);
      }}
      onPointerLeave={(e) => {
        domain.pointerEnd(e.clientY);
      }}
      onPointerUp={(e) => {
        domain.pointerEnd(e.clientY);
      }}
      style={{ ...style, position: "relative", overflow: "hidden" }}
      className={className}
    >
      <div
        ref={contentRef}
        style={{
          position: "absolute",
          width: "100%",
          height: "1px",
          overflow: "visible",
        }}
      >
        {children}
      </div>
    </div>
  );
}
