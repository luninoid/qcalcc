# Paper Tape specification

Current dispatch update: qCal.cc static package v45. This file records the implementation
and its limitations; examples below are acceptance cases for future revisions,
not a claim that every case has been browser-tested in this release.

## Runtime and entry points

Paper Tape runs locally in `index.html`, without a build step, server, or CDN.
Load order: `tape-math.js`, bundled Math.js, `equation-solver.js`,
`tape-advanced.js`, `tape-visual.js`, then `app.js` (all scripts except Math.js
are under `assets/`). `app.js` dispatches commands and manages tape state.
Never evaluate user expressions with JavaScript `eval` or `Function`.

## Input and output

- Submit an expression with Enter or the evaluate control. Ignore blank input.
- Complete missing closing parentheses for ordinary function expressions.
- Use normal arithmetic precedence, grouping, powers, factorials, and supported
  implicit multiplication. Use parentheses when grouping is ambiguous.
- Prefer exact rational results and simplified integer/rational square and cube
  roots where the dedicated handlers support them.
- `decimal(expression)` can participate in arithmetic; `dec expression` forces
  decimal evaluation. Constants include `pi` and `π` through normalization.
- Render text answers using the existing Plex math typography, with fractions,
  superscripts, and radical overlines. Keep a plain-text answer for COPY.
- Each answer has COPY/COPIED feedback; print excludes interactive controls.
- Graphs and number lines are inline SVG, escaped/generated from parsed inputs.

## Command reference

| Command | Purpose / syntax |
| --- | --- |
| `help`, `help topic` | General help or supported topic help |
| `list` | Operations, Functions, Conversions, Units, then Commands |
| `clear` | Empty visible entries and navigation history, including examples |
| `persist` | Save tape in this browser |
| `forget` | Disable persistence and delete saved tape data |
| `solve equation`, `solve(equation[, variable])` | Equation solving or supported linear inequality |
| `graph(expression[, variable])` | Automatically framed graph |
| `plot expression`, `plot(expression)` | Graph aliases; optional `y=` prefix |
| `numline(set)` | Number-line rendering of supported intervals/inequalities |
| `interval(set)`, `algebraic(set)` | Convert supported set notation |
| `domain(expression)`, `range(expression[, variable])` | Limited real-domain/range analysis |
| `extrema`, `min`, `max`, `inflection` | Polynomial point analysis; expression and optional variable |
| `deriv(expression, variable)` | Symbolic derivative |
| `int(expression, variable[, lower, upper])` | Basic polynomial integration |
| `lim(expression, variable, point)` | Finite and basic infinite limits |
| `expand expression`, `simplify expression` (or parenthesized forms) | Algebraic expansion/simplification and common trig identities |
| `partialfrac(expression, variable)`, `apart(...)` | Supported linear-factor partial fractions |
| `factor(value)` | Integer prime factors; limited algebraic handling |
| `gcf(values)`, `lcm(values)` | Comma-separated numeric arguments |
| `basechange(value, fromBase, toBase)` | Whole-number bases 2–36 |

Math.js also supplies ordinary numeric functions, including trigonometric,
inverse-trigonometric, logarithmic, exponential, rounding, and absolute value.
Base output helpers include `binary`, `ternary`, `octal`, `hex`, and `hexadecimal`.
The runtime `list` output and `unitCatalog` are authoritative for the unit inventory.

## Spaced function and command input

`solve`, `simplify`, `expand` and `factor` accept a space before their full
argument as well as the usual function-call parentheses. A complete outer
argument pair is reused, while a product of grouped factors is wrapped as
one argument. For example:

- `cos 0` → `1`
- `simplify (x+3)(x+2)(x+1)` → `x³ + 6x² + 11x + 6`
- `solve 2x^2-8=0` → `x = -2, 2`

Ordinary numeric functions such as sin, cos, sqrt and abs also accept
space-separated arguments. A bare function binds to the next multiplicative
term, stopping before a top-level sum, comparison, comma or closing
parenthesis. Thus `cos pi/3` means `cos(pi/3)` and `cos 0 + 1` means
`cos(0) + 1`. Use explicit parentheses whenever the intended scope is
ambiguous; `cos(0)*2` differs from the shorthand `cos 0*2`. Existing
explicit function calls, including `cos (0) + 1`, retain their scope.

Simplify collects supported single-variable polynomials into descending
powers when the input constants and resulting coefficients are safe
integers. Existing radical, fraction and trigonometric simplification stays
on its dedicated/general symbolic paths. Unsupported polynomial forms
fall back to the existing Math.js simplifier.

## Units

Accept `quantity unit to unit` and supported compound dimensional expressions.
Normalize supported aliases and SI prefixes without losing case-sensitive units.
Cancel compatible dimensions; reject incompatible target dimensions. Keep unit
answers in conversion notation rather than forcing every quantity into a fraction.

Acceptance examples: `mile to ft` → `5280 ft`;
`10 cm^2 / 50 mm to m` → `0.02 m`; `60 deg to rad` → `π/3`.

## History, persistence, and printing

Initial examples are visible and included in history. New results appear first.
Older/newer controls navigate submitted expressions. Clear resets history too.
Persistence is opt-in, stored at `qcal.paper-tape.v1`; at most 500 entries and
500 history expressions are saved. Expiration is **90 days** since last use,
not a calendar-month calculation. Handle unavailable storage without breaking input.
Printing uses the tape-only layout, white backgrounds, and no COPY controls.

## Current capability boundaries

- Equation solving supports polynomials through degree four, limited absolute
  value/root cases, identities/contradictions, and requested-variable linear
  isolation. It is not a general symbolic equation or inequality solver.
- Graph viewport selection is heuristic; it starts from a finite window, with
  special quadratic framing. It cannot guarantee every root, extremum, or
  discontinuity is found. Explicit viewport arguments are not implemented.
- Number-line nesting/shorthand is specialized, including `numline domain sqrt x`;
  this does not imply arbitrary command composition everywhere.
- Domain handling is pattern-based: linear square-root radicands can produce
  intervals, logarithms can return textual conditions, and rational expressions
  can return a generic denominator restriction. Other expressions can fall through
  to all reals; this must not be treated as a proven general domain algorithm.
- Range and point analysis are intended for basic polynomials. Higher-degree
  inputs are not reliably analyzed: critical-root helpers are quadratic and
  range classification uses constant/linear/quadratic coefficients.
- Trig simplification covers selected identities, not all equivalent forms.
- Limits include numerical heuristics; no general symbolic proof is supplied.
- Unsupported requests use the solver capability message where wired; graph
  failures have a separate graph-specific message. Future work should reject
  unsupported analysis explicitly instead of returning an unverified result.

## Regression examples for future changes

Check `cos 0`, `cos(0)`, `cos 0 + 1`, `cos pi/3`,
`simplify (x+3)(x+2)(x+1)`, `solve 2x^2-8=0`, `0.5`, `sqrt(12)`, `sqrt(1/2)`, `cbrt(54)`, `sin(30 deg)`,
`2*decimal(45 deg to rad)`, `solve(x^2=x)`, `solve(y+3=x^2-5y,y)`,
`plot y=2x^2-8x+6`, `numline(domain(sqrt(x)))`, and the unit examples above.
Exercise help/list ordering, COPY, clear, persistence/forget, 90-day expiry,
offline opening, and tape printing. Keep unsupported cases in the check set.
