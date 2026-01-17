# Local storage
Store values in the local storage.

```ts twoslash
import { localStorage } from "@postact/core";

// Create an entry for the key "apples"
const apples = localStorage("apples");

apples.set("100");
console.log(apples.get()) // Console: 100

// Remove the entry "apples" completely
apples.remove();
```

## Usage with states
You can use the local storage interface together with states to make them last even after the app refreshes.

::: warning ⚠️ WATCH OUT!
The below implementation is **unsafe**, and is for demonstration purposes only.
In a real-world application, be sure to check for runtime types to avoid attacks.
:::

```ts
import { state, localStorage } from "@postact/core";

const applesLs = localStorage("apples");

// Read value from previous session (if any)
const $apples = state<number>(applesLs ? JSON.parse(applesLs) : 0);

// Whenever the state updates, change the local storage, too
$apples.subscribe((apples) => {
  applesLs.set(JSON.stringify(apples));
});
```
