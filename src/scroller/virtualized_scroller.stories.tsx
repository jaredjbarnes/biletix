import React, { useState } from "react";
import { VirtualizedScroller } from "./virtualized_scroller";
import { VirtualizedScrollerDomain } from "./virtualized_scroller_domain";

export default {
  title: "Example/VirtualizedScroller",
  component: VirtualizedScroller,
};

export function Baseline() {
  const [domain] = useState(() => {
    const domain = new VirtualizedScrollerDomain(
      requestAnimationFrame,
      cancelAnimationFrame
    );
    domain.disableX();
    return domain;
  });

  function generate() {
    const children: React.ReactNode[] = [];

    for (let x = 0; x < 100; x++) {
      children.push(
        <div
          key={x}
          style={{ margin: "10px", backgroundColor: "red", height: "100px" }}
        ></div>
      );
    }
    return children;
  }
  return (
    <VirtualizedScroller
      style={{ width: "300px", height: "600px", border: "3px solid black" }}
      domain={domain}
    >
      {generate()}
    </VirtualizedScroller>
  );
}