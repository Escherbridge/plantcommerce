# forms — component notes

## RichTextEditor.svelte

Quill-backed rich-text field with a plain-`textarea` fallback.

### Why the Quill CSS is a static import (not dynamic)

Quill's JS is browser-only, so it is loaded with a dynamic `import('quill')`
inside `onMount`. Its stylesheet, however, is imported **statically** at the top
of the `<script>` (`import 'quill/dist/quill.snow.css'`).

The previous code awaited the CSS as a second dynamic import
(`await import('quill/dist/quill.snow.css')`) immediately before
`new Quill(...)`. That put a fragile async step on the critical path:

- On a **cold Vite dev server** the first hit to this component triggers
  on-demand dependency pre-bundling; the two sequential `await import()` calls
  can take several seconds to resolve.
- In a **production build** a dynamic CSS import becomes a separate async CSS
  chunk loaded at runtime, which can stall or fail independently of the JS.

While that chain is pending, the `.ql-editor` has not been created yet **and**
`useSimpleEditor` is still `false` (nothing has thrown), so the fallback
`textarea` is not shown either — the field renders as an empty box. This is the
"editor never appears and the fallback never appears" symptom seen in E2E on a
cold server.

A static CSS import is bundled into the page stylesheet by Vite at build/SSR
time, so it is present before hydration and removes that await from the init
path. Only the Quill JS import remains async, and it is fully guarded.

### Fallback guarantees

`onMount` is wrapped in try/catch. On **any** failure — a rejected
`import('quill')`, an unbound container ref, or a Quill constructor error —
`useSimpleEditor` is set to `true`, which reactively swaps in the plain
`textarea` so the form field always remains editable. `await tick()` + an
explicit `editorContainer` guard run before `new Quill(...)` so a missing
container degrades to the fallback rather than throwing later.

The toolbar is deliberately limited to the markup `sanitizeRichText` allows on
render (see `src/lib/utils/AGENTS.md`) so nothing a user formats is silently
stripped.
