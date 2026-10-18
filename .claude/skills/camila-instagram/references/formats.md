# Formats

Contents: Video (Reel/TikTok) · Caption · Hashtags · Carousel · Stories · Replies · Bio · Batch

## Video (Reel / TikTok)
One script serves both platforms. Only caption and hashtags differ.

**Length:** 20–45 s, ideally 25–35 s. Completion matters more than length, so never stretch a 20 s idea. Estimate it as words ÷ 2.3 plus the total of all pauses. About 55–75 spoken words usually fits.

**Beats** (hook → bridge → body → payoff → close)
1. **Hook (0–2 s):** layered hook (`hooks.md`). Striking first frame + on-screen text + one spoken line.
2. **Bridge (2–6 s):** one line that opens a loop ("y la razón es más simple de lo que crees", "te explico en tres pasos"). Number the steps so progress is visible.
3. **Body (6–24 s):** 2–3 steps or points, one idea each. Explain every term once, in plain words or one everyday comparison. Visual change every 2–4 s (cut, zoom, screen capture, B-roll, text pop).
4. **Payoff (24–32 s):** the takeaway line. It delivers exactly what the hook promised. Slowest, clearest line, followed by a pause.
5. **Close (last 2–3 s):** a short closing line (`camila.md`) or a loop back to the hook. CTA stays out of her voice; it goes in the caption and the last frame.

**Cut-test:** every line must grab, explain or set up the payoff. If it does none, delete it.

**Muted version first:** write the on-screen text so the whole story works without sound. Spoken audio adds, never carries alone.

**Beats table (always include):**

| Time | Visual / shot | On-screen text | Spoken |
|---|---|---|---|
| 0–2s | Camila close-up + app screen behind | "¿Por qué la IA se inventa cosas?" | "¿Por qué la IA se inventa cosas?" |

Visual column = brief for HeyGen framing, screen capture or Kling B-roll. Keep it shootable: one thing per row.

**On-screen text**
- At most 2 lines of at most 7 words each, bold, high contrast, no emoji. Keep text out of the bottom 25% and top 10% of the frame (platform UI covers it).
- Burned-in subtitles come from `clean`; don't repeat them in overlays.
- Key terms she explains appear as on-screen labels the moment she says them.

**Cover text:** 2–5 words as a title on the grid. Examples: "La IA no piensa", "Qué es un prompt", "Noticia de la semana".

**Sound:** suggest a soft background track in the brief (low, under the voice), never a trending sound as fact; the human adds trending audio in the app.

### Video types (pick the one that fits the pillar)
- **Explain (`explica`):** question → plain answer → everyday comparison → takeaway.
- **News (`noticia`):** see `news.md`: what happened → why it matters to you → what you can do or ignore.
- **Use it (`usalo`):** result first → 2–3 steps she'd actually follow → what to watch for → takeaway. Show the prompt on screen so it can be copied.
- **Careful (`ojo`):** the common mistake → why it happens → the simple habit → takeaway.
- **Myth:** "La IA piensa como una persona" → what it really does → why it matters.
- **Mini list:** "3 cosas…" with a number on screen per item.

## Caption
**Structure**
```
Line 1: hook. It must work alone before "… más" (at most 125 characters, ideally 90 or fewer)

2–5 short lines: the idea in plain words, concrete

The takeaway, on a line by itself

One CTA
```
- 250–700 characters.
- Work 1–2 search phrases naturally into the first lines (platforms search captions): "qué es la IA", "cómo usar ChatGPT", "noticias de IA", "inteligencia artificial para principiantes". Never as a keyword list.
- Blank line between blocks.
- 0–2 emojis, at the end of a line, soft (🤍 ✨ 🤖). Never 🔥 💪 🚀 💯 🙌.
- TikTok caption: shorter (100–300 characters), the search phrase in the first line.
- Add the AI-generated label in the platform settings (the JSON field `ai_label`), not in the text.

**CTAs: one per post, rotate**

| Type | Example | When |
|---|---|---|
| Save | "Guárdalo para cuando lo necesites." | explainers, use-it, careful |
| Send | "Mándaselo a quien aún no entiende qué es la IA." | news, explainers |
| Soft comment | "¿Qué quieres que explique la próxima? Te leo." | only if a human will read and reply |
| Series | "Cada semana, una cosa de IA explicada fácil." | news and series |

Don't use "Comenta SÍ", "Dale like si…" or "Etiqueta a 3 amigas". Platforms demote engagement bait.

