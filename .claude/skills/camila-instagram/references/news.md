# AI news videos

News is the pillar where being wrong costs the most. Camila reports what happened, calmly, and what it means for a beginner. Nothing else.

## Workflow (`ai news` keyword, or any news video)
1. **Search the web** for AI news from the last 7 days. Prefer primary sources (the company's own announcement, official blog, paper, regulator) and one reputable outlet that confirms it. Don't rely on a single social post or on a headline alone.
2. **Pick 3–5 items** a beginner would care about. Filter in this order:
   - Does it change what a normal person can do or should watch out for?
   - Is it confirmed (not a rumor, leak or "reportedly")?
   - Can it be said in one idea, with no jargon?
   Skip: funding rounds, benchmark leaderboards, executive drama, model version-number wars, unless one affects regular users.
3. **Verify each item:** date, who announced it, what exactly is available (to everyone, paid, one country, waitlist), numbers. If two sources disagree, say what is confirmed and what isn't, or drop the item.
4. **Write one video per item** with the News structure below.
5. **Record sources** in the brief and in `sources` (title, URL, date). If a fact can't be sourced, remove it.

## News structure (25–35 s)
1. **Hook:** "Esta semana, [en una frase, qué pasó]." Layered; on-screen text names it in plain words.
2. **What happened:** one or two sentences, plain. Explain any term once.
3. **Why it matters to you:** one concrete everyday consequence. Not "revolutionary", just "esto significa que ahora puedes…" or "esto significa que conviene tener cuidado con…".
4. **What to do (or not do):** one action, or explicitly "no tienes que hacer nada". Honest relief is good content.
5. **Close:** short line. Caption holds the CTA.

## Rules
- **Say how sure she is.** "Está confirmado", "la empresa dice", "todavía no está disponible en todos los países". Never turn a claim into a fact.
- **Date matters.** Give the day or "esta semana". Never "hoy" unless it's published the same day.
- **No hype, no fear.** Banned: revolucionario, cambia todo, nadie lo vio venir, te va a reemplazar, el fin de, histórico. If the real news is small, say it's small.
- **No predictions as facts.** "Podría" and "dicen que" are fine when labelled.
- **No leaked or unverified screenshots, no quotes she can't source.**
- **No investing talk.** If news involves stock prices or crypto, skip it or cover only what the product does.
- **Neutral on companies.** Say what the product does; don't rank or recommend it as "the best".
- **Risk and privacy items are welcome:** new scams, deepfakes, data-sharing changes. Explain calmly and give the habit.
- **Mention it's AI-generated content** via the label (`ai_label`), and never present Camila as having personally tested something she hasn't.

## Brief block (English, goes in item 10 of the output)
```
Sources: 1) {title} — {outlet} — {url} — {date}; 2) …
Confirmed: …
Not confirmed / avoid saying: …
Availability: who can use it, where, paid or free
Re-verify before publish: {numbers, names, dates}
```

## Weekly `ai news` batch output
Plan table (`# | Date of news | Item | Why a beginner cares | Hook | Sources`), then one full video package per item, then the batch JSON. Save as `camila/plans/YYYY-MM-DD-news.md` and `.json`.
