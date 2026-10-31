# qCal.cc Printouts contributor specification

This document defines the established appearance and behavior of qCal.cc printables. Use it when adding a reference sheet, graph paper, randomized drill, or external resource. Preserve the existing static, offline-capable site and shared styling. This is contributor guidance, not a replacement for mathematical verification or visual print testing.

## Files and integration

| File | Responsibility |
| --- | --- |
| `printouts.html` | Shared page shell, script and stylesheet loading |
| `assets/printouts.js` | Catalogue, categories, external resources, preview routing and static sheet rendering |
| `assets/reference-data.js` | Shared reference-sheet formulas and practice prompts |
| `assets/drills.js` | Arithmetic generators, reusable sheet header, drill mounting and sequential printing |
| `assets/algebra-drills.js` | Equation and systems generators, variable parsing and controls |
| `assets/drills.css` | Preview position, controls, shared sheet header and drill layouts |
| `assets/styles.css` | Active site and print styles, Bion font faces and typography roles |
| `vendor/`, `LICENSES/`, `THIRD_PARTY_NOTICES.md` | Local dependencies, fonts and their notices |

Use `styles.css` as the active stylesheet; the unreferenced historical stylesheet was removed. New dependencies must remain local and retain applicable licenses. Deliver plain HTML/CSS/JavaScript and assets; do not require Node, a build service, TypeScript, or a CDN for users to open the site.

Add a unique, stable sheet ID and catalogue metadata (`title`, `eyebrow`, `description`). Dynamic sheets also register their title in `window.QCAL_DRILLS.titles` and provide a mount handler; the catalogue uses this registration to identify Dynamic sheets. Preserve existing URLs. In particular, `linear-literal-drills` remains the URL ID for the renamed **Equation Drills**.

Load a new drill module after `drills.js` and before `printouts.js`. Reuse the shared header and print helper rather than duplicating their markup. Reference sheets should use the shared reference data so screen and printed formulas stay synchronized.

## Catalogue and preview navigation

- The library page has a single large **Printouts** heading in Bion Bold.
- Keep Reference Sheets, Practice Sheets, Graph Paper and External Resources visually organized. Expand/collapse arrows point up when open and down when closed.
- Describe the mathematical subject and purpose in the tags: for example, **Algebra · Practice · Dynamic** or **Arithmetic · Practice · Dynamic**. Dynamic is a status, not a subject category.
- Static/Dynamic/External status belongs inline with the other tags, with matching size, weight, capitalization treatment, color and separator spacing. Avoid a detached badge or a large flex gap before the status.
- Keep descriptions in IBM Plex Sans. Do not add an “OPEN ↗” label to cards.
- Every printout preview has a left-arrow link to `printouts.html`, to the left of the preview title and tag group. Use IBM Plex Sans at 400 weight, 18 px. The bundled subset contains the down arrow U+2193, but not the left arrow U+2190: render `↓` in an aria-hidden span and rotate it 90 degrees to point left. Do not use a literal `←`, which triggers a mismatched fallback glyph. Keep the span’s font and color inherited from the link to override the preview tag styling. It needs an accessible “Back to Printouts” label and a visible keyboard focus state. This navigation stays outside the printable page.
- External cards use the external URL and label External; they do not claim to be locally generated worksheets. Use the resource's requested name (for example, **Math is Fun**), then explain other subjects or levels in the description when relevant and verified.

## Typography

| Element | Font and weight |
| --- | --- |
| Main library “Printouts” heading, qCal.cc wordmark | Bion Bold, 700 |
| Reference category headings, such as “Reciprocal Identities” | Bion Bold, 700 |
| Other established sheet titles, preview titles, navigation, short labels and tags | Bion Book, 400 |
| Printed type/category and “Name:” | Bion Book, 400 |
| Descriptions, instructions and explanatory prose | IBM Plex Sans |
| Arithmetic digits, algebra expressions and worked calculations | IBM Plex Mono, with suitable glyph fallback |
| Site footer and maintained-by link | Bion Book, 400 |

