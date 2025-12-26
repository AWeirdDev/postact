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
  }

  if (text.startsWith("webkit")) {
    return "-" + text;
  } else {
    return text;
  }
}

export function css(styles: Partial<CSSStyleDeclaration>): string;
export function css(tsa: TemplateStringsArray, ...args: string[]): string;
export function css(
  arg0: Partial<CSSStyleDeclaration> | TemplateStringsArray,
  ...args: string[]
): string {
  if (Array.isArray(arg0)) {
    return arg0
      .reduce((accu, current, idx) => accu + current + args[idx], "")
      .trim();
  } else {
    return Object.entries(arg0).reduce(
      (acc, [k, v]) => acc + `${getName(k)}: ${v};`,
      "",
    );
  }
}
