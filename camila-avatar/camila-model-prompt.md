# Camila: visual model (avatar identity)

v1 · 2026-10-14 · 23 y.o., AI enthusiast, talks to a microphone, 9:16 for Reels/TikTok.

## 0. Rules

1. No "beautiful / stunning / perfect / flawless / gorgeous" in prompts. These words push every generator to the same smoothed "AI influencer" face. Attractiveness here comes from proportions, warmth and small imperfections, all written out explicitly.
2. Identity is locked by the anchors in section 1. Paste the anchor text into every prompt, or use the chosen master image as a character/omni reference.
3. She is openly AI (persona rule). Turn on the AI-content label on Instagram ("AI info") and TikTok ("AI-generated content"). Realistic AI humans without a label risk removal.
4. Ethnicity is deliberately "Hispanic, warm light-olive": reads as Spanish or Latin American, so it works whichever Spanish dialect you pick later.
5. Look = relatable friend, not a glam model. Audience is mostly women beginners: everyday styling, no sexualised posing.

## 1. Identity anchors (locked)

| Feature | Lock |
|---|---|
| Age / read | 23, Hispanic, could be from Spain or Latin America |
| Face shape | oval leaning to heart, soft jawline, gently defined cheekbones, soft chin |
| Eyes | warm hazel-brown, almond shape, thin amber ring around the pupil, natural lashes |
| Brows | dark brown, medium thickness, natural arch, left brow marginally higher than right |
| Nose | small, straight bridge, slightly rounded tip |
| Lips | full, natural, soft cupid's bow, smile slightly stronger on the right |
| Skin | warm light-olive, golden undertone, visible pores, fine peach fuzz, faint freckles over nose and upper cheeks, natural shine on forehead and nose bridge |
| ID mark | one small beauty mark on the right cheekbone (recognition anchor, keep it in every image) |
| Hair | dark chestnut brown, just past the shoulders, soft natural waves, off-centre part, a few flyaways, one loose strand framing the face, left side tucked behind the ear |
| Makeup | "no-makeup makeup": light skin tint, peach cream blush, brushed-up brows, brown mascara, rosy-nude lip balm. No contour, no heavy lashes, no glossy lips |
| Jewellery | small gold huggie earrings only (video-safe: no dangling pieces, no thin chains that shimmer) |
| Signature outfit | oatmeal soft ribbed-knit sweater, relaxed neckline |
| Build | slim, natural, relaxed shoulders, upright but not stiff posture |
| Expression default | relaxed genuine smile, eyes slightly crinkled, curious look |

## 2. Master prompt A: with microphone (use this one)

```
Photorealistic, unretouched portrait photograph of a 23-year-old Hispanic woman, chest-up, seated at a desk in a cozy home recording corner, looking straight into the camera with a relaxed, genuine closed-mouth smile and slightly crinkled eyes, a curious friendly expression. Oval face leaning to heart-shaped, soft jawline, gently defined cheekbones, small straight nose with a slightly rounded tip, full natural lips with a soft cupid's bow. Slight natural facial asymmetry: left eyebrow marginally higher than the right, smile slightly stronger on the right side. Warm hazel-brown almond-shaped eyes with a thin amber ring around the pupil, natural dark-brown medium-thick eyebrows with a soft natural arch, natural lashes, real catchlights in both eyes. Warm light-olive skin with a golden undertone, visible pores, fine peach fuzz catching the light, faint freckles across the nose and upper cheeks, a single small beauty mark on the right cheekbone, subtle natural texture under the eyes, slight natural shine on the forehead and nose bridge, no airbrushing, no skin smoothing. Dark chestnut-brown hair just past the shoulders, soft natural waves, off-centre part, a few flyaway strands, one loose strand framing the face, the left side tucked behind the ear showing a small gold huggie earring. Minimal no-makeup makeup: light skin tint, soft peach cream blush, brushed-up natural brows, brown mascara, rosy-nude lip balm. Wearing an oatmeal-coloured soft ribbed-knit sweater with a relaxed neckline. A matte black broadcast dynamic microphone with a foam windscreen on an articulated boom arm enters from the lower left, about 12 cm from her mouth, angled toward her lips, positioned below the chin line so her lips and jaw stay fully visible and unobstructed. Behind her, a softly blurred warm home-studio background: a lamp with a warm glow, a shelf with books and a small green plant, a muted terracotta acoustic panel. Lighting: soft natural window light from camera-left as the key, warm practical lamp as a gentle rim light from behind-right, low fill, natural light falloff on the face. Shot on a full-frame camera, 85mm lens at f/1.8, eye level, vertical 9:16, shallow depth of field, natural colour grading, subtle film grain, true-to-life skin tones, candid documentary feel.
```

