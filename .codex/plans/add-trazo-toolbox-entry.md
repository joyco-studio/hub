# Add Trazo to the Toolbox

Add Trazo as a first-party library entry using the existing metadata-driven
toolbox pattern. The hub will fetch and render the repository README,
automatically supplying the documentation body, table of contents, and GitHub
link.

1. Create `content/toolbox/trazo.mdx` with the title, a concise README-derived
   description, `type: library`, and the `joyco-studio/trazo` repository.
2. Leave the MDX body empty and do not mark the entry as featured. The shared
   library pipeline will expose `/toolbox/trazo`, include it in the main and
   library indexes, and generate the Markdown representation.
3. Check formatting, run the production build, and verify the rendered page and
   index output contain the Trazo entry and README content.

Status: complete. Formatting and the authenticated production build pass. The
rendered page, raw Markdown page, main toolbox index, and library index all
return the Trazo entry with its repository README content.

Follow-up: the live README exposed that unlabeled fenced blocks skipped Shiki
and inherited inline-code styling. Both Markdown pipelines now treat unlabeled
blocks as plaintext while leaving inline code unchanged.
