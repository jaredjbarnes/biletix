import { GestureCanceller } from "./gesture_canceller";

export interface Gesture {
  enter(e: PointerEvent, gestureCanceler: GestureCanceller);
  leave(e: PointerEvent, gestureCanceller: GestureCanceller);
  out(e: PointerEvent, gestureCanceller: GestureCanceller);
  over(e: PointerEvent, gestureCanceller: GestureCanceller);
  down(e: PointerEvent, gestureCanceller: GestureCanceller);
  move(e: PointerEvent, gestureCanceller: GestureCanceller);
  up(e: PointerEvent, gestureCanceller: GestureCanceller);
  cancel(id: number);
  clearListeners();
}
