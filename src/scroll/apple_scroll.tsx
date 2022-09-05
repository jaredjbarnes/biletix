import { useAsyncValue } from "ergo-hex";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import "hammerjs";
import { SnapScrollDomain } from "./snap_scroll_domain";
import { usePanning } from "./use_panning";
import { useResizing } from "./use_resizing";
import { createAnimation, easings } from "motion-ux";
import { SnapAxisDomain } from "./snap_axis_domain";
import { useHorizontalResizing } from "./use_horizontal_resizing";
import { useHorizontalPanning } from "./use_horizontal_panning";

declare var Hammer: any;

const veilAnimation = createAnimation({
  opacity: {
    from: 1,
    "80%": {
      value: 0,
      easeIn: "quad",
    },
    to: 0,
  },
});

export interface AppleScrollProps {
  domain: SnapAxisDomain;
  itemWidth: number;
  itemHeight: number;
  style?: React.CSSProperties;
  className?: string;
  onTap?: (event: PointerEvent) => void;
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
  const viewportWidth = domain.end - domain.start - 100;
  const interval = viewportWidth / 4;
  const adjustedOffset = domain.start / 2 - interval * 3;
  const startIndex =
    adjustedOffset <= 0
      ? Math.ceil(adjustedOffset / interval)
      : Math.floor(adjustedOffset / interval);
  const children: React.ReactNode[] = [];

  useAsyncValue(domain.offsetBroadcast);
  useAsyncValue(domain.sizeBroadcast);

  useHorizontalPanning(divRef, domain, onTap);
  useHorizontalResizing(divRef, domain);

  useEffect(() => {
    domain.initialize(0);
  }, [domain]);

  useLayoutEffect(() => {
    domain.setSnapInterval(interval * 2);
  }, [domain, interval]);

  for (let i = 0; i <= 5; i++) {
    const originalPosition = i * interval - (adjustedOffset % interval);
    const percentage = Math.abs(originalPosition / viewportWidth);
    const boundPercentage = Math.max(0, Math.min(percentage, 1));
    const transformedPosition = easings.easeInQuint(percentage);
    const position = transformedPosition * viewportWidth;
    const scale = 0.9 + boundPercentage * 0.1;

    const style: React.CSSProperties = {
      position: "absolute",
      transform: `translate(${position}px, -50%) scale(${scale})`,
      transformOrigin: "left center",
      height: `${itemHeight}px`,
      width: `${itemWidth}px`,
      backgroundColor: "red",
      boxSizing: "border-box",
      border: "3px solid black",
      borderRadius: "25px",
      top: "50%",
      left: "0px",
      padding: "30px",
      overflow: "hidden",
    };

    const veilStyle: React.CSSProperties = {
      position: "absolute",
      top: 0,
      left: 0,
      opacity: veilAnimation.update(boundPercentage).currentValues.opacity,
      width: "100%",
      height: "100%",
      backgroundColor: "black",
    };

    children.push(
      <div key={i} style={style} data-id={i}>
        <div style={veilStyle}></div>
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
        boxSizing: "border-box",
      }}
      className={className}
    >
      {children}
    </div>
  );
}
