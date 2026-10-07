# Publish the GLB texture and CSP log

Publish a concise version of the supplied article in a new PR against `main`, independent of the inner-shadow article. Preserve log number 20 and author `justkahdri` from the earlier unpublished draft.

1. Explain the observed symptom, the embedded-image loading path, and the targeted CSP change. Remove assumptions about the reader, universal diagnoses, testing digressions, and the repeated conclusion.
2. Verify the technical explanation against three.js r183 and the CSP specification. Omit the unavailable screenshot placeholder, validate MDX compilation and log numbering, and review the final diff.
3. Commit, push the new branch, and create a PR against `main`.

Status: article complete. Primary-source verification, MDX compilation, frontmatter, log numbering, formatting, independent review, and the production build passed. The article route is present in the prerender manifest. Ready to commit and publish the new PR.
