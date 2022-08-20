import React, { useState } from "react";
import { VirtualizedScroller } from "./virtualized_scroller";
import { VirtualizedScrollerDomain } from "./virtualized_scroller_domain";

export default {
  title: "Example/VirtualizedScroller",
  component: VirtualizedScroller,
};

const HEIGHT = 100;
const PADDING = 5;
const HEIGHT_AND_PADDING = PADDING + 100 + PADDING;

export function Baseline() {
  const [domain] = useState(() => {
    const domain = new VirtualizedScrollerDomain(
      requestAnimationFrame,
      cancelAnimationFrame
    );
    domain.disableX();
    return domain;
  });

  return (
    <VirtualizedScroller
      style={{ width: "300px", height: "600px", border: "3px solid black" }}
      enableXScrolling={false}
      renderThreshold={HEIGHT_AND_PADDING}
      onScrollStart={()=>{console.log("start");}}
      onScroll={()=>{console.log("scroll");}}
      onScrollEnd={()=>{console.log("end");}}
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
        const startIndex = Math.floor(domain.top / HEIGHT_AND_PADDING) - 1;
        const endIndex = Math.ceil(domain.bottom / HEIGHT_AND_PADDING) + 1;
        const children: React.ReactNode[] = [];

        for (let x = startIndex; x < endIndex; x++) {
          const style: React.CSSProperties = {
            position: "absolute",
            transform: `translate(${0}px, ${x * HEIGHT_AND_PADDING}px)`,
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
