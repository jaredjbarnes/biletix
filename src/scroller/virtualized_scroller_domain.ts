import { ObservableValue, ReadonlyObservableValue } from "ergo-hex";

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

type ScrollHandler =
  | ((domain: VirtualizedScrollerDomain) => void)
  | null
  | undefined;

export class VirtualizedScrollerDomain {
  private _offset = new ObservableValue<Position>({
    x: 0,
    y: 0,
  });
  private _size = new ObservableValue<Size>({
    width: 0,
    height: 0,
  });
  private _isScrolling = false;
  private _isXDisabled = false;
  private _isYDisabled = false;
  private _requestAnimationId = 0;
  private _lastTime = 0;
  private _lastInteraction;
  private _lastOffset: Position = { x: 0, y: 0 };
  private _startOffset: Position = { x: 0, y: 0 };
  private _deltaOffset: Position = { x: 0, y: 0 };
  private _deltaOffsetHistory = new Array<Position>(3);
  private _requestAnimationFrame;
  private _cancelAnimationFrame;

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
    return this._lastInteraction;
  }

  onScrollStart: ScrollHandler;
  onScroll: ScrollHandler;
  onScrollEnd: ScrollHandler;

  constructor(
    requestAnimationFrame: (callback: () => void) => number,
    cancelAnimationFrame: (id: number) => void
  ) {
    this._requestAnimationFrame = requestAnimationFrame;
    this._cancelAnimationFrame = cancelAnimationFrame;

    this._deltaOffsetHistory.fill({ x: 0, y: 0 });
  }

  pointerStart(x: number, y: number) {
    const cancelAnimationFrame = this._cancelAnimationFrame;
    cancelAnimationFrame(this._requestAnimationId);

    this._lastTime = Date.now();
    this._lastInteraction = Date.now();
    this._lastOffset.x = x;
    this._startOffset.x = x;
    this._lastOffset.y = y;
    this._startOffset.y = y;
    this._deltaOffset = { x: 0, y: 0 };
    this._deltaOffsetHistory.forEach((p) => {
      p.x = 0;
      p.y = 0;
    });

    this._isScrolling = true;
    this.onScrollStart && this.onScrollStart(this);
  }

  pointerMove(x: number, y: number) {
    const now = Date.now();
    const deltaTime = now - this._lastTime;

    // Throttle to 60 frames a second
    if (deltaTime < 16) {
      return;
    }

    const onScroll = this.onScroll;
    const deltaY = y - this._lastOffset.y;
    const deltaX = x - this._lastOffset.x;
    this._lastTime = now;
    this._lastOffset.y = y;
    this._lastOffset.x = x;
    let totalX = 0;
    let totalY = 0;

    // Its important to average the deltas or it appears janky.
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
    this._offset.transformValue((v) => {
      v.x += this._isXDisabled ? 0 : averageX;
      v.y += this._isYDisabled ? 0 : averageY;
      return v;
    });

    onScroll && onScroll(this);
  }

  pointerEnd() {
    this._lastInteraction = Date.now();
    const deltaX = this._deltaOffset.x;
    const deltaY = this._deltaOffset.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > 6) {
      this._requestAnimationId = requestAnimationFrame(() => {
        this.settle();
      });
    } else {
      this.stop();
    }
  }

  stop() {
    if (this._isScrolling) {
      this._isScrolling = false;
      this.onScrollEnd && this.onScrollEnd(this);
    }

    const cancelAnimationFrame = this._cancelAnimationFrame;
    cancelAnimationFrame(this._requestAnimationId);
    this._deltaOffset = { x: 0, y: 0 };
    this._deltaOffsetHistory.forEach((p) => {
      p.x = 0;
      p.y = 0;
    });
  }

  scrollTo() {
    // TODO
  }

  setSize(width: number, height: number) {
    if (this.width == width && this.height === height) {
      return;
    }

    this._size.transformValue((s) => {
      s.width = width;
      s.height = height;
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

  private settle() {
    this._lastInteraction = Date.now();
    this._deltaOffset.y = this._deltaOffset.y * 0.97;
    this._deltaOffset.x = this._deltaOffset.x * 0.97;
    const requestAnimationFrame = this._requestAnimationFrame;

    const distanceTraveled = Math.sqrt(
      this._deltaOffset.x * this._deltaOffset.x +
        this._deltaOffset.y * this._deltaOffset.y
    );

    if (distanceTraveled > 0.1) {
      this._offset.transformValue((v) => {
        v.x += this._isXDisabled ? 0 : this._deltaOffset.x;
        v.y += this._isYDisabled ? 0 : this._deltaOffset.y;
        return v;
      });

      this.onScroll && this.onScroll(this);

      this._requestAnimationId = requestAnimationFrame(() => {
        this.settle();
      });
    } else {
      this.stop();
    }
  }
}
