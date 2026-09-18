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

## Editorial revision and improved Figma examples

The user found the original article's explanation stronger and wants harmonious stars to re-export from Figma. Preserve the original title and avoid em dashes throughout.

1. Recover the original narrative order: visible symptom, coverage/antialiasing, source alpha, the hardAlpha filter chain, and only then the remedies. Retain the experimental corrections instead of restoring the original's inaccurate universal claims.
2. Prepare three restrained palettes with coherent lighting, short offsets, and exact editable-effect recipes. Render local SVG prototypes in Chrome to evaluate appearance and whether they retain the required aliasing/halo behavior. Label these as prototypes, not Figma exports.
3. Ask for the target Figma file while preparing the designs independently. If accessible, create native editable stars and effects there; otherwise provide a self-contained Figma setup kit and settings. Keep proven article illustrations until replacement exports have been verified.
4. Validate and push the narrative improvements and example kit to the existing PR, preserving the existing reproduction data.

Additional user direction: remove the RMSE table from the article body because it does not explain the issue to readers. Use the provided alpha-coverage illustration and a Trazo flow diagram instead. The supplied illustration already contains labels, so display it without a redundant caption, with the explanation in alt text only.

Implemented the explanation-first narrative and removed the metric table and numerical result commentary from the article body. Added the original user illustration, a Trazo diagram of the actual shadow filter chain, and a practical visual checklist. Prepared three harmonious local star prototypes and exact native-effect recipes in `temp/star-design-kit`; Amber and Slate retain useful contrasting behaviors in Chrome previews. Awaiting an optional Figma file link; current article screenshots remain the verified exports until replacement exports are available.

User refinement: transparent PNG/SVG backgrounds. Re-rendered publication star assets from their transparent SVG sources, preserving white highlights instead of color-keying the measured PNGs. Proposal artwork also uses transparency. Removed the forced white background from the supplied coverage illustration and added dark-theme contrast adaptation; it still has no visible caption. Fixed-background captures remain in the technical appendix for reproducibility.

Final revision validated: production build, log numbering, targeted formatting, and whitespace checks passed. Chrome checks at 1440px and 390px confirm five loaded transparent illustrations, six working downloads, zero result tables, no duplicate coverage caption, no runtime errors, no missing anchors, and no horizontal overflow. Visually reviewed the coverage illustration, Trazo flow, and enlarged halo comparison on the dark site background. The optional Figma file link was not supplied; the editable-effect recipes and transparent prototype previews are ready in the design kit.

Final user refinement: removed the Trazo filter-flow diagram because it duplicated the preceding explanation. Retained the coverage illustration and the SourceAlpha/hardAlpha prose.

## Slate + porcelain Figma export

The user supplied the actual `temp/slate-porcelain.svg` export. Its white highlight is composited after the dark shadow, unlike the local prototype. Validate the actual export before replacing the older article counterexample.

1. Preserve the original and generate a matrix-only alpha-1 candidate and an order-correct region reconstruction.
2. Render in Chrome at native size and 8×/16×/32×, compare edge and shadow bands on light/dark backgrounds, and inspect nearest-neighbor enlargements.
3. If confirmed, replace the article's counterexample with transparent slate assets and update the explanation, downloads, and reproducible report. Keep the earlier fixtures as evidence.
4. Check the article, commit, and update the existing PR.

Slate validation completed in Chrome 153 at native size and 8×/16×/32× on white, gray, and dark. The alpha-only edit improves the jagged outline but leaves a gray-blue fringe over white; partitioning removes the underlying slate contribution. Edge error on white at 32×: 21.17 original, 11.60 alpha 1, 6.58 reconstruction. Gray is nearly tied and dark depends on reference resolution, so the article does not claim universal superiority. Inline and canvas renders match for all three variants.

Published the actual export and transparent comparisons with centered labels, preserving dark-then-white composition. Updated the article counterexample and recipes provenance, kept the earlier fixtures and fixed-background measurements. Production build, log numbering, formatting, matrix-only patch check, SVG parsing, alpha-channel checks, and whitespace checks passed. Chrome verified five images and seven downloads at 1440px and 390px, with no errors, missing anchors, or overflow.