Use the existing local Bion Book/Bold and IBM Plex assets. Do not make all text bold, or change prose and mathematics to Bion. Preserve the existing role distinctions. Unicode variables may need browser fallback fonts; check uncommon glyphs as well as ordinary Latin letters. Emoji use locally bundled OpenMoji fonts: `vendor/openmoji-black.woff2` for outline glyphs by default and `vendor/openmoji-color.woff2` for full color. The **Full Color Emoji** checkbox sits directly below the variable-name text box, before the expandable Variable presets menu and help text. It defaults off, is disabled when the variable list has no emoji, and Reset turns it off. Switching it changes appearance without regenerating problems; matching keys and worked solutions inherit it. Emoji spans alone use these fonts, preserving the equation font for coefficients and other variables. Do not simulate monochrome mode with a grayscale filter. Await the selected font and `document.fonts.ready` before printing. Keep the OpenMoji CC BY-SA 4.0 license and attribution with the fonts. Test the glyphs and complete sequences actually used; supported parsing does not guarantee that an arbitrary future emoji exists in the bundled font. Distinct skin-tone or variation-selector inputs can look identical in monochrome; use visibly distinct variables for classroom sheets.

Reference equations must be prominent: use the Quadratics sheet's quadratic formula as the visual size benchmark, with category labels secondary. Typeset radicals with a continuous overline spanning the full radicand, including indexed roots. Preserve exact radicals and pi where possible. In Vieta's product relation use **×**, not a centered dot, and put separate equations on separate lines. Multiplication-table numbers must be large enough for classroom printing.

## Printed header

Use `QCAL_DRILLS.header(title, type, intro, classes)` so every sheet shares the same header.

1. Put the small grayscale quokka at the upper left, followed by **qCal.cc** in Bion Bold.
2. Follow the wordmark with a small space, then type and subject in Bion Book: **Practice · Arithmetic**, **Practice · Algebra**, **Reference · Algebra**, or **Paper · Graphing**. Type precedes subject. Do not put a separator dot immediately after qCal.cc; retain the dot between type and subject.
3. Align qCal.cc and the adjacent type/category text on a common baseline. Center that text group vertically beside the quokka. Do not independently center each word at conflicting heights.
4. On the same upper row, align **Name:** to the right, above the worksheet title. Match its type/category text size (currently 10.5 pt). Use Bion Book.
5. Follow Name with a long continuous CSS rule, currently 2.4 inches wide, lowered slightly relative to the text baseline. Never simulate it with repeated underscore characters. Keep enough width for a real student name without colliding with the wordmark/tags.
6. Place the worksheet title and any brief instructions below that row. Keep title/category spacing consistent between static and dynamic sheets.

Reuse the header for keys too; mark them **Answer Key** without changing problem positions or the established branding alignment.

## Page geometry and problem space

The existing target is US Letter portrait (8.5 × 11 inches), with approximately half-inch printed padding and no browser UI inside the page. Reuse `.print-sheet` and existing `@page` rules. Screen previews have their own surrounding margins; screen and print padding are not identical.

Place all previews slightly left of the available area, reserving the right side for controls. Static sheets put Print in the same side-control position as dynamic sheets. On small screens, keep controls accessible and the page usable; the established layout places controls above the page when needed.

A worksheet should use the whole usable page, spreading problems evenly across rows and columns. More digits, variables, equations or working steps require more space; reduce problem count and/or columns instead of shrinking everything into an unreadable grid. Allow room to solve the problem, not merely to write an answer. Do not insert separator rules or ruled writing lines between Equation Drills or Systems problems. Keep problem numbers unobtrusive and avoid splitting a problem across pages.

Cartesian and polar graph sheets distribute their grids evenly down the page. Curves, axes and grids should print clearly and darkly; axes remain distinguishable from grids. Graph borders and arrows must not be clipped.

