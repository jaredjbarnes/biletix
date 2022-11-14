import { ObservableValue, ReadonlyObservableValue } from "ergo-hex";
import {
  createAnimation,
  EasingFunction,
  easings,
  createDynamicEasing,
  Motion,
} from "motion-ux";
import { Axis, ScrollHandler } from "./axis";

const customBoundsEasing = createDynamicEasing("quad", "quint");

export class AxisDomain implements Axis {
  private _requestAnimationFrame;
  private _cancelAnimationFrame;
  protected _offset = new ObservableValue<number>(0);
  protected _size = new ObservableValue<number>(0);
  protected _motion: Motion<{ offset: number }>;
  protected _isScrolling = false;
  protected _isDisabled = false;
  protected _requestAnimationId = -1;
  protected _lastTime = Date.now();
  protected _lastOffset: number = 0;
  protected _startOffset: number = 0;
  protected _deltaOffset: number = 0;
  protected _deltaOffsetHistory = new Array<number>(3);
  protected _minOffset: number = -Infinity;
  protected _maxOffset: number = Infinity;

  get offsetBroadcast(): ReadonlyObservableValue<number> {
    return this._offset;
  }

  get sizeBroadcast(): ReadonlyObservableValue<number> {
    return this._size;
  }

  get start() {
    return -this._offset.getValue();
  }

  get end() {
    return this.start + this.size;
  }

  get size() {
    return this._size.getValue();
  }

  get velocity() {
    return this._deltaOffset;
  }

  get isScrolling() {
    return this._isScrolling;
  }

  get min() {
    return -this._maxOffset;
  }

  set min(value: number) {
    this._maxOffset = -value;
  }

  get max() {
    return -this._minOffset;
  }

  set max(value: number) {
    this._minOffset = -value;
  }

  get minOffset() {
    return this._minOffset;
  }

  set minOffset(value: number) {
    this._minOffset = value;
  }

  get maxOffset() {
    return this._maxOffset;
  }

  set maxOffset(value: number) {
    this._maxOffset = value;
  }

  onScrollStart: ScrollHandler;
  onScroll: ScrollHandler;
  onScrollEnd: ScrollHandler;

  constructor(
    requestAnimationFrame: (callback: () => void) => number,
    cancelAnimationFrame: (id: number) => void
  ) {
    this._motion = new Motion(({ currentValues }) => {
      this._offset.transformValue((o) =>
        this.updateFromAnimation(o, currentValues.offset)
      );

      this.onScroll && this.onScroll(this);
    }, true);

    this._requestAnimationFrame = requestAnimationFrame;
    this._cancelAnimationFrame = cancelAnimationFrame;
    this._deltaOffsetHistory.fill(0);
  }

  private updateFromAnimation(offset: number, newOffset: number) {
    offset = this._isDisabled ? offset : newOffset;
    this._deltaOffset = offset - this._lastOffset;
    this._deltaOffsetHistory.fill(this._deltaOffset);
    return offset;
  }

  initialize(value: number) {
    this._motion.segueTo(createAnimation({ offset: value }));
  }

  reset() {
    this.cancelMomentum();
    this._motion.stop();
    this.processScrollEnd();
    this._lastTime = Date.now();
    this._lastOffset = this._offset.getValue();
    this._deltaOffset = 0;
    this._deltaOffsetHistory.fill(0);
  }

  private processScrollEnd() {
    if (this._isScrolling) {
      this._isScrolling = false;
      this.onScrollEnd && this.onScrollEnd(this);
    }
  }

  pointerStart(value: number) {
    this.reset();
    this._lastTime = Date.now();
    this._lastOffset = value;
    this._startOffset = value;
    this._deltaOffset = 0;
    this._deltaOffsetHistory.fill(0);
    this._isScrolling = true;
  }

  pointerMove(value: number) {
    const now = Date.now();
    const deltaTime = now - this._lastTime;
    const frames = Math.floor(deltaTime / 16);
    const delta = (value - this._lastOffset) / frames;

    if (deltaTime < 16) {
      return false;
    }

    this._lastTime = now;
    this._lastOffset = value;

    this.updatePointerDelta(delta);

    this._offset.transformValue((o) => {
      return this._isDisabled ? o : o + this._deltaOffset;
    });

    this.onScroll && this.onScroll(this);

    return true;
  }

