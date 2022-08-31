import { ObservableValue, ReadonlyObservableValue } from "ergo-hex";
import { createAnimation, easings, Motion } from "motion-ux";
import { BaseScrollDomain } from "./base_scroll_domain";
import { Position, Scrollable, ScrollHandler, Size } from "./scrollable";

export class ScrollDomain extends BaseScrollDomain {
  constructor(
    requestAnimationFrame: (callback: () => void) => number,
    cancelAnimationFrame: (id: number) => void
  ) {
    super();
    this._requestAnimationFrame = requestAnimationFrame;
    this._cancelAnimationFrame = cancelAnimationFrame;
    this._deltaOffsetHistory.fill({ x: 0, y: 0 });
  }

  pointerEnd() {
    super.pointerEnd();
    const deltaX = this._deltaOffset.x;
    const deltaY = this._deltaOffset.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > 6) {
      this._requestAnimationId = requestAnimationFrame(() => {
        this.finishMomentum();
      });
    } else {
      this.stop();
    }
  }

  reset() {
    this.cancelMomentum();
    super.reset();
  }

  animateTo(x: number, y: number, duration = 2000) {
    const offset = this._offset.getValue();

    if (this._requestAnimationId !== -1) {
      this.cancelMomentum();

      const delta = this._deltaOffset;
      const animation = createAnimation({
        x: {
          from: offset.x - delta.x,
          to: offset.x,
        },
        y: {
          from: offset.y - delta.y,
          to: offset.y,
        },
      });

      this._motion.inject(animation);
      this.reset();
    } else {
      const animation = createAnimation({
        x: offset.x,
        y: offset.y,
      });
      this._motion.inject(animation);
    }

    x = this._isXDisabled ? offset.x : x;
    y = this._isYDisabled ? offset.y : y;

    // Need to constrain if disabled and well as if snapped.
    this._motion.segueTo(
      createAnimation({
        x,
        y,
      }),
      duration,
      easings.easeOutQuint
    );
  }

  private cancelMomentum() {
    const cancelAnimationFrame = this._cancelAnimationFrame;
    cancelAnimationFrame(this._requestAnimationId);
    this._requestAnimationId = -1;
  }

  private finishMomentum() {
    this._deltaOffset.y = this._deltaOffset.y * 0.97;
    this._deltaOffset.x = this._deltaOffset.x * 0.97;
    const requestAnimationFrame = this._requestAnimationFrame;

    const distanceTraveled = Math.sqrt(
      this._deltaOffset.x * this._deltaOffset.x +
        this._deltaOffset.y * this._deltaOffset.y
    );

    if (distanceTraveled > 0.1) {
      this._offset.transformValue((o) => {
        o.x = this._isXDisabled ? 0 : o.x + this._deltaOffset.x;
        o.y = this._isYDisabled ? 0 : o.y + this._deltaOffset.y;
        return o;
      });

      this.onScroll && this.onScroll(this);

      this._requestAnimationId = requestAnimationFrame(() => {
        this.finishMomentum();
      });
    } else {
      this.reset();
    }
  }
}