Check the maximum-sized worksheet and its full worked key for clipping, overlap, wrapping and extra pages. A mathematically correct generator is not evidence that its printed layout fits.

## Controls for dynamic sheets

Keep controls outside `.print-sheet`, in the right-hand aside. Use meaningful labels, appropriate numeric bounds, visible status/error text and keyboard-operable elements.

- Stack **Print**, **Regenerate** and **Reset** vertically in that order.
- Use the Paper Tape traffic-light treatment: green Print, amber Regenerate, red Reset. Buttons are borderless with no filled backgrounds; on hover their text becomes the site's ink color. Preserve visible keyboard focus.
- Regenerate makes a fresh worksheet using the current settings. Reset restores documented defaults and generates a fresh worksheet.
- Numeric ranges have Minimum and Maximum fields, with small up/down buttons on the right of each field. Support typed values as well as arrow clicks, clamp to the permitted bounds and disable buttons at the outer limits.
- When minimum rises above maximum, move maximum up with it. When maximum drops below minimum, move minimum down with it. Do not stop at the paired value and do not leave an inverted range.
- Add controls that affect the new subject: digit/variable/equation counts, operation choices and mathematically relevant allowances. Avoid settings that do not change generated problems.
- Invalid or impossible configurations need a clear inline message and must not print a stale sheet. Do not quietly substitute a different difficulty or ignore an unrecognized variable command.
- For emoji-variable sheets, place **Full Color Emoji** directly below the variable-name box, off by default and disabled until emoji are present. Apply it to the worksheet, inline answers and worked key without regenerating the mathematical problems.
- At the bottom, offer **Print with key**, off by default. Beneath it, **With solutions** is disabled until Print with key is selected; unchecking Print with key also clears With solutions.

### Established defaults and ranges

| Drill | Ranges and default settings |
| --- | --- |
| Arithmetic by Columns Drills | First row: 1–7 digits; second row: 1–6. Each defaults to min=max=2. Addition, subtraction and multiplication all on. Subtraction past zero on. |
| Long Division Drills | Dividend: 1–7 digits, default min=max=6. Divisor: 1–3 digits, default min=max=2. Allow remainders on. |
| Equation Drills | Variable count: 1–6, default min=max=2. Negative and fractional options off. |
| Systems of Linear Equations Drills | One System size range: 2–6, default min=max=2. The chosen size is both variable count and equation count. Negative and fractional solutions off. |

Both algebra drills default their allowable-variable field to `abcdefghijklmnopqrstuvwxyz`. Their selected maximum cannot exceed the number of distinct available variables.

### Variable input grammar

- Accept Latin, Greek (including alpha and beta), Cyrillic and other Unicode letters, including supplementary-plane mathematical letters: `xyzꟛθχ𝜒` is seven distinct variables. Read whole grapheme clusters, not UTF-16 code units, so supplementary letters and emoji sequences remain intact.
- Accept basic geometric shapes and emoji as variables, including `△□○◇`, `😀`, flags, keycaps, skin-tone modifiers and ZWJ sequences such as `👩‍🔬`. Each complete emoji grapheme is one variable. Whitespace separates symbols without becoming a variable. Preserve the entire symbol in prompts, keys and solutions.
- Ignore whitespace between ordinary letters: `a b c` and `abc` provide the same variables.
- Treat uppercase and lowercase as distinct variables: `Aa` provides two variables; the same rule applies to Greek, Cyrillic and other scripts. Preserve case and mathematical styles. Do not normalize mathematical italic chi `𝜒` into ordinary chi `χ`.
- Support backslash variable commands separated by whitespace, such as `a \theta \chi`. Each supported command becomes one displayed variable, not a sequence of letters. Adjacent backslash commands also work.
- Deduplicate decoded variables in first-seen order. A raw `θ` and `\theta` represent the same variable. NFC normalization combines canonically equivalent accented letters; avoid compatibility normalization that destroys mathematical styles.
- Shape aliases map to the same displayed variable, so aliases and their raw shape are deduplicated. The mappings are listed below.
- Supported commands are Greek letter names and their standard variants, with capitalized Greek names supported as well; also `\ell`, `\hbar`, `\imath`, `\jmath`, `\triangle`, `\square`, `\bigcirc`, `\diamond`, `\star`, `\rhombus`, `\tree`, `\car` and `\apple`. The exact command map is `latexVariables` in `algebra-drills.js`.
- A command consumes its consecutive ASCII letters. Use a space between `\theta` and a following ordinary letter. Unknown commands and input outside the supported letters/shapes/emoji produce an error. Parsing uses `Intl.Segmenter`; browsers without it get an explicit compatibility message. This field is for variable symbols, not arbitrary TeX expressions, subscripts, macros or executable markup.
- Render input safely: use the shared `formatSymbols` formatter for prompts, answers and worked steps. It escapes every grapheme before wrapping emoji in a span; never interpolate raw variable input as HTML. The spans let Full Color Emoji affect only emoji glyphs.

