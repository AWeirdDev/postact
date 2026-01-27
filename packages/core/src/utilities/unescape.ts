/*
 * Derived from lodash unescape.js
 * Copyright OpenJS Foundation and other contributors
 * Licensed under the MIT License
 * https://github.com/lodash/lodash
 */

// Modified by AWeirdDev, 2025

const HTML_UNESCAPES = Object.freeze({
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
});

const RE_ESCAPED_HTML = /&(?:amp|lt|gt|quot|#39);/g;

/**
 * Unescape HTML.
 * @param slice The string slice.
 */
export function unescape(slice: string): string {
  return slice && RE_ESCAPED_HTML.test(slice)
    ? slice.replace(
        RE_ESCAPED_HTML,
        (entity) => HTML_UNESCAPES[entity as keyof typeof HTML_UNESCAPES],
      )
    : slice;
}
