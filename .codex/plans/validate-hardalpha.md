# Validate the hardAlpha fix

Compare the original ×127 inner-shadow filter, the ×1 edit, and the article's vector-mask rebuild in real Chrome. The objective is to test blur and blend modes before changing the article's recommendation. Existing edits and illustrations belong to the preceding work and must be preserved unless explicitly superseded by these results.

## Method

1. Recover existing SVG fixtures where accessible. Desktop is currently blocked by macOS; reconstruct controlled fixtures in `.context/hardalpha-validation` and label them as synthetic unless the originals become available.
2. Render each candidate at native pixel size in installed Google Chrome. Use the original filter at 8×, area-downsampled, as the reference; check 16× convergence and the supersampled ×1 filter to expose reference bias. Keep backgrounds, filter color space, shapes, offsets, and blend order identical.
3. Measure RGB RMSE on a common silhouette band and on a wider band covering offset plus three blur standard deviations. Include normal, overlay, multiply, blur, transparent fills, multiple sizes, and subpixel placement. Measure display-composited images, not undefined transparent RGB.
4. Save SVG fixtures, numeric results, native renders, and nearest-neighbor magnifications alongside a reproducible script and report. Distinguish the article's rasterized vector masks from actual Boolean vector geometry.
5. Decide the article recommendation from the measured results. Following the user's steering toward verification and the newly supplied original, write an evidence report and proposed editorial wording before changing the article. Identify unsupported universal claims and distinguish masks from Boolean paths.

## Progress

Completed. Read both JOYCO indexes and the color-space article. Recovered the original triangle from workspace attachments and prior illustrative scripts from `/private/tmp`. Desktop remains inaccessible; the user supplied `temp/Star 1.svg`. All final experiments and reports are in `temp/hardalpha-validation/`, as requested.

Rendered 37 cases in Google Chrome 153.0.8010.52, checked 8×/16× references and 32× for the supplied stars, measured narrow and broad bands and resampling sensitivity, and compared the article's masks against real Boolean paths where blur is absent. Inline SVG screenshot controls for all three originals match canvas exactly.

The user's opaque star improves with alpha 1 (18.68 → 9.32 edge RMSE); two shadows and blur alone do not establish a halo. A controlled variant changing only source fill opacity to 0.36 loses shadow intensity with alpha 1 (30.31 vs 17.54 original and 10.35 mask rebuild). Real Boolean rims also strongly improve the translucent synthetic fixture. The report recommends alpha 1 as a first fix with a reconstruction fallback when appearance changes, without claiming a universal halo or universal geometric superiority.

Saved a minimally patched `temp/Star 1-alpha1.svg`, native and nearest-neighbor comparison images, full metrics, measurement masks, reproducible scripts, and Spanish report. Existing article edits and illustrations were preserved; no hub code or dependencies changed.

Additional user fixture `temp/Star2.svg` confirms a blue fringe from alpha 1 around the white rim, even with opaque fill. The article's mask reconstruction worsens it. Added a hybrid reconstruction partitioning the blue fill and white rim into disjoint Boolean regions while retaining the red blur. Its edge RMSE is 5.41 vs 11.16 (alpha 1), 15.42 (article masks), and 10.01 (original), confirmed against 32×. Saved `temp/Star2-alpha1.svg` and `temp/Star2-rebuilt.svg`; updated the report to distinguish this verified halo from the separate translucent-fill intensity issue. This supports a simple alpha-1 fix first and a carefully constructed geometric fallback, without claiming the original mask recipe is sufficient.

## Article and delivery (authorized follow-up)

The user requested internet research, updating the log entry, committing all changes, and creating a PR against `main`.

1. Check public primary sources for the filter math and first-hand Figma export reports; distinguish official explanations from community workarounds and our experiments.
2. Rewrite log 19 around the verified two-step recommendation, replace the former simulated illustrations with real Chrome renders, and provide original/patched/rebuilt SVG downloads and reproducible evidence.
3. Validate formatting, log numbering, production compilation, and the existing article route with desktop/mobile screenshots and asset checks.
4. Review the full diff, commit the completed work, and create a PR against `main` without renaming the branch.

Article work completed: log 19 now presents alpha 1 as the first fix, the reproduced Star2 halo, and the Boolean-region reconstruction that removes it. Added real native Chrome illustrations, original/patched/rebuilt SVGs, public numeric results, community and specification citations, and a link to the public repository's reproducible report. The research found related Figma community reports and public uses of the matrix, but no authoritative explanation of the specific multiplier.

User correction: preserve the original title, **19 - The aliasing lurks in the shadows**. Restored it and replaced the technical summary with the more inviting subtitle: “Perfect in Figma. Jagged in the browser. The tiny SVG fix that helps, and the halo it can leave behind.”

Validation passed: production build, log numbering, targeted Prettier, SVG parsing, minimal-patch checks, report links, and git whitespace checks. Chrome verified the article at 1440px and 390px: four images loaded; native comparison images stayed 192 × 97 and 280 × 97; all six downloads returned 200; no runtime errors, missing heading anchors, or horizontal overflow. Existing baseline-browser-mapping, Shiki-version, and module-type build warnings remain nonblocking. Intermediate supersampled rasters are gitignored and reproducible; comparison images, raw user fixtures, scripts, parameters, computed paths, and metrics are included.
