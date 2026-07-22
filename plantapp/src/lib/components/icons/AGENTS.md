# Interface icon system

`Icon.svelte` is the single source for interface glyphs. Each name resolves to
a semantically distinct drawing on a 24 by 24 coordinate grid with a 1.75
stroke, round caps, and round joins. Callers control visual size and color with
component props or classes, not alternate path data or stroke weights.

Icons are decorative by default and therefore hidden from assistive technology.
Pass `label` only when the icon itself carries meaning; icon-only controls still
need their own accessible button or link name.

## Explicit boundary

Complex illustrations, data visualizations, repeating patterns, and the Aevani
wordmark remain standalone artwork rather than interface icons. The components
under `../patterns/` and the dotted divider pattern keep their own SVG geometry.
Third-party brand asset files and Storybook example assets are also outside this
system. `BrandIcon.svelte` keeps the small set of social marks used by the shell
in a separate fill-based vocabulary so they cannot collide with interface
semantics such as `x` for close. Do not use these exceptions as a path for new
ad-hoc UI glyphs.
