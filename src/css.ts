import { isPostactIdent, PostactIdentifier } from "./_internals";
import { isSubscribable, type Subscribable } from "./subscribable";
import { anyToString, text, textWithOptions } from "./text";

/**
 * Gets the CSS property name.
 * @param key The original key name given by the user.
 */
function getName(key: string): string {
  let text = "";
  let idx = 0;

  while (idx < key.length) {
    const char = key[idx];

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

type _AnyCSSValue = string | number;
type StyleDeclaration = {
  [K in keyof CSSStyleDeclaration]:
    | CSSStyleDeclaration[K]
    | Subscribable<CSSStyleDeclaration[K]>;
};

export function css(
  arg0: Partial<StyleDeclaration> | TemplateStringsArray,
  ...args: (_AnyCSSValue | Subscribable<_AnyCSSValue>)[]
): string | Subscribable<string> {
  throw new Error(
    "CSS is not supported yet, but it will be in future versions. " +
      "In the meantime, you could use text`...` instead, there's just no highlighting.",
  );
}

export function isCSSPaper(item: any): item is PostactIdentifier.CSSPaper {
  return isPostactIdent(PostactIdentifier.CSSPaper, item);
}
