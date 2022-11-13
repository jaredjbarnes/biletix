import {
  ObservableValue,
  ReadonlyObservableValue,
  useAsyncValue,
} from "ergo-hex";
import React, { useRef, useState } from "react";
import { Character } from "./character";
import { CharacterDomain } from "./character_domain";

export default {
  title: "Example/Character",
  component: Character,
};

export function Default() {
  const [domain] = useState(() => {
    return new CharacterDomain("J", 0);
  });
  return (
    <div>
      <Character domain={domain} />
      <button
        onClick={() => {
          domain.show();
        }}
      >
        Show
      </button>
      <button
        onClick={() => {
          domain.hide();
        }}
      >
        Hide
      </button>
    </div>
  );
}