  private updatePointerDelta(delta: number) {
    let total = 0;

    for (let i = 0; i < 3; i++) {
      if (i < 2) {
        this._deltaOffsetHistory[i] = this._deltaOffsetHistory[i + 1];
      } else {
        this._deltaOffsetHistory[i] = delta;
      }

      total += this._deltaOffsetHistory[i];
    }

    const averageX = total / 3;
    this._deltaOffset = averageX;
  }

  pointerEnd() {
    const offset = this._offset.getValue();
    const delta = Math.abs(this._deltaOffset);
    this._lastTime = Date.now();

    if (delta > 3) {
      this._requestAnimationId = requestAnimationFrame(() => {
        this.finishMomentum();
      });
    } else {
      if (offset < this._minOffset) {
        this.animateTo(this._minOffset, 800, customBoundsEasing);
      } else if (offset > this.maxOffset) {
        this.animateTo(this._maxOffset, 800, customBoundsEasing);
      } else {
        this.stop();
      }
    }
  }

  private finishMomentum() {
    this.updateDelta();
    const shouldContinue = this.springIntoBounds();
    this.fillDeltaHistory();

    const offset = this._offset.getValue();
    const requestAnimationFrame = this._requestAnimationFrame;
    const sufficientSpeedToContinue = Math.abs(this._deltaOffset) > 0.1;
    const beyondBounds = offset < this.minOffset || offset > this.maxOffset;

    if (shouldContinue && (sufficientSpeedToContinue || beyondBounds)) {
      this._offset.transformValue((o) => {
        o = this._isDisabled ? o : o + this._deltaOffset;
        return o;
      });

      this.onScroll && this.onScroll(this);

      this._requestAnimationId = requestAnimationFrame(() => {
        this.finishMomentum();
      });
    }
  }

  private cancelMomentum() {
    const cancelAnimationFrame = this._cancelAnimationFrame;
    cancelAnimationFrame(this._requestAnimationId);
    this._requestAnimationId = -1;
  }

  private updateDelta() {
    this._deltaOffset = this._deltaOffset * 0.97;
  }

  private springIntoBounds() {
    const offset = this._offset.getValue();
    const delta = this._deltaOffset;

    if (offset > this._maxOffset) {
      if (delta >= 0.90) {
        this._deltaOffset *= 1 - (offset - this._maxOffset) / 200;
      } else {
        this.reset();
        this.animateTo(this._maxOffset, 800, customBoundsEasing);
        return false;
      }
    } else if (offset < this.minOffset) {
      if (delta <= -0.9) {
        this._deltaOffset *= 1 - (this.minOffset - offset) / 200;
      } else {
        this.reset();
        this.animateTo(this._minOffset, 800, customBoundsEasing);
        return false;
      }
    }

    return true;
  }

  private fillDeltaHistory() {
    this._deltaOffsetHistory.fill(this._deltaOffset);
  }

  animateTo(
    value: number,
    duration = 2000,
    easing: EasingFunction = easings.easeOutQuint
  ) {
    const offset = this._offset.getValue();
    const delta = this._deltaOffset;
    const animation = createAnimation({
      offset: {
        from: offset - delta,
        to: offset,
      },
    });

    this.reset();
    this._motion.inject(animation);
    value = this.getValueWithinBounds(value);

    // Need to constrain if disabled and well as if snapped.
    this._motion.segueTo(createAnimation({ offset: value }), duration, easing);
  }

  private getValueWithinBounds(value: number) {
    if (this._isDisabled) {
      return this._offset.getValue();
    }

    return Math.min(this._maxOffset, Math.max(value, this._minOffset));
  }

  stop() {
    this.reset();
  }

  setSize(value: number) {
    if (this.size == value) {
      return;
    }

    this._size.setValue(value);
  }

  disable() {
    this._isDisabled = true;
  }

  enable() {
    this._isDisabled = false;
  }

  scrollTo(value: number) {
    this.stop();
    this._offset.setValue(value);
  }
}
