import React, { useState } from "react";
import { AppleScroll } from "./apple_scroll";
import { AxisDomain } from "./axis_domain";
import { Scroll } from "./scroll";
import { ScrollDomain } from "./scroll_domain";
import { SnapAxisDomain } from "./snap_axis_domain";
import { StackList } from "./stack_list";
import { VerticalScroll } from "./vertical_scroll";

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

export function SnapVerticalScroll() {
  const [domain] = useState(() => {
    const domain = new SnapAxisDomain(
      requestAnimationFrame,
      cancelAnimationFrame,
      100
    );
    domain.min = 0;
    domain.max = 500;
    return domain;
  });

  return (
    <VerticalScroll
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
          domain.start <= 0
            ? Math.ceil(domain.start / HEIGHT)
            : Math.floor(domain.start / HEIGHT);
        const endIndex = Math.ceil(domain.end / HEIGHT);
        const amount = endIndex - startIndex;
        const children: React.ReactNode[] = [];

        for (let i = -1; i <= amount; i++) {
          const position = i * HEIGHT - (domain.start % HEIGHT);
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
    </VerticalScroll>
  );
}

export function MomentumVerticalScroll() {
  const [domain] = useState(() => {
    const domain = new AxisDomain(requestAnimationFrame, cancelAnimationFrame);
    domain.min = 0;
    domain.max = 500;
    return domain;
  });

  return (
    <VerticalScroll
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
          domain.start <= 0
            ? Math.ceil(domain.start / HEIGHT)
            : Math.floor(domain.start / HEIGHT);
        const endIndex = Math.ceil(domain.end / HEIGHT);
        const amount = endIndex - startIndex;
        const children: React.ReactNode[] = [];

        for (let i = -1; i <= amount; i++) {
          const position = i * HEIGHT - (domain.start % HEIGHT);
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
    </VerticalScroll>
  );
}

export function AppleScrollBaseline() {
  const [domain] = useState(() => {
    const domain = new SnapAxisDomain(
      requestAnimationFrame,
      cancelAnimationFrame,
      300
    );
    domain.min = 0;
    domain.max = 900;
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

export function StackListBaseline() {
  const [domain] = useState(() => {
    const domain = new SnapAxisDomain(
      requestAnimationFrame,
      cancelAnimationFrame,
      300
    );
    domain.min = 0;
    domain.max = 1155;
    return domain;
  });

  return (
    <StackList
      domain={domain}
      style={{
        width: "100%",
        height: `100%`,
        border: "3px solid black",
        boxSizing: "border-box",
      }}
    />
  );
}
