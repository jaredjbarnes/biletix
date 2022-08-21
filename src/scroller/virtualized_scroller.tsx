import { useAsyncValueEffect } from "ergo-hex";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { VirtualizedScrollerDomain } from "./virtualized_scroller_domain";
import "hammerjs";

declare var Hammer: any;

export interface VirtualizedScrollerProps {
  children: (domain: VirtualizedScrollerDomain) => React.ReactNode;
  domainRef?: (domain: VirtualizedScrollerDomain) => void;
  style?: React.CSSProperties;
  className?: string;
  overflow?: "visible" | "hidden";
  disableX?: boolean;
  disableY?: boolean;
  onTap?: (event: PointerEvent) => void;
  settleStep?: number | null | undefined;
  onScrollStart?: (domain: VirtualizedScrollerDomain) => void;
  onScroll?: (domain: VirtualizedScrollerDomain) => void;
  onScrollEnd?: (domain: VirtualizedScrollerDomain) => void;
  renderThreshold?: number;
}

export function VirtualizedScroller({
  domainRef,
  children,
  style,
  className,
  overflow = "hidden",
  disableX = false,
  disableY = false,
  renderThreshold = 1,
  settleStep = null,
  onScrollStart,
  onScroll,
  onScrollEnd,
  onTap,
}: VirtualizedScrollerProps) {
  const [domain] = useState(() => {
    return new VirtualizedScrollerDomain(
      requestAnimationFrame,
      cancelAnimationFrame
    );
  });

  useLayoutEffect(() => {
    domain.onScrollStart = onScrollStart;
  }, [domain, onScrollStart]);

  useLayoutEffect(() => {
    domain.onScroll = onScroll;
  }, [domain, onScroll]);

  useLayoutEffect(() => {
    domain.onScrollEnd = onScrollEnd;
  }, [domain, onScrollEnd]);

  useLayoutEffect(() => {
    if (disableX) {
      domain.disableX();
    } else {
      domain.enableX();
    }
  }, [domain, disableX]);

  useLayoutEffect(() => {
    if (disableY) {
      domain.disableY();
    } else {
      domain.enableY();
    }
  }, [domain, disableY]);

  useLayoutEffect(() => {
    domain.settleStep = settleStep;
  }, [domain, settleStep]);

  const divRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [, setLastYIndex] = useState(-1);
  const [, setLastXIndex] = useState(-1);

  useAsyncValueEffect((offset) => {
    const content = contentRef.current;
    const yIndex = Math.floor(offset.y / renderThreshold);
    const xIndex = Math.floor(offset.x / renderThreshold);

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

  useLayoutEffect(() => {
    domainRef && domainRef(domain);
  }, [domain]);

  return (
    <div
      ref={divRef}
      onPointerDown={(e) => {
        domain.stop();
      }}
      style={{
        ...style,
        position: "relative",
        userSelect: "none",
        touchAction: "pan-x pan-y",
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
        }}
      >
        {children(domain)}
      </div>
    </div>
  );
}
