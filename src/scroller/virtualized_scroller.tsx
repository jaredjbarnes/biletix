import { useAsyncValueEffect } from "ergo-hex";
import React, { PointerEventHandler, useEffect, useRef, useState } from "react";
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
  const isDownRef = useRef<boolean>(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useAsyncValueEffect((y) => {
    const content = contentRef.current;

    if (content != null) {
      content.style.transform = `translate(0px, ${y}px)`;
    }
  }, domain.offsetY);

  function startDrag(e: React.PointerEvent) {
    const id = e.pointerId;
    const div = divRef.current;

    if (div != null) {
      function move(e: PointerEvent) {
        if (id === e.pointerId) {
          domain.pointerMove(e.clientY);
        }
      }

      function end(e: PointerEvent) {
        if (id === e.pointerId) {
          domain.pointerEnd(e.clientY);
        }

        div?.removeEventListener("pointermove", move);
        div?.removeEventListener("pointerup", end);
        div?.removeEventListener("pointerleave", end);
      }

      div.addEventListener("pointermove", move);
      div.addEventListener("pointerup", end);
      div.addEventListener("pointerleave", end);
    }
    domain.pointerStart(e.clientY);
    e.stopPropagation();
    e.preventDefault;
  }

  useEffect(() => {
    const div = divRef.current;

    if (div != null) {
      function cancel(e) {
        e.preventDefault();
        e.stopPropagation();
      }
      div.addEventListener("touchstart", cancel, { passive: false });

      return () => {
        div.removeEventListener("touchstart", cancel);
      };
    }
  }, []);

  return (
    <div
      ref={divRef}
      onPointerDown={startDrag}
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
