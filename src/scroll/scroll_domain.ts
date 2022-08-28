import { ObservableValue, ReadonlyObservableValue } from "ergo-hex";
import { createAnimation, easings, Motion } from "motion-ux";

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

type ScrollHandler = ((domain: ScrollDomain) => void) | null | undefined;

export class ScrollDomain {
  private _offset = new ObservableValue<Position>({
    x: 0,
    y: 0,
  });
  private _size = new ObservableValue<Size>({
    width: 0,
    height: 0,
  });
  private _snapInterval: number | null = null;
  private _motion: Motion<Position>;
  private _isPanning = false;
  private _isScrolling = false;
  private _isXDisabled = false;
  private _isYDisabled = false;
  private _requestAnimationId = 0;
  private _lastTime = 0;
  private _lastInteraction = Date.now();
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

  get snapInterval() {
    return this._snapInterval;
  }

  set snapInterval(value: number | null | undefined) {
    if (value == null) {
      this._snapInterval = null;
    } else {
      this._snapInterval = Math.max(value, 0);
    }
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
    let isFirst = true;
    this._motion = new Motion(({ currentValues }) => {
      if (isFirst || this._isPanning) {
        isFirst = false;
      } else {
        this._lastInteraction = Date.now();
        this._offset.transformValue((o) => {
          o.x = this._isXDisabled ? 0 : currentValues.x;
          o.y = this._isYDisabled ? 0 : currentValues.y;
          return o;
        });
      }
    }, true);
    this._deltaOffsetHistory.fill({ x: 0, y: 0 });
    this._motion.segueTo(createAnimation({ x: 0, y: 0 }), 2000);
  }

  pointerStart(x: number, y: number) {
    const cancelAnimationFrame = this._cancelAnimationFrame;
    cancelAnimationFrame(this._requestAnimationId);
    this._motion.stop();

    this._isPanning = true;
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
    this._offset.transformValue((o) => {
      o.x = this._isXDisabled ? 0 : o.x + averageX;
      o.y = this._isYDisabled ? 0 : o.y + averageY;
      return o;
    });

    onScroll && onScroll(this);
  }

  pointerEnd() {
    this._isPanning = false;
    this._lastInteraction = Date.now();
    const deltaX = this._deltaOffset.x;
    const deltaY = this._deltaOffset.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const snapInterval = this._snapInterval;

    if (distance > 6) {
      this._requestAnimationId = requestAnimationFrame(() => {
        if (snapInterval == null) {
          this.finishMomentum();
        } else {
          this.settle(snapInterval);
        }
      });
    } else {
      if (snapInterval == null) {
        this.stop();
      } else {
        this.settle(snapInterval);
      }
    }
  }

  stop() {
    const snapInterval = this._snapInterval;

    if (this._isScrolling) {
      this._isScrolling = false;
      this.onScrollEnd && this.onScrollEnd(this);
    }

    if (snapInterval != null) {
      this._deltaOffset = { x: 0, y: 0 };
      this._deltaOffsetHistory.forEach((p) => {
        p.x = 0;
        p.y = 0;
      });
      this._motion.stop();
      this.settle(snapInterval);
    }

    const cancelAnimationFrame = this._cancelAnimationFrame;
    cancelAnimationFrame(this._requestAnimationId);
  }

  scrollTo() {
    // TODO
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

  private finishMomentum() {
    this._lastInteraction = Date.now();
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
      this.stop();
    }
  }
}