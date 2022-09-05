import { createAnimation, easings } from "motion-ux";
import { AxisDomain } from "./axis_domain";

export class MomentumAxisDomain extends AxisDomain {
  constructor(
    requestAnimationFrame: (callback: () => void) => number,
    cancelAnimationFrame: (id: number) => void
  ) {
    super();
    this._requestAnimationFrame = requestAnimationFrame;
    this._cancelAnimationFrame = cancelAnimationFrame;
    this._deltaOffsetHistory.fill(0);
  }

  pointerEnd() {
    super.pointerEnd();
    const delta = this._deltaOffset;

    if (delta > 3) {
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

  animateTo(value: number, duration = 2000) {
    const offset = this._offset.getValue();

    if (this._requestAnimationId !== -1) {
      this.cancelMomentum();

      const delta = this._deltaOffset;
      const animation = createAnimation({
        offset: {
          from: offset - delta,
          to: offset,
        },
      });

      this._motion.inject(animation);
      this.reset();
    } else {
      const animation = createAnimation({
        offset,
      });
      this._motion.inject(animation);
    }

    value = this._isDisabled ? offset : value;

    // Need to constrain if disabled and well as if snapped.
    this._motion.segueTo(
      createAnimation({ offset: value }),
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
    this._deltaOffset = this._deltaOffset * 0.97;
    const requestAnimationFrame = this._requestAnimationFrame;

    if (this._deltaOffset > 0.1) {
      this._offset.transformValue((o) => {
        o = this._isDisabled ? 0 : o + this._deltaOffset;
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
