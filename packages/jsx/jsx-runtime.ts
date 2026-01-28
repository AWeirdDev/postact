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
  type StyleDeclaration,
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
    | "textContent"
    | "innerText"
    | "outerText";

  type CamelToKebab<S extends string> = S extends `${infer A}${infer B}`
    ? B extends Uncapitalize<B>
      ? `${Lowercase<A>}${CamelToKebab<B>}`
      : `${Lowercase<A>}-${CamelToKebab<B>}`
    : S;

  type ExcludedHTMLProps =
    | "children"
    | "style"
    | "className"
    | "classList"
    | "ELEMENT_NODE"
    | "ATTRIBUTE_NODE"
    | "TEXT_NODE"
    | "CDATA_SECTION_NODE"
    | "ENTITY_REFERENCE_NODE"
    | "ENTITY_NODE"
    | "PROCESSING_INSTRUCTION_NODE"
    | "COMMENT_NODE"
    | "DOCUMENT_NODE"
    | "DOCUMENT_TYPE_NODE"
    | "DOCUMENT_FRAGMENT_NODE"
    | "NOTATION_NODE"
    | "DOCUMENT_POSITION_DISCONNECTED"
    | "DOCUMENT_POSITION_PRECEDING"
    | "DOCUMENT_POSITION_FOLLOWING"
    | "DOCUMENT_POSITION_CONTAINS"
    | "DOCUMENT_POSITION_CONTAINED_BY"
    | "DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC"
    | "FILTER_ACCEPT"
    | "FILTER_REJECT"
    | "FILTER_SKIP"
    | "SHOW_ALL"
    | "SHOW_ELEMENT"
    | "SHOW_ATTRIBUTE"
    | "SHOW_TEXT"
    | "SHOW_CDATA_SECTION"
    | "SHOW_ENTITY_REFERENCE"
    | "SHOW_ENTITY"
    | "SHOW_PROCESSING_INSTRUCTION"
    | "SHOW_COMMENT"
    | "SHOW_DOCUMENT"
    | "SHOW_DOCUMENT_TYPE"
    | "SHOW_DOCUMENT_FRAGMENT"
    | "SHOW_NOTATION"
    | "NONE"
    | "CAPTURING_PHASE"
    | "AT_TARGET"
    | "BUBBLING_PHASE"
    | "DOM_KEY_LOCATION_STANDARD"
    | "DOM_KEY_LOCATION_LEFT"
    | "DOM_KEY_LOCATION_RIGHT"
    | "DOM_KEY_LOCATION_NUMPAD"
    | "BUTTON_LEFT"
    | "BUTTON_MIDDLE"
    | "BUTTON_RIGHT"
    | "BUTTON_BACK"
    | "BUTTON_FORWARD"
    | "STYLE_RULE"
    | "IMPORT_RULE"
    | "MEDIA_RULE"
    | "FONT_FACE_RULE"
    | "PAGE_RULE"
    | "KEYFRAMES_RULE"
    | "KEYFRAME_RULE"
    | "NAMESPACE_RULE"
    | "COUNTER_STYLE_RULE"
    | "SUPPORTS_RULE"
    | "DOCUMENT_RULE"
    | "START_TO_START"
    | "START_TO_END"
    | "END_TO_END"
    | "END_TO_START"
    | "UNSENT"
    | "OPENED"
    | "HEADERS_RECEIVED"
    | "LOADING"
    | "DONE"
    | ReadonlyDOMProps
    | keyof EventHandlers<any>;

  type ExtractProps<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
  }[keyof T];

  type ElementProps<T extends HTMLElement> = Partial<
    Omit<Pick<T, ExtractProps<T>>, ExcludedHTMLProps>
  >;

  type HTMLAttributes<T extends HTMLElement> = {
    [K in keyof ElementProps<T> as CamelToKebab<K & string>]: ElementProps<T>[K];
  } & EventHandlers<T> &
    IntrinsicElementsProps & {
      /**
       * Reference to the rendered component.
       */
      ref?: Ref<T>;

      /**
       * HTML Classes.
       */
      [`class`]?: string | string[] | null;

      /**
       * HTML Classes (fallback for React users).
       */
      className?: string | string[] | null;

      /**
       * HTML style.
       */
      style?: string | Subscribable<string> | StyleDeclaration | null;
    };

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
