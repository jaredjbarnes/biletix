import { createAnimation, easings } from "motion-ux";
import { BaseScrollDomain } from "./base_scroll_domain";

export class SnapScrollDomain extends BaseScrollDomain {
  private _snapInterval: number;

  constructor(snapInterval: number) {
    super();
    this._snapInterval = Math.max(snapInterval, 0);
  }

  setSnapInterval(interval: number) {
    this._snapInterval = interval;
  }

  pointerEnd() {
    super.pointerEnd();
    this.settle();
  }

  stop() {
    super.stop();
    this.settle();
  }

  animateTo(x: number, y: number, duration = 2000) {
    const offset = this._offset.getValue();
    const animation = createAnimation({
      x: offset.x,
      y: offset.y,
    });

    this._motion.inject(animation);

    x = this._isXDisabled ? offset.x : x;
    y = this._isYDisabled ? offset.y : y;

    this._motion.segueTo(
      createAnimation({
        x,
        y,
      }),
      duration,
      easings.easeOutQuint
    );
  }

  private settle() {
    const offset = this._offset.getValue();
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

    const distanceX = this.deriveDistance(delta.x);
    const distanceY = this.deriveDistance(delta.y);
    const x = this.round(offset.x + distanceX);
    const y = this.round(offset.y + distanceY);

    this._motion.inject(animation).segueTo(
      createAnimation({
        x: this._isXDisabled ? offset.x : x,
        y: this._isYDisabled ? offset.y : y,
      }),
      2000,
      easings.easeOutQuint
    );
  }

  private deriveDistance(delta: number) {
    const interval = this._snapInterval;
    const step = Math.round(delta / (1 - 0.97) / interval);
    return step * interval;
  }

  private round(value: number) {
    const interval = this._snapInterval;
    const halfStep = interval / 2;
    const remainder = Math.abs(value % interval);
    const direction = Math.sign(value);

    return remainder > halfStep
      ? value + direction * (interval - remainder)
      : value - direction * remainder;
  }
}
