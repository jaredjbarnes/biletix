import { useAsyncValue } from "ergo-hex";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import "hammerjs";
import { SnapScrollDomain } from "./snap_scroll_domain";
import { usePanning } from "./use_panning";
import { useResizing } from "./useResizing";
import { easings } from "motion-ux";

declare var Hammer: any;

function round(value: number, interval) {
  const halfStep = interval / 2;
  const remainder = Math.abs(value % interval);
  const direction = Math.sign(value);

  return remainder > halfStep
    ? value + direction * (interval - remainder)
    : value - direction * remainder;
}

export interface AppleScrollProps {
  domain: SnapScrollDomain;
  itemWidth: number;
  itemHeight: number;
  style?: React.CSSProperties;
  className?: string;
  onTap?: (event: PointerEvent) => void;
  overflow?: "hidden" | "visible";
}

export function AppleScroll({
  domain,
  itemWidth,
  itemHeight,
  style,
  className,
  onTap,
}: AppleScrollProps) {
  const divRef = useRef<HTMLDivElement | null>(null);
  const viewportWidth = domain.right - domain.left;
  const interval = viewportWidth / 4;
  const adjustedOffset = domain.left * 0.5;
  const startIndex =
    adjustedOffset <= 0
      ? Math.ceil(adjustedOffset / interval)
      : Math.floor(adjustedOffset / interval);
  const children: React.ReactNode[] = [];

  useAsyncValue(domain.offsetBroadcast);
  useAsyncValue(domain.sizeBroadcast);

  usePanning(divRef, domain, onTap);
  useResizing(divRef, domain);

  useEffect(() => {
    domain.initialize(0, 0);
  }, [domain]);

  useLayoutEffect(() => {
    domain.setSnapInterval(interval * 2);
  }, [domain, interval]);

  for (let i = 0; i <= 6; i++) {
    const originalPosition = i * interval - (adjustedOffset % interval);
    const percentage = Math.abs(originalPosition / viewportWidth);
    const boundPercentage = Math.max(Math.min(1, percentage), 0);
    const transformedPosition = easings.easeInQuint(boundPercentage);
    const position = transformedPosition * viewportWidth;
    const scale = 0.9 + boundPercentage * 0.1;

    const style: React.CSSProperties = {
      position: "absolute",
      transform: `translate(${position}px, 0px) scale(${scale})`,
      transformOrigin: "left center",
      height: `${itemHeight}px`,
      width: `${itemWidth}px`,
      backgroundColor: "red",
      boxSizing: "border-box",
      border: "3px solid black",
      borderRadius: "25px",
      top: "0px",
      left: "0px",
      padding: "30px",
    };

    children.push(
      <div key={i} style={style} data-id={i}>
        {startIndex + i}
      </div>
    );
  }

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
        overflow: "hidden",
      }}
      className={className}
    >
      {children}
    </div>
  );
}
