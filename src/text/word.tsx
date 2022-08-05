import React from "react";
import { Character } from "./character";
import { WordDomain } from "./word_domain";

export interface WordProps {
  domain: WordDomain;
}

export function Word({ domain }: WordProps) {
  const characters = domain.characters;
  return (
    <div>
      {characters.map((c, index) => {
        return <Character key={index} domain={c} />;
      })}
    </div>
  );
}
