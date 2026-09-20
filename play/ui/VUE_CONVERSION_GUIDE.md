# play/ui example conversion guide (jQuery/jui.js -> jui-ui-vue)

Each `play/ui/json/<code>.js` + `play/ui/html/<code>.html` pair is a playground
example. The **new runtime** (see `templates/play/ui/loader.html`) does:

```js
var options = eval("(" + <json/code.js content> + ")")   // a Vue options object
options.template = <html/code.html content>                // becomes its template
var app = Vue.createApp(options)
app.use(JuiUiVue)   // registers every jui-ui-vue component globally
app.mount("#app")
```

So converting an example means rewriting BOTH files:

- `json/<code>.js`: a JS object literal (not a function call, not `jui.ready(...)`)
  shaped like `{ setup() { ...; return {...} } }`. Use Vue's Composition API
  (`Vue.ref`, `Vue.reactive`, `Vue.computed`, `Vue.onMounted`, etc. - all
  available as `Vue.xxx` globals, since this runs in a plain `<script>`, not a
  bundled SFC). Whatever the `setup()` return object exposes becomes available
  in the template.
- `html/<code>.html`: the template markup. Old jQuery-targeted DOM
  (`<div id="foo">` + separate JS `$("#foo")...`) becomes a Vue component tag
  (`<ComponentName v-model="..." prop="..." @event="..." />`) using
  **PascalCase** component names (they're globally registered by `app.use(JuiUiVue)`,
  matching `~/cl/jui-ui-vue/src/components/*.vue` filenames).

## Reference example (already converted - copy this pattern)

`play/ui/json/switch_1.js`:
```js
{
    setup() {
        const checked = Vue.ref(false)

        function toggle() {
            checked.value = !checked.value
        }

        return { checked, toggle }
    }
}
```

`play/ui/html/switch_1.html`:
```html
<div class="row">
    <div class="col" style="width: 90px;">
        <Switch v-model="checked" inner />
    </div>
    <div class="col">
        <button class="btn small" @click="toggle" style="width: 70px;">
            <i class="icon-play"></i> Run
        </button>
    </div>
</div>
```

## How to find each component's real API

1. Read `~/cl/jui-ui-vue/src/components/<ComponentName>.vue` - this is the
   real, authoritative prop/event/slot API (Composition API `<script setup>`,
   `defineProps`/`defineEmits`). Don't guess prop names - read the file.
2. If `~/cl/jui-ui-vue/playground/<ComponentName>Page.vue` exists, it's a
   hand-written usage reference (often with a comment noting which original
   example it corresponds to) - prefer copying its idioms over inventing new
   ones.
3. The OLD example's `json/<code>.js` (what you're replacing) tells you the
   old jui.js option names (e.g. `{ checked: false }`) and the old imperative
   methods called on the instance (e.g. `.toggle()`, `.open()`) - translate
   option names to props, and imperative method calls to either a prop/event
   or a `ref` + component method (check the `.vue` file for `defineExpose`).
4. The OLD example's `html/<code>.html` tells you the layout/structure
   (row/col wrappers, buttons, labels) to preserve - keep the same visual
   layout and surrounding buttons/controls, just replace the jui-targeted
   `<div id="...">` with the real Vue component tag.

## Rules

- Keep the **same file names** (`json/<code>.js`, `html/<code>.html`) - only
  rewrite their content.
- Keep the same *visual intent* of each example (what it demonstrates), not
  necessarily the exact old DOM structure.
- If an example calls an old jui.js method that has no direct jui-ui-vue
  equivalent (check the component's `.vue` file for `defineExpose`), find the
  closest reasonable Vue idiom (usually a `ref` toggled by a `v-model` or a
  local function) rather than skipping the example.
- Multiple buttons/controls that trigger different instance methods in the
  old example (e.g. "open", "close", "toggle") should map to multiple
  `@click` handlers in `setup()`, one per button - keep parity with what the
  original example demonstrated.
- If a `.js` example imports/uses something clearly out of scope for a
  single component demo (rare), keep it minimal and focused on the one
  component being demonstrated.
- Do NOT touch `play/ui/index.php`-era files (already deleted) or the
  playground shell (`templates/play/ui/index.html`, `component.js`,
  `component.css`, `loader.html`) - only the `json/*.js` + `html/*.html` pairs
  listed in your assignment.
- Out of scope for this pass (do not touch): `table*`/`xtable*` examples
  (need jui-grid-vue, not jui-ui-vue) and the `style` group's CSS-only demos
  (`bargraph`, `forms`, `grid`, `icons`, `navbar`, `panel`, `typography` -
  no JS, no component involved, deferred separately).

## Verifying your own conversion (do this before finishing)

1. Re-read both files you wrote.
2. Confirm the component tag's props/events in `html/<code>.html` exactly
   match `defineProps`/`defineEmits` in the real `.vue` source file (not
   guessed).
3. Confirm `json/<code>.js` is a single JS object literal (parses as an
   expression, no `jui.ready`, no top-level `function`/`var` statements
   outside the object) - it will be wrapped in `eval("(" + text + ")")`.