### Variable preset menu

Immediately under Full Color Emoji, offer a collapsed-by-default native
`details` menu titled **Variable presets**. It contains these buttons:

| Button | Symbols |
| --- | --- |
| Clear | Empty the variable-name field |
| Uppercase Latin | ABCDEFGHIJKLMNOPQRSTUVWXYZ |
| Lowercase Latin | abcdefghijklmnopqrstuvwxyz |
| Uppercase Greek | ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ |
| Lowercase Greek | αβγδεζηθικλμνξοπρστυφχψω |
| Basic Shapes | ○□△▭◇⋆⬠⬡ |
| Basic Emojis | 🌳🚗🍎😀🐈🐕 |

Presets append missing symbols in their listed order, preserving the field’s
existing variable order and entered command spellings. Compare decoded variables
so repeated clicks and equivalent raw/command aliases never add duplicates.
Insert whitespace before appended sets to terminate an existing LaTeX
command. Sets can be combined; Clear empties the field and displays the
usual too-few-variables validation until enough variables are supplied.
Preset buttons regenerate using the current range and solution settings.
They must update Full Color Emoji's enabled state and respect print-time
control locking. Keep the menu outside the printable page, keyboard
accessible and visually consistent with other borderless controls.

### Mixing available variable sets

Input order and worksheet selection are separate. Preserve the field's order
when appending and deduplicating, but do not generate worksheets using only
the leading letters. Shuffle within script/case families and interleave the
nonempty families (Latin, Greek, Cyrillic, other letters by case, shapes and
emoji). Consume that mixed pool across the worksheet before cycling through
it again. Keep variables distinct within each problem. Where the worksheet
has enough variable slots, every available family must be represented.
Regeneration reshuffles the pool; appending a later preset must make it
eligible immediately. Test the concrete sequence Clear → Uppercase Latin →
Lowercase Latin → Greek and verify both the input field and generated
problems, not just the append helper.

### Shape command aliases

| Input commands | Displayed variable |
| --- | --- |
| `\circ`, `\circle`, `\sircle`, `\bigcirc` | ○ |
| `\sq`, `\square` | □ |
| `\rect`, `\rectangle` | ▭ |
| `\tri`, `\triangle` | △ |
| `\diam`, `\diamond`, `\lozenge`, `\rhombus` | ◇ |
| `\tree` | 🌳 |
| `\car` | 🚗 |
| `\apple` | 🍎 |
| `\star` | ⋆ |
| `\pentagon` | ⬠ |
| `\hexagon` | ⬡ |

The tree is a deciduous tree, the car an automobile, and the apple a red apple in full-color mode. These names are aliases for their corresponding raw emoji and deduplicate with them.

These commands name variable symbols, so `\circ` intentionally selects the
full circle ○. `\sircle` is an accepted spelling alias. Separate a command
from a following ordinary letter with whitespace. Add new aliases to both
the command map and this table; test raw-symbol/command deduplication.

