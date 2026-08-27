# Theme transition

`ThemeTransition` coordinates the visual handoff between the retro and modern
portfolio themes. `App.tsx` owns the active theme and prevents re-entry while a
transition is running.

## Standard timing

- `0ms`: copy the source frame bounds and start expanding toward the viewport.
- `0–600ms`: dissolve the source navigation and cover the viewport with pixels.
- `620ms`: swap the React theme while the pixel overlay is opaque.
- `620–1,300ms`: measure the destination frame, contract the frame copy, and
  remove the pixel cells. When returning to retro, measured outline copies of
  the visible navigation tabs draw into place and fade into the real controls.
- `1,360ms`: remove the overlay, clear `aria-busy`, and focus the destination
  heading.

The pixel grid is calculated from the current viewport. Mobile uses a smaller
grid to reduce work. A resize during the transition recalculates the grid and
remeasures whichever frame is currently active.

With `prefers-reduced-motion: reduce`, the sequence becomes a 140ms crossfade.
The theme swap occurs at 70ms and no pixel, frame, or text animation runs.
