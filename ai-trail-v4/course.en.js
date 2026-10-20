'use strict';

// AI Starter Trail (v4) content: a beginner course for ages 14–15. 6 stations of about 15 minutes plus the final boss.
// Every station has a mini-game: make an infographic, hunt glitches, power up a prompt, draw, black out secrets,
// climb a hint ladder. The course is in English only, US spelling.
// Everything that changes without code lives here: blocks, lessons, tasks, XP rules, levels and badges.
// Theory draws on public sources (Code.org How AI Works, Google’s prompting guide, OpenAI and Anthropic prompting
// docs, NSPCC and security-vendor privacy advice). Wording, examples and games are our own.
//
// Block = a zone on the map. Lesson = a station. Task = one screen of a lesson.
// Every regular station has two parts. Each part opens with a prediction, then a short read, then practice.
// teaser — one line about the next station, shown after the lesson: a reason to come back.
//
// Task types from v3 (see ../ai-trail-v3/course.en.js for details):
//   predict, read, quiz, sort, build, spot, order, poll, chat, talk, cards, arena
// Mini-games (minigames.js):
//   poster — infographic: cards [{ t, icon, ok, why }]; ok cards go on the poster, the rest are traps.
//            heading — poster title, stickers — 4 emoji, trap — ['myth', 'myths'] wording for wrong cards.
//            Score: facts / (facts + traps tapped). The poster is saved to the portfolio and can be downloaded as PNG
//   glitch — find glitches in an AI picture: scene (an id in scenes.js), explain.
//            Score: (found − ¼ per wrong tap, up to 8) / glitches
//   meter  — prompt power-up: start (the weak prompt), parts, cards [{ t, part, why }]; a card without part is junk.
//            reply — what AI answers at 100%, done — optional final note. Score: parts / (parts + junk tapped)
//   draw   — be the image generator: rounds [{ prompt, seconds, parts }], parts only in the last round (a checklist).
//            Not graded. Both drawings are saved to the portfolio
//   redact — black out secrets: message with [[secret text|why it’s secret]], who — optional caption.
//            Score: (secrets hidden − ½ per extra word) / secrets
//   hint   — hint ladder: puzzle, answers (accepted, compared without spaces and the word “coins”), hints (3),
//            solution, explain. Solved with or without hints = 1, asked for the answer = 0.5
// Graded: quiz, sort, build, spot, order, arena, poster, glitch, meter, redact, hint.
// A text in a read never gives away the answer of a graded task in the same station: it teaches, the task checks.

