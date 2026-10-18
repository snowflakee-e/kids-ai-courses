# Design: Channel Bloop (parent pages)

Source of truth: `designs/parents/channel/index.html`. Direction: kids' TV idents that grow into a teen documentary channel. The age dial is a channel dial.

## The one rule
Every visual token comes from the child's age. Nothing swaps abruptly: the dial blends between four stops in OKLCH (`paint(age)`, visual position `v = clamp((age - 7) / 3, 0, 3)`).

| Token | 6-8 Explorers | 9-11 Inventors | 12-14 Creators | 15-17 Pros |
|---|---|---|---|---|
| Ident field `--bg` | #FFCE3A sun yellow | #3CCBB0 mint | #2F4FE0 broadcast blue | #121A2E ink |
| Lower third `--acc` | #FF5B4A tomato | #FF8A3D orange | #FFD84D yellow | #F5C842 yellow |
| Page `--page` (light) | #E8F3FF sky | #ECFAF5 mint | #EEF1FD blue | #0D1322 ink (dark) |
| Radius `--rad` | 28px | 20px | 12px | 4px |
| Recursive CASL / wght / slnt | 1 / 900 / -9 | .7 / 840 / -6 | .28 / 760 / -2 | 0 / 640 / 0 |
| Lower-third tilt | -2deg | -1.2deg | -.4deg | 0 |
| Bloop | big host, bouncing | smaller | smaller, calm | the channel bug in the corner |
| Ident shapes | crowd the margins | thinning | 2-3 left | none |

Dark scheme: page, ink and card use the `pageD / inkD / cardD` stops; the ident field keeps its colour.

## Type
One variable face: Recursive (Google Fonts, axes slnt, wght, CASL, CRSV, MONO). Display uses the full CASL; body uses CASL × .45 and slant 0. Numbers are tabular.

## Broadcast parts
- Ident hero: giant age numeral (rolls like a counter), Bloop from `bobik.js` coloured via `--rb-*`.
- Lower third: track tab + h1 answering that age's worry + "Book a free lesson".
- Tuner: native range input (6-17, keyboard: arrows, PageUp/PageDown by track, Home/End) + four channel buttons + tick numbers.
- Programme guide: one `<details>` row per episode: number, title + idea, habit chips, screen rating badge, proof it leaves; opens to activity + "Try at home".
- Screen ratings: U Unplugged, G Grown-up types, S Simulator, R Real tool, W With you, A In the app.
- Standards slate (ink section): screen count, tool rule per age, our AI use statement.
- Sample parent report: four habits as 5 pips, latest Made / How / Think.
- Channel change: 0.4s scanline flash + lower third slides in. All motion off under reduced motion.

## Copy rules
One CTA label: "Book a free lesson". No em or en dashes in UI text (ranges use a hyphen). Prices are placeholders and say so. No invented reviews or numbers.
