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

  function beginScrolling(e: React.PointerEvent) {
    domain.pointerStart(e.clientY);

    function preventDefault(e: TouchEvent) {
      e.preventDefault();
    }

    function pointerMove(e: PointerEvent) {
      domain.pointerMove(e.clientY);
    }

    function pointerEnd(e: PointerEvent) {
      domain.pointerEnd(e.clientY);

      document.body.removeEventListener("touchmove", preventDefault);
      document.removeEventListener("pointermove", pointerMove);
      document.removeEventListener("pointerleave", pointerEnd);
      document.removeEventListener("pointerup", pointerEnd);
    }
    document.body.style.overflow = "hidden";
    document.body.addEventListener("touchmove", preventDefault, {
      passive: false,
    });
    document.addEventListener("pointermove", pointerMove);
    document.addEventListener("pointerleave", pointerEnd);
    document.addEventListener("pointerup", pointerEnd);

    e.preventDefault();
  }

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
        e.preventDefault;
      }}
      onPointerDown={beginScrolling}
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