## Hashtags
At most 5, no accents. 1 core + 2–3 topic + at most 1 broad. Hashtags mostly help classification; caption words matter more for search.

| Group | Tags |
|---|---|
| Core (pick 1) | #inteligenciaartificial #ia |
| explica | #queesia #aprendeia #iaparaprincipiantes |
| noticia | #noticiasia #novedadesia #tecnologia |
| usalo | #chatgpt #productividad #trucosia #iaparatodos |
| ojo | #seguridaddigital #pensamientocritico #iaresponsable |
| Broad (at most 1) | #tecnologia #aprendizaje #tips |

Don't invent tags nobody searches for.

## Carousel
5–8 slides. Instagram shows carousels again, starting from slide 2, to people who scrolled past slide 1, so slide 2 also has to work as a hook.

1. Hook (at most 10 words), must work alone in the feed.
2. Second hook or the plain question.
3. Middle slides: one idea each, at most 15 words, with the term in bold and its plain meaning below.
4. Second-to-last: the takeaway, alone.
5. Last: one small action + CTA (save or send).

Caption is shorter (100–400 characters). Add one design line in English (background, type, mood), for example "soft pastel gradient, rounded sans-serif, one idea per slide, no emoji".

**Deliver in this order:** title, pillar and takeaway → numbered slide list → design line → caption → hashtags → sources if factual → JSON (`"format": "carousel"`, a `slides` array instead of `annotated`/`clean`/`tts`/`beats`).

## Stories
3–5 frames, at most 20 words each. Lighter and more conversational. Use one sticker per sequence:
- Poll: "¿Ya usas IA en tu día a día?" (sí / todavía no)
- Quiz: "¿Qué hace un 'prompt'?" with three options
- Question box: "¿Qué quieres entender de la IA?"
- Slider: "¿Cuánta confianza le tienes a la IA?"

If a frame has voice, annotate it like a video line.

**Deliver:** list of frames with text, sticker and voice annotation where there's voice → JSON (`"format": "stories"`, a `frames` array).

## Replies (comments and DMs)
- At most 25 words. Echo one word or detail from the comment, so it can't read as a template. Identical repeated replies get flagged as spam.
- Warm, curious, plain words. One idea, no walls of explanation.
- **Questions about AI:** answer in one or two sentences; if it needs a video, say "me lo apunto para un video".
- **"¿Eres real?":** honest. "Soy una IA, sí. Pero lo que te cuento lo reviso de verdad."
- **Disagreement or correction:** thank them; if they're right, say so; if the fact is unclear, say "lo reviso". Never argue.
- **Hostile or trolling ("la IA es mala", insults):** one calm line or no reply.
- **Medical, financial, legal or personal-crisis questions:** don't advise. Mark `⚠️ HUMAN REVIEW`. Suggested reply: "Eso es mejor consultarlo con una persona que sepa. Yo solo te explico qué hace la IA 🤍". Any sign of self-harm or crisis: flag `⚠️ HUMAN REVIEW`, never auto-post, suggest a caring reply pointing to emergency services or the local helpline (in Spain, 024). A human decides what is sent.
- **Flirting:** deflect kindly, no flirting back.

**Deliver:** a table `# | comment | reply | flag` → JSON array (`[{"comment": "", "reply": "", "flag": null}]`).

## Bio
At most 150 characters: what she is, who it's for, rhythm, that she's AI. Give 3 options. Example:
```
Camila · IA 🤖
La IA explicada fácil + noticias de la semana. Sin tecnicismos.
```

## Batch (weekly plan, `camila` and `ai news` keywords)
Default: 7 videos (one week) for `camila`. For `ai news`: 3–5 news videos (`news.md`).

**Planning rules**
- Follow the pillar shares in `camila.md`; never the same pillar twice in a row.
- Each video starts from a different question or moment.
- Rotate hook types and CTAs.
- Takeaway lines must not repeat or paraphrase each other, within the batch or against earlier plans. Before planning, read earlier plan files in `camila/plans/` if any exist.
- News older than a week isn't news; move it to an explainer.

**Output**
1. A plan table for humans: `# | Day | Pillar | Question/Idea | Hook (on-screen) | Takeaway | CTA`.
2. The full video package for every item (video contract in SKILL.md).
3. JSON: `{"batch_id": "camila-YYYY-MM-DD", "created": "YYYY-MM-DD", "items": [ ... ]}`, same schema as a single video for each item.

Save the results inside the working folder as `camila/plans/YYYY-MM-DD-week.md` (table plus packages) and `camila/plans/YYYY-MM-DD-week.json`.
