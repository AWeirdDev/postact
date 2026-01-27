# Postact
[🚧 **Docs**](https://aweirddev.github.io/postact) · [**GitHub**](https://github.com/AWeirdDev/postact)

Postact is a lightweight, semi-opinionated yet minimalist library (and a potential framework) for building robust full-stack apps in TypeScript/JavaScript.

**The ecosystem**:

- `@postact/core` – The core package for virtual DOM, states, and rendering.
- `@postact/jsx` – Postact JSX support for creating even more robust apps.
- `@postact/client-router` – Simple client router, providing `route()` and `<Route />`.
- `@postact/serde` – Strict serialization/deserialization and typing to align with Postact and other workflows.
- `@postact/ssr` – Server-side rendering.

## Future plans
In the future. Maybe. Okay yeah I will.

- [x] `route()` full context interface
- [x] **IMPORTANT: Rewrite `vdom/client.ts`**
- [x] Virtual fragment (w/ `subscribables` field) support
- [x] Insertions after regular tags
- [x] Component-like insertions `<${...}>`
- [x] References (`ref`)
- [ ] Classes support
- [ ] Style support (CSS support with `css`)
