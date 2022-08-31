import { ReadonlyObservableValue } from "ergo-hex";

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type ScrollHandler = ((domain: Scrollable) => void) | null | undefined;

export interface Scrollable {
  offsetBroadcast: ReadonlyObservableValue<Position>;
  sizeBroadcast: ReadonlyObservableValue<Size>;
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  lastInteraction: number;
  velocity: Position;
  onScrollStart: ScrollHandler;
  onScroll: ScrollHandler;
  onScrollEnd: ScrollHandler;
  initialize(x: number, y: number): void;
  pointerStart(x: number, y: number): void;
  pointerMove(x: number, y: number): void;
  pointerEnd(): void;
  reset(): void;
  stop(): void;
  setSize(width: number, height: number): void;
  disableX(): void;
  disableY(): void;
  enableX(): void;
  enableY(): void;
  scrollTo(x: number, y: number): void;
  animateTo(x: number, y: number, duration: number): void;
}