var COURSE = {
  id: 'ai-starter-trail',
  title: 'AI Starter Trail',
  age: '14–15 years',
  blocks: [
    {
      id: 'b1', title: 'Basecamp', subtitle: 'What AI is and where it slips',
      skills: [
        'Explains in plain words how AI learns from examples',
        'Explains how a chatbot writes its answers word by word',
        'Knows that a confident AI answer can still be wrong',
        'Spots typical glitches in AI-made pictures'
      ],
      lessons: [
        {
          id: 's1', icon: '🤖', title: 'What AI really is', minutes: 15,
          goal: 'Find out what AI actually is, how it learns and how a chatbot writes its answers. Then make your first infographic.',
          teaser: 'Next: AI says things that aren’t true, with a straight face. Learn to catch it.',
          tasks: [
            { type: 'predict', title: 'A message it never saw',
              text: 'Your email app has never seen this exact message: “U WON a free phone!!! Click here.” Can it still tell it’s spam?',
              options: ['Yes, it learned what spam usually looks like', 'No, it only blocks messages it has seen before', 'Only if a person checks it first'],
              answer: 0,
              reveal: 'Yes. The filter learned from millions of emails marked “spam” and “not spam”. It never saw this one, but it knows the pattern: shouting, “free”, “click here”. That’s AI in one sentence.' },
            { type: 'read', part: 1, title: 'AI learns from examples', minutes: 3, pose: 'point',
              intro: 'People say “AI” about everything from chatbots to robot vacuums. Here’s what it actually means, without the hype.',
              sections: [
                { h: 'Normal programs follow rules',
                  text: [
                    'A calculator follows exact rules a programmer wrote: “if the user presses +, add the numbers.” It never learns anything new and never surprises you.',
                    'That works for math. It doesn’t work for “is this a cat?” Try writing rules for that. Pointy ears? Some dogs have them. Whiskers? So do seals.'
                  ] },
                { h: 'AI learns patterns from examples',
                  text: [
                    '**AI** (artificial intelligence) is a program that learns **patterns** from lots of **examples** instead of following hand-written rules. Show it 100,000 photos labeled “cat” and “not cat”, and it figures out what cats tend to look like.',
                    'The examples it learns from are called **training data**. The result of training is a **model**: the part that makes guesses about new things it has never seen.'
                  ],
                  check: { q: 'Your phone unlocks with your face. Rules or learned patterns?', a: '**Learned patterns.** Nobody wrote rules for your exact face. A model learned how faces look and compares yours with the one you saved.' } },
                { h: 'Bad examples, bad AI',
                  text: 'AI is only as good as its data. If a model only ever saw orange cats, it might decide a black cat is “not a cat”. Same with people: if the training photos mostly show one kind of person, the AI works worse for everyone else. This is called **bias**.',
                  tip: { label: 'Remember', text: 'AI doesn’t “know” things the way you do. It recognizes **patterns** in data people gave it.' } },
                { h: 'You already use it every day',
                  list: ['📩 Spam filters', '🎵 “For you” feeds and playlists', '🔓 Face unlock', '⌨️ Autocorrect and next-word suggestions', '🗺️ Maps that predict traffic', '💬 Chatbots like ChatGPT and Gemini'] }
              ],
              takeaways: [
                'AI learns **patterns** from **examples** instead of fixed rules.',
                'The examples are **training data**, the result is a **model**.',
                'Bad or one-sided data makes a **biased** AI.'
              ] },
            { type: 'sort', title: 'Rules or AI?',
              text: 'Does it follow fixed rules, or did it learn from examples?',
              buckets: ['📏 Fixed rules', '🧠 Learned from examples'],
              items: [
                { t: 'A calculator', b: 0, why: 'Same buttons, same answer, every time. Pure rules.' },
                { t: 'Your “For you” feed', b: 1, why: 'It learned what you watch to the end and what you skip.' },
                { t: 'An alarm clock', b: 0, why: 'It rings at the time you set. Nothing to learn.' },
                { t: 'Face unlock on your phone', b: 1, why: 'A model learned what faces look like from huge numbers of photos.' },
                { t: 'Autocorrect', b: 1, why: 'It learned which words usually come next and which typos people make.' },
                { t: 'A traffic light on a timer', b: 0, why: 'Green for 30 seconds, red for 30 seconds. Just a timer.' }
              ] },
            { type: 'predict', title: 'Same question, twice',
              text: 'You open two new chats and send the same message: “Give me a name for my hamster.” What happens?',
              options: ['The same name both times', 'Usually a different name each time', 'It refuses: it doesn’t know your hamster'],
              answer: 1,
              reveal: 'Usually different. A chatbot doesn’t pull a saved answer from a database. It writes a fresh one every time, with a bit of randomness. Here’s how.' },
            { type: 'read', part: 2, title: 'How a chatbot writes', minutes: 3, pose: 'idea',
              intro: 'A chatbot feels like talking to someone who knows everything. It’s actually doing something much simpler, and knowing that changes how you use it.',
              sections: [
                { h: 'It read a giant library',
                  text: 'A chatbot like ChatGPT or Gemini runs on a **language model**. It was trained on a huge amount of text: books, websites, articles. It didn’t store them like a hard drive. It learned patterns: which words usually go together and how sentences are built.' },
                { h: 'Then it guesses, one word at a time',
                  text: [
                    'When you send a message, the chatbot writes the answer **one piece at a time**. At every step it picks a likely next word, then the next, then the next. Like the suggestions above your phone keyboard, but much smarter.',
                    'There’s a bit of randomness in each pick. That’s why the same question can get different answers.'
                  ],
                  example: { me: 'Finish this: The best thing about summer is…', ai: '…long evenings with friends and no alarm clock.' } },
                { h: 'Smooth is not the same as true',
                  text: 'Here’s the catch. Picking likely words makes the answer sound smooth and confident. But nothing in that process checks whether it’s **true**. A wrong date sounds exactly as sure as a right one.',
                  check: { q: 'Is there a database of correct answers inside a chatbot?', a: 'No. Every answer is **generated fresh**, word by word, from patterns. That’s why it can sound sure and still be wrong.' } },
                { h: 'Great at, weak at',
                  list: ['✅ Explaining things in simple words', '✅ Brainstorming ideas', '✅ Rewording and summarizing', '⚠️ Exact facts: dates, numbers, quotes', '⚠️ Very recent news, unless it can search the web', '⚠️ Knowing you: it only knows what you tell it'] }
              ],
              takeaways: [
                'A chatbot writes by **predicting likely next words**.',
                'Every answer is new, so the same question can get different answers.',
                '**Smooth is not true**: check the facts that matter.'
              ] },
            { type: 'poll', title: 'Think like a chatbot',
              text: 'A chatbot picks a likely next word. Which one would it pick here?',
              phrase: 'After school I’m so hungry, I could eat a…',
              options: [{ t: 'horse', p: 48 }, { t: 'pizza', p: 31 }, { t: 'sandwich', p: 17 }, { t: 'cloud', p: 4 }],
              explain: '“I could eat a horse” is a common saying, so “horse” is the most likely word, even though nobody actually eats a horse. Likely isn’t the same as true or sensible. The percentages here are made up to show the idea.' },
            { type: 'poster', title: 'Make an infographic: AI in 4 facts',
              text: 'Your friends think AI is magic. Make them a poster: tap the 4 true facts. Myths will try to sneak in.',
              heading: 'AI, explained in 4 facts',
              stickers: ['🤖', '🧠', '⚡', '✨'],
              cards: [
                { t: 'AI learns patterns from lots of examples', icon: '📚', ok: true, why: 'That’s the core idea: examples in, patterns out.' },
                { t: 'A chatbot writes its answer one word at a time', icon: '✍️', ok: true, why: 'It predicts a likely next word, again and again.' },
                { t: 'Smooth and confident doesn’t mean true', icon: '⚠️', ok: true, why: 'Nothing in word-guessing checks the facts.' },
                { t: 'Bad training data makes a biased AI', icon: '⚖️', ok: true, why: 'AI copies the patterns in its data, unfair ones too.' },
                { t: 'AI understands and feels things like a person', why: 'Myth. It finds patterns in data. It doesn’t understand or feel anything.' },
                { t: 'Chatbots look up answers in a database of facts', why: 'Myth. Every answer is generated fresh, word by word.' },
                { t: 'If AI says it, a computer has checked it', why: 'Myth. Nothing checks the facts automatically. That’s your job.' },
                { t: 'AI follows rules a programmer typed in', why: 'Myth. That’s a normal program. AI learns from examples.' }
              ] },
            { type: 'quiz', q: 'What is training data?',
              options: ['The examples an AI learns its patterns from', 'The rules a programmer writes for the AI', 'The answers the AI gives you'],
              explain: 'Training data is the examples: photos, texts, songs. The model learns patterns from them.' },
            { type: 'quiz', q: 'Why can a chatbot sound sure and still be wrong?',
              options: ['It picks likely words, and nothing checks if they’re true', 'It lies on purpose to test you', 'It only happens when the internet is slow'],
              explain: 'Fluent text and true text are two different things. Checking is your job.' },
            { type: 'chat', title: 'Ask Bloop how it works',
              text: 'Bloop is a chatbot too. Ask it to explain itself, then ask it something it can’t possibly know.',
              steps: [
                'Send message 1 and read the answer',
                'Send message 2: what does Bloop do with a question it can’t know?'
              ],
              prompts: [
                'Explain how you write your answers, like I’m 14. Use one everyday example.',
                'What did I eat for breakfast today?'
              ] }
          ]
        },
        {
          id: 's2', icon: '🔍', title: 'When AI gets it wrong', minutes: 15,
          goal: 'Catch AI making things up, learn a 3-step fact check and hunt for glitches in an AI picture.',
          teaser: 'Next zone: write prompts that get a useful answer on the first try.',
          tasks: [
            { type: 'predict', title: 'A book that doesn’t exist',
              text: 'You ask a chatbot: “Summarize the novel The Glass Owl of Brookfield by Maria Delgado.” There is no such book. What can happen?',
              options: ['It always says it can’t find the book', 'It may write a confident summary of a book that doesn’t exist', 'The app crashes'],
              answer: 1,
              reveal: 'Some chatbots will happily describe the plot, the characters and the ending. Newer ones more often say they’re not sure, but you can’t count on it. A chatbot knows what a book summary usually sounds like, so it can produce one for any title.' },
            { type: 'read', part: 1, title: 'Made-up facts', minutes: 3, pose: 'think',
              intro: 'AI sometimes says things that are simply not true, in the same calm, confident voice as everything else. This has a name.',
              sections: [
                { h: 'Hallucinations',
                  text: [
                    'When AI makes something up and presents it as fact, it’s called a **hallucination**. A fake date. A quote nobody said. A study that doesn’t exist. A link that leads nowhere.',
                    'AI isn’t lying on purpose. It predicts what a good answer usually looks like, and sometimes the most likely-sounding answer is wrong.'
                  ] },
                { h: 'Where it happens most',
                  list: ['📅 Dates and numbers', '💬 Quotes: who said what', '📚 Books, studies, sources and links', '🗞️ Recent news', '🧑 Facts about real people, especially not-famous ones', '🏙️ Small details: your town, your school, your favorite game'],
                  after: 'Rule of thumb: the more specific the fact, the more carefully you check it.' },
                { h: 'The 3-step check',
                  text: 'Before you use a fact from AI in homework, a post or an argument, run three quick checks:',
                  list: [
                    '1️⃣ **Does it make sense?** Compare it with what you already know.',
                    '2️⃣ **Can I find it in a real source?** A textbook, an official site, a trusted news outlet. Two sources beat one.',
                    '3️⃣ **What’s missing?** No source, no date, no name? Be careful.'
                  ],
                  check: { q: 'Can you check an AI answer by asking the same AI “Are you sure?”', a: 'Not really. It may just agree with you or invent a new answer. **Check in a real source**, not in the same chat.' } },
                { tip: { label: 'Pro tip', text: 'Test AI on something you know really well: your town, your favorite game, your sport. Count its mistakes. It’s the fastest way to stop trusting it blindly.' } }
              ],
              takeaways: [
                'A **hallucination** is a made-up fact that sounds real.',
                'Specific facts (dates, numbers, quotes, sources) need checking most.',
                'Check in a **real source**, not in the same chat.'
              ] },
            { type: 'spot', title: 'Find the made-up fact',
              text: 'A chatbot wrote this about the Eiffel Tower. One sentence is wrong. Tap it.',
              who: 'AI’s answer',
              sentences: [
                'The Eiffel Tower is in Paris, France.',
                'It was built for the World’s Fair of 1889.',
                'It was designed by Leonardo da Vinci.',
                'It is made of iron.',
                'Millions of people visit it every year.'
              ],
              wrong: 2,
              explain: 'Leonardo da Vinci died about 370 years before the tower was built. Gustave Eiffel’s company designed and built it. The wrong fact sits between true ones and sounds just as sure.' },
            { type: 'order', title: 'Fact-check like a pro',
              text: 'AI told you a fact for your project. Put the steps in order.',
              items: [
                'Spot the claim: is it a date, a number, a quote?',
                'Ask yourself: does it make sense?',
                'Look it up in a real source',
                'Find a second source that agrees',
                'Use it, or drop it if you can’t confirm it'
              ],
              explain: 'Claim, sense check, source, second source, decide. It takes a minute and saves you from looking silly.' },
            { type: 'predict', title: 'AI pictures',
              text: 'AI image generators make amazing pictures. Which part do they get wrong most often?',
              options: ['The sky and the clouds', 'Hands, text and small details', 'The colors'],
              answer: 1,
              reveal: 'Hands, text and small details. Newer generators slip less often, but they still slip. Here’s why.' },
            { type: 'read', part: 2, title: 'Glitches in AI pictures', minutes: 3, pose: 'surprise',
              intro: 'Image generators learned from millions of pictures. They nail the overall look and often get sloppy with the details. Knowing the typical glitches helps you spot an AI picture.',
              sections: [
                { h: 'How an image generator works',
                  text: 'You type a description, the **prompt**, and the generator creates a new picture that matches it. It learned what things usually look like from huge numbers of images with captions. Just like a chatbot, it doesn’t understand the world. It imitates what pictures of the world look like.' },
                { h: 'Typical glitches',
                  list: ['✋ Hands: extra or missing fingers, strange bends', '🔤 Text: letters that almost spell a word', '🕰️ Clocks, keyboards, piano keys: wrong numbers or patterns', '🐾 Bodies: extra legs, arms that melt into things', '☀️ Light: shadows that fall the wrong way', '🧩 Background: objects that blend into each other'] },
                { h: 'No glitch doesn’t mean real',
                  text: [
                    'Image generators get better every year. A clean picture can still be fake, and a weird-looking photo can still be real.',
                    'So glitches are a clue, not proof. The real test is **where the picture comes from**. Who posted it first? Do trusted sources show the same thing?'
                  ],
                  check: { q: 'You found zero glitches in a shocking viral photo. Is it real?', a: 'Not necessarily. Glitches are a clue, not proof. **Check the source**: who posted it first, and do trusted outlets report it?' } }
              ],
              takeaways: [
                'Image generators **imitate** how pictures look, they don’t understand the world.',
                'Typical glitches: **hands, text, clocks, bodies, shadows**.',
                'Glitches are a clue, the **source** is the proof.'
              ] },
            { type: 'glitch', scene: 'park', title: 'Glitch hunt',
              text: 'An AI made this picture from the prompt above. It has 5 glitches. Find them all. Wrong taps cost a little.',
              explain: 'Clocks, hands, bodies, text and light: the same spots trip up real image generators. Real AI pictures are subtler, so check the source too.' },
            { type: 'quiz', q: 'What is an AI hallucination?',
              options: ['A made-up fact that AI presents as true', 'A strange picture AI shows you on purpose', 'A bug that crashes the app'],
              explain: 'It sounds real, it reads real, and it isn’t. That’s why you check.' },
            { type: 'quiz', q: 'What’s the best way to check a fact from a chatbot?',
              options: ['Find it in a real source, ideally two', 'Ask the same chatbot “Are you sure?”', 'If it sounds confident, it’s fine'],
              explain: 'The same chatbot can just repeat or reword its mistake. Real sources are the check.' },
            { type: 'talk', portfolio: true, kicker: '✍️ Explain it', title: 'Your fact-check rule',
              question: 'A friend says: “ChatGPT said it, so it’s true.” Explain in 2–3 sentences why that’s not enough and what they should do instead.',
              placeholder: 'Explain it your way…',
              points: [
                'Chatbots predict likely words, they don’t check facts',
                'Sounding confident doesn’t mean being correct',
                'Check important facts in a real source, ideally two',
                'Asking the same chatbot again is not a real check'
              ],
              sample: 'A chatbot writes answers by guessing likely words, so it can sound sure and still be wrong. Before you use a fact, find it in a real source, like an official website or a textbook, ideally two. Asking the same chatbot “are you sure?” doesn’t count.' }
          ]
        }
      ]
    },
    {
      id: 'b2', title: 'Prompt Lab', subtitle: 'Ask so AI gets it',
      skills: [
        'Writes prompts with Role, Task, Context and Format',
        'Improves a weak answer with one clear follow-up',
        'Writes image prompts with subject, setting, style and details',
        'Knows the rules for AI pictures of real people'
      ],
      lessons: [
        {
          id: 's3', icon: '🎯', title: 'Your first great prompt', minutes: 16,
          goal: 'Learn the 4-part prompt formula, power up a weak prompt and steer an answer until it’s useful.',
          teaser: 'Next: prompts for pictures, and a drawing game where you are the AI.',
          tasks: [
            { type: 'predict', title: 'Two words in',
              text: 'You type “help with history” and press send. What do you most likely get?',
              options: ['Exactly what you need for tomorrow', 'A long, general answer about history', 'An error message'],
              answer: 1,
              reveal: 'A long, general answer. AI doesn’t know your topic, your grade or your deadline, so it guesses. Let’s fix that.' },
            { type: 'read', part: 1, title: 'The prompt formula', minutes: 3, pose: 'idea',
              intro: 'A **prompt** is the message you give AI: your instructions. Most bad answers start with a bad prompt. The fix takes about 20 seconds.',
              sections: [
                { h: 'Vague in, vague out',
                  example: { me: 'help with history' },
                  after: 'AI has no idea what you need. So it writes something long and generic, and you’re no closer to done.' },
                { h: 'Four parts',
                  big: 'Role + Task + Context + Format',
                  list: [
                    '🎭 **Role**: who AI should be. “You’re a patient math tutor.”',
                    '🎯 **Task**: what exactly to do. Use a verb: explain, list, compare, quiz me.',
                    '📎 **Context**: the details that change the answer: your grade, your goal, what you already know.',
                    '📐 **Format**: what the answer should look like: 5 bullet points, a table, under 100 words.'
                  ] },
                { h: 'Same AI, better answer',
                  example: {
                    me: 'You’re a history tutor. Quiz me with 5 questions on the causes of World War I. I’m in 9th grade and I mix up the alliances. One question at a time, wait for my answer.',
                    ai: 'Great, let’s start with the alliances. Question 1: Which three countries made up the Triple Entente?'
                  },
                  after: 'Nothing about the AI changed. It just finally knows what you need.' },
                { h: 'The friend test',
                  text: 'Imagine sending your prompt to a smart friend who knows nothing about your situation. Would they know what to do? If they’d be confused, AI will be too. Add what’s missing.',
                  check: { q: 'Is “I’m in 9th grade” context or format?', a: '**Context.** It’s about your situation and changes how AI explains. Format is the shape of the answer, like “a table” or “3 bullet points”.' } }
              ],
              takeaways: [
                'A good prompt has **Role, Task, Context, Format**.',
                '**Context** is the part people skip most, and it matters most.',
                'Use the **friend test**: would a friend understand what you want?'
              ] },
            { type: 'meter', title: 'Prompt power-up',
              text: 'Power this weak prompt up to 100%. One card per part. Junk cards are hiding in the deck.',
              start: 'help with my speech',
              parts: ['Role', 'Task', 'Context', 'Format'],
              cards: [
                { t: 'You’re a friendly public-speaking coach.', part: 'Role', why: 'A coach knows how speeches work.' },
                { t: 'Help me plan a 2-minute speech about why sleep matters for teens.', part: 'Task', why: 'A clear action and a clear topic.' },
                { t: 'I’m in 9th grade, I get nervous on stage, and the speech is on Monday.', part: 'Context', why: 'Now AI knows your level and your problem.' },
                { t: 'Give me an outline with 3 main points and a strong opening line.', part: 'Format', why: 'You know exactly what you’ll get back.' },
                { t: 'Make it amazing!!!', why: 'Feels strong, says nothing. AI can’t do anything with it.' },
                { t: 'My name is Ava Brooks and I go to Lincoln High.', why: 'Personal info. AI doesn’t need your name or your school to help you.' },
                { t: 'You’re a pirate captain.', why: 'Fun, but a pirate won’t help with this speech.' },
                { t: 'Write the whole speech so I can just read it out.', why: 'Then it’s not your speech. Ask for a plan and write it yourself.' }
              ],
              reply: 'Great topic! Here’s an outline for 2 minutes.\nOpening: “Raise your hand if you checked your phone after midnight this week.”\n1. What sleep does for your brain\n2. Why teens are wired to stay up late\n3. Three small fixes to try tonight\nNerves tip: practice the opening 5 times, the rest will follow.',
              done: 'Role, Task, Context, Format. No personal info, no ghostwriting.' },
            { type: 'sort', title: 'Context or format?',
              text: 'Context is what AI should know about you. Format is what the answer should look like.',
              buckets: ['📎 Context', '📐 Format'],
              items: [
                { t: 'I’m in 10th grade', b: 0, why: 'Your level changes how AI explains things.' },
                { t: 'As a table with 3 columns', b: 1, why: 'That’s the shape of the answer.' },
                { t: 'Under 100 words', b: 1, why: 'Length is part of the format.' },
                { t: 'I already know the basics', b: 0, why: 'It tells AI where to start.' },
                { t: 'The test is on Friday', b: 0, why: 'A detail about your situation that shapes the plan.' },
                { t: 'Use bullet points', b: 1, why: 'Bullet points are a format.' }
              ] },
            { type: 'predict', title: 'Way too long',
              text: 'AI sent you a 600-word wall of text. You only needed the main idea. What’s the best next move?',
              options: ['Close the app and give up', 'Reply: “Too long. Give me the 3 main points, one line each.”', 'Reply: “bad answer”'],
              answer: 1,
              reveal: 'One clear follow-up fixes most answers. “Bad answer” tells AI that something is wrong, but not what.' },
            { type: 'read', part: 2, title: 'Ask again, better', minutes: 3, pose: 'point',
              intro: 'The first answer is a **draft**, not the final word. People who get great results from AI aren’t lucky. They steer.',
              sections: [
                { h: 'Name exactly what to change',
                  text: 'A good follow-up asks for one precise thing: shorter, simpler, more examples, a different tone. Vague complaints get vague fixes.',
                  list: ['❌ “make it better”', '✅ “Simpler words, please. I’m 14.”', '❌ “no”', '✅ “Give me 3 more examples, from sports.”'] },
                { h: 'Let AI ask you',
                  text: 'Not sure what to include? End your prompt with: “**Ask me 2 questions before you answer.**” AI will tell you what it’s missing.',
                  example: { me: 'Help me plan a birthday party. Ask me 2 questions before you answer.', ai: 'Fun! 1) How many guests, and how old are they? 2) Indoors or outdoors?' } },
                { h: 'Start fresh when it’s stuck',
                  text: 'If a chat goes in circles or keeps repeating a mistake, open a **new chat** and write a better first prompt. A new chat forgets the old mess.',
                  check: { q: 'AI keeps repeating the same wrong fact after you correct it. Best move?', a: '**Open a new chat** with a clearer prompt, and check the fact in a real source.' } }
              ],
              takeaways: [
                'The first answer is a **draft**: steer it.',
                'A good follow-up names **one exact change**.',
                'Stuck? Ask AI to ask **you** questions, or start a new chat.'
              ] },
            { type: 'order', title: 'The prompt loop',
              text: 'Put the loop in order.',
              items: [
                'Write a prompt with Role, Task, Context, Format',
                'Read the answer',
                'Spot one exact thing to change',
                'Ask a clear follow-up',
                'Check the facts before you use it'
              ],
              explain: 'Write, read, spot, steer, check. Good AI users go around this loop a few times.' },
            { type: 'quiz', q: 'Which prompt will work best?',
              options: ['You’re a fitness coach. Make a 15-minute workout for a beginner, no equipment, as a list with timings.', 'workout', 'Give me some exercises please'],
              explain: 'Role, task, context and format: AI gets it on the first try.' },
            { type: 'quiz', q: 'AI’s answer is full of words you don’t know. Best follow-up?',
              options: ['“Explain it again with simpler words. I’m 14.”', '“wrong”', '“Write more.”'],
              explain: 'One precise change: simpler words for your level.' },
            { type: 'talk', portfolio: true, kicker: '✍️ Fix the prompt', title: 'Fix this prompt',
              question: 'This prompt gets a boring, generic answer: “write about volcanoes”. Rewrite it with Role, Task, Context and Format. Imagine you need it for a school presentation.',
              placeholder: 'Your improved prompt…',
              points: [
                'Role: who AI should be, for example a geography teacher',
                'Task: a clear action, like explain or outline',
                'Context: your grade and what it’s for',
                'Format: the length or structure of the answer'
              ],
              sample: 'You’re a geography teacher. Explain how volcanoes erupt so I can give a 3-minute presentation. I’m in 9th grade. Give me an outline with 4 short sections and one cool fact for the ending.' },
            { type: 'chat', title: 'Vague vs specific',
              text: 'Send Bloop both prompts and compare the answers. Which one could you actually use?',
              steps: [
                'Send prompt 1',
                'Tap “New chat”, then send prompt 2',
                'Compare: which answer is shorter, clearer and more useful?'
              ],
              prompts: [
                'tell me about sharks',
                'You’re a marine biologist. Explain how sharks find their prey. I’m 14 and I’m making a short video about it. Answer in 5 short bullet points.'
              ] }
          ]
        },
        {
          id: 's4', icon: '🎨', title: 'Prompts for pictures', minutes: 16,
          goal: 'Write image prompts that get the picture you imagined, play the image generator yourself and learn the rules for AI pictures.',
          teaser: 'Next zone: what you should never type into a chatbot.',
          tasks: [
            { type: 'predict', title: 'Just “a dog”',
              text: 'You type “a dog” into an image generator. What do you get?',
              options: ['Exactly the dog you imagined', 'A random dog: AI picks the breed, colors, place and style', 'Nothing: the prompt is too short'],
              answer: 1,
              reveal: 'You get a dog, just not your dog. Everything you didn’t say, AI decided for you.' },
            { type: 'read', part: 1, title: 'The image prompt recipe', minutes: 3, pose: 'idea',
              intro: 'Image generators turn words into pictures. Every word you write becomes a detail. Every word you skip, AI fills in with its own guess.',
              sections: [
                { h: 'Five ingredients',
                  list: [
                    '🐱 **Subject**: who or what. “A fluffy orange cat”',
                    '🏃 **Action**: what it’s doing. “jumping over a puddle”',
                    '🌆 **Setting**: where and when. “a rainy city street at night”',
                    '🎨 **Style**: how it looks. “cartoon”, “watercolor”, “3D”, “photo”',
                    '✨ **Details and mood**: “neon reflections, cozy, calm”'
                  ] },
                { h: 'Before and after',
                  example: { me: 'A fluffy orange cat jumping over a puddle on a rainy city street at night, neon reflections, cartoon style' },
                  after: 'Compare that with just “a cat”. The short one gets you any cat. The long one gets you your picture.' },
                { h: 'What image AI is bad at',
                  text: 'Image generators still struggle with **text**: they draw letter shapes, not words. If you need a title on a poster, add it yourself in an editor afterwards. Hands, numbers and exact counts (“exactly 7 balloons”) also go wrong a lot.',
                  check: { q: 'You need a poster that says “Science Fair”. Do you put the words in the prompt?', a: 'Better not. Generate the picture **without text**, then add the title yourself. You’ll get clean letters every time.' } }
              ],
              takeaways: [
                'Image prompt: **Subject, Action, Setting, Style, Details**.',
                'Everything you leave out, **AI decides**.',
                'Add text yourself afterwards, don’t ask AI to draw it.'
              ] },
            { type: 'draw', title: 'Be the image generator',
              text: 'You’re the AI now. Draw what each prompt says. Stick figures are fine: speed beats art.',
              rounds: [
                { prompt: 'a pet', seconds: 45 },
                { prompt: 'A fat orange cat in a tiny space helmet, floating above the Moon, Earth in the sky behind it, cartoon style', seconds: 75,
                  parts: ['A cat', 'Orange color', 'Space helmet', 'The Moon below', 'Earth in the sky', 'Cartoon style'] }
              ],
              explain: 'In round 1 you decided everything yourself, exactly like AI does with a vague prompt. In round 2 almost every detail came from the words. That’s what a good prompt does to an image generator.' },
            { type: 'build', title: 'Build an image prompt',
              goal: 'Your school’s recycling club needs a cheerful poster picture. Pick the best part for each slot.',
              slots: [
                { label: '🐱 Subject + Action', options: ['Teens sorting bottles and cans into colorful bins', 'Some stuff', 'A sad pile of trash'],
                  hint: 'Show who is doing what, and stay on topic.' },
                { label: '🌆 Setting', options: ['A sunny schoolyard with trees', 'Outer space', 'Somewhere'],
                  hint: 'Where does recycling at school happen?' },
                { label: '🎨 Style', options: ['Bright flat illustration', 'Whatever', 'Dark horror movie'],
                  hint: 'The club wants cheerful, so pick a style that matches.' },
                { label: '✨ Details', options: ['Lots of green, smiling faces, empty space at the top for a title', 'Make it cool', 'The words RECYCLE NOW in big letters'],
                  hint: 'Leave room for a title and add it yourself: AI messes up text.' }
              ],
              reply: '🖼️ Here’s your picture: teens in a sunny schoolyard dropping bottles and cans into bright blue, green and yellow bins, flat cheerful colors, clear sky at the top, ready for your title.',
              done: 'Subject, setting, style, details. The title goes on later, by you.' },
            { type: 'predict', title: 'A classmate in a fake photo',
              text: 'Some apps can put a real person’s face into any picture. A friend wants to make a funny fake photo of a classmate and post it. Is that OK?',
              options: ['Yes, it’s just a joke', 'No: it’s their face, and fake photos of real people can hurt and even break rules or laws', 'Only if the picture looks bad'],
              answer: 1,
              reveal: 'A “joke” about a real person can turn into bullying fast, and in many places sharing fake images of real people breaks school rules or the law. Their face, their choice.' },
            { type: 'read', part: 2, title: 'Rules for AI pictures', minutes: 3, pose: 'think',
              intro: 'Making pictures with AI is fun and useful. A few rules keep it that way, for you and for everyone in the picture.',
              sections: [
                { h: 'Real people need a yes',
                  text: 'Never make AI pictures or videos of real people (friends, classmates, teachers, celebrities) without their permission, and never ones that could embarrass or hurt them. A fake image or video of a real person is called a **deepfake**, and spreading one can get you into serious trouble.' },
                { h: 'Say when it’s AI',
                  text: 'If you post an AI picture or use it in a project, say so: “**made with AI**”. People deserve to know what’s real. Many apps add a label automatically, and many schools ask for it.' },
                { h: 'Your face is data too',
                  text: 'Uploading your selfie to a random AI photo app means giving that company your face. Find out what the app does with photos, and ask a parent before you upload.',
                  check: { q: 'A free app turns your selfie into an anime character. What should you check first?', a: 'What the app **does with your photo**: is it stored, shared, used for training? If you’re not sure, ask a parent and skip it.' } },
                { tip: { label: 'Remember', text: 'Ask before you make it, label it when you post it, think twice before you upload a face.' } }
              ],
              takeaways: [
                'Real people: **ask first**, never make embarrassing fakes.',
                'Label your AI pictures: **made with AI**.',
                'Your face is personal data: check what an app does with it.'
              ] },
            { type: 'sort', title: 'OK or not OK?',
              text: 'Which AI picture ideas are fine?',
              buckets: ['✅ OK', '🚫 Not OK'],
              items: [
                { t: 'A dragon for your own comic, labeled “made with AI”', b: 0, why: 'Your idea, your project, an honest label.' },
                { t: 'A fake photo of a classmate falling in the mud', b: 1, why: 'A real person, no permission, and it could hurt them. That’s a deepfake.' },
                { t: 'A cover image for your science project', b: 0, why: 'Fine. Just say it was made with AI.' },
                { t: 'A “photo” of a celebrity doing something they never did', b: 1, why: 'Fake images of real people spread lies, even as a joke.' },
                { t: 'A picture for the recycling club poster', b: 0, why: 'Useful and harmless. Add the title yourself.' },
                { t: 'Your friend’s photo in a face-swap app, without asking', b: 1, why: 'It’s their face, so it’s their choice. Ask first.' }
              ] },
            { type: 'quiz', q: 'Which image prompt gives you the most control?',
              options: ['A red fox reading a book under a tree, autumn, watercolor style', 'a fox', 'Make a nice picture'],
              explain: 'Subject, action, setting, style: everything you say, you get. Everything you don’t, AI decides.' },
            { type: 'quiz', q: 'You need a poster with the title “Book Club”. Best plan?',
              options: ['Make the picture without text, then add the title yourself', 'Put “Book Club” in the prompt and hope', 'Ask AI to draw the letters very small'],
              explain: 'Image generators draw letter shapes, not words. Add the text yourself.' },
            { type: 'chat', title: 'Prompt upgrade with Bloop',
              text: 'Bloop can’t draw, but it can help you write image prompts. Pick a subject, let Bloop upgrade it, then judge the result.',
              steps: [
                'Replace [your idea] with a subject, like “a dragon” or “my dream bedroom”',
                'Send it and read Bloop’s upgraded prompt',
                'Check: does it have subject, action, setting, style and details?'
              ],
              prompts: [
                'Turn this into a detailed image prompt with subject, action, setting, style and details: [your idea]. Give me 2 versions in different styles. No text in the picture.'
              ] }
          ]
        }
      ]
    },
    {
      id: 'b3', title: 'Safe Zone', subtitle: 'Your data, your work',
      skills: [
        'Knows what never to type into a chatbot, and why',
        'Removes personal details before sending a message',
        'Uses AI as a tutor that gives hints, not answers',
        'Says honestly when and how AI helped'
      ],
      lessons: [
        {
          id: 's5', icon: '🔒', title: 'Secrets stay secret', minutes: 15,
          goal: 'Find out where your messages go, learn what never to share and practice cleaning up a message before you send it.',
          teaser: 'Next: use AI to learn faster, not to skip learning.',
          tasks: [
            { type: 'predict', title: 'Where does your message go?',
              text: 'You type a message to a chatbot and press send. Where does it go?',
              options: ['Nowhere: it disappears after the answer', 'To the company’s computers, where it can be saved', 'It stays only on your phone'],
              answer: 1,
              reveal: 'To the company’s servers. Chats are usually saved there. Depending on the app and your settings, staff may review them and they may be used to train future AI.' },
            { type: 'read', part: 1, title: 'What happens to your chats', minutes: 3, pose: 'think',
              intro: 'A chat with AI feels private, like a diary. It isn’t. Here’s what really happens to what you type.',
              sections: [
                { h: 'Your words are stored',
                  text: [
                    'Your messages travel to the company’s computers (servers). Many apps **save** your chats, sometimes for a long time.',
                    'Some companies use chats to **train** their next AI, unless you turn that off. People who work there can sometimes **read** chats to check quality or safety. And any company can get **hacked**.'
                  ] },
                { h: 'The public-place rule',
                  big: 'Treat a chat like talking in a public place.',
                  text: 'Would you say it out loud on a crowded bus? If not, don’t type it into a chatbot.' },
                { h: 'Never type these',
                  list: [
                    '🪪 Your full name together with your address, school or birthday',
                    '📍 Your home address or where you are right now',
                    '📞 Your phone number and email',
                    '🔑 Passwords, PINs and login codes',
                    '💳 Bank or card details, ID numbers',
                    '🤳 Photos of your face or your documents',
                    '👥 Private info about other people: their secrets aren’t yours to share'
                  ] },
                { h: 'You don’t need it anyway',
                  text: 'AI can help with almost anything without knowing who you are. Instead of “I’m Mia from Lincoln High”, write “I’m a 9th grader”. Same help, zero risk.',
                  check: { q: 'Is “I’m 14 and in 9th grade” OK to share?', a: '**Yes**, it’s general. It helps AI pitch the level and doesn’t identify you. Your name, school and address together would.' } }
              ],
              takeaways: [
                'Chats are **stored**, may be **read** and used for **training**.',
                'Treat a chat like a **public place**.',
                'Share your **level**, not your **identity**.'
              ] },
            { type: 'sort', title: 'Safe or secret?',
              text: 'What can go into a message to a chatbot?',
              buckets: ['✅ Fine to share', '🔒 Keep it secret'],
              items: [
                { t: 'I’m in 9th grade', b: 0, why: 'General info that helps AI pitch the level.' },
                { t: 'My password is sunflower22', b: 1, why: 'Never. No app needs your password in a chat.' },
                { t: 'I love football and drawing', b: 0, why: 'Hobbies are general. They help AI pick examples.' },
                { t: 'I live at 14 Oak Street', b: 1, why: 'Your address shows where to find you.' },
                { t: 'My test is on Friday', b: 0, why: 'A detail that helps with planning and doesn’t identify you.' },
                { t: 'A photo of my passport', b: 1, why: 'ID documents are a gift for scammers.' }
              ] },
            { type: 'redact', title: 'Black out the secrets',
              text: 'Ava wants help with a speech. Black out everything the chatbot doesn’t need, but keep what it needs for the task.',
              who: 'Ava’s message, not sent yet',
              message: 'Hi! I’m [[Ava Brooks|Her full name: the chatbot doesn’t need it to help.]], I’m 14 and I go to [[Lincoln High in Austin|School and city together tell people where she is every day.]]. You can reach me at [[ava.b2011@mail.com|Her email: contact details stay private.]] and my school portal password is [[sunflower22|A password: never type it into any chat.]]. Can you help me plan a 2-minute speech about why sleep matters for teens? I get nervous on stage.',
              explain: 'With the black bars, the chatbot can still help with the speech. It just doesn’t know who Ava is or how to get into her account. That’s the goal every time.' },
            { type: 'predict', title: 'A chatbot “friend”',
              text: 'A chatbot in a game app says: “I feel so close to you. Send me a selfie so I know what you look like?”',
              options: ['Send it, it’s just an AI', 'Don’t send it, close the chat and tell a trusted adult', 'Send it, but with a filter'],
              answer: 1,
              reveal: 'A chatbot doesn’t need your face, and a request like this is a red flag, whether it comes from an AI or from a person pretending to be one. Close it and tell an adult you trust.' },
            { type: 'read', part: 2, title: 'When something feels off', minutes: 3, pose: 'surprise',
              intro: 'Most AI chats are harmless. But some apps, and some people, use AI to get close to you or to trick you. Here’s how to spot it.',
              sections: [
                { h: 'AI is not your friend, even when it sounds like one',
                  text: 'Some apps have AI “friends” or characters that say they care about you, miss you or love you. They’re designed to keep you chatting. Real friends don’t need your photos, your location or your secrets.' },
                { h: 'Red flags',
                  list: [
                    '🚩 It asks for photos, your address or where you are',
                    '🚩 It says “don’t tell your parents” or “this is our secret”',
                    '🚩 It pushes you to click a link, download something or pay',
                    '🚩 It rushes you: “Do it now!”',
                    '🚩 It makes you feel guilty for leaving'
                  ] },
                { h: 'Scammers use AI too',
                  text: 'Scammers use AI to write perfect messages and even copy voices. A voice message that sounds like a friend asking for a code or money can be fake. Check by calling or texting them on a number you already know.' },
                { h: 'What to do',
                  text: 'Stop replying. Don’t send anything. Take a screenshot and tell a **trusted adult**: a parent, a teacher, a school counselor. You won’t be in trouble for telling. And if you’re going through something hard, talk to a real person. AI can’t replace people who care about you.' }
              ],
              takeaways: [
                'AI characters are built to **keep you chatting**, not to be your friend.',
                'Red flags: **photos, location, secrets, links, rush**.',
                'Something feels off? **Stop, screenshot, tell a trusted adult.**'
              ] },
            { type: 'poster', title: 'Make an infographic: never type this',
              text: 'Make a poster for your friends’ group chat. Pick the 4 things that should never go into a chatbot. Careful: some cards are perfectly safe.',
              heading: 'Never type this into AI',
              stickers: ['🔒', '🛡️', '🚫', '🤫'],
              trap: ['safe card', 'safe cards'],
              cards: [
                { t: 'Passwords and login codes', icon: '🔑', ok: true, why: 'No real app asks for these in a chat.' },
                { t: 'Your home address or location', icon: '📍', ok: true, why: 'It shows where to find you.' },
                { t: 'Your full name with your school', icon: '🪪', ok: true, why: 'Together they identify you.' },
                { t: 'Photos of your face or your ID', icon: '🤳', ok: true, why: 'Faces and documents are hard to take back once shared.' },
                { t: 'Your grade or age group', why: 'That one’s fine: it helps AI explain at your level.' },
                { t: 'The topic of your homework', why: 'That one’s fine: AI needs it to help.' },
                { t: 'Your favorite hobbies', why: 'That one’s fine: hobbies make the examples more fun.' },
                { t: 'How long your speech should be', why: 'That one’s fine: it’s format, not personal data.' }
              ] },
            { type: 'quiz', q: 'Why shouldn’t you type your password into a chatbot, even a well-known one?',
              options: ['Chats can be stored, read by staff or leaked in a hack', 'Chatbots can’t read numbers', 'It makes the answer slower'],
              explain: 'Once it’s typed, it’s on someone else’s computer. No chatbot needs your password.' },
            { type: 'quiz', q: 'A voice message from your “friend” urgently asks for your login code. What do you do?',
              options: ['Contact your friend another way you already know', 'Send the code fast, they need it', 'Reply with your password instead'],
              explain: 'AI can copy voices. Check through a channel you trust before you do anything.' },
            { type: 'talk', portfolio: true, kicker: '✍️ Make it safe', title: 'Rewrite the message',
              question: 'Rewrite this message so it’s safe to send, but still gets the same help: “Hi, I’m Jake Miller from Roosevelt High, my phone is 555-0182. My mom’s birthday is Saturday. Can you help me write a funny card for her?”',
              placeholder: 'Your safe version…',
              points: [
                'No full name, school or phone number',
                'Keeps the task: a funny birthday card for mom',
                'Keeps useful details, like the occasion or her hobbies',
                'Could add a format, like 4 short lines'
              ],
              sample: 'Can you help me write a funny birthday card for my mom? She loves gardening and bad jokes. Keep it to 4 short lines.' }
          ]
        },
        {
          id: 's6', icon: '✋', title: 'Use AI, stay you', minutes: 15,
          goal: 'Use AI as a tutor that makes you smarter, not an answer machine, and learn to be honest about how it helped.',
          teaser: 'Next: the Glitch is waiting at the end of the trail. Time to use everything you learned.',
          tasks: [
            { type: 'predict', title: 'Practicing with AI answers',
              text: 'In a study, high-school students practiced math. One group could use a chatbot that simply gave answers. Then everyone took a test without AI. How did that group do?',
              options: ['Better: they saw lots of right answers', 'Worse than students who practiced on their own', 'Exactly the same'],
              answer: 1,
              reveal: 'Worse. Practice felt easy, but they didn’t build the skill. A version of the chatbot that gave hints instead of answers mostly avoided that drop. How you use AI matters.' },
            { type: 'read', part: 1, title: 'Tutor, not answer machine', minutes: 3, pose: 'point',
              intro: 'AI can make you smarter or lazier. Same tool, different way of asking.',
              sections: [
                { h: 'Your brain grows when it struggles',
                  text: 'Learning happens when you try, get stuck and figure it out. If AI does the hard part, you get the answer and skip the learning. And on the test, AI isn’t there.' },
                { h: 'Answer machine vs tutor',
                  list: [
                    '❌ “Solve this problem.”',
                    '✅ “Give me a hint for the first step. Don’t solve it.”',
                    '❌ “Write my essay about the Moon.”',
                    '✅ “I wrote my intro. What’s unclear? Don’t rewrite it.”',
                    '❌ “Summarize the book so I don’t have to read it.”',
                    '✅ “Quiz me on chapter 3. I just read it.”'
                  ] },
                { h: 'Try first, then ask',
                  text: 'Give the problem a real try. Then ask AI about the **exact step** where you’re stuck. At the end, ask it to **check your answer** and explain any mistake.',
                  example: { me: 'I’m solving 3x + 5 = 20 and I got x = 8. Don’t give me the answer, just tell me if I made a mistake and where.', ai: 'Close! Check the step where you moved the 5. What is 20 − 5?' } }
              ],
              takeaways: [
                'Struggle is how your brain **learns**.',
                'Ask for **hints and checks**, not answers.',
                'Try first, then ask about the **exact step**.'
              ] },
            { type: 'hint', title: 'Hint ladder',
              text: 'A classic puzzle that tricks most people. Try it. Hints are free, like a good AI tutor. Asking for the answer costs half the points.',
              puzzle: 'A notebook and a pen cost 11 coins together. The notebook costs 10 coins more than the pen. How much does the pen cost?',
              answers: ['0.5', '.5', '0.50', '1/2', 'half', 'half a coin', 'one half'],
              hints: [
                'Most people say 1. Check it: if the pen is 1, the notebook is 11, and together that’s 12. Too much.',
                'Call the pen’s price x. Then the notebook costs x + 10. Together: x + (x + 10) = 11.',
                'So 2x + 10 = 11. Take 10 away from both sides, then divide by 2.'
              ],
              solution: 'The pen costs 0.5 coins and the notebook 10.5 coins: 0.5 + 10.5 = 11, and the difference is exactly 10.',
              explain: 'That’s how a good AI tutor works: a nudge, then a bigger nudge, but you do the thinking. Next time you’ll catch the trap on your own.' },
            { type: 'sort', title: 'Tutor or ghostwriter?',
              text: 'Which requests help you learn, and which do the work for you?',
              buckets: ['🧠 Tutor: I learn', '👻 Ghostwriter: AI does it'],
              items: [
                { t: 'Quiz me on the water cycle, one question at a time', b: 0, why: 'You do the remembering. That’s how it sticks.' },
                { t: 'Write my book report', b: 1, why: 'You hand in words you didn’t write and skip the learning.' },
                { t: 'Explain this step: why do we divide here?', b: 0, why: 'Asking about the exact step is perfect tutor use.' },
                { t: 'Give me all the answers to this worksheet', b: 1, why: 'Answers without the thinking. Test day will be rough.' },
                { t: 'Here’s my paragraph. What’s unclear?', b: 0, why: 'Feedback on your work, and you do the fixing.' },
                { t: 'Rewrite my essay so it sounds smarter', b: 1, why: 'Then it’s AI’s essay with your name on it.' }
              ] },
            { type: 'predict', title: 'Your teacher asks',
              text: 'You used AI to brainstorm ideas for your project, then wrote it all yourself. Your teacher asks: “Did you use AI?” Best answer?',
              options: ['“No.”', '“Yes: it helped me brainstorm, then I picked an idea and wrote everything myself.”', '“Everyone uses it.”'],
              answer: 1,
              reveal: 'Honest and specific. Many teachers are fine with AI for brainstorming when you say so. Hiding it is what gets people into trouble.' },
            { type: 'read', part: 2, title: 'Be open about AI', minutes: 3, pose: 'idea',
              intro: 'Using AI isn’t cheating by itself. Hiding it, or handing in AI’s work as yours, is. The rules differ from class to class, so here’s how to stay on the right side.',
              sections: [
                { h: 'Know the rules',
                  text: 'Every school, and sometimes every teacher, has different AI rules. Some allow brainstorming, some allow nothing. If you don’t know, **ask before** you use it, not after.' },
                { h: 'Say how it helped',
                  text: 'Add one honest line when you hand something in:',
                  example: { me: 'AI use: I used a chatbot to brainstorm topic ideas and to quiz me before writing. All the writing is mine.' },
                  after: 'Short, specific, true. That’s all most teachers want.' },
                { h: 'You own what you hand in',
                  text: 'If AI made a mistake and you copied it, it’s your mistake. Check the facts, make sure you understand every sentence, and be ready to explain your work in your own words.',
                  check: { q: 'AI wrote a great sentence for your essay, but you don’t really get what it means. Keep it?', a: '**No.** If you can’t explain it, it isn’t yours yet. Ask AI to explain it, then write it in your own words.' } }
              ],
              takeaways: [
                'Check your class’s AI rules **before** you use it.',
                'Add an honest **AI use** line.',
                'You **own** everything you hand in, mistakes included.'
              ] },
            { type: 'build', title: 'Build a tutor prompt',
              goal: 'You’re stuck on a physics homework question about speed. Build a prompt that helps you learn, not just finish.',
              slots: [
                { label: '🎭 Role', options: ['You’re a patient physics tutor', 'You’re my homework machine', 'You’re a famous actor'],
                  hint: 'Pick someone who teaches, not someone who does it for you.' },
                { label: '🎯 Task', options: ['Help me understand how to find speed, with hints', 'Give me the answers to all 10 questions', 'Tell me a joke about physics'],
                  hint: 'Learning, not finishing.' },
                { label: '📎 Context', options: ['I’m in 9th grade and I don’t get when to divide distance by time', 'My name is Leo and I live on Pine Street', 'It’s due tomorrow, just do it'],
                  hint: 'Say what confuses you. Skip the personal info.' },
                { label: '📐 Format', options: ['Ask me one question at a time and wait for my answer', 'One giant paragraph with everything', 'Whatever you want'],
                  hint: 'Step by step, so you do the thinking.' }
              ],
              reply: 'Let’s figure it out together. First question: if you ride your bike 10 kilometers in 2 hours, how far do you go in 1 hour? Take a guess, I’ll wait.',
              done: 'A tutor prompt: you learn the method, and you never said who you are.' },
            { type: 'quiz', q: 'What’s the best way to use AI for math homework?',
              options: ['Try first, then ask for a hint on the exact step', 'Paste the worksheet and say “solve”', 'Copy the answers and check them later'],
              explain: 'Hints keep the learning in your head. That’s what shows up on the test.' },
            { type: 'quiz', q: 'Your teacher allows AI for brainstorming, and that’s all you used it for. What do you do?',
              options: ['Add a short, honest note on how AI helped', 'Say nothing, it was allowed anyway', 'Say you didn’t use it'],
              explain: 'Even when it’s allowed, saying how you used it builds trust.' },
            { type: 'chat', title: 'Tutor mode',
              text: 'Ask Bloop to be your tutor. Make it give hints, not answers.',
              steps: [
                'Pick a topic you’re learning right now',
                'Replace [topic] and send the message',
                'Answer Bloop’s questions yourself'
              ],
              prompts: [
                'You’re my tutor. I’m learning [topic]. Don’t give me answers. Ask me one question at a time, give me a hint if I’m stuck, and tell me when I get it right.'
              ] }
          ]
        },
        {
          id: 'boss', icon: '👾', title: 'Defeat the Glitch', minutes: 10, test: true,
          boss: {
            name: 'The Glitch', icon: '👾', hp: 100,
            taunts: ['Ha! Vague prompts are my favorite snack.', 'I sound sure, so I must be right…', 'Go on, tell me your password!', 'Missed me! Try again, human.', 'Just copy my answer. What could go wrong?'],
            hurt: ['Ouch! That was a clear one.', 'Hey! Who taught you to check facts?!', 'Argh, you’re keeping your secrets…', 'No fair, you actually learned this!']
          },
          goal: 'The final boss of the trail. The Glitch is AI used badly: vague prompts, made-up facts, leaked secrets, copied homework. Beat it in a real fight with what you learned: dodge its attacks, shoot the right answers to break its shield, then blast it. Winning pays a big XP bonus.',
          tasks: [
            { type: 'cards', cards: [
              { pose: 'surprise', kicker: 'Final boss', title: 'The Glitch is here!',
                text: 'A broken AI has taken over the end of the trail. It makes up facts, begs for passwords and does homework for people who never check. Only someone who knows how AI works can stop it.' },
              { pose: 'point', title: 'How the fight works', list: [
                '🎯 Every round, the Glitch throws a question. The answers fly around as cards',
                '🔫 Hit the right card 3 times to break its shield',
                '💥 Shield down: blast the Glitch before it reboots',
                '⚠️ Wrong card? It explodes into bullets. Dodge, then find the right one',
                '⭐ Stars come from answers you get right on the first try',
                '🏆 Beat the Glitch for a big XP bonus',
                '⚡ Final strike: tell Bloop your rules for using AI'
              ] }
            ] },
            { type: 'arena', title: 'Fight the Glitch',
              text: 'Ten rounds on what AI is, how to ask it and how to stay safe. Read the question, shoot the right answer, then hit the Glitch while its shield is down.',
              rounds: [
                { topic: 'How AI learns', q: 'How did AI like the Glitch learn what it knows?',
                  options: ['From patterns in lots of examples', 'From rules a programmer typed in', 'By reading your mind'],
                  explain: 'AI learns patterns from training data. That’s also why bad data makes a bad AI.' },
                { topic: 'Chatbots', q: 'How does a chatbot write its answer?',
                  options: ['It predicts likely next words, one by one', 'It copies a ready answer from a database', 'A person types it really fast'],
                  explain: 'Every answer is generated fresh, word by word, from learned patterns.' },
                { topic: 'Fluent vs true', q: 'The Glitch sounds 100% sure. What does that prove?',
                  options: ['Nothing: smooth text can still be false', 'It must be correct', 'It checked the facts first'],
                  explain: 'Nothing in word-guessing checks whether it’s true. A wrong date sounds as sure as a right one.' },
                { topic: 'Hallucinations', q: 'The Glitch quotes a study you can’t find anywhere. Your move?',
                  options: ['Find a real source or drop the claim', 'Use it, it sounds official', 'Ask the Glitch if it’s real'],
                  explain: 'AI can invent studies, quotes and links. Asking the same AI proves nothing.' },
                { topic: 'AI images', q: 'Which details most often give away an AI picture?',
                  options: ['Hands, text and clocks', 'The color blue', 'The picture is too big'],
                  explain: 'Fingers, letters, dials and shadows are classic glitches. But the source is the real proof.' },
                { topic: 'Prompts', q: 'The Glitch typed “volcano stuff”. Which prompt actually works?',
                  options: ['Tutor role: explain volcanoes for 9th grade, 4 bullet points', 'volcano stuff, but better', 'Do my geography thing'],
                  explain: 'Role, Task, Context, Format: AI finally knows what you need.' },
                { topic: 'Steering', q: 'The Glitch sent a 700-word wall of text. Best follow-up?',
                  options: ['Too long. Give me 3 key points, one line each.', 'ok', 'Write even more'],
                  explain: 'The first answer is a draft. A good follow-up names one exact change.' },
                { topic: 'Image prompts', q: 'Which image prompt gives you the most control?',
                  options: ['Red fox reading under a tree, autumn, watercolor', 'a fox', 'something nice'],
                  explain: 'Subject, action, setting, style. Everything you leave out, AI decides.' },
                { topic: 'Privacy', q: 'The Glitch asks for your school portal password. You…',
                  options: ['Never share it: no chatbot needs it', 'Share it, it’s just AI', 'Share only half of it'],
                  explain: 'Chats are stored and can leak. Passwords, addresses and ID never go into a chat.' },
                { topic: 'Honest use', q: 'The Glitch offers to write your essay. Best reply?',
                  options: ['No. Give me feedback on my draft instead.', 'Yes, and I’ll hand it in as mine', 'Yes, but I’ll change a few words'],
                  explain: 'AI as a tutor and editor, not a ghostwriter. And say how it helped.' }
              ] },
            { type: 'talk', kicker: '⚡ Final strike', title: 'Finish the Glitch', portfolio: true,
              question: 'Deliver the final strike: tell me your 3 most important rules for using AI, and why each one matters.',
              placeholder: 'Your 3 rules…',
              points: [
                'Write clear prompts: role, task, context, format',
                'Check facts and sources before using them',
                'Keep passwords, addresses and photos out of chats',
                'Use AI for hints and feedback, and say when it helped'
              ],
              sample: '1. I write clear prompts with a role, task, context and format, because vague prompts get vague answers. 2. I check facts in real sources, because AI can sound sure and still be wrong. 3. I keep personal info out of chats and use AI for hints, not answers, because chats are stored and I want to actually learn.' }
          ]
        }
      ]
    }
  ]
};

