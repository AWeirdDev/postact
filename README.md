# postact
web development without the fucking mess

given your html:

```html
<div id="app"></div>
```

create a counter app:

```ts
function createCounter() {
  const $count = state(0);
  
  function onClick() {
    $count.update(v => v + 1);
  }
  
  return html`
    <button onclick=${onClick}>
        ${$count}
    </button>
  `
}

select("#app").render(createCounter())
```

this is essentially react but without the mess so shut up nextjs supporters

> [!NOTE]
> this software is a work-in-progress and does not gurantee the robusticity or a long-term support as of now.

***

(c) 2025 AWeirdDev