For one-variable Equation Drills, write **Solve:** followed by a newline and the equation. Generate an exact numerical solution that respects negative/fractional options. For multiple variables, write **Solve for a:** (using the selected target) on a separate line above the equation; the answer isolates that target symbol. Symbolic rearrangements can depend on other variables, so their numerical sign is not determined without assigning values to those variables; the multi-variable generator's options govern its coefficient/constant choices and whether division is required.

## Answer keys and worked solutions

Print with key opens two sequential print operations: the worksheet first, then its matching key. Use the shared `sequentialPrint` helper and `afterprint` flow; never regenerate between the two. Keep a snapshot of the generated problems, guard controls during the sequence, and restore the original worksheet and controls afterward. Test both completing and cancelling dialogs. Browser print behavior requires manual verification; do not claim success from a mocked `window.print()` alone.

Answer keys retain the worksheet's grid, numbering and spacing. Put answers inline with their original problems, not in a compact list elsewhere.

- Column arithmetic answers belong under the horizontal arithmetic rule. With solutions shows carries, borrowing and multiplication partial products inside the stacked calculation.
- Crossed-out borrowing digits use **diagonal** strikes, including in print. Revised digits must remain legible above their original columns.
- Long-division quotients align above the corresponding dividend digit columns. Place lowercase **r** followed by the remainder beside the quotient, at the same size and baseline. Do not include the remainder when it is zero.
- Division subtraction products, rules and brought-down values align with the dividend columns. Keep the quotient's position independent of the width of the remainder text.
- Each system prompt has one thin left curly brace spanning all its equation rows, for every system size from 2 to 6. Keep it outside the equation text with enough left padding, preserve line alignment, and retain it on the cloned answer key. Scale a vector brace to the group height instead of inserting one brace character per line.
- Equation/system answers and worked steps belong with their own original problem. Use exact fractions where possible and verify each solution by substitution. Systems must have the documented number of independent equations and a unique solution.

## Contribution and verification procedure

1. Read the shared code and the closest existing sheet. Record the intended title, subject/type, defaults, bounds, mathematical restrictions and key format.
2. Separate generation from mounting/rendering so the mathematics can be tested without a browser. Keep the current generated model for regeneration and key printing.
3. Register the catalogue entry and renderer, add only necessary controls and reuse shared CSS/header/printing helpers. Keep tags and navigation consistent for static and dynamic sheets.
4. Test every boundary, equal and mixed ranges, paired-limit crossing, invalid variable input, Unicode/command aliases, operation/solution toggles, regeneration and Reset. Verify negative/fractional restrictions and impossible configurations. Check exact divisions when remainders are off; ensure division by zero is impossible.
5. Independently verify generated answers, rather than just comparing two functions with the same formula. For systems, check rank and substitution. Check key answers and worked steps against the worksheet model.
6. Inspect screen and real browser print previews for smallest/largest settings, every key mode, unusual variable glyphs, header alignment, page fit, even spacing, hidden controls, fractions and radicals. Exercise sequential print completion and cancellation. Label visual printing unverified if no browser is available.
7. Check JavaScript syntax, local assets and links, offline operation, font licensing, ZIP integrity and root-level `index.html`. Package the site's files at the ZIP root, not inside an extra version folder. Do not bundle development dependencies or temporary test output.
8. Update this specification and README when a new sheet adds a reusable convention or changes a documented default. Preserve a prior package as a rollback point.

## Keeping this specification complete

When a printable requires an appearance rule, control, mathematical option,
input syntax, accessibility behavior or print/key workflow that is not yet
covered here, add the missing information to this file as part of the same
contribution. Include its purpose, exact behavior, defaults and bounds,
validation/error handling, layout implications and verification examples as
applicable. Add reusable conventions to the relevant shared section and
subject-specific rules alongside the named drill. Update outdated passages
rather than appending conflicting instructions. Document any known limitation
and any visual or print checks that remain unverified. A person or agent
should be able to extend the site from this file without needing the chat
history to recover a missing requirement.