## 3. Master prompt B: identity plate (no mic, for the avatar tool)

Generate this FIRST. It is the clean face for HeyGen and the reference for every other image. Take prompt A and make these swaps:

- Remove the whole microphone sentence.
- Background: "plain softly lit warm-grey wall, very shallow depth of field, no props".
- Lighting: "soft even window light from camera-left, gentle fill, no hard shadows".
- Pose: "facing the camera straight on, shoulders square, head level, mouth closed, soft smile, both hands out of frame, nothing near the face".
- Framing: "head and shoulders, face fills about 40% of the frame".

Pick the best of 8-16 results. Check it against the anchors in section 1. The chosen image becomes the identity master.

## 4. Variants (swap lines in prompt A, keep the anchors)

| Variant | Swap |
|---|---|
| Headphones | "wearing closed-back over-ear studio headphones in matte black, hair falling naturally around them" (earring hidden: acceptable) |
| Talking frame (stills only) | "mid-sentence, lips slightly parted, eyebrows lightly raised, animated and engaged" |
| Surprise / "wait, this is cool" | "eyes slightly wider, eyebrows raised, small delighted smile, lips slightly parted" |
| Serious / safety topic | "calm reassuring expression, soft eye contact, no smile, relaxed brow" |
| 3/4 left, 3/4 right, profile | "head turned 35 degrees to the left", "to the right", "90-degree profile" (use plain background, no mic, for the reference sheet) |
| Outfit 2 | soft sage-green cardigan over a plain white tee |
| Outfit 3 | washed light-denim jacket over a cream tee |
| Outfit 4 | fitted heather-grey crew-neck sweatshirt |
| Outfit 5 (evening news) | plain black fitted long-sleeve top |
| Outdoor / café | "sitting at a window table in a small café, natural daylight, blurred street behind, no microphone" |

Avoid in video frames: stripes, small checks, fine patterns (moire), dangling earrings, thin chains.

## 5. Negative prompt

For tools that accept one:

```
plastic skin, airbrushed, over-smoothed, waxy, porcelain skin, perfectly symmetrical face, uncanny valley, glamour retouching, heavy makeup, contouring, glossy lips, fake lashes, over-sharpened, HDR, oversaturated, beauty filter, CGI, 3D render, illustration, anime, cartoon, doll-like, huge eyes, extra fingers, deformed hands, fused fingers, microphone covering mouth, microphone covering chin, lips hidden, text, watermark, logo, brand name, lens flare, harsh shadows, closed eyes, blurry face, double chin artefacts, cropped head
```

For tools without a negative field, add one line at the end of the prompt: "natural unretouched skin texture, no smoothing, no beauty filter, microphone must not cover the lips."

## 6. Workflow

Use case: fixed front-facing talking head, same pose and framing, different outfits. A reference sheet is NOT needed.

1. Prompt A (mic) or B (no mic) x 8-16 → pick one → identity master. Back up the original file and never overwrite it.
2. Test the master in the avatar tool (see section 7) before making any outfit variants.
3. Outfits: edit the master, do not regenerate. Upload the master to an image editor (Nano Banana / Flux Kontext / gpt-image style) with:
   `Change only her clothing to [outfit]. Keep everything else exactly identical: same face, same beauty mark, same eyes, same skin texture, same hair and flyaways, same earring, same pose, same framing, same microphone, same background, same lighting, same expression.`
   Always edit from the original master, never from an earlier variant (chained edits drift the face).
