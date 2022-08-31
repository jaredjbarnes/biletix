import { createAnimation, easings } from "motion-ux";
import { BaseScrollDomain } from "./base_scroll_domain";

export class SnapScrollDomain extends BaseScrollDomain {
  private _snapInterval: number;

  constructor(snapInterval: number) {
    super();
    this._snapInterval = Math.max(snapInterval, 0);
  }

  pointerEnd() {
    super.pointerEnd();
    this.settle(this._snapInterval);
  }

  stop() {
    super.stop();
    this.settle(this._snapInterval);
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

  private settle(step: number) {
    const halfStep = step / 2;
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

    const stepX = Math.round(delta.x / (1 - 0.97) / step);
    const stepY = Math.round(delta.y / (1 - 0.97) / step);
    const distanceX = stepX * step;
    const distanceY = stepY * step;

    let x = offset.x + distanceX;
    let y = offset.y + distanceY;

    const remainderX = Math.abs(x % step);
    const remainderY = Math.abs(y % step);
    const directionX = Math.sign(x);
    const directionY = Math.sign(y);

    x =
      remainderX > halfStep
        ? x + directionX * (step - remainderX)
        : x - directionX * remainderX;
    y =
      remainderY > halfStep
        ? y + directionY * (step - remainderY)
        : y - directionY * remainderY;

    if (
      (Math.abs(x - offset.x) < 1 || this._isXDisabled) &&
      (Math.abs(y - offset.y) < 1 || this._isYDisabled)
    ) {
      return;
    }

    this._motion.inject(animation).segueTo(
      createAnimation({
        x: this._isXDisabled ? offset.x : x,
        y: this._isYDisabled ? offset.y : y,
      }),
      2000,
      easings.easeOutQuint
    );
  }
}
