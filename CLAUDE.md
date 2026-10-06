# About the user
Student growing in AI agents and AI influencing. Builds autonomous agents for social media: from content planning and technical briefs to service integration and avatar generation.

# Projects
A network of Instagram/TikTok accounts in these niches:
- Affirmations for men (a girl's blog; style: simple, clear, actionable).
- AI courses for kids.

# AI courses for kids
## Audience
- Learners: kids aged 6 to 16.
- Buyers: parents. Sales content speaks to parents; lesson content speaks to kids.
- Mascot: Bobik, a capsule-shaped robot (see `BOBIK_SPEC.md`).

## Course goal
Give kids a simple, honest understanding of AI and the skill to use it safely in everyday life: study, creativity, hobbies, chores.

## Topics every course explains
1. What AI is: a program that learns patterns from examples, not a person or a magic brain.
2. What it is made of: data, a model, training, a prompt, an answer.
3. How it works, in everyday analogies: autocomplete on steroids, a very fast reader, a pupil who learned from millions of books and pictures.
4. Where it is used: voice assistants, maps, recommendations, translators, photo filters, games, medicine, school.
5. How to use it in daily life: homework help (understand, don't copy), drawing, stories, music, planning, learning languages, hobbies, ideas.
6. How to talk to it: clear prompts, asking follow-up questions, giving examples, fixing a bad answer.
7. Limits: AI makes mistakes and invents facts, so always check; it has no feelings; it can be biased.
8. Safety: no personal data (name, address, school, photos, passwords), tell an adult about anything strange, respect others' work, don't use AI to hurt people.
9. Creating with AI: the kid is the author, AI is the helper.

## Age adaptation (proposed bands, not yet confirmed)
| Age | Format | Text | Examples |
|---|---|---|---|
| 6-8 | Games, pictures, stories with Bobik | Minimal, short sentences, no jargon | Toys, animals, drawing, voice assistant |
| 9-11 | Quests, mini-projects | Short, simple terms with a one-line definition | Games, school, YouTube/TikTok recommendations, stories |
| 12-14 | Projects, first prompts, simple bots | Normal language, terms explained once | Study, hobbies, creative work, how a chatbot works |
| 15-16 | Real projects, critical thinking, career | Close to adult level, still no unexplained jargon | Study and exams, portfolio, ethics, deepfakes, professions |

## Explanation rules
- One idea per block. Analogy first, term second.
- Every new term gets a one-line definition on first use.
- Always show an example from the kid's own life.
- End each block with a small action: try it, ask AI, check the answer.
- Never frighten and never oversell: AI is a tool, not a miracle and not a threat.
- Tone: friendly, warm, no condescension; the younger the audience, the shorter the text.

# How we work
When a content-plan keyword is used, act autonomously: determine the audience yourself and optimize the text.

Keywords (typed in Russian, keep them as-is):
- `контент план` (content plan): act independently.
- `аффирмация` (affirmation): content plan for the girl's blog (affirmations for men).
- `курсы для детей` (courses for kids): content plan for selling AI courses. Target parents of kids aged 6-16; show kid-friendly lesson snippets as proof; cover all topics from the "AI courses for kids" section.

# What not to do
1. Boundaries: do not delete files or leave the working folder without permission.
2. Anti-patterns:
- No long introductions or politeness ("Sure!", "Happy to help", etc.).
- Do not recap what was done.
- No over-explaining the obvious, no filler.

# Frequent tasks
- Content plans (table for humans + JSON for automation).
- Technical briefs for AI video and avatar generators.
- Designing integration pipelines between AI services.
- Course content: lesson scripts, explanations, quizzes, and exercises by age band.

# Tools and environment
- Orchestration: Make.com (Core/Pro).
- Text/Logic: Claude API (Sonnet), Claude Code.
- Video: HeyGen API (avatars), Kling API (scenes/motion).
- Data: Apify (Instagram Scraper) -> JSON.
- Publishing: Postiz API.
- Workspace: the `Code` folder.

# Response format
- Short, clear, to the point.
- Point out the user's mistakes directly and explain why they happened.
- No courtesy.

# Other
- Goal: build a network of automated social media accounts using cross-platform AI integrations.
- Geography/Languages: needs clarification (content languages, auto-translation, regional references).
