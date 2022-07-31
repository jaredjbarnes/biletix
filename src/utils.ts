import { WeakPromise } from "ergo-hex";

export function delay(time: number) {
  return new WeakPromise<void>((resolve) => {
    const id = setTimeout(resolve, time);
    return () => {
      clearTimeout(id);
    };
  });
}
