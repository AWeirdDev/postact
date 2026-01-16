import {
  createVf,
  type Ref,
  type Subscribable,
  type VirtualFragment,
  type VirtualItem,
} from "@postact/core";

export declare namespace JSX {
  type Element = VirtualItem;
  type AnyChildren =
    | Element
    | string
    | boolean
    | number
    | bigint
    | null
    | undefined
    | Subscribable<AnyChildren>;

  interface IntrinsicElementsProps {
    /**
     * Takes a `Ref` object so that you can interact with its
     * native APIs whenever this element is rendered.
     *
     * The `Ref` object is a subscribable, subscribable via `.subscribe()`.
     */
    ref?: Ref<any>;
    children?: AnyChildren | AnyChildren[];
  }

  type EventHandlers<T> = {
    [K in keyof GlobalEventHandlersEventMap as `on${K}`]?: (
      this: T,
      event: GlobalEventHandlersEventMap[K],
    ) => any;
  };

  type ElementAttributes<T> = {
    [K in keyof T]?: T[K];
  };
  type ReadonlyDOMProps =
    | "offsetWidth"
    | "offsetHeight"
    | "offsetTop"
    | "offsetLeft"
    | "clientWidth"
    | "clientHeight"
    | "clientTop"
    | "clientLeft"
    | "scrollWidth"
    | "scrollHeight"
    | "nodeName"
    | "nodeType"
    | "nodeValue"
    | "parentNode"
    | "childNodes"
    | "firstChild"
    | "lastChild"
    | "previousSibling"
    | "nextSibling"
    | "attributes"
    | "ownerDocument"
    | "namespaceURI"
    | "tagName"
    | "innerHTML"
    | "outerHTML"
    | "textContent";

  type ExcludedHTMLProps = "children" | "style" | ReadonlyDOMProps | keyof EventHandlers<any>;

  type ExtractProps<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
  }[keyof T];

  type ElementProps<T extends HTMLElement> = Partial<
    Omit<Pick<T, ExtractProps<T>>, ExcludedHTMLProps>
  >;

  type HTMLAttributes<T extends HTMLElement> = ElementProps<T> &
    EventHandlers<T> &
    IntrinsicElementsProps & { ref?: Ref<T> };

  type IntrinsicElementsBase = {
    [K in keyof HTMLElementTagNameMap]: HTMLAttributes<HTMLElementTagNameMap[K]>;
  };

  interface IntrinsicElements extends IntrinsicElementsBase {
    [elemName: string]: IntrinsicElementsProps;
  }
}

const Fragment = Symbol();

function mapChildren(items: any[]) {
  return items.map((item) => {});
}

function jsx(
  type: Symbol | Function | string,
  props: any,
  key?: string,
  isStaticChildren?: boolean,
): JSX.Element {
  if (type === Fragment) {
    const children = Array.isArray(props.children) ? props.children : [props.children];
    return createVf(children);
  }
  return createVf([]);
}

export { jsx, jsx as jsxs, Fragment };
