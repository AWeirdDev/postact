import { type Subscribable } from "./subscribables/base";

/**
 * Gets the CSS property name.
 * @param key The original key name given by the user.
 */
export function getCssKeyName(key: string): string {
  let text = "";
  let idx = 0;

  while (idx < key.length) {
    const char = key[idx]!;

    // isUpperCase
    if (char == char.toUpperCase()) {
      text += "-" + char.toLowerCase();
    } else {
      text += char;
    }

    idx += 1;
  }

  if (text.startsWith("webkit")) {
    return "-" + text;
  } else {
    return text;
  }
}

export type StyleDeclarationFull = {
  [K in keyof CSSStyleDeclaration]: CSSStyleDeclaration[K] | Subscribable<CSSStyleDeclaration[K]>;
};
export type StyleDeclaration = Partial<StyleDeclarationFull>;
