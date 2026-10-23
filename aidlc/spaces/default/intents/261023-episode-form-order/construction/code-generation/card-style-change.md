# Podcast card styling follow-up

## Approved request and acceptance
The user supplied ExploreCard/DurationBadge code, requested corrected numeric conversion and calmer card styling, then explicitly instructed: “you apply changes and i need only integer MIN”. This approves the concrete styling previously proposed in chat, with uppercase MIN. Preserve their latest lg breakpoint sizing: card height 206px/width 268.917px at lg through 1439px; height 270px/width 288.717px at 1440px and above; fluid cards below lg.

- CARD-AC1: duration strings display a floored integer followed by MIN, including numeric minutes and MM:SS/HH:MM:SS; invalid/negative inputs produce no badge.
- CARD-AC2: valid Tailwind sizing, compact image/content spacing and clamped titles fit the requested desktop card dimensions; cards have subtle borders, rounded corners, shadows and visible keyboard focus.
- CARD-AC3: loading cards match the final dimensions; four grid columns begin at xl so fixed-width cards do not overlap at lg.

## Implementation and evidence
Changed only src/components/site/podcast/podcast-listing.tsx: explicit numeric duration parsing, MIN display, article/image/content classes, heading semantics, lazy image loading, skeleton dimensions and grid breakpoint alignment. Preserve category colors, URLs and episode data. Source inspection only; no tests, build, lint or browser verification ran, following the user's prior instruction. Runtime layout and acceptance remain unverified.

The episode source-summary implementation approval remains pending; this follow-up does not record an approval for that separate deliverable.

## Equal-height responsive correction
User supplied a screenshot showing unequal card heights below lg and explicitly requested equal-height cards across extra-small, small, medium and larger screens. This supersedes fixed desktop widths: cards now use full grid-column width with min-width zero. All cards have height 206px below 1440px and 270px at/above 1440px; image height is also fixed at both ranges, including missing-image placeholders. Two title lines are reserved regardless of title length. Grid columns: one below 480px, two from 480px, three from 768px, four from 1280px. Shared card/image/grid constants keep skeleton and content geometry aligned. No tests or browser checks ran, as previously requested; responsiveness remains unverified by execution.

## Mobile visual revision
The user rejected the fixed-height mobile result with a screenshot. Superseding the preceding mobile geometry: below lg use proportional 16:9 image frames and a consistent 120px editorial area, with readable 16px titles and 12px category/metadata. Cards remain equal height within the grid because their widths, image ratio and editorial area match. Use one column below sm, two at sm/md, three at lg and four at xl; preserve 206px desktop height from lg and 270px from 1440px. Missing images use an existing brand-logo fallback instead of an empty gray frame. Skeletons share the same frame/content rules. No browser or test execution performed under the prior user instruction.

## Larger desktop revision
The user subsequently requested larger cards from lg upward, with a desktop screenshot. Superseding previous desktop sizes: use three fluid columns throughout lg and larger, 320px card height with a 180px image from lg, and 360px card height with a 210px image from 1440px. Increase desktop titles to 18px/20px, metadata to 14px and content padding to 16px/20px. Cards and skeletons retain shared geometry and equal height; below-lg styles remain unchanged. Source-only changes, no checks run per the user's earlier instruction.

## Channel tab alignment
User requested that the first channel name align with the Channels heading. Added first:pl-0 to the channel tab buttons, removing only the first tab's left padding at every breakpoint. Other tab spacing and horizontal scrolling are preserved. Source-only adjustment; no tests/browser checks run.

## Duration font spacing
User requested removal of the apparent extra bottom pixel in the MIN badge. Added text-box-trim: trim-both and text-box-edge: cap alphabetic to trim line-box space to the capital height and baseline while retaining symmetric badge padding. Browsers without these properties retain the previous spacing. Source-only CSS change; no browser check run under the existing instruction.
