import { useAsyncValue } from "ergo-hex";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import "hammerjs";
import { Scrollable } from "./scrollable";
import { usePanning } from "./use_panning";
import { useResizing } from "./useResizing";

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
  useAsyncValue(domain.offsetBroadcast);
  useAsyncValue(domain.sizeBroadcast);

  usePanning(divRef, domain, onTap);
  useResizing(divRef, domain);

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
      {children(domain)}
    </div>
  );
}
