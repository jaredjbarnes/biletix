import { Factory } from "./factory";
import { Gesture } from "./gesture";
import { PanListener } from "./listener";
import { PanEvent } from "./pan_event";

function noop() {}

export class PanGesture implements Gesture {
  private panEvents = new Map<number, PanEvent>();
  private onStartListeners: PanListener[] = [];
  private onMoveListeners: PanListener[] = [];
  private onEndListeners: PanListener[] = [];
  private panEventFactory = new Factory<PanEvent>(() => new PanEvent());
  private panListenerFactory = new Factory<PanListener>(() => ({
    target: null,
    callback: noop,
  }));

  enter(e: PointerEvent) {}
  out(e: PointerEvent) {}
  over(e: PointerEvent) {}

  down(e: PointerEvent) {
    const panEvent = this.panEventFactory.useInstance();
    panEvent.reset(e.target as HTMLElement);
    panEvent.originalEvent = e;

    this.panEvents.set(e.pointerId, panEvent);
  }

  move(e: PointerEvent) {
    const panEvent = this.panEvents.get(e.pointerId);

    if (panEvent != null) {
      panEvent.originalEvent = e;
      panEvent.deltaX = e.clientX - panEvent.x;
      panEvent.deltaY = e.clientY - panEvent.y;
      panEvent.x = e.clientX;
      panEvent.y = e.clientY;

      if (panEvent.isPanning) {
        this.notifyMove(panEvent);
      } else {
        const deltaX = e.clientX - panEvent.startX;
        const deltaY = e.clientY - panEvent.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance > 5) {
          panEvent.startPanning();
          panEvent.startX = e.clientX;
          panEvent.startY = e.clientY;

          this.notifyStart(panEvent);
        }
      }
    }
  }

  up(e: PointerEvent) {
    const panEvent = this.panEvents.get(e.pointerId);

    if (panEvent != null && panEvent.isPanning) {
      panEvent.originalEvent = e;
      this.notifyEnd(panEvent);
    }
  }

  leave(e: PointerEvent) {
    this.up(e);
  }

  cancel(pointerId: number) {
    const event = this.panEvents.get(pointerId);

    if (event != null) {
      this.panEventFactory.releaseInstance(event);
      this.panEvents.delete(pointerId);
    }
  }

  clearListeners() {
    throw new Error("Method not implemented.");
  }

  onStart(target: HTMLElement, callback: (event: PanEvent) => void) {
    return this.subscribe(target, this.onStartListeners, callback);
  }

  onMove(target: HTMLElement, callback: (event: PanEvent) => void) {
    return this.subscribe(target, this.onStartListeners, callback);
  }

  onEnd(target: HTMLElement, callback: (event: PanEvent) => void) {
    return this.subscribe(target, this.onStartListeners, callback);
  }

  dispose() {
    this.panEvents.clear();
    this.panEventFactory.releaseAll();
  }

  private isWithin(progenitor: HTMLElement, prospectiveAncestor: HTMLElement) {
    return (
      progenitor == null ||
      prospectiveAncestor == null ||
      progenitor === prospectiveAncestor ||
      progenitor.contains(prospectiveAncestor)
    );
  }

  private subscribe(
    target: HTMLElement,
    listeners: PanListener[],
    callback: (event: PanEvent) => void
  ) {
    const listener = this.panListenerFactory.useInstance();
    listener.callback = callback;
    listener.target = target;

    listeners.unshift(listener);

    const unsubscribe = () => {
      const index = listeners.indexOf(listener);

      if (index > -1) {
        listeners.splice(index, 1);
        this.panListenerFactory.releaseInstance(listener);
      }
    };

    return unsubscribe;
  }

  private notifyStart(panEvent: PanEvent) {
    this.notify(this.onStartListeners, panEvent);
  }

  private notifyMove(panEvent: PanEvent) {
    this.notify(this.onMoveListeners, panEvent);
  }

  private notifyEnd(panEvent: PanEvent) {
    this.notify(this.onEndListeners, panEvent);
  }

  private notify(listeners: PanListener[], panEvent: PanEvent) {
    for (let x = 0; x < listeners.length; x++) {
      const listener = listeners[x];
      listener.callback(panEvent);

      if (panEvent.isPropagationStopped) {
        break;
      }
    }

    panEvent.resetPropagation();
  }
}
