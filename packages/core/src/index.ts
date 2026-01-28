// utilities
export { select, ensureWindow, unescape, render, type Renderable } from "./utilities";

// subscribables
export { state, type Checker, type Updater, type UpdateDispatch } from "./subscribables/state";
export { dependent } from "./subscribables/dependent";
export { later } from "./subscribables/later";
export { ref, type Ref } from "./subscribables/ref";
export {
  type Subscriber,
  type Subscribable,
  BaseSubscribable,
  isSubscribable,
} from "./subscribables/base";
export { store } from "./subscribables/store";

// display-related
export { html, filterListenersFromAttributes } from "./html";
export { getCssKeyName, type StyleDeclaration, type StyleDeclarationFull } from "./css";
export { text } from "./text";
export { transformArgToVirtualItem } from "./argument";

// components
export {
  component,
  isComponentInstance,
  isComponentPtr,
  type PropsWithChildren,
  type Component,
  type ComponentInstance,
} from "./component";

// vdom -> document dom
export {
  type VirtualElement,
  type VirtualItem,
  type VirtualTextNode,
  type VirtualFragment,
  createVf,
  createVtn,
  isVe,
  isVf,
  isVtn,
} from "./vdom/structure";
export { realize, type ToFragOptions } from "./vdom/client";

// expose some internals... it's fine
export { PostactIdentifier } from "./_internals";
