/** Keep the page black while Experience dominates, then hand it to Projects.
 * The section's own background stays black independently of this page effect.
 */
export function mobileExperienceExitProgress(sectionBottom: number, viewportTop: number, viewportHeight: number) {
  const remaining = (sectionBottom - viewportTop) / Math.max(1, viewportHeight)
  // Start clearing after Projects occupies a third of the viewport; finish
  // exactly when Experience leaves, irrespective of scrolling speed or pauses.
  return Math.max(0, Math.min(1, remaining / (2 / 3)))
}
