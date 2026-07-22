# Growing Guides screenshot critique

- Reference: `C:\Users\atooz\AppData\Local\Temp\codex-clipboard-b10fabf3-637b-412d-accb-3a104a8cd391.png`
- Reviewed: 2026-07-22
- Method: design critique covering hierarchy, layout, typography, color, consistency, usability, and accessibility.

## Findings

The five cards read as separate islands rather than one navigable category set. Their intrinsic widths sit inside wide grid tracks, so the unused track space becomes oversized horizontal gaps. The second row inherits the same track distribution and leaves two cards stranded instead of composing a deliberate final row. The cards are visually similar, but spacing does not communicate a group and the repeated blue icon tiles do not provide a strong selected or navigational cue.

The pale blue treatment also competes with the warmer, land-oriented Aevani content without creating useful hierarchy. Icon geometry varies between concepts, and Setup and Maintenance are not sufficiently distinct. Selection, hover, and focus depend too heavily on small color changes.

## Applied direction

- One shared max-width container with explicit one-, two-, and five-column tracks.
- Stretch cards to their tracks; use consistent internal spacing and minimum height.
- At tablet width, center the single final card within the two-column measure; at desktop, keep all five in one bounded row.
- Use warm paper, navy, and forest as structure. Reserve chartreuse for icon fields, selected cues, and focus support.
- Use the canonical 24 by 24 icon system with a 1.75 stroke, round caps/joins, and distinct Setup/Maintenance silhouettes.
- Add redundant selected text, background, border, and `aria-current`, with visible two-layer focus.
