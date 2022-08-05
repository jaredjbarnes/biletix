import { WordDomain } from "./word_domain";

export class TextDomain {
  private _words: WordDomain[];

  get words() {
    return this._words;
  }
  
  constructor(text: string) {
    const parts = text.trim().split("\n");
    this._words = parts.map((w) => new WordDomain(w));
  }

  show() {
    this._words.forEach((c) => c.show());
  }

  hide() {
    this._words.forEach((c) => c.hide());
  }
}
