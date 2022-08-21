import React, { useState } from "react";
import { VirtualizedScroller } from "./virtualized_scroller";
import { VirtualizedScrollerDomain } from "./virtualized_scroller_domain";

export default {
  title: "Example/VirtualizedScroller",
  component: VirtualizedScroller,
};

const HEIGHT = 600;
const PADDING = 0;

export function Baseline() {
  return (
    <VirtualizedScroller
      style={{ width: "300px", height: "600px", border: "3px solid black" }}
      renderThreshold={300}
      disableX
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
        const startIndex = Math.floor(domain.top / HEIGHT) - 2;
        const endIndex = Math.ceil(domain.bottom / HEIGHT) + 2;
        const children: React.ReactNode[] = [];

        for (let x = startIndex; x < endIndex; x++) {
          const style: React.CSSProperties = {
            position: "absolute",
            transform: `translate(${0}px, ${x * HEIGHT}px)`,
            height: `${HEIGHT}px`,
            width: "100%",
            backgroundColor: "red",
          };

          children.push(
            <div key={x} style={style} data-id={x}>
              {x}
            </div>
          );
        }

        return children;
      }}
    </VirtualizedScroller>
  );
}

export function Snap() {
  return (
    <VirtualizedScroller
      style={{ width: "300px", height: "600px", border: "3px solid black" }}
      disableX
      settleStep={HEIGHT}
      renderThreshold={300}
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
        const startIndex = Math.floor(domain.top / HEIGHT) - 1;
        const endIndex = Math.ceil(domain.bottom / HEIGHT) + 1;
        const children: React.ReactNode[] = [];

        for (let x = startIndex; x < endIndex; x++) {
          const style: React.CSSProperties = {
            position: "absolute",
            transform: `translate(${0}px, ${x * HEIGHT}px)`,
            height: `${HEIGHT}px`,
            width: "100%",
            backgroundColor: "red",
            boxSizing: "border-box",
            border: "3px solid black",
          };

          children.push(
            <div key={x} style={style} data-id={x}>
              {x}
            </div>
          );
        }

        return children;
      }}
    </VirtualizedScroller>
  );
}
