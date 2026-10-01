# Native image sequence registry replacement

## Contract and rationale

Implement the attached `update-hub-image-sequence.md` contract, using website commit
`6c849e66` as behavioral reference. A stable native image presents decoded Blob
URLs; local decode ownership and shared encoded transfers remain separate. The
attached plan supersedes the older double-buffering advice on
`kahdri/image-seq-log`. That branch's article is reference material and is not
imported into this change.

## Implementation

1. Adapt the reference transfer scheduler and runtime into focused registry library
   files. Review fairness, cancellation, streaming limits, responsive identities,
   bounded decoded ownership, playback policies, and one-shot completion.
2. Replace the component with native observers and its own RAF clock. Preserve the
   visible lease during suspension and source changes; restore the poster for
   reduced motion. Document the ready-ahead range of zero through three.
3. Migrate both the demo and homepage category links, publish all three registry
   files, and rewrite documentation with autoplay, scrub, networking, and migration
   examples. Rebuild the registry and verify installation paths.
4. Add focused runtime and real-browser regression coverage for this stateful,
   asynchronous runtime. Validate Chromium, WebKit, and Firefox, then measure cold
   and warm delivery, concurrent sequences, reentry, reversal, and resize. Keep
   diagnostic fixtures outside published registry code.
5. Run typechecking, focused lint, registry build, and behavioral tests. Record
   observable results and any environment or profiling limitations without claiming
   physical GPU completion.

## Progress

- Read the supplied plan, existing consumers, website reference, and branch log.
- Scanned JOYCO logs and toolbox; Render Pipeline supports separating decode from
  physical presentation, and Metri remains intentionally optional.
- Implemented the three-file native player and migrated both Hub consumers.
- Rewrote API, migration, responsive, lifecycle, accessibility, and network docs.
- Verified clean shadcn installation and import rewriting into a standalone consumer.
- Runtime checks and Chromium/Firefox/WebKit behavior checks pass. Added follow-up
  regressions for hidden documents, initial reduced motion, and idempotent posters.
- Hub production build, typechecking, and focused lint pass; inspected the real
  demo and homepage without browser errors.
- Real WebP profiling shows approximately 24 fps warm playback and no incomplete
  samples. A repeated poster assignment found in the initial trace was fixed;
  refreshed final-payload captures confirm the behavior. Results and limitations
  are recorded in `tests/image-sequence/VALIDATION.md`. All implementation steps
  are complete.
