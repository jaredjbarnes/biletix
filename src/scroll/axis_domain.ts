import { ObservableValue, ReadonlyObservableValue } from "ergo-hex";
import { createAnimation, Motion } from "motion-ux";
import { Axis, ScrollHandler } from "./axis";

export abstract class AxisDomain implements Axis {
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
  protected _requestAnimationFrame;
  protected _cancelAnimationFrame;

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

  min: number = Infinity;
  max: number = Infinity;

  onScrollStart: ScrollHandler;
  onScroll: ScrollHandler;
  onScrollEnd: ScrollHandler;

  constructor() {
    this._motion = new Motion(({ currentValues }) => {
      this._offset.transformValue((o) =>
        this.updateFromAnimation(o, currentValues.offset)
      );

      this.onScroll && this.onScroll(this);
    }, true);
    this._deltaOffsetHistory.fill(0);
  }

  initialize(value: number) {
    this._motion.segueTo(createAnimation({ offset: value }));
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
    const successfullyUpdated = this.updateDeltaAverage(value);

    if (!successfullyUpdated) {
      return;
    }

    this._offset.transformValue((o) => {
      return this._isDisabled ? o : o + this._deltaOffset;
    });

    this.onScroll && this.onScroll(this);
  }

  pointerEnd() {
    this._lastTime = Date.now();
  }

  reset() {
    this._motion.stop();

    if (this._isScrolling) {
      this._isScrolling = false;
      this.onScrollEnd && this.onScrollEnd(this);
    }

    const offset = this._offset.getValue();

    this._lastTime = Date.now();
    this._lastOffset = offset;
    this._deltaOffset = 0;
    this._deltaOffsetHistory.fill(0);
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

  abstract animateTo(value: number, duration: number): void;

  private updateDeltaAverage(value: number) {
    const now = Date.now();
    const deltaTime = now - this._lastTime;
    const frames = Math.floor(deltaTime / 16);

    if (deltaTime < 16) {
      return false;
    }

    const delta = (value - this._lastOffset) / frames;
    this._lastTime = now;
    this._lastOffset = value;
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

    return true;
  }

  private updateFromAnimation(offset: number, newOffset: number) {
    this._lastOffset = offset;
    offset = this._isDisabled ? offset : newOffset;

    this._deltaOffset = offset - this._lastOffset;
    this._deltaOffsetHistory.fill(this._deltaOffset);

    return offset;
  }
}
