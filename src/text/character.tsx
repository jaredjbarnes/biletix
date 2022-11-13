import React, { useRef } from "react";
import {
  ObservableValue,
  ReadonlyObservableValue,
  useAsyncValue,
  useAsyncValueEffect,
} from "ergo-hex";
import { CharacterDomain } from "./character_domain";

export interface CharacterProps {
  domain: CharacterDomain;
}

export function Character({ domain }: CharacterProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  useAsyncValueEffect((value) => {
    const div = ref.current;
    if (div != null) {
      Object.keys(value).forEach((key) => {
        div.style[key] = value[key];
      });
    }
  }, domain.style);

  return <div ref={ref}>{domain.character}</div>;
}
