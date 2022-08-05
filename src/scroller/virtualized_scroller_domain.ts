import { ObservableValue, ReadonlyObservableValue } from "ergo-hex";

export class VirtualizedScrollerDomain {
  private _offsetY = new ObservableValue<number>(0);
  private _requestAnimationId = 0;
  private _lastTime = 0;
  private _lastY = 0;
  private _deltaYHistory = new Array(3);
  private _startY = 0;
  private _requestAnimationFrame;
  private _cancelAnimationFrame;
  private _maxDistanceMoved = 0;
  private _deltaY = 0;

  get offsetY(): ReadonlyObservableValue<number> {
    return this._offsetY;
  }

  constructor(
    requestAnimationFrame: (callback: () => void) => number,
    cancelAnimationFrame: (id: number) => void
  ) {
    this._requestAnimationFrame = requestAnimationFrame;
    this._cancelAnimationFrame = cancelAnimationFrame;
  }

  pointerStart(y: number) {
    const cancelAnimationFrame = this._cancelAnimationFrame;
    cancelAnimationFrame(this._requestAnimationId);

    this._lastTime = Date.now();
    this._maxDistanceMoved = 0;
    this._lastY = y;
    this._startY = y;
    this._deltaY = 0;
    this._deltaYHistory.fill(0);
  }

  pointerMove(y: number) {
    const now = Date.now();
    const deltaTime = now - this._lastTime;

    if (deltaTime < 16) {
      return;
    }

    const deltaY = y - this._lastY;
    this._deltaYHistory.shift();
    this._deltaYHistory.push(deltaY);
    this._lastY = y;

    this._maxDistanceMoved = Math.max(
      this._maxDistanceMoved,
      Math.abs(y - this._startY)
    );

    const average =
      this._deltaYHistory.reduce((acc, v) => acc + v, 0) /
      this._deltaYHistory.length;

    this._deltaY = average;
    this._offsetY.transformValue((v) => v + average);
  }

  pointerEnd(y: number) {
    if (this._maxDistanceMoved > 5) {
      this._requestAnimationId = requestAnimationFrame(() => {
        this.settle();
        console.log(this._deltaY, this._offsetY.getValue());
      });
    }
  }

  private settle() {
    this._deltaY = this._deltaY * 0.97;
    const requestAnimationFrame = this._requestAnimationFrame;

    if (Math.abs(this._deltaY) > 0.01) {
      this._offsetY.transformValue((v) => v + this._deltaY);
      this._requestAnimationId = requestAnimationFrame(() => {
        this.settle();
      });
    } else {
      console.log(this._offsetY.getValue());
    }
  }

  scrollTo() {
    this._cancelAnimationFrame(this._requestAnimationId);
  }
}
