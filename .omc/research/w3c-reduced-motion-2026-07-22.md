# Source capture: W3C WCAG 2.1 — reduced motion technique and interaction animation

- URLs:
  - https://www.w3.org/WAI/WCAG21/Techniques/css/C39
  - https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions
- Fetched: 2026-07-22 (America/Denver)
- Page updates: C39 updated 2026-01-12; Animation from Interactions updated 2025-09-16
- Intent: constrain motion inspired by editorial/Awwwards sites without creating vestibular or usability barriers.

## Captured source facts

- W3C Technique C39 uses `prefers-reduced-motion` to suppress user-triggered motion.
- W3C notes that non-essential scroll and interaction motion can cause distraction, nausea, dizziness, or headaches for some users.
- A static-first implementation that enables motion only under `prefers-reduced-motion: no-preference` is an accepted approach.
- Animation from Interactions is Level AAA in WCAG 2.1; the technique is still an appropriate quality target for Aevani.

## Aevani implication

Keep motion subordinate to comprehension: small state transitions and restrained reveals only, no parallax dependency, no forced page choreography, and a complete static/reduced-motion path.