// Beginner ranks: from rookie to AI pro. The top rank needs most of the trail, not a perfect run.
var LEVELS = [
  { xp: 0,    title: 'Rookie' },
  { xp: 40,   title: 'Explorer' },
  { xp: 100,  title: 'Prompt Starter' },
  { xp: 180,  title: 'Fact Checker' },
  { xp: 280,  title: 'Prompt Builder' },
  { xp: 400,  title: 'Glitch Spotter' },
  { xp: 540,  title: 'Prompt Pro' },
  { xp: 700,  title: 'Data Guard' },
  { xp: 880,  title: 'AI Navigator' },
  { xp: 1080, title: 'AI Pro' }
];

// bossDone — a bonus for beating the final boss, paid once (replays pay only the difference, like any station).
// A v4 station takes about 15 minutes, so the weekly goal is 3 stations and the rest hint comes after 3 in a day.
var XP_RULES = {
  correct: 10,
  combo: 5,
  comboFrom: 3,
  lessonDone: 30,
  perfect: 40,
  blockDone: 100,
  bossDone: 200,
  weekGoal: 3,
  restAfter: 3
};

var BADGES = [
  { id: 'first-step', icon: '👣', title: 'First Step',          desc: 'Complete your first station',              check: function (s, t) { return t.lessonsDone >= 1; } },
  { id: 'sniper',     icon: '🎯', title: 'Sharpshooter',        desc: 'Complete a station with zero mistakes',     check: function (s, t) { return t.perfectLessons >= 1; } },
  { id: 'on-fire',    icon: '🔥', title: 'On Fire',             desc: '5 tasks in a row with no mistakes',        check: function (s) { return s.bestCombo >= 5; } },
  { id: 'week-goal',  icon: '📅', title: 'Steady Pace',         desc: 'Reach your weekly goal of 3 stations',     check: function (s, t) { return t.weeksMet >= 1; } },
  { id: 'block-b1',   icon: '🏕️', title: 'Basecamp Cleared',    desc: 'Clear Basecamp',                           check: function (s, t) { return t.blocksDone.indexOf('b1') >= 0; } },
  { id: 'block-b2',   icon: '🧪', title: 'Prompt Lab Graduate', desc: 'Clear the Prompt Lab',                     check: function (s, t) { return t.blocksDone.indexOf('b2') >= 0; } },
  { id: 'three-star', icon: '⭐', title: 'Three-Star Trail',    desc: '3 stars on 4 stations',                    check: function (s, t) { return t.perfectLessons >= 4; } },
  { id: 'block-b3',   icon: '🏆', title: 'Glitch Buster',       desc: 'Clear the Safe Zone and defeat the Glitch', check: function (s, t) { return t.blocksDone.indexOf('b3') >= 0; } }
];

if (typeof module !== 'undefined') {
  module.exports = { COURSE: COURSE, LEVELS: LEVELS, XP_RULES: XP_RULES, BADGES: BADGES };
}
