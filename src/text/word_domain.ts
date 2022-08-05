import { CharacterDomain } from "./character_domain";

export class WordDomain {
  private _characters: CharacterDomain[];

  get characters() {
    return this._characters;
  }

  constructor(text: string) {
    const parts = text.trim().split("");
    const length = parts.length;
    const partDelay = 30;
    const maxTime = length * partDelay;
    this._characters = parts.map(
      (c, index) =>
        new CharacterDomain(c, index * partDelay, maxTime - index * partDelay)
    );
  }

  show() {
    this._characters.forEach((c) => c.show());
  }

  hide() {
    this._characters.forEach((c) => c.hide());
  }
}
