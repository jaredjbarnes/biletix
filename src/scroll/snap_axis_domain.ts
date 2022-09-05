import { createAnimation, easings } from "motion-ux";
import { AxisDomain } from "./axis_domain";

export class SnapAxisDomain extends AxisDomain {
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

  reset(): void {
    super.reset();
  }

  stop() {
    super.stop();
    this.settle();
  }

  animateTo(value: number, duration = 2000) {
    const offset = this._offset.getValue();
    const animation = createAnimation({ offset: value });

    this._motion.inject(animation);

    value = this._isDisabled ? offset : value;

    this._motion.segueTo(
      createAnimation({ offset: value }),
      duration,
      easings.easeOutQuint
    );
  }

  private settle() {
    const offset = this._offset.getValue();
    const delta = this._deltaOffset;

    const animation = createAnimation({
      offset: {
        from: offset - delta,
        to: offset,
      },
    });

    const distance = this.deriveDistance(delta);
    const value = this.round(offset + distance);
    
    this._motion.inject(animation).segueTo(
      createAnimation({
        offset: this._isDisabled ? offset : value,
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
