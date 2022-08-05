import React, { useLayoutEffect, useState } from "react";
import { TextDomain } from "./text_domain";
import { Word } from "./word";

export interface TextProps {
  domain: TextDomain;
}

export function Text({ domain }: TextProps) {
  const words = domain.words;
  return (
    <div>
      {words.map((w) => (
        <Word domain={w} />
      ))}
    </div>
  );
}
