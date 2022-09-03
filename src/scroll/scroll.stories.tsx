import React, { useState } from "react";
import { AppleScroll } from "./apple_scroll";
import { Scroll } from "./scroll";
import { ScrollDomain } from "./scroll_domain";
import { SnapScrollDomain } from "./snap_scroll_domain";

export default {
  title: "Example/VirtualizedScroller",
  component: Scroll,
};

const HEIGHT = 100;

export function Baseline() {
  const [domain] = useState(() => {
    const domain = new ScrollDomain(
      requestAnimationFrame,
      cancelAnimationFrame
    );
    domain.disableX();
    return domain;
  });

  return (
    <Scroll
      domain={domain}
      style={{
        width: "100%",
        height: `100%`,
        border: "3px solid black",
        boxSizing: "border-box",
      }}
      onTap={(e) => {
        const target = e.target as HTMLElement | null;

        if (target != null) {
          const element = target.closest("[data-id]");

          if (element != null) {
            console.log(element.getAttribute("data-id"));
          }
        }
      }}
    >
      {(domain) => {
        const startIndex =
          domain.top <= 0
            ? Math.ceil(domain.top / HEIGHT)
            : Math.floor(domain.top / HEIGHT);
        const endIndex = Math.ceil(domain.bottom / HEIGHT);
        const amount = endIndex - startIndex;
        const children: React.ReactNode[] = [];

        for (let i = -1; i <= amount; i++) {
          const position = i * HEIGHT - (domain.top % HEIGHT);
          const style: React.CSSProperties = {
            position: "absolute",
            transform: `translate(${0}px, ${position}px)`,
            height: `${HEIGHT}px`,
            width: "100%",
            backgroundColor: "red",
            boxSizing: "border-box",
            border: "3px solid black",
          };

          children.push(
            <div key={i} style={style} data-id={i}>
              {startIndex + i}
            </div>
          );
        }

        return children;
      }}
    </Scroll>
  );
}

export function Snap() {
  const [domain] = useState(() => {
    const domain = new SnapScrollDomain(HEIGHT);
    domain.disableX();
    return domain;
  });

  return (
    <Scroll
      domain={domain}
      style={{
        width: "100%",
        height: `100%`,
        border: "3px solid black",
        boxSizing: "border-box",
      }}
      onTap={(e) => {
        const target = e.target as HTMLElement | null;
        if (target != null) {
          const element = target.closest("[data-id]");

          if (element != null) {
            console.log(element.getAttribute("data-id"));
          }
        }
      }}
    >
      {(domain) => {
        const startIndex =
          domain.top <= 0
            ? Math.ceil(domain.top / HEIGHT)
            : Math.floor(domain.top / HEIGHT);
        const endIndex = Math.ceil(domain.bottom / HEIGHT);
        const amount = endIndex - startIndex;
        const children: React.ReactNode[] = [];

        for (let i = -1; i <= amount; i++) {
          const position = i * HEIGHT - (domain.top % HEIGHT);
          const style: React.CSSProperties = {
            position: "absolute",
            transform: `translate(${0}px, ${position}px)`,
            height: `${HEIGHT}px`,
            width: "100%",
            backgroundColor: "red",
            boxSizing: "border-box",
            border: "3px solid black",
          };

          children.push(
            <div key={i} style={style} data-id={startIndex + i}>
              {startIndex + i}
            </div>
          );
        }

        return children;
      }}
    </Scroll>
  );
}

export function AppleScrollBaseline() {
  const [domain] = useState(() => {
    const domain = new SnapScrollDomain(300);
    return domain;
  });

  return (
    <AppleScroll
      domain={domain}
      itemWidth={300}
      itemHeight={500}
      style={{
        width: "100%",
        height: `100%`,
        border: "3px solid black",
        boxSizing: "border-box",
      }}
    />
  );
}
