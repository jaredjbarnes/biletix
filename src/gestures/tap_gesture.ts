import { Factory } from "./factory";
import { Gesture } from "./gesture";
import { Listener } from "./listener";

function noop() {}

interface PointerData {
  isDown: boolean;
  x: number;
  y: number;
}

export class TapGesture implements Gesture {
  private pointers = new Map<number, PointerData>();
  private listeners: Listener[] = [];
  private listenerFactory = new Factory<Listener>(() => ({
    isActive: false,
    target: null,
    callback: noop,
  }));

  enter(e: PointerEvent) {}
  out(e: PointerEvent) {}
  over(e: PointerEvent) {}
  move(e: PointerEvent) {}

  leave(e: PointerEvent) {
    this.cancel(e.pointerId);
  }

  down(e: PointerEvent) {
    this.pointers.set(e.pointerId, {isDown: true, x: e.clientX, y: e.clientY });
  }

  up(e: PointerEvent) {
    const data = this.pointers.get(e.pointerId);

    if (data != null) {
      const deltaX = Math.abs(e.clientX - data.x);
      const deltaY = Math.abs(e.clientY - data.y);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < 5) {
        this.listeners.forEach((listener) => {
          listener.callback(e);
        });
      }
    }

    this.cancel(e.pointerId);
  }

  cancel(id: number) {
    this.pointers.delete(id);
  }

  clearListeners() {
    this.listeners.length = 0;
  }

  onTap(target: EventTarget, callback: (e: PointerEvent) => void) {
    const listener = this.listenerFactory.useInstance();
    listener.callback = callback;
    listener.target = target;

    const unsubscribe = () => {
      const index = this.listeners.indexOf(listener);

      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };

    this.listeners.push(listener);

    return unsubscribe;
  }
}
