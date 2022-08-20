export class PanEvent {
  private _isPanning = false;
  private _target: HTMLElement | null = null;
  private _isPropagationStopped = false;
  private _isCancelled = false;

  get isPanning() {
    return this._isPanning;
  }

  get target() {
    return this._target;
  }

  get isPropagationStopped() {
    return this._isPropagationStopped;
  }

  get isCancelled() {
    return this._isCancelled;
  }

  originalEvent: PointerEvent | null = null;
  x = 0;
  y = 0;
  startX = 0;
  startY = 0;
  deltaX = 0;
  deltaY = 0;

  reset(target: HTMLElement | null) {
    this._target = target;
    this.x = 0;
    this.y = 0;
    this.startX = 0;
    this.startY = 0;
    this.deltaX = 0;
    this.deltaY = 0;
    this._isCancelled = false;
    this._isPropagationStopped = false;
    this._isCancelled = false;
    this._isPanning = false;
  }

  stopPropagation() {
    this._isPropagationStopped = true;
  }

  resetPropagation() {
    this._isPropagationStopped = false;
  }

  cancel() {
    this._isCancelled = true;
  }

  startPanning() {
    this._isPanning = true;
  }
}
