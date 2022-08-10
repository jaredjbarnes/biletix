import { useAsyncValue, useAsyncValueEffect, useUpdate } from "ergo-hex";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { VirtualizedScrollerDomain } from "./virtualized_scroller_domain";

export interface VirtualizedScrollerProps {
  style?: React.CSSProperties;
  className?: string;
  domain: VirtualizedScrollerDomain;
  children: (domain: VirtualizedScrollerDomain) => React.ReactNode;
  movementThreshold?: number;
}

export function VirtualizedScroller({
  style,
  className,
  children,
  domain,
  movementThreshold = 1,
}: VirtualizedScrollerProps) {
  const divRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [, setLastYIndex] = useState(-1);
  const [, setLastXIndex] = useState(-1);

  useAsyncValueEffect((offset) => {
    const content = contentRef.current;
    const yIndex = Math.floor(offset.y / movementThreshold);
    const xIndex = Math.floor(offset.x / movementThreshold);

    setLastXIndex(xIndex);
    setLastYIndex(yIndex);

    if (content != null) {
      content.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
    }
  }, domain.offsetBroadcast);

  const startDrag = useCallback(
    function startDrag(e: React.PointerEvent) {
      const id = e.pointerId;
      const div = divRef.current;

      if (div != null) {
        function move(e: PointerEvent) {
          if (id === e.pointerId) {
            domain.pointerMove(e.clientX, e.clientY);
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
      domain.pointerStart(e.clientX, e.clientY);
      e.stopPropagation();
      e.preventDefault;
    },
    [domain]
  );

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

  useEffect(() => {
    const div = divRef.current;

    if (div == null) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry != null) {
        domain.setSize(entry.contentRect.width, entry.contentRect.height);
      }
    });

    observer.observe(div);

    const rect = div.getBoundingClientRect();
    domain.setSize(rect.width, rect.height);

    return () => {
      observer.disconnect();
    };
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
        {children(domain)}
      </div>
    </div>
  );
}
