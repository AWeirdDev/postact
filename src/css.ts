import { isPostactIdent, PostactIdentifier } from "./_internals";

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

/**
 * A CSS sheet. The term "paper" is used just to differentiate this from
 * {@link CSSStyleSheet}.
 */
export interface CSSPaper {
  __p: PostactIdentifier.CSSPaper;

  /**
   * The inner CSS.
   */
  inner: string;
}

export function css(
  arg0: Partial<CSSStyleDeclaration> | TemplateStringsArray,
  ...args: string[]
): CSSPaper {
  if (Array.isArray(arg0)) {
    return {
      __p: PostactIdentifier.CSSPaper,
      inner: arg0
        .reduce((accu, current, idx) => accu + current + args[idx], "")
        .trim(),
    };
  } else {
    return {
      __p: PostactIdentifier.CSSPaper,
      inner: Object.entries(arg0).reduce(
        (acc, [k, v]) => acc + `${getName(k)}: ${v};`,
        "",
      ),
    };
  }
}

export function isCSSPaper(item: any): item is PostactIdentifier.CSSPaper {
  return isPostactIdent(PostactIdentifier.CSSPaper, item);
}
