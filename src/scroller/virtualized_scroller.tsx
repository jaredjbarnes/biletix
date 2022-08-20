import { useAsyncValueEffect } from "ergo-hex";
import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { VirtualizedScrollerDomain } from "./virtualized_scroller_domain";
import "hammerjs";

declare var Hammer: any;

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

  useLayoutEffect(() => {
    const stage = divRef.current;
    if (stage != null) {
      const manager = new Hammer.Manager(stage);
      manager.add(
        new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 })
      );

      manager.on("panstart", (e) => {
        domain.pointerStart(e.center.x, e.center.y);
      });

      manager.on("panmove", (e) => {
        domain.pointerMove(e.center.x, e.center.y);
      });

      manager.on("panend", (e) => {
        domain.pointerEnd();
      });

      manager.on("pancancel", (e) => {
        domain.pointerEnd();
      });

      return () => {
        manager.stop();
        manager.destroy();
      };
    }
  }, [domain]);

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
      onPointerDown={(e) => {
        domain.pointerStart(e.clientX, e.clientY);
        domain.pointerEnd();
      }}
      style={{
        ...style,
        position: "relative",
        overflow: "hidden",
        userSelect: "none",
      }}
      className={className}
    >
      <div
        ref={contentRef}
        style={{
          position: "absolute",
          width: "100%",
          height: "1px",
          overflow: "visible",
          userSelect: "none",
        }}
      >
        {children(domain)}
      </div>
    </div>
  );
}