4. QC every variant against section 8 and compare side by side with the master (face, skin tone, hair, mic position).
5. One avatar/look per outfit in the avatar tool. Same pose and framing everywhere.
6. Voice: create audio in ElevenLabs from the `tts` field of the script, then feed that audio into HeyGen as the voice source (lip-sync with exact pauses, per `camila-instagram` skill, `references/voice-tts.md`).

A reference sheet (3/4 views, profile) is only needed later if you add head turns, new camera angles, Kling scene clips, or have to regenerate the master.

Generator settings, if you use Midjourney: `--ar 9:16 --style raw`, stylize 50-150 (higher = more "pretty" and less real). In Flux / Nano Banana / gpt-image style editors: upload the master and say "keep the exact same face, hair, skin texture and beauty mark; change only [x]".

## 7. Microphone and avatar-video risks

- Photo-to-video avatars (HeyGen Avatar IV etc.) can warp objects close to the mouth or chin when the jaw moves. Test prompt A in a 10-second sample. If the mic bends or the lips look smeared:
  - Use plate B (no mic) for the talking video and move the mic to a lower-left position fully outside the face area, or
  - Cut mic-scene stills/B-roll separately and use the talking video without a mic for the main content.
- Mic must never overlap the lips, chin or cheek. Pop filter or foam windscreen sits beside the mouth, not in front of it.
- Hands: keep them out of frame. Hands near the face are the most common failure.
- Static mic + moving head: keep head movement small. Ask for "minimal head movement, natural blinking" in the avatar tool.
- Background: keep it simple. Busy shelves flicker in generated video.
- Kling (scenes/motion): use the identity master as the start frame for scene clips (café, walking), not for lip-sync.

## 8. QC checklist (every new image)

- [ ] Beauty mark is on the right cheekbone
- [ ] Hazel-brown eyes with amber ring, not green or black
- [ ] Left brow slightly higher; smile slightly stronger on the right
- [ ] Hair length, wave pattern and part match the master
- [ ] Pores and peach fuzz visible at 100% zoom; no plastic sheen
- [ ] No more than one natural freckle cluster; not covered in freckles
- [ ] Only the gold huggie earring jewellery
- [ ] Microphone clear of the lips; lips fully visible
- [ ] Teeth (if visible): natural, slightly uneven, not a perfect white row
- [ ] Looks like a friendly 23-year-old, not 17, not 30

## 9. JSON for automation (Make.com: inject `anchors` into every image prompt)

```json
{
  "character": "Camila",
  "version": 1,
  "age": 23,
  "aspect_ratio": "9:16",
  "anchors": "23-year-old Hispanic woman, oval face leaning to heart-shaped, soft jawline, gently defined cheekbones, small straight nose with slightly rounded tip, full natural lips, warm hazel-brown almond eyes with thin amber ring, dark-brown medium-thick natural eyebrows with left brow marginally higher, warm light-olive skin with golden undertone, visible pores, fine peach fuzz, faint freckles over nose and upper cheeks, one small beauty mark on the right cheekbone, dark chestnut-brown hair just past the shoulders with soft natural waves and off-centre part, left side tucked behind ear, small gold huggie earrings, no-makeup makeup, natural unretouched skin",
  "default_outfit": "oatmeal soft ribbed-knit sweater with relaxed neckline",
  "default_expression": "relaxed genuine smile, slightly crinkled eyes, curious",
  "mic": "matte black broadcast dynamic microphone with foam windscreen on boom arm, lower left, 12 cm from mouth, below chin line, lips fully visible",
  "camera": "full-frame, 85mm f/1.8, eye level, shallow depth of field, natural colour grade, subtle film grain",
  "negative": "plastic skin, airbrushed, over-smoothed, perfectly symmetrical face, heavy makeup, glossy lips, CGI, 3D render, anime, extra fingers, deformed hands, microphone covering mouth, text, watermark",
  "master_image": "",
  "heygen_avatar_id": "",
  "voice_id": ""
}
```
