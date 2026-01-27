import {
  ensureWindow,
  BaseSubscribable,
  component,
  type Renderable,
  type PropsWithChildren,
  type Subscribable,
  state,
} from "@postact/core";

/**
 * A global router. Used for **subscribing and publishing only**.
 */
const GLOBAL_ROUTER: BaseSubscribable<{ pathname: string; hash: string }> = new BaseSubscribable({
  pathname: "",
  hash: "",
});
let GLOBAL_HAS_REGISTERED_HASH_LISTENER: boolean = false;

// [ai-generated content]
type ExtractRouteParams<Path extends string> = Path extends `${string}:${infer Param}/${infer Rest}`
  ? { [K in Param | keyof ExtractRouteParams<`/${Rest}`>]: string }
  : Path extends `${string}:${infer Param}`
    ? { [K in Param]: string }
    : {};
// [/ai-generated content]

export interface RouteContext<Path extends string> {
  /**
   * Route parameters.
   * For instance, if your path is `/hello/:name`, then you will
   * have a field called `name` with type of `string`.
   *
   * @example
   * ```ts
   * route("/explore/:username/:project", (ctx) => {
   *   const { username, project } = ctx.params;
   *   console.log(`A project of id ${project}, made by @${username}`);
   * })
   * ```
   */
  params: ExtractRouteParams<Path>;

  /**
   * Navigates to a new path.
   * @param loc The new path.
   */
  navigate: (loc: string) => void;
}

/**
 * Handle a route if matches the current path (`window.location.pathname`).
 * **Client-side only.**
 *
 * @param route The route. (e.g., `/hello`, `/user/:id`, `/any/*`)
 * @param handler The handler.
 *
 * @example A simple path-based routing.
 * ```ts
 * route("/", (ctx) => {
 *   select("#app").render(
 *     html`
 *       <h1>Hello!</h1>
 *       <p>Now go to /name/&lt;your name&gt;</p>
 *     `
 *   )
 * })
 *
 * route("/name/:username", (ctx) => {
 *   const { username } = ctx.params;
 *   select("#app").render(
 *     html`<h1>Hello ${username}</h1>`
 *   )
 * })
 * ```
 */
export function route<Path extends string, HandlerResult>(
  route: Path,
  handler: (ctx: RouteContext<Path>) => HandlerResult,
): Subscribable<HandlerResult | null> {
  ensureWindow();

  const useHash = route.startsWith("#");

  function _run(pathname: string, hash: string): HandlerResult | null {
    const pathSplits = useHash ? hash.replace("#", "").split("/") : pathname.split("/");

    const args = useHash ? route.slice(1).split("/") : route.split("/");
    const params: Record<string, string> = {};

    for (let i = 0; i < pathSplits.length; i++) {
      if (i >= args.length) return null;

      const split = decodeURIComponent(pathSplits[i]!);
      const arg = args[i]!;

      if (arg.startsWith(":")) {
        if (!split) return null;
        const name = arg.slice(1);
        params[name] = split;
      } else if (arg == "*") {
        return handler({ params } as RouteContext<Path>);
      } else if (arg != split) {
        return null;
      }
    }

    if (pathSplits.length !== args.length) return null;

    return handler({ params, navigate } as RouteContext<Path>);
  }

  const $result = state(_run(window.location.pathname, window.location.hash));

  GLOBAL_ROUTER.subscribe(({ pathname, hash }) => {
    if (useHash) $result.update(_run(pathname, hash));
    else $result.update(_run(pathname, hash));
  });

  // disgusting code, but whatever you say lil bro
  if (!GLOBAL_HAS_REGISTERED_HASH_LISTENER) {
    registerHashListener();
    GLOBAL_HAS_REGISTERED_HASH_LISTENER = true;
  }

  return $result;
}

// ==== functions below are all inside the `RouteContext`, so that
// ==== typeof window !== "undefined"

function notifyGlobalRouter() {
  GLOBAL_ROUTER.value = {
    pathname: window.location.pathname,
    hash: window.location.hash,
  };
  GLOBAL_ROUTER.emit();
}

function navigate(loc: string) {
  window.history.pushState(null, "", loc);

  if (loc.startsWith("#") || loc.startsWith("/")) {
    notifyGlobalRouter();
  }
}

function registerHashListener() {
  // this is only triggered when the user does it... somehow
  window.addEventListener("hashchange", () => {
    notifyGlobalRouter();
  });
}

// ==== neatly designed client-side routing components! i hope

interface RouteComponentConfig<Path extends string> {
  path: Path;
  element: (ctx: RouteContext<Path>) => Renderable;
}

/**
 * A route component.
 *
 * @example
 * ```tsx
 * <Route
 *   path="/user/:name"
 *   element={(ctx) => <h1>Hello, {ctx.params.name}!</h1>}
 * />
 * ```
 */
export function Route<Path extends string>({ path, element }: RouteComponentConfig<Path>) {
  const $comp = route(path, element);
  return <>{$comp}</>;
}
