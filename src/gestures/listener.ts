import { PanEvent } from "./pan_event";

export interface PanListener {
  target: HTMLElement | null;
  callback: (event: PanEvent) => void;
}
