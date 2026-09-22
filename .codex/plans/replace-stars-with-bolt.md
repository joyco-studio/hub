# Replace the shadow examples with the supplied bolt

Use the supplied 24 × 24 Figma vector consistently across the article. Preserve the original export, and keep the simple alpha fix limited to the two matrix multipliers. The geometry example must use this icon's actual `(1, 0)` rim offset.

1. Generate original, alpha-1, and partitioned SVG variants from the supplied path, including the existing light/dark illustration palettes.
2. Render new native-size pixel close-ups and replace the article's star assets, dimensions, captions, and geometry description. Add a responsive 24 × 24 grid to both close-ups so each cell corresponds to a source pixel, with an explicit explanatory label. Keep historical measurements identified as earlier star experiments.
3. Verify the source differences, compile the MDX, and inspect the comparisons in the browser on desktop and mobile.

Status: complete. SVG variants and native-size pixel close-ups generated; article dimensions, offsets, links, and measurement provenance updated. Both close-ups have a responsive 24 × 24 overlay grid and an explanation of its scale. Verified source preservation, matrix-only alpha edits, disjoint curve-based regions, MDX compilation, and all asset links. Browser inspection confirmed light/dark rendering and no horizontal overflow at 375px.

## Follow-up: restore the stars with grids

The user requested a checkpoint before returning to the stars. Commit `b842f8d` preserves the complete bolt version. Restore the earlier supplied star export for the first comparison and the existing high-contrast stars for the fringe comparison. Retain the enlarged SVG presentation and gray backgrounds. Adjust each pixel grid to the source image's 52 columns and 49 rows. Keep the bolt assets and scripts available for recovery.

Status: complete. Restored the supplied star and high-contrast variants; both magnified views use a 52 × 49 grid. Per follow-up feedback, the three-way comparison uses the page background to expose the fringe and labels the rebuilt version “Geometry”; the first pair retains its gray background. Verified MDX compilation, all asset paths, the original export and matrix-only fix, light/dark desktop screenshots, and a 375px mobile layout with no overflow or broken images. The bolt checkpoint and its assets remain available.
