# Gold examples

These show the standard. Don't reuse their ideas or takeaway lines in new content. Example 2 uses placeholders on purpose: never invent a news item to fill a template.

---

## Example 1: Video (explica)

### Video: Why AI makes things up
Pillar: explica · Idea: why AI invents answers · Takeaway: "La IA adivina muy bien, pero lo importante, revísalo tú." · Platform: both · Est. length: ~30s

**1. Hooks**
- A (used), pregunta real: on-screen "¿por qué la IA se inventa cosas?" / spoken "¿Por qué la IA a veces se inventa cosas?"
- B, error común: on-screen "la IA no siempre dice la verdad" / spoken "La IA no siempre dice la verdad."
- C, traducción: on-screen "qué es 'alucinar'" / spoken "Dicen que la IA alucina. Esto es lo que pasa."

**2. Voice brief**
A friend explaining something she just understood: close-mic, conversational, a smile in the voice. Pace natural, slower on the takeaway. Arc: curious → reassuring → playful → clear takeaway → light close.

**3. Annotated script**
```
(curious, direct) [warm smile in voice] ¿Por qué la IA a veces se inventa cosas? [pause 0.6s]
(reassuring) [light inhale] Sin drama: no te está mintiendo. [pause 0.3s] Está adivinando. [emphasis] [pause 0.6s]
(clear, friendly) Funciona como el autocompletar de tu teléfono, pero gigante. [pause 0.3s] Mira cuál es la siguiente palabra más probable... y la escribe. [pause 0.6s]
(playful) Si no sabe la respuesta, no dice "no sé". [soft laugh] [pause 0.3s] Completa igual. [pause 1s]
(takeaway, clear) [slower] La IA adivina muy bien... [pause 0.6s] pero lo importante, [lower pitch] revísalo tú. [pause 1.5s]
(light close) [warm smile in voice] Una cosa menos que no entender.
```

**4. Clean text (Spanish)**
¿Por qué la IA a veces se inventa cosas? Sin drama: no te está mintiendo. Está adivinando. Funciona como el autocompletar de tu teléfono, pero gigante. Mira cuál es la siguiente palabra más probable... y la escribe. Si no sabe la respuesta, no dice "no sé". Completa igual. La IA adivina muy bien... pero lo importante, revísalo tú. Una cosa menos que no entender.

**5. TTS-ready (ElevenLabs v4)**
```
[curious] ¿Por qué la IA a veces se inventa cosas? [short pause] [reassuring, gentle voice] Sin drama: no te está mintiendo. Está adivinando. [short pause] [warmly, smiling] Funciona como el autocompletar de tu teléfono, pero gigante. Mira cuál es la siguiente palabra más probable... y la escribe. [short pause] [playfully] Si no sabe la respuesta, no dice "no sé". [soft laugh] Completa igual. [long pause] [slowly] La IA adivina muy bien... [short pause] [low, warm voice] pero lo importante, revísalo tú. [long pause] [warmly, smiling] Una cosa menos que no entender.
```

**6. Beats**

| Time | Visual / shot | On-screen text | Spoken |
|---|---|---|---|
| 0–2s | Camila close-up, chat window blurred behind | "¿por qué la IA se inventa cosas?" | ¿Por qué la IA a veces se inventa cosas? |
| 2–6s | Screen: AI chat gives a wrong answer, red circle | "no miente: adivina" | Sin drama: no te está mintiendo. Está adivinando. |
| 6–14s | Phone keyboard with autocomplete suggestions, zoom | "= autocompletar, pero gigante" | Funciona como el autocompletar… y la escribe. |
| 14–20s | Camila, small laugh; text pops "no sé" crossed out | "nunca dice 'no sé'" | Si no sabe la respuesta… Completa igual. |
| 20–28s | Camila, steady, key line big on screen | "revisa lo importante" | La IA adivina muy bien… revísalo tú. |
| 28–30s | Camila smiles; cut back to first frame (loop) | — | Una cosa menos que no entender. |

**7. Caption**
Esto explica por qué la IA a veces se inventa cosas 🤖

Cuando no sabe una respuesta, no dice "no sé". Predice la siguiente palabra más probable y sigue escribiendo, como el autocompletar de tu teléfono, pero gigante.

Por eso funciona muy bien para borradores e ideas, y no tanto para datos exactos.

La IA adivina muy bien, pero lo importante, revísalo tú.

Guárdalo para cuando alguien te diga "pero la IA lo dijo".

**8. Hashtags:** #inteligenciaartificial #queesia #aprendeia #chatgpt

**9. Cover text:** "La IA adivina"

**10. Sources + AI label:** Explainer, no dated or numeric claims. AI label on.

