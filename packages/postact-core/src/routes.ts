import { ensureWindow } from "./utilities";
import { BaseSubscribable } from "./subscribable";

/**
 * A global router. Used for **subscribing and publishing only**.
 */
const GLOBAL_ROUTER: BaseSubscribable<{ pathname: string; hash: string }> =
  new BaseSubscribable({ pathname: "", hash: " " });
let GLOBAL_HAS_REGISTERED_HASH_LISTENER: boolean = false;

// [ai-generated content]
type ExtractRouteParams<Path extends string> =
  Path extends `${string}:${infer Param}/${infer Rest}`
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
export function route<Path extends string>(
  route: Path,
  handler: (ctx: RouteContext<Path>) => void,
): void {
  ensureWindow();

  const useHash = route.startsWith("#");

  function _run(pathname: string, hash: string) {
    const pathSplits = useHash
      ? hash.replace("#", "").split("/")
      : pathname.split("/");

    const args = useHash ? route.slice(1).split("/") : route.split("/");
    const params: Record<string, string> = {};

    for (let i = 0; i < pathSplits.length; i++) {
      if (i >= args.length) return;

      const split = decodeURIComponent(pathSplits[i]!);
      const arg = args[i]!;

      if (arg.startsWith(":")) {
        if (!split) return;
        const name = arg.slice(1);
        params[name] = split;
      } else if (arg == "*") {
        handler({ params } as RouteContext<Path>);
        return;
      } else if (arg != split) {
        return;
      }
    }

    if (pathSplits.length !== args.length) return;

    handler({ params, navigate } as RouteContext<Path>);
  }

  _run(window.location.pathname, window.location.hash);

  GLOBAL_ROUTER.subscribe(({ pathname, hash }) => {
    if (useHash) _run(pathname, hash);
    else _run(pathname, hash);
  });

  // disgusting code, but whatever you say lil bro
  if (!GLOBAL_HAS_REGISTERED_HASH_LISTENER) {
    registerHashListener();
    GLOBAL_HAS_REGISTERED_HASH_LISTENER = true;
  }
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
