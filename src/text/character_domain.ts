import React from "react";
import {
  ObservableValue,
  ReadonlyObservableValue,
  WeakPromise,
} from "ergo-hex";
import { delay } from "../utils";
import { createAnimation, easings, Motion } from "motion-ux";

export class CharacterDomain {
  private _character: string;
  private _delay: number;
  private _delayedPromise: WeakPromise<void> = WeakPromise.resolve();
  private _motion: Motion<{ opacity: number; scale: number }>;
  private _style: ObservableValue<React.CSSProperties> = new ObservableValue({
    display: "inline-block",
    position: "relative",
    left: "0px",
    top: "0px",
    transform: "scale(0.25) translate(0,0)",
    opacity: 0,
    transformOrigin: "center bottom",
    fontSize: "50px",
  } as React.CSSProperties);

  get character() {
    return this._character;
  }

  get style(): ReadonlyObservableValue<React.CSSProperties> {
    return this._style;
  }

  constructor(character: string, delay: number) {
    this._character = character;
    this._delay = delay;

    this._motion = new Motion((animation) => {
      this._style.transformValue((style) => {
        const { scale, opacity } = animation.currentValues;
        style.transform = `scale(${scale})`;
        style.opacity = String(opacity);
        return style;
      });
    });

    this._motion.segueTo(
      createAnimation({
        opacity: 0,
        scale: 0.25,
      })
    );
  }

  async show() {
    try {
      this._delayedPromise.cancel(0);
      this._delayedPromise = delay(this._delay);
      await this._delayedPromise;

      this._motion.segueTo(
        createAnimation({
          opacity: 1,
          scale: {
            from: 0.25,
            "40%": {
              value: 1.5,
              easeIn: "quad",
              easeOut: "quad",
            },
            to: {
              value: 1,
              easeIn: "expo",
            },
          },
        }),
        500
      );
    } catch (error) {}
  }

  async hide() {
    try {
      this._delayedPromise.cancel(0);
      this._delayedPromise = delay(this._delay);
      await this._delayedPromise;

      this._motion.segueTo(
        createAnimation({
          opacity: {
            from: 1,
            to: { value: 0, easeOut: "quad" },
          },
          scale: {
            from: 1,
            "40%": {
              value: 1.5,
              easeIn: "quad",
              easeOut: "quad",
            },
            to: {
              value: 0,
              easeIn: "expo",
            },
          },
        }),
        500
      );
    } catch (error) {}
  }
}
