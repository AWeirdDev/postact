import {
  createVf,
  filterListenersFromAttributes,
  PostactIdentifier,
  transformArgToVirtualItem,
  type Ref,
  type Subscribable,
  type VirtualElement,
  type VirtualItem,
  type Component,
  type ComponentInstance,
  isComponentPtr,
} from "@postact/core";

export declare namespace JSX {
  type Element = VirtualItem | ComponentInstance;
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
  return items.map((item) => transformArgToVirtualItem(item));
}

function jsx(type: Symbol | Function | string | Component<any>, props: any): JSX.Element {
  const hasChildren = typeof props.children !== "undefined" && props.children !== null;
  const children = !hasChildren
    ? []
    : Array.isArray(props.children)
      ? props.children
      : [props.children];

  if (type === Fragment) {
    return createVf(mapChildren(children));
  }

  if (typeof type === "string") {
    if (hasChildren) {
      delete props["children"];
    }

    const [listeners, attrs] = filterListenersFromAttributes(new Map(Object.entries(props)));
    return {
      __p: PostactIdentifier.VirtualElement,
      tag: type,
      attributes: attrs,
      children: mapChildren(children),
      listeners,
    } satisfies VirtualElement;
  }

  if (isComponentPtr(type)) {
    return type.ptr(props);
  }

  if (typeof type === "function") {
    return type(props);
  }

  throw new TypeError(`unknown type: ${JSON.stringify(type)}`);
}

export { jsx, jsx as jsxs, Fragment };
