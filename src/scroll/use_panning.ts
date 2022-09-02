import React, { useLayoutEffect } from "react";
import "hammerjs";
import { Scrollable } from "./scrollable";

declare var Hammer: any;

export function usePanning(
  divRef: React.RefObject<HTMLDivElement | null>,
  domain: Scrollable,
  onTap?: (event: PointerEvent) => void
) {
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
}
