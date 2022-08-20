import { PanEvent } from "./pan_event";
import { PanGesture } from "./pan_gesture";
import { TapGesture } from "./tap_gesture";

export class GestureRecognizer {
  private element: HTMLElement;
  private panGesture: PanGesture;
  private tapGesture: TapGesture;

  constructor(element: HTMLElement) {
    this.element = element;
    this.panGesture = new PanGesture();
    this.tapGesture = new TapGesture();

    this.element.addEventListener("onpointerdown", this.pointerDown);
    this.element.addEventListener("onpointermove", this.pointerMove);
    this.element.addEventListener("onpointerup", this.pointerUp);
    this.element.addEventListener("onpointerenter", this.pointerEnter);
    this.element.addEventListener("onpointerleave", this.pointerLeave);
    this.element.addEventListener("onpointerout", this.pointerOut);
  }

  onPanStart(callback: (e: PanEvent) => void) {
    return this.panGesture.onStart(callback);
  }

  onPanMove(callback: (e: PanEvent) => void) {
    return this.panGesture.onMove(callback);
  }

  onPanEnd(callback: (e: PanEvent) => void) {
    return this.panGesture.onMove(callback);
  }

  onTap(callback: (e: PanEvent) => void) {
    return this.tapGesture.onTap(callback);
  }

  private pointerDown = () => {};
  private pointerMove = () => {};
  private pointerUp = () => {};
  private pointerLeave = () => {};
  private pointerEnter = () => {};
  private pointerOut = () => {};
  private pointerCancel = () => {};

  dispose() {
    this.element.removeEventListener("onpointerdown", this.pointerDown);
    this.element.removeEventListener("onpointermove", this.pointerMove);
    this.element.removeEventListener("onpointerup", this.pointerUp);
    this.element.removeEventListener("onpointerenter", this.pointerEnter);
    this.element.removeEventListener("onpointerleave", this.pointerLeave);
    this.element.removeEventListener("onpointerout", this.pointerOut);
  }
}
