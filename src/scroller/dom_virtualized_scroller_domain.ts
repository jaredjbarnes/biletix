import { VirtualizedScrollerDomain } from "./virtualized_scroller_domain";

export class DomVirtualizedScrollerDomain extends VirtualizedScrollerDomain {
  private _element: HTMLElement | null = null;
  private _resizeObserver: ResizeObserver | null;

  setElement(element: HTMLElement) {
    this._element = element;
    this.setUpPointerHandlers();
    this.setUpResizeObserver();
  }

  private setUpPointerHandlers() {
    if (this._element == null) {
      return;
    }
    this._element.addEventListener("pointerdown", this.startScroll);
  }

  private startScroll = (e: PointerEvent) => {
    const id = e.pointerId;
    const element = this._element;

    if (element == null) {
      return;
    }

    function move(e: PointerEvent) {
      if (id === e.pointerId) {
        this.pointerMove(e.clientY);
      }
    }

    function end(e: PointerEvent) {
      if (element == null) {
        return;
      }

      if (id === e.pointerId) {
        this.pointerEnd(e.clientY);
      }

      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", end);
      element.removeEventListener("pointerleave", end);
    }

    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", end);
    element.addEventListener("pointerleave", end);

    this.pointerStart(e.clientY);
    e.stopPropagation();
    e.preventDefault;
  };

  setUpResizeObserver() {
    this._resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry){
        entry.contentBoxSize
      }
    });
  }

  dispose() {
    this._element?.removeEventListener("pointerdown", this.startScroll);
    this._resizeObserver?.disconnect();
  }
}
