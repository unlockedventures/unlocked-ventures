# Floating channel context

## Approved scope
The user approved the proposed small floating pill, showing the current channel and “Change channel ↑”, after rejecting a second sticky menu below the header. Keep it within the podcast browsing experience; preserve the existing header and channel selector.

## Acceptance and implementation plan
- PILL-AC1: After scrolling the channel selector above the sticky header, display a bottom-centered pill naming the selected channel while its cards are being browsed. Keep long channel names within the viewport.
- PILL-AC2: Hide it while tabs are visible, before the browsing section ends/footer enters view, for no channels, or for an empty channel.
- PILL-AC3: Activating the pill returns to the channel selector with sticky-header clearance and keyboard focus on the selected tab. Respect reduced-motion preference.
- PILL-AC4: Use a keyboard-operable button, visible focus indication, a descriptive accessible name and mobile safe-area spacing. Keep below the header/menu stacking layer.

Implement in src/components/site/podcast/podcast-listing.tsx using refs for section/selector and a passive, animation-frame-coalesced scroll/resize listener, with ResizeObserver for layout changes and cleanup on unmount. No dependencies or data/schema changes. Source review only; the user's instruction to omit further test/browser execution persists. Runtime outcomes remain unverified.

## Observer visibility correction
User reported that no pill appeared and explicitly requested IntersectionObserver. Replace the scroll listener with a tab observer (sticky-header offset included) and a section-end observer (hide before footer). Show only when tabs have passed above the visible viewport, not while they are below the screen. ResizeObserver refreshes observer margins if header height changes. Render the fixed pill through a document.body portal: source inspection found the page-view ancestor uses transform and will-change: transform, which can establish a containing block for a fixed descendant and place it outside the visible viewport. Existing keyboard focus, return action, reduced-motion behavior, channel label and empty-channel handling remain. No test/browser execution performed under the existing user instruction; visibility is not yet verified in a browser.
