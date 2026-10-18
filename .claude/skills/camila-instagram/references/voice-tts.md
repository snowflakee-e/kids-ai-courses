# Voice direction and TTS

The voice is half the product. Direct every spoken line. Camila is a 23-year-old woman talking to a friend: warm, curious, natural. Not sleepy, not whispered, not an announcer.

## What to direct on every line
- **Breath:** light natural breaths between phrases; a small inhale before the key point.
- **Pauses:** give the exact length. `[pause 0.3s]` is a micro pause, `[pause 0.6s]` a beat, `[pause 1s]` lets a line land. Put pauses before the key word and after the takeaway line.
- **Pace:** natural conversational, a little quicker on setup, slower on the key idea. Never rushed, never flat.
- **Volume and distance:** normal close-mic talking, intimate but awake. No shouting, no whisper (except a playful aside).
- **Pitch and tone:** warm, mid-range, bright, a smile in the voice. A light rise on real questions and surprise only. No salesy or news-anchor intonation.
- **Energy:** relaxed enthusiasm, "wait, this is cool". Calmer and slower on safety topics.
- **Emotion:** name it on every line (curiosity, surprise, reassurance, playful, concern).
- **Texture:** soft consonants, natural small laughs, "mm" and "oh" reactions where they fit.

## Annotated script format
One spoken line per row. Put the emotion first in parentheses, then the tags just before the words they affect, then the pause after.
```
(curious, direct) [warm smile in voice] ¿Por qué la IA a veces se inventa cosas? [pause 0.6s]
(reassuring) [light inhale] Tranquila: no es que mienta. [pause 0.3s] Es que adivina. [emphasis] [pause 0.6s]
(takeaway, clear) [slower] La IA no sabe cosas. [pause 0.3s] Predice la siguiente palabra. [pause 1s]
```
Standard tags: `[light inhale] [pause Xs] [warm smile in voice] [curious] [surprised] [playful] [emphasis] [slower] [softer] [reassuring] [soft laugh] [lower pitch] [rising question]`. If you need a new tag, invent it and explain it once in the voice brief.

Use at most 3 tags before any one phrase. Beyond that, both the engine and a human reader lose track.

The takeaway line is the slowest and clearest line in the script, with the longest pause after it.

## Voice brief
2–4 lines in English covering overall tone, pace (for example "conversational, ~10% slower on the takeaway"), volume and emotional arc (for example "curious → reassuring → clear takeaway → light close").

## Converting for the engine (the TTS-ready field)
The production tags are notes for humans, not engine syntax, so convert them for whichever engine is in use. The default is ElevenLabs v4.

### ElevenLabs v4 / v3 (default)
From ElevenLabs' prompting guide (`prompt.txt` in the working folder):
- `<break>` tags (SSML) don't work. Pauses come from ellipses, punctuation, and the tags `[short pause]` and `[long pause]`.
- Audio tags go in square brackets and are written in English, even when the text is Spanish.
- Make tags describe the voice clearly (for example "[warm, curious voice]"). Vague tags can come out as sound effects.
- CAPS add emphasis. Camila doesn't use them, except established acronyms.
- Too many tags can make the output unstable. If a render glitches, remove tags before you rewrite any text.

| Production tag | ElevenLabs v4 |
|---|---|
| `[pause 0.3s]` | `...` or a comma/period |
| `[pause 0.6s]` | `[short pause]` |
| `[pause 1s]` or longer | `[long pause]` |
| `[light inhale]` | `[inhales]` |
| `[warm smile in voice]` | `[warmly, smiling]` |
| `[curious]` | `[curious]` |
| `[surprised]` | `[surprised]` |
| `[playful]` | `[playfully]` |
| `[emphasis]` | stress the word with punctuation; avoid CAPS |
| `[slower]` | `[slowly]` |
| `[softer]` | `[softly]` |
| `[reassuring]` | `[reassuring, gentle voice]` |
| `[soft laugh]` | `[soft laugh]` |
| `[lower pitch]` | `[low, warm voice]` |
| `[rising question]` | end the phrase with `?` and keep the tag `[curious]` |

Drop the emotion labels `(…)`. The tags carry their effect.

Starting settings, to tune by ear: speed 1.0 (range 0.7–1.2), stability "Natural". "Creative" is more expressive but less consistent. News videos: stability slightly higher, so facts stay clear.

This mapping is a starting point. If a tag keeps failing with Camila's voice, update the table.

### HeyGen
- **Don't use Video Agent (v3) with a text prompt for Camila.** It treats scripts as concepts, rewrites the words, and is told not to pad with pauses. Both ruin her delivery.
- **Recommended pipeline:** create the audio in ElevenLabs from `tts`, then make the avatar video in HeyGen with that audio as the voice source (lip-sync). Her exact words and pauses survive.
- **If you have to use HeyGen's built-in voices:** use `clean` with `...` for pauses. HeyGen voices may accept `<break time="1s"/>`, but test it on one video before running a batch.

### Other engines
- If the engine supports SSML: turn `[pause Xs]` into `<break time="Xs"/>` and drop any tags the engine doesn't know.
- If it takes plain text only: use `clean`, with ellipses for pauses.

## Spanish pronunciation for TTS
- Correct accents change the pronunciation: tú/tu, sí/si, más/mas, está/esta.
- In spoken text, write numbers and dates as words: "el veinte de octubre", "tres cosas".
- Product and English tech words: spell them how they should sound if the engine mispronounces them ("chat-yi-pi-ti" for ChatGPT, tested once), or use IPA between slashes (supported in v4). Keep "IA" as "I-A".
- Test every new term once before a batch.
