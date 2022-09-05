import { ObservableValue, ReadonlyObservableValue } from "ergo-hex";
import { createAnimation, Motion } from "motion-ux";
import { Position, Scrollable, ScrollHandler, Size } from "./scrollable";

export abstract class BaseScrollDomain implements Scrollable {
  protected _offset = new ObservableValue<Position>({
    x: 0,
    y: 0,
  });
  protected _size = new ObservableValue<Size>({
    width: 0,
    height: 0,
  });
  protected _motion: Motion<Position>;
  protected _isScrolling = false;
  protected _isXDisabled = false;
  protected _isYDisabled = false;
  protected _requestAnimationId = -1;
  protected _lastTime = Date.now();
  protected _lastOffset: Position = { x: 0, y: 0 };
  protected _startOffset: Position = { x: 0, y: 0 };
  protected _deltaOffset: Position = { x: 0, y: 0 };
  protected _deltaOffsetHistory = new Array<Position>(3);
  protected _requestAnimationFrame;
  protected _cancelAnimationFrame;

  get offsetBroadcast(): ReadonlyObservableValue<Position> {
    return this._offset;
  }

  get sizeBroadcast(): ReadonlyObservableValue<Size> {
    return this._size;
  }

  get top() {
    return -this._offset.getValue().y;
  }

  get left() {
    return -this._offset.getValue().x;
  }

  get right() {
    return this.left + this._size.getValue().width;
  }

  get bottom() {
    return this.top + this._size.getValue().height;
  }

  get width() {
    return this._size.getValue().width;
  }

  get height() {
    return this._size.getValue().height;
  }

  get lastInteraction() {
    return this._lastTime;
  }

  get velocity() {
    return this._deltaOffset;
  }

  get isScrolling() {
    return this._isScrolling;
  }

  min: Position = { x: Infinity, y: Infinity };
  max: Position = { x: Infinity, y: Infinity };
  
  onScrollStart: ScrollHandler;
  onScroll: ScrollHandler;
  onScrollEnd: ScrollHandler;

  constructor() {
    this._motion = new Motion(({ currentValues }) => {
      this._offset.transformValue((o) =>
        this.updateFromAnimation(o, currentValues)
      );

      this.onScroll && this.onScroll(this);
    }, true);
    this._deltaOffsetHistory.fill({ x: 0, y: 0 });
  }

  initialize(x: number, y: number) {
    this._motion.segueTo(createAnimation({ x, y }));
  }

  pointerStart(x: number, y: number) {
    this.reset();

    this._lastTime = Date.now();
    this._lastOffset.x = x;
    this._lastOffset.y = y;
    this._startOffset.x = x;
    this._startOffset.y = y;
    this._deltaOffset = { x: 0, y: 0 };
    this._deltaOffsetHistory.forEach((p) => {
      p.x = 0;
      p.y = 0;
    });

    this._isScrolling = true;
  }

  pointerMove(x: number, y: number) {
    const successfullyUpdated = this.updateDeltaAverage(x, y);

    if (!successfullyUpdated) {
      return;
    }

    this._offset.transformValue((o) => {
      o.x = this._isXDisabled ? o.x : o.x + this._deltaOffset.x;
      o.y = this._isYDisabled ? o.y : o.y + this._deltaOffset.y;
      return o;
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
    this._lastOffset.x = offset.x;
    this._lastOffset.y = offset.y;
    this._deltaOffset.x = 0;
    this._deltaOffset.y = 0;
    this._deltaOffsetHistory.forEach((p) => {
      p.x = 0;
      p.y = 0;
    });
  }

  stop() {
    this.reset();
  }

  setSize(width: number, height: number) {
    if (this.width == width && this.height === height) {
      return;
    }

    this._size.transformValue((s) => {
      s.width = Math.floor(width);
      s.height = Math.floor(height);
      return s;
    });
  }

  disableX() {
    this._isXDisabled = true;
  }

  disableY() {
    this._isYDisabled = true;
  }

  enableX() {
    this._isXDisabled = false;
  }

  enableY() {
    this._isYDisabled = false;
  }

  scrollTo(x: number, y: number) {
    this.stop();
    this._offset.transformValue((o) => {
      o.x = x;
      o.y = y;
      return o;
    });
  }

  abstract animateTo(x: number, y: number, duration: number): void;

  private updateDeltaAverage(x: number, y: number) {
    const now = Date.now();
    const deltaTime = now - this._lastTime;
    const frames = Math.floor(deltaTime / 16);

    if (deltaTime < 16) {
      return false;
    }

    const deltaY = (y - this._lastOffset.y) / frames;
    const deltaX = (x - this._lastOffset.x) / frames;
    this._lastTime = now;
    this._lastOffset.y = y;
    this._lastOffset.x = x;
    let totalX = 0;
    let totalY = 0;

    for (let i = 0; i < 3; i++) {
      if (i < 2) {
        this._deltaOffsetHistory[i].x = this._deltaOffsetHistory[i + 1].x;
        this._deltaOffsetHistory[i].y = this._deltaOffsetHistory[i + 1].y;
      } else {
        this._deltaOffsetHistory[i].x = deltaX;
        this._deltaOffsetHistory[i].y = deltaY;
      }

      totalX += this._deltaOffsetHistory[i].x;
      totalY += this._deltaOffsetHistory[i].y;
    }

    const averageX = totalX / 3;
    const averageY = totalY / 3;

    this._deltaOffset.x = averageX;
    this._deltaOffset.y = averageY;

    return true;
  }

  private updateFromAnimation(offset: Position, newOffset: Position) {
    this._lastOffset.x = offset.x;
    this._lastOffset.y = offset.y;

    offset.x = this._isXDisabled ? offset.x : newOffset.x;
    offset.y = this._isYDisabled ? offset.y : newOffset.y;

    this._deltaOffset.x = offset.x - this._lastOffset.x;
    this._deltaOffset.y = offset.y - this._lastOffset.y;

    this._deltaOffsetHistory.forEach((d) => {
      d.x = this._deltaOffset.x;
      d.y = this._deltaOffset.y;
    });

    return offset;
  }
}