**11. JSON**
```json
{
  "id": "camila-video-explica-001",
  "format": "video",
  "platform": "both",
  "pillar": "explica",
  "idea": "why AI invents answers",
  "takeaway": "La IA adivina muy bien, pero lo importante, revísalo tú.",
  "hook": {
    "type": "pregunta real",
    "on_screen": "¿por qué la IA se inventa cosas?",
    "spoken": "¿Por qué la IA a veces se inventa cosas?",
    "alternates": [
      { "type": "error común", "on_screen": "la IA no siempre dice la verdad", "spoken": "La IA no siempre dice la verdad." },
      { "type": "traducción", "on_screen": "qué es 'alucinar'", "spoken": "Dicen que la IA alucina. Esto es lo que pasa." }
    ]
  },
  "voice_brief": "Friend explaining something she just understood: close-mic, conversational, smile in the voice. Slower on the takeaway. Arc: curious, reassuring, playful, clear, light close.",
  "annotated": "(curious, direct) [warm smile in voice] ¿Por qué la IA a veces se inventa cosas? [pause 0.6s]\n(reassuring) [light inhale] Sin drama: no te está mintiendo. [pause 0.3s] Está adivinando. [emphasis] [pause 0.6s]\n...",
  "clean": "¿Por qué la IA a veces se inventa cosas? Sin drama: no te está mintiendo. Está adivinando. ...",
  "tts_engine": "elevenlabs_v4",
  "tts": "[curious] ¿Por qué la IA a veces se inventa cosas? [short pause] ...",
  "beats": [
    { "at": "0-2s", "visual": "Camila close-up, chat window blurred behind", "on_screen": "¿por qué la IA se inventa cosas?", "spoken": "¿Por qué la IA a veces se inventa cosas?" }
  ],
  "caption": "Esto explica por qué la IA a veces se inventa cosas 🤖\n\n...",
  "hashtags": ["inteligenciaartificial", "queesia", "aprendeia", "chatgpt"],
  "cover_text": "La IA adivina",
  "sources": [],
  "ai_label": true,
  "duration_s": 30
}
```
(In real output, `annotated`, `clean`, `tts`, `beats` and `caption` are complete, never abbreviated with "...".)

---

## Example 2: News structure (noticia), placeholders only

### Video: {item}
Pillar: noticia · Idea: {what changed for a normal user} · Takeaway: "{one plain sentence}" · Platform: both · Est. length: ~30s

**Annotated script (shape)**
```
(curious, calm) [warm smile in voice] Esta semana, {qué pasó, en una frase}. [pause 0.6s]
(clear, friendly) Dicho fácil: {qué es, con un término explicado}. [pause 0.6s]
(clear) {Quién lo anunció} dice que {dato confirmado}. [pause 0.3s] Por ahora está disponible {dónde y para quién}. [pause 0.6s]
(relatable) ¿Y a ti qué te cambia? {una consecuencia concreta del día a día}. [pause 0.6s]
(takeaway, calm) [slower] {Qué hacer, o "no tienes que hacer nada"}. [pause 1.5s]
(light close) Eso fue lo importante de la semana.
```

**Brief block (English)**
```
Sources: 1) {title} — {outlet} — {url} — {date}; 2) {second source}
Confirmed: {...}
Not confirmed / avoid saying: {...}
Availability: {who, where, free or paid}
Re-verify before publish: {numbers, names, dates}
```

What makes it work: one item, one consequence, one action (or honest "nothing to do"), confirmed facts only, and no hype words.

---

## Example 3: Video (usalo), compact

**Idea:** write a hard message without rewriting it ten times · **Takeaway:** "Dile a la IA cómo quieres sonar, no solo qué decir."

**Hook A (resultado primero):** on-screen "un mensaje difícil, 20 segundos" / spoken "Este mensaje me tomaba veinte minutos. Ahora, veinte segundos."

**Annotated script**
```
(excited, small) [warm smile in voice] Este mensaje me tomaba veinte minutos. [pause 0.3s] Ahora, veinte segundos. [pause 0.6s]
(clear) Paso uno: [pause 0.3s] cuéntale a la IA qué pasó, en tus palabras. [pause 0.6s]
(clear) Paso dos: [pause 0.3s] dile cómo quieres sonar. [emphasis] Amable, pero firme. [pause 0.6s]
(clear) Paso tres: [pause 0.3s] léelo y cámbialo a tu manera. [pause 0.6s]
(careful, reassuring) [softer] Y no pongas nombres ni datos personales. [pause 1s]
(takeaway) [slower] Dile cómo quieres sonar, no solo qué decir. [pause 1.5s]
(light close) Pruébalo y me cuentas.
```
Beats note: show the typed prompt on screen at paso dos so it can be copied; text pop per step ("1", "2", "3").
