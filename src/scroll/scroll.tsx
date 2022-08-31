import { useAsyncValue } from "ergo-hex";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import "hammerjs";
import { Scrollable } from "./scrollable";

declare var Hammer: any;

export interface ScrollProps {
  children: (domain: Scrollable) => React.ReactNode;
  domain: Scrollable;
  style?: React.CSSProperties;
  className?: string;
  onTap?: (event: PointerEvent) => void;
  overflow?: "hidden" | "visible";
}

export function Scroll({
  domain,
  children,
  style,
  className,
  overflow = "hidden",
  onTap,
}: ScrollProps) {
  const divRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const offset = useAsyncValue(domain.offsetBroadcast);
  useAsyncValue(domain.sizeBroadcast);

  useLayoutEffect(() => {
    const stage = divRef.current;
    if (stage != null) {
      const manager = new Hammer.Manager(stage);
      manager.domEvents = true;

      manager.add(
        new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 })
      );

      if (onTap) {
        manager.add(new Hammer.Tap());
      }

      manager.on("tap", (e) => {
        const elapsedTime = Date.now() - domain.lastInteraction;
        if (elapsedTime > 300) {
          onTap && onTap(e.srcEvent);
        }
      });

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
  }, [domain, onTap]);

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

  useEffect(() => {
    domain.initialize(0, 0);
  }, [domain]);

  return (
    <div
      ref={divRef}
      onPointerDown={() => {
        domain.stop();
      }}
      style={{
        ...style,
        position: "relative",
        userSelect: "none",
        touchAction: "none",
        overflow,
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
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
      >
        {children(domain)}
      </div>
    </div>
  );
}
