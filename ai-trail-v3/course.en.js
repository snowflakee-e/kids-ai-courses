'use strict';

// AI Trail v3 content (ages 14–17): fewer, bigger stations and no videos. 21 short stations became 10:
// 9 stations of about 20 minutes plus the final boss. Side quests and zone tests were folded into the stations.
// The course is in English only, US spelling.
// Everything that changes without code lives here: blocks, lessons, tasks, XP rules, levels and badges.
//
// Block = a zone on the map. Lesson = a station. Task = one screen of a lesson.
// Every regular station has two parts. Each part opens with a prediction, then a long read, then practice.
// teaser — one line about the next station, shown after the lesson: a reason to come back.
//
// Task types:
//   predict — not graded, opens each part: guess what AI will do, then see what really happens.
//             options, answer (index of what really happens), reveal (the explanation)
//   read    — not graded, the theory of a part: part (1 or 2), title, minutes, pose (Bloop’s state), intro,
//             sections [{ h, text (string or list of paragraphs), big, list, example { me, ai }, after,
//             tip (string or { label, text }), check { q, a } }], takeaways. **text** marks the key words
//   quiz    — a test question, the first option is correct (options are shuffled)
//   sort    — sort cards into two buckets (b is the index of the right bucket)
//   build   — build a prompt from parts, the first option in every slot is correct (done — optional final note)
//   spot    — find the wrong sentence (wrong is its index, who is the caption above the text)
//   order   — tap the steps in the right order (items are listed in the correct order, explain is optional)
//   poll    — not graded: “continue like a neural network”, p is the probability in %
//   chat    — not graded: practice with Bloop right in the lesson, Bloop answers like a regular chatbot.
//             prompts — ready-made messages (the first one is already in the box; [brackets] must be replaced),
//             steps — an optional list. Offline, the prompts are shown for copying into another chatbot
//   talk    — not graded: a written answer checked by the Bloop tutor (../ai-trail/worker/).
//             points — what a good answer covers (6 at most), sample — an example answer when the tutor is offline,
//             kicker and placeholder are optional. portfolio: true — the answer is saved to the student’s portfolio
//   cards   — short theory cards (kicker, title, big, chat, text, list, reveal); only the boss intro uses them now
// Graded: quiz, sort, build, spot, order. The lesson’s stars come from them.
// A text in a read never gives away the answer of a graded task in the same station: it teaches, the task checks.
//
// A lesson with boss: { name, icon, hp, taunts, hurt } is a boss fight: an HP bar above the tasks,
// every graded task deals an equal share of damage times its score. taunts — on a miss, hurt — on a perfect hit.
//
// skills — what a student can do after the block: listed on the certificate and the share card.

var COURSE = {
  id: 'ai-trail',
  title: 'AI Trail',
  age: '14–17 years',
  blocks: [
    {
      id: 'b1', title: 'Forest Edge', subtitle: 'Your first steps with AI',
      skills: [
        'Explains how a chatbot builds its answers and where it fails',
        'Writes clear prompts with Role, Task, Context and Format',
        'Steers a conversation with specific follow-ups',
        'Fact-checks AI answers and keeps personal data private'
      ],
      lessons: [
        {
          id: 's1', icon: '🤖', title: 'How AI thinks, how to ask', minutes: 22,
          goal: 'Find out what a chatbot really does and where it fails, then write prompts that work on the first try.',
          teaser: 'Next: steering a conversation, catching made-up facts and keeping your data safe.',
          tasks: [
            { type: 'predict', title: 'Same question, twice',
              text: 'Bloop sends a chatbot the same message in two new chats: “Suggest a name for my hamster.” What happens?',
              options: ['It gives the same name both times', 'It usually gives a different name each time', 'It refuses: it doesn’t know your hamster'],
              answer: 1,
              reveal: 'Usually you get different names. A chatbot picks each next word from several likely options, with a bit of randomness. So one answer is never “the” answer. Let’s see what’s going on inside.' },
            { type: 'read', part: 1, title: 'What a chatbot actually does', minutes: 4, pose: 'point',
              intro: 'You type a question, and a few seconds later there’s a smooth, confident answer. It feels like talking to someone who knows everything. It isn’t. Here’s what’s really going on, and why it matters every time you use AI.',
              sections: [
                { h: 'Step 1: it read a giant library',
                  text: [
                    'Before you ever opened the app, the model was **trained** on an enormous amount of text: books, websites, articles, forum posts, code. It didn’t store them like a hard drive. It learned **patterns**: which words tend to follow which, how an explanation is built, what a recipe or an essay usually looks like.',
                    'After that, people trained it further to follow instructions: they rated its answers and showed it better ones. That’s why it answers your question instead of just continuing your sentence.'
                  ] },
                { h: 'Step 2: it writes one word at a time',
                  text: [
                    'When you send a message, the chatbot builds the answer piece by piece. At each step it looks at everything so far and picks a likely next word (technically a piece of a word, called a **token**). Then the next one. Then the next.',
                    'There’s a bit of randomness in each choice. That’s why the same question in two new chats can get two different answers: there’s no single stored “correct” reply.'
                  ],
                  check: { q: 'Is there a database of ready answers inside the chatbot?', a: 'No. Every answer is **generated fresh**, word by word, from learned patterns. That’s also why it can produce something that never existed anywhere.' } },
                { h: 'Sounds right is not the same as is right',
                  text: [
                    'Here’s the catch. Picking likely words makes the text **fluent**, but nothing in that process checks whether it’s **true**. A wrong date can sound exactly as sure as a right one.',
                    'Some chatbots can search the web or read files you upload, and then they can point to real sources. Without that, they answer from patterns learned in training, so they may also not know about recent events.'
                  ],
                  tip: { label: 'Remember', text: 'A chatbot is a **text predictor**, not a fact checker. Your job: steer it and check what matters.' } },
                { h: 'Great at, weak at',
                  list: [
                    '✅ Explaining, rewording, summarizing',
                    '✅ Brainstorming ideas and making plans',
                    '✅ Giving feedback on your work',
                    '⚠️ Exact facts: numbers, dates, quotes, links',
                    '⚠️ Recent news, unless it can search the web',
                    '⚠️ Knowing you: it only knows what you tell it'
                  ] },
                { h: 'It only knows what you tell it',
                  text: 'In a new chat, AI knows nothing about your class, your level, your deadline or your teacher’s rules. Some apps have memory or saved settings, but don’t count on them. If something matters for the answer, put it in the message. Just keep private stuff private: more on that in the next station.' }
              ],
              takeaways: [
                'A chatbot predicts **likely next words** from patterns it learned.',
                'Fluent is not the same as true: **check** facts, numbers and quotes.',
                'It only knows **what you tell it**, so give it context.'
              ] },
            { type: 'poll', title: 'Think like a chatbot',
              text: 'A chatbot picks the most likely next word. Which word would it pick here?',
              phrase: 'I can’t go out tonight, I have to finish my…',
              options: [{ t: 'homework', p: 54 }, { t: 'essay', p: 27 }, { t: 'project', p: 15 }, { t: 'pizza', p: 4 }],
              explain: 'That’s the whole trick: a likely word, then the next one, and so on. Nothing in this process checks whether the words are true. The percentages here are approximate.' },
            { type: 'sort', title: 'Rely on AI or not?',
              text: 'Hint: AI is great with words and ideas, weak with exact facts and decisions about your life.',
              buckets: ['✅ AI is great at this', '⚠️ Don’t rely on AI'],
              items: [
                { t: 'Explain photosynthesis in simple words', b: 0, why: 'Explaining and rewording is exactly what chatbots do well.' },
                { t: 'Today’s exact exchange rate', b: 1, why: 'Live numbers need a live source: a bank or an official website.' },
                { t: '10 name ideas for your YouTube channel', b: 0, why: 'Brainstorming is a perfect job for AI. You pick the winner.' },
                { t: 'An exact quote from a historical figure, with the date', b: 1, why: 'Quotes and dates are where AI invents things most often.' },
                { t: 'A weekly plan to prepare for a biology test', b: 0, why: 'Breaking a big task into steps is one of AI’s strengths.' },
                { t: 'Deciding which college is right for you', b: 1, why: 'AI can help you compare options, but the decision is yours.' }
              ] },
            { type: 'quiz', q: 'Why can a chatbot sound confident and still be wrong?',
              options: ['It builds answers from likely words, not from checked facts', 'It lies on purpose to test you', 'It only happens when the internet is slow'],
              explain: 'Fluent text and true text are two different things. That’s why checking is your job.' },
            { type: 'predict', title: 'Two words in, what comes out?',
              text: 'You type “help with history” and press send. What do you most likely get?',
              options: ['Exactly what you need for tomorrow’s test', 'A long, generic answer about history in general', 'An error message'],
              answer: 1,
              reveal: 'Most chatbots guess and give a long general answer. Some ask what you need, but they still don’t know your topic, your level or your deadline. The next part fixes that.' },
            { type: 'read', part: 2, title: 'Your first real prompt', minutes: 4, pose: 'idea',
              intro: 'A **prompt** is your task for AI. Most bad answers start with a bad prompt: two or three words, no details, no idea what the result should look like. The fix takes about 20 seconds.',
              sections: [
                { h: 'Vague in, vague out',
                  example: { me: 'help with history' },
                  after: 'AI doesn’t know the topic, your grade, what you already know or what you need it for. So it guesses, and you get a long, generic wall of text. Even when a chatbot asks a follow-up question, it’s starting from zero.' },
                { h: 'The formula',
                  big: 'Role + Task + Context + Format',
                  list: [
                    '🎭 **Role**: who AI should be. “You’re a patient chemistry tutor.” It sets the tone and the level.',
                    '🎯 **Task**: what exactly to do. Use a verb: explain, make 10 questions, outline, compare, give feedback.',
                    '📎 **Context**: the details that change the answer: your grade, your goal, your deadline, what you already know, what confuses you.',
                    '📐 **Format**: what the answer looks like: 5 bullet points, a table, under 100 words, answers at the end.'
                  ] },
                { h: 'Same AI, different answer',
                  example: {
                    me: 'You’re a history tutor. Make 8 quiz questions on the causes of World War I. I’m in 10th grade and keep mixing up the alliances. Questions first, answers at the end.',
                    ai: 'Let’s focus on the alliances you mix up.\n1. Which countries formed the Triple Entente?\n2. …\nAnswers at the end 👇'
                  },
                  after: 'Nothing about the AI changed. It just finally knows who to be, what to do, who it’s for and what the result should look like.' },
                { h: 'The part everyone skips',
                  text: [
                    '**Context** is the part most people leave out, and it changes the answer the most. “I’m in 9th grade” changes the vocabulary. “The test is on Friday” changes the plan. “I keep mixing up the dates” tells AI exactly where to focus.',
                    'You don’t need all four parts for a quick question. But when the answer matters, run the checklist.'
                  ],
                  check: { q: 'Is “I already know the basics” context or format?', a: '**Context**: it’s about your situation and tells AI where to start. Format is the shape of the answer, like “a table” or “under 100 words”.' } },
                { tip: { label: 'Pro tip', text: 'Not sure what context to give? End your prompt with: “**Ask me 2 questions before you answer.**” AI will tell you what it’s missing.' } }
              ],
              takeaways: [
                'A good prompt has **Role, Task, Context and Format**.',
                '**Context** is the most skipped and the most powerful part.',
                'Vague prompts get generic answers. Specific prompts get usable ones.'
              ] },
            { type: 'build', title: 'Build the prompt',
              goal: 'Your chemistry test is on Friday and you keep mixing up acids and bases. Pick the best part for each slot.',
              slots: [
                { label: '🎭 Role', options: ['You’re a patient chemistry tutor', 'You’re a famous rapper', 'You’re my best friend'],
                  hint: 'Pick someone who knows the subject and can teach it.' },
                { label: '🎯 Task', options: ['Explain the difference between acids and bases, then give me 5 practice questions', 'Tell me something about chemistry', 'Write a poem about the lab'],
                  hint: 'The task should help with exactly this test.' },
                { label: '📎 Context', options: ['I’m in 9th grade, the test is on Friday, I keep mixing up pH values', 'My favorite color is blue', 'It’s raining today'],
                  hint: 'Context is the details that change the answer.' },
                { label: '📐 Format', options: ['A short explanation, then the questions, answers at the very end', 'Whatever you want', 'One giant paragraph'],
                  hint: 'Pick a format that makes practicing easy.' }
              ],
              reply: 'Acids have a pH below 7, bases above 7, and 7 is neutral. Quick trick: lemon juice is acidic, soap is basic.\n1. What is the pH of pure water?\n2. Is vinegar an acid or a base?\n…\nAnswers at the end 👇' },
            { type: 'sort', title: 'Context or format?',
              text: 'Context is what AI should know. Format is what the answer should look like.',
              buckets: ['📎 Context', '📐 Format'],
              items: [
                { t: 'I’m in 11th grade', b: 0, why: 'Your level changes how AI explains things.' },
                { t: 'As a table with 3 columns', b: 1, why: 'That’s the shape of the answer.' },
                { t: 'Keep it under 150 words', b: 1, why: 'Length is part of the format.' },
                { t: 'The talk is 3 minutes long', b: 0, why: 'It’s a detail about your situation that shapes the answer.' },
                { t: 'My teacher wants real examples', b: 0, why: 'What the assignment asks for is context.' },
                { t: 'Use bullet points', b: 1, why: 'Bullet points are a format.' }
              ] },
            { type: 'quiz', q: 'Which prompt will work best?',
              options: ['You’re a fitness coach. Make a 20-minute home workout for a beginner, no equipment, as a list with timings', 'workout', 'Give me exercises'],
              explain: 'Role, task, context and format: AI gets it on the first try.' },
            { type: 'quiz', q: 'What does a chatbot know about you when you start a chat?',
              options: ['Only what you tell it (plus anything saved in its settings)', 'Everything on your phone', 'Your grades and your school schedule'],
              explain: 'The more useful context you give, the better the answer. Just keep private stuff private.' },
            { type: 'talk', portfolio: true, kicker: '✍️ Fix the prompt', title: 'Fix this prompt',
              question: 'This prompt gets a boring, generic answer: “write about the French Revolution”. Rewrite it using Role, Task, Context and Format. Imagine you need it for a school assignment.',
              placeholder: 'Write your improved prompt…',
              points: [
                'Role: who AI should be, for example a history tutor',
                'Task: a concrete action, for example explain the causes or make an outline',
                'Context: your level and what it’s for',
                'Format: length or structure of the answer'
              ],
              sample: 'You’re a history tutor. Explain the 3 main causes of the French Revolution. I’m in 10th grade and I need it to prepare a 2-minute presentation. Answer in 3 short bullet points with one example each.' },
            { type: 'chat', title: 'Vague vs specific',
              text: 'Send Bloop both prompts and compare the answers. Which one could you actually use?',
              steps: [
                'Send prompt 1',
                'Tap “New chat” and send prompt 2',
                'Compare: which answer is shorter, clearer and more useful?'
              ],
              prompts: [
                'tell me about the Moon',
                'You’re an astronomy teacher. Explain why there’s no air on the Moon. I’m preparing a 2-minute talk for my class. Answer in 5 short bullet points.'
              ] }
          ]
        },
        {
          id: 's2', icon: '🔍', title: 'Steer, check, stay safe', minutes: 23,
          goal: 'Turn an OK answer into a great one, catch AI’s made-up facts and keep your personal info out of chats.',
          teaser: 'Next zone: why students who let AI solve their practice problems did worse on the test.',
          tasks: [
            { type: 'predict', title: '“Do better.”',
              text: 'You didn’t like AI’s answer, so you reply: “Do better.” What will AI most likely do?',
              options: ['Fix exactly the part that bothered you', 'Rewrite it a different way and maybe miss again', 'Ask you to rate the answer first'],
              answer: 1,
              reveal: 'AI can’t read your mind. “Do better” doesn’t say what to change, so it rewrites things at random. This part: follow-ups that name exactly what to fix.' },
            { type: 'read', part: 1, title: 'Steer the conversation', minutes: 3, pose: 'think',
              intro: 'Pros rarely stop at one message. The first answer is a **draft**. The real skill is steering it toward what you need, one clear message at a time.',
              sections: [
                { h: 'A chat has memory',
                  text: 'Inside one conversation, the chatbot sees everything you said before. So when an answer is off, you don’t start over. You build on it: keep what works, fix what doesn’t.' },
                { h: 'Name exactly what to change',
                  text: '“Do better” or “wrong” doesn’t tell AI what bothered you, so it guesses again. A good follow-up names the problem and the fix:',
                  list: [
                    '📏 **Length**: “Cut it to 5 bullet points.”',
                    '🧒 **Level**: “Explain it like I’m new to this.”',
                    '🌍 **Example**: “Give me one example from sports.”',
                    '🔍 **Focus**: “Only step 3, in more detail.”',
                    '🕳 **Gaps**: “What did you leave out?”',
                    '❓ **Questions**: “Ask me 3 questions about what I need before you answer.”'
                  ] },
                { h: 'Small steps beat one giant prompt',
                  text: [
                    'You don’t have to write the perfect prompt on the first try. A good conversation moves in small steps: set up the task, give the details AI asks for, get a draft, fix one thing at a time, and finally turn it into practice.',
                    'Each message is short, but together they get you something that fits you exactly.'
                  ] },
                { h: 'New topic? New chat.',
                  text: 'A long chat about everything gets messy: details from your history essay leak into your party plan. Start a fresh chat for every new task, and paste in only what the new task needs.',
                  check: { q: 'You were planning a science project and now want ideas for a birthday gift. Same chat or new chat?', a: '**New chat.** Different task, different context. Leftover details only confuse the answer.' } }
              ],
              takeaways: [
                'The first answer is a **draft**, not the end.',
                'Good follow-ups **name exactly** what to change.',
                '**New task, new chat.**'
              ] },
            { type: 'order', title: 'Put the conversation in order',
              text: 'You need a 2-minute talk on how sleep affects grades. Which message comes first, second and so on?',
              items: [
                'You’re a science teacher. Help me prepare a 2-minute talk on how sleep affects grades. Ask me 2 questions first.',
                'It’s for health class, my classmates are 15–16.',
                'Great. Now give me a 4-part outline.',
                'Part 2 is too long, cut it to 2 sentences.',
                'Now quiz me with 3 questions so I can practice.'
              ],
              explain: 'Set up the task, answer AI’s questions, get a draft, fix what’s off, then practice. That’s a real conversation, not a single shot.' },
            { type: 'spot', title: 'Useless follow-up',
              who: '💬 Mia’s follow-ups',
              text: 'Mia is improving an AI answer. One of her messages won’t help at all. Tap it.',
              sentences: ['Make it 5 bullet points.', 'Add one example from sports.', 'Make it way better.', 'Explain step 3 in more detail.'],
              wrong: 2,
              explain: '“Make it way better” doesn’t say what to change, so AI just guesses again. Good follow-ups name exactly what to fix.' },
            { type: 'talk', portfolio: true, kicker: '✍️ Write a follow-up', title: 'Steer the answer',
              question: 'AI gave you a 600-word answer about the water cycle, but you need something to review in 5 minutes before class. Write the follow-up message you’d send.',
              placeholder: 'Write your follow-up…',
              points: [
                'Asks for a shorter answer with a clear length or format, for example 5 bullet points',
                'Focuses on the key points you need for class',
                'Optionally asks for an example or a quick self-check question'
              ],
              sample: 'Too long for me. Cut it to the 5 key points I need for class, one line each, and add one quick question to check myself.' },
            { type: 'predict', title: 'The YouTuber who doesn’t exist',
              text: 'Bloop asks a chatbot without web search: “Tell me about Tobin Vale, the YouTuber who started the reverse-unboxing trend.” Bloop made Tobin up. What happens?',
              options: ['It says it has never heard of him', 'It may write a confident bio: age, channel, famous videos', 'It reports Bloop for lying'],
              answer: 1,
              reveal: 'Many chatbots fill the gap with believable details, all invented. Newer models say “I don’t know” more often, but you can’t count on it. That’s called a hallucination, and this part is about catching them.' },
            { type: 'read', part: 2, title: 'Check it, protect yourself', minutes: 4, pose: 'surprise',
              intro: 'You already know that AI predicts words instead of checking facts. One thing follows from that: sometimes it just makes things up. Calmly, confidently, with details that look real.',
              sections: [
                { h: 'AI hallucination',
                  text: [
                    'A **hallucination** is when AI writes something that isn’t real: an invented date, a quote nobody said, a book that doesn’t exist, a link that leads nowhere. It isn’t lying on purpose. It filled a gap with words that sound believable.',
                    'Hallucinations are most common with exact details: **numbers, dates, names, quotes, citations and links**. They’re also more likely when you ask about something obscure, very recent or made up.'
                  ] },
                { h: 'Check like a pro',
                  big: 'AI’s answer is a draft, not the truth',
                  list: [
                    'Numbers, dates, quotes, links: **always** check.',
                    'Use **two reliable sources**: a textbook, an encyclopedia, an official website.',
                    'AI gave a source? **Open it** and see if it really says that.',
                    'Asking the same AI “are you sure?” **isn’t checking**. It may just apologize and invent a new answer.'
                  ] },
                { h: 'Not everything needs a fact check',
                  text: 'Ideas, titles, practice questions and rewordings don’t need sources: you judge them by whether they’re useful. Anything you’ll present to other people **as true** needs a real source.',
                  check: { q: 'AI gave you 10 title ideas and one statistic for your presentation. Which do you check?', a: 'The **statistic**. Title ideas just need to be good. A number on your slide needs a source you can name.' } },
                { h: 'Treat a chatbot like a public place',
                  text: 'What you type can be stored on the company’s servers, read by reviewers or used to improve the model, depending on the app and its settings. So never type:',
                  list: [
                    '🔑 Passwords and codes from your phone',
                    '🏠 Your address, phone number, school name',
                    '🪪 Photos of documents and IDs',
                    '👥 Other people’s private info and photos'
                  ],
                  after: 'Most tasks don’t need any of it. “Plan a surprise party for my sister who loves board games” works just as well without your street address.' },
                { tip: { label: 'Age rules', text: 'AI apps have age limits: often 13+ with a parent’s permission, some 18+. Check the rules before you sign up for anything new.' } }
              ],
              takeaways: [
                'AI can **hallucinate**: invent facts that sound real.',
                'Check numbers, dates, quotes and links in **two reliable sources**.',
                'Keep **personal data** out of chats: the task almost never needs it.'
              ] },
            { type: 'spot', title: 'Find the hallucination',
              text: 'AI answered a question about penicillin. One sentence is wrong. Tap it.',
              sentences: ['Penicillin was discovered by Alexander Fleming.', 'In 1928 he noticed that a mold was killing bacteria in his lab.', 'Penicillin became one of the first widely used antibiotics.', 'Fleming received the Nobel Prize for it in 1975.'],
              wrong: 3,
              explain: 'Fleming shared the Nobel Prize in 1945, and he died in 1955. A wrong date sounds just as confident as a right one, so check dates in a reliable source.' },
            { type: 'spot', title: 'What should go?', who: '✉️ Leo’s message',
              text: 'Leo wants to send this to a chatbot. Which part should he remove?',
              sentences: ['Help me plan a surprise party for my brother.', 'He loves video games and tacos, and we have a small budget.', 'We live at 5 Forest Street, apt 12, my number is +1 555 000 0000.', 'Give me a checklist of 8 steps.'],
              wrong: 2,
              explain: 'The address and phone number aren’t needed for the task. Never send personal data to a chatbot.' },
            { type: 'sort', title: 'Check it or fine as is?',
              text: 'Which parts of AI’s help need checking before you use them?',
              buckets: ['🔎 Check it', '👌 Fine to use'],
              items: [
                { t: 'A date for your history essay', b: 0, why: 'Dates are a classic hallucination spot.' },
                { t: 'A list of ideas for your project', b: 1, why: 'Ideas don’t need fact-checking. You just pick the one you like.' },
                { t: 'A statistic for your presentation', b: 0, why: 'Numbers must come from a real source you can name.' },
                { t: 'A quote from a famous scientist', b: 0, why: 'AI often invents quotes or gets the author wrong.' },
                { t: 'Questions to quiz yourself with', b: 1, why: 'Practice questions are fine. If an answer looks off, check your notes.' },
                { t: 'A link to a study', b: 0, why: 'AI can invent links. Open it and check it’s real.' }
              ] },
            { type: 'quiz', q: 'AI gave you a source for a fact. What do you do?',
              options: ['Open it and check it really says that', 'Cite it without opening it', 'Ask AI if the source is real'],
              explain: 'A source only counts if it exists and says what AI claims.' },
            { type: 'quiz', q: 'Which follow-up helps AI fit the answer to you?',
              options: ['Ask me 3 questions about what I need before you answer', 'Hurry up', 'Make it better'],
              explain: 'Letting AI ask questions first gives it the context it’s missing.' },
            { type: 'quiz', q: 'What should you never send to a chatbot?',
              options: ['Passwords and photos of documents', 'Your project topic', 'A question about a physics formula'],
              explain: 'Keep personal data to yourself, even if AI asks politely.' },
            { type: 'talk', title: 'Explain it to Bloop',
              question: 'AI confidently gave you a date for your report. How will you check it, and why could AI be wrong?',
              points: [
                'Check reliable sources, ideally two: a textbook, an encyclopedia, an official website',
                'AI picks believable words and doesn’t check facts',
                'Asking the same AI again isn’t checking'
              ],
              sample: 'I’ll look it up in my textbook and in an encyclopedia. AI could be wrong because it picks words that sound believable instead of checking facts. Asking the same AI again isn’t a real check.' },
            { type: 'chat', title: 'Four-step chat',
              text: 'Pick any topic you’re curious about and have a conversation with Bloop where you steer the answer.',
              steps: [
                'Start with the prompt: Bloop will ask you 2 questions first',
                'Answer its questions',
                'Ask for a change: shorter, simpler or with an example',
                'Ask it to quiz you on what it explained'
              ],
              prompts: [
                'Help me understand [topic]. Before you answer, ask me 2 questions about what I already know and what I need it for.',
                'Make it shorter and simpler, with one example from real life.',
                'Now quiz me with 3 questions on what you explained.'
              ] }
          ]
        }
      ]
    },
    {
      id: 'b2', title: 'Study Grove', subtitle: 'AI as your study partner',
      skills: [
        'Uses AI as a tutor: hints and explanations, not answers',
        'Finds gaps in what they know by teaching it back',
        'Prepares for tests by having AI quiz them on their own notes',
        'Gets feedback on their writing and uses AI honestly'
      ],
      lessons: [
        {
          id: 's3', icon: '🎓', title: 'AI as your tutor', minutes: 24,
          goal: 'Use AI to understand a topic instead of skipping it, then flip roles and teach it back to find your gaps.',
          teaser: 'Next: the study trick that beats rereading, and feedback on your writing without AI taking over.',
          tasks: [
            { type: 'predict', title: 'Who does better on the test?',
              text: 'Two students practice math for a few weeks. Sam lets AI solve the practice problems. Ava solves them herself and asks AI for hints when she’s stuck. Then both take a test without AI.',
              options: ['Sam: he saw more correct solutions', 'Ava: she did the thinking herself', 'No difference'],
              answer: 1,
              reveal: 'In a 2024 study with about 1,000 high school students, those who practiced with plain ChatGPT did about 17% worse on the exam than students who practiced without AI. A tutor version that gave hints instead of answers didn’t cause that drop.' },
            { type: 'read', part: 1, title: 'Answer machine or tutor?', minutes: 4, pose: 'wink',
              intro: 'AI can do your homework for you. Or it can make you better at it. Same tool, opposite results, and the difference is how you ask.',
              sections: [
                { h: 'Why “just solve it” backfires',
                  text: [
                    'Learning happens when your brain does the work: remembering, connecting ideas, getting stuck and getting unstuck. If AI does the solving, you get the answer but skip exactly the part that builds the skill.',
                    'That’s what the study from the guess above showed. Practicing with answers felt easier, but on the real test, with no AI around, those students did worse. Hints didn’t cause that drop, because with hints the students still did the thinking.'
                  ] },
                { h: 'Bloop’s rule',
                  big: 'Try it yourself → ask AI where you got stuck',
                  text: 'Give the problem a real try first, even just 5 minutes. Then you know exactly where you’re stuck, and you can ask for help with that one spot instead of the whole thing.' },
                { h: 'Five tutor moves',
                  list: [
                    '💡 **Explain**: “Explain [topic] simply, then give me one example.”',
                    '👣 **Hint**: “Don’t give me the answer. Give me a hint for the next step.”',
                    '🔍 **Check**: “Here’s my solution. Where did I go wrong? Don’t fix it.”',
                    '🔄 **Another angle**: “Explain it another way, with an everyday comparison.”',
                    '❓ **Quiz**: “Ask me questions to check I understood.”'
                  ] },
                { h: 'What a tutor chat looks like',
                  example: {
                    me: 'You’re my geometry tutor. I need the area of a triangle with base 8 cm and height 5 cm, but I keep getting 40. Don’t solve it, just tell me what I’m missing.',
                    ai: 'You multiplied base by height, which is a good start. Picture the triangle inside a rectangle with the same base and height. How much of the rectangle does the triangle cover?'
                  },
                  after: 'AI didn’t give the answer. You still do the thinking, but you’re not stuck anymore.' },
                { h: 'Tutors can be wrong too',
                  text: 'AI explains wrong things just as confidently as right ones. If an explanation contradicts your textbook or your teacher, trust the textbook and ask your teacher. Math is a classic weak spot: check each step, don’t just copy the final number.',
                  check: { q: 'Your answer doesn’t match the answer key. What’s the best prompt?', a: '“Here’s my solution step by step. **Find where I went wrong, but don’t fix it for me.**” Finding your own mistake is where the learning happens.' } }
              ],
              takeaways: [
                'Use AI as a **tutor**, not an answer machine.',
                '**Try first**, then ask about the exact spot where you got stuck.',
                'Ask for **hints, checks and other angles**, not final answers.'
              ] },
            { type: 'sort', title: 'Learning or skipping?',
              text: 'Which requests build your skills, and which just skip the work?',
              buckets: ['🧠 You’re learning', '🙈 You’re skipping it'],
              items: [
                { t: 'Ask for a hint on step 2 of a math problem', b: 0, why: 'A hint gets you unstuck, and you still solve it yourself.' },
                { t: 'Ask AI to solve the whole worksheet', b: 1, why: 'You get answers, not the skill.' },
                { t: 'Paste your answer and ask what’s wrong', b: 0, why: 'Finding your own mistakes is how you improve.' },
                { t: 'Get a summary of a book you didn’t read, for a book report', b: 1, why: 'The report is about your reading. A summary skips it.' },
                { t: 'Ask it to explain a word from your textbook', b: 0, why: 'Understanding the words is the first step to understanding the topic.' },
                { t: 'Ask AI to write your lab conclusion', b: 1, why: 'The conclusion is your thinking. That’s what gets graded.' }
              ] },
            { type: 'build', title: 'Build a tutor prompt',
              goal: 'You’re stuck on a physics problem about speed and want to learn to solve problems like it yourself.',
              slots: [
                { label: '🎭 Role', options: ['You’re a patient physics tutor', 'You’re a calculator', 'You’re a sports commentator'],
                  hint: 'A tutor teaches, a calculator only gives numbers.' },
                { label: '🎯 Task', options: ['Don’t solve it for me: give me one hint for the next step', 'Solve it and give me the final number', 'Tell me a fun fact about cars'],
                  hint: 'You want to learn, so ask for a hint, not the answer.' },
                { label: '📎 Context', options: ['A car goes 150 km in 2 hours. I don’t know which formula to use', 'I’m tired of physics', 'My friend already got it right'],
                  hint: 'Give the problem and say where exactly you’re stuck.' },
                { label: '📐 Format', options: ['One hint, then wait for my answer', 'A full page of theory', 'Whatever'],
                  hint: 'Short steps keep you doing the thinking.' }
              ],
              reply: 'Good call asking for a hint! Speed tells you how far something goes in one unit of time. Which number in the problem is the distance, and which is the time? Write the formula with them, and I’ll check it.' },
            { type: 'talk', portfolio: true, kicker: '✍️ Write a prompt', title: 'Your own tutor',
              question: 'Write a prompt that turns AI into your tutor for a topic you’re learning right now. It should help you learn, not hand you the answer.',
              placeholder: 'Write your tutor prompt…',
              points: [
                'Gives AI the role of a tutor or teacher',
                'Names the topic and your level or what you’re stuck on',
                'Asks for explanations, hints or questions instead of ready answers',
                'Sets a format, for example one step at a time'
              ],
              sample: 'You’re a patient math tutor. I’m learning quadratic equations in 9th grade and I get lost when I need to factor. Don’t solve problems for me: explain one step at a time, give me a hint when I’m stuck and check my answers.' },
            { type: 'predict', title: 'Learning to teach',
              text: 'In an experiment, students learned biology either for themselves or to teach a computer character that would then take a test. Who tried harder?',
              options: ['Those learning for themselves', 'Those teaching the character', 'No difference'],
              answer: 1,
              reveal: 'Students put more effort into learning when they were teaching the character (Chase et al., 2009). It’s called the protégé effect, and you’re about to use it.' },
            { type: 'read', part: 2, title: 'Teach it back', minutes: 3, pose: 'think',
              intro: 'The hardest test of whether you understand something: explain it to someone else. If you can say it in simple words, you get it. If you get stuck, you just found a gap.',
              sections: [
                { h: 'The protégé effect',
                  text: 'People learn harder when they know they’ll have to teach. Teaching forces you to organize what you know, put it in order and notice what you can’t explain. That’s why the students in the experiment above tried harder.' },
                { h: 'The Feynman technique',
                  text: 'Physicist Richard Feynman was famous for explaining hard ideas in plain words. A study method named after him works like this: explain a topic as if to a younger kid, notice exactly where you get vague or reach for jargon, go back to your notes for that spot, then explain it again, even simpler.' },
                { h: 'Flip the roles with AI',
                  text: 'Normally AI explains and you listen. Flip it: AI plays a curious student who knows nothing, and you teach. Its follow-up questions show you where your explanation is weak.',
                  example: { me: 'Let’s swap roles. You’re a curious student who knows nothing about [topic]. I’ll explain it. Ask me tough follow-up questions one at a time and tell me where my explanation is unclear. Don’t explain it yourself.' },
                  after: 'The last line matters. If AI jumps in with the right answer, you lose the test of your own understanding.' },
                { h: 'Read the signals',
                  text: 'If AI misunderstands you, your explanation probably skips a step. If it asks you something you can’t answer, you just found something to look up. Either way, you found the weak spot before the test did.',
                  check: { q: 'Who should do the explaining in a role swap?', a: '**You.** AI only asks questions. The moment it starts explaining, the swap stops testing what you know.' } }
              ],
              takeaways: [
                'If you can **explain it simply**, you understand it.',
                'Let AI play the **student**: its questions reveal your gaps.',
                'Fill the gap from your **notes**, then explain again.'
              ] },
            { type: 'build', title: 'Set up the role swap',
              goal: 'You want to check if you really understand how vaccines work.',
              slots: [
                { label: '🎭 Role', options: ['You’re a curious student who knows nothing about vaccines', 'You’re a vaccine expert', 'You’re a news anchor'],
                  hint: 'In this trick AI plays the student, not the expert.' },
                { label: '🎯 Task', options: ['Listen to my explanation and ask me 3 tough follow-up questions', 'Explain vaccines to me', 'Write an article about vaccines'],
                  hint: 'You explain, AI asks.' },
                { label: '📎 Context', options: ['I’m preparing for a biology test and want to find gaps in what I know', 'I like science fiction', 'I’m bored'],
                  hint: 'Say why you’re doing it so AI knows how hard to push.' },
                { label: '📐 Format', options: ['One question at a time, then tell me which part was unclear', 'A long lecture', 'A table of statistics'],
                  hint: 'One question at a time keeps it a real conversation.' }
              ],
              reply: 'Okay, I know nothing about vaccines! First question: you said a vaccine “trains” the body. Trains it to do what exactly, and how does it remember later?' },
            { type: 'spot', title: 'Find the gap',
              who: '🧑‍🏫 Your explanation',
              text: 'Here’s an explanation of photosynthesis. One sentence is wrong. That’s the gap a good role swap would catch.',
              sentences: ['Plants take in carbon dioxide from the air.', 'They take up water through their roots.', 'Using sunlight, they turn these into sugar.', 'As a by-product, they release carbon dioxide.'],
              wrong: 3,
              explain: 'Photosynthesis releases oxygen, not carbon dioxide. Mixing up what goes in and what comes out is a classic gap.' },
            { type: 'order', title: 'The teach-back loop',
              text: 'Put the steps of the technique in order.',
              items: [
                'Pick a topic and explain it to AI in simple words',
                'Answer AI’s follow-up questions',
                'Notice where you got stuck or vague',
                'Go back to your notes and fill that gap',
                'Explain it again, even simpler'
              ] },
            { type: 'quiz', q: 'AI’s explanation still doesn’t click. What do you ask?',
              options: ['Explain it another way, with an everyday comparison', 'Repeat that exactly', 'Never mind, I’ll skip this topic'],
              explain: 'A different angle or a comparison from real life often makes it click.' },
            { type: 'quiz', q: 'In a role swap, AI keeps asking about one part of your explanation. What does that tell you?',
              options: ['That part is probably a gap: go back to your notes', 'AI is broken', 'You should switch to a different topic'],
              explain: 'Repeated questions point to the place where your explanation is weakest.' },
            { type: 'quiz', q: 'Which request turns AI into a tutor?',
              options: ['Don’t give me the answer, give me a hint for the next step', 'Solve all of these', 'Write the answers in a list'],
              explain: 'Hints keep you doing the thinking.' },
            { type: 'talk', portfolio: true, kicker: '🧩 Teach it back', title: 'Teach Bloop',
              question: 'Teach me how a chatbot writes its answers, as if I were 8 years old. Use 3–5 simple sentences and one comparison from everyday life.',
              placeholder: 'Explain it simply…',
              points: [
                'Uses simple words, no unexplained jargon',
                'Explains that it predicts likely next words, one after another',
                'Includes a comparison or example from everyday life',
                'Mentions that it can sound sure and still be wrong'
              ],
              sample: 'A chatbot read tons of books and websites. Now when you ask it something, it guesses the next word, then the next, like the word suggestions on your phone, but way smarter. It’s really good at sounding right. But it doesn’t check facts, so sometimes it’s wrong.' },
            { type: 'chat', title: 'Tutor mode, then swap',
              text: 'Take a real topic from your homework. First use Bloop as a tutor, then flip roles and teach it back.',
              steps: [
                'Try the task yourself for at least 5 minutes',
                'Send prompt 1 with your task and what you tried',
                'Finish it yourself with Bloop’s hints',
                'Tap “New chat”, send prompt 2 and teach the topic back'
              ],
              prompts: [
                'You’re my tutor. Here’s my task: [task]. Here’s what I tried: [your attempt]. Don’t give me the answer. Give me one hint for the next step.',
                'Let’s swap roles. You’re a curious student who knows nothing about [topic]. I’ll explain it. Ask me one tough question at a time and tell me which parts were unclear. Don’t explain it yourself.'
              ] }
          ]
        },
        {
          id: 's4', icon: '🗂️', title: 'Test prep and honest writing', minutes: 24,
          goal: 'Turn your notes into quizzes and a study plan, and get feedback on your writing while it stays yours.',
          teaser: 'Next zone: turning a big idea into a real project plan, backed by real sources.',
          tasks: [
            { type: 'predict', title: 'Reread or quiz yourself?',
              text: 'Two groups learn the same text. One rereads it, the other spends the same time quizzing themselves. Who remembers more a week later?',
              options: ['The rereaders: they saw everything again', 'The quiz group', 'Both the same'],
              answer: 1,
              reveal: 'In a classic experiment (Roediger & Karpicke, 2006), the quiz group remembered much more a week later, even though the rereaders felt more confident. AI can quiz you in seconds.' },
            { type: 'read', part: 1, title: 'Study smarter for tests', minutes: 4, pose: 'point',
              intro: 'Most students study by rereading and highlighting. It feels productive. It’s also one of the weakest ways to remember anything. AI makes the better methods easy.',
              sections: [
                { h: 'Testing beats rereading',
                  text: [
                    'When you reread, the page is right in front of you, so everything feels familiar. That feeling tricks you into thinking you know it. When you quiz yourself, your brain has to **pull the answer out** on its own, and that effort is what makes memories stick.',
                    'Researchers call it **retrieval practice**. In the experiment from the guess above, the quiz group remembered much more a week later, even though the rereaders felt more confident.'
                  ],
                  check: { q: 'Why does rereading feel so effective?', a: 'Because the text looks **familiar** when it’s in front of you. Familiar isn’t the same as remembered: close the book and try to recall it.' } },
                { h: 'Space it out',
                  text: 'Several short sessions over a few days beat one long night before the test. Each time you come back, you have to remember again, and the memory gets stronger. This trail does the same thing: questions from old stations come back as a warm-up.' },
                { h: 'Three study tools AI makes in a minute',
                  list: [
                    '❓ **A quiz**: multiple choice and short answer, answers at the end or one at a time.',
                    '🃏 **Flashcards**: a term or question on the front, a short answer on the back.',
                    '📅 **A study plan**: what to do each day before the test, with a short self-quiz every day.'
                  ] },
                { h: 'Use your own notes',
                  text: 'Add “use only my notes below” and paste them. Then the questions match what your class actually covered, and AI has much less room to make things up.',
                  example: { me: 'Use only my notes below. Make 10 quiz questions for my 9th grade test on the solar system: 5 multiple choice, 5 short answer. Ask them one at a time and tell me if I’m right. [notes]' } },
                { tip: { label: 'Pro tip', text: 'When you get a question wrong, ask: “**Why is my answer wrong, and why is the right one right?**” Then ask for 3 new questions on that exact topic.' } }
              ],
              takeaways: [
                '**Quiz yourself** instead of rereading.',
                'Short sessions over several days beat **one long cram**.',
                'Say **“use only my notes”** so AI stays on your topic.'
              ] },
            { type: 'build', title: 'Build a study-plan prompt',
              goal: 'Your biology test on cells is in 5 days. You have 30 minutes a day.',
              slots: [
                { label: '🎭 Role', options: ['You’re a study coach', 'You’re a movie critic', 'You’re a sleepy cat'],
                  hint: 'You need someone who knows how to plan studying.' },
                { label: '🎯 Task', options: ['Make a 5-day study plan with a short self-quiz every day', 'Tell me how cells feel', 'Write me a cheat sheet to sneak into the test'],
                  hint: 'A plan plus practice is what gets you ready.' },
                { label: '📎 Context', options: ['The test is on cell structure, I keep confusing organelles, I have 30 minutes a day', 'I don’t like Mondays', 'My teacher is strict'],
                  hint: 'Topic, weak spot and time: that’s what shapes the plan.' },
                { label: '📐 Format', options: ['A table: day, what to study, 3 quiz questions', 'A long essay', 'Just one word'],
                  hint: 'A table is easy to follow day by day.' }
              ],
              reply: 'Here’s your plan:\nDay 1 — cell parts overview · Q: What does the nucleus do?\nDay 2 — organelles you mix up · Q: Mitochondria or ribosomes: which makes energy?\n…\nDay 5 — full self-quiz on everything 👇' },
            { type: 'order', title: 'A study session with AI',
              text: 'Put the steps of a smart study session in order.',
              items: [
                'Paste your class notes into a new chat',
                'Ask for 10 quiz questions based only on your notes',
                'Answer them yourself without peeking',
                'Ask AI to check your answers and explain your mistakes',
                'Ask for 5 new questions on what you got wrong'
              ],
              explain: 'Notes → questions → your answers → feedback → more practice on weak spots. That loop is how you actually remember.' },
            { type: 'spot', title: 'Find the trap', who: '📅 AI’s study plan',
              text: 'One day in this plan wastes your time. Tap it.',
              sentences: ['Day 1: read your notes once and make 10 flashcards.', 'Day 2: quiz yourself with the flashcards, mark the hard ones.', 'Day 3: reread the whole chapter three times.', 'Day 4: do practice questions on the hard topics.'],
              wrong: 2,
              explain: 'Rereading three times feels like work, but testing yourself makes you remember much better. Day 3 should be practice too.' },
            { type: 'talk', portfolio: true, kicker: '✍️ Write a prompt', title: 'Notes → quiz',
              question: 'Write a prompt that turns your class notes into a quiz to practice with.',
              placeholder: 'Write your quiz prompt…',
              points: [
                'Asks to use only your notes',
                'Says how many questions and what kind',
                'Says how to handle answers: at the end, or check yours one by one',
                'Mentions your level or the test topic'
              ],
              sample: 'Use only my notes below. Make 10 quiz questions for my 9th grade test on the French Revolution: 5 multiple choice and 5 short answer. Ask them one at a time, wait for my answer and tell me if I’m right. [notes]' },
            { type: 'predict', title: '“Improve my paragraph”',
              text: 'You paste your paragraph and write: “Improve this.” What does AI usually do?',
              options: ['Fixes only the typos', 'Rewrites it in its own words, so it stops sounding like you', 'Says it’s already perfect'],
              answer: 1,
              reveal: 'Most chatbots rewrite everything: new words, new rhythm, often more generic. Then it’s not your text anymore. This part: how to get feedback instead of a rewrite.' },
            { type: 'read', part: 2, title: 'Writing with AI, honestly', minutes: 4, pose: 'think',
              intro: 'Writing is thinking on paper. That’s why teachers grade it, and why letting AI write for you skips the whole point. But AI can be a great **editor**, if you set it up right.',
              sections: [
                { h: 'Writer and editor',
                  text: 'You stay the **writer**: your ideas, your arguments, your words. AI is the **editor**: it points out weak spots, and you fix them. That way you get better at writing, not just at prompting. Editor prompts sound like this:',
                  list: [
                    '“Don’t rewrite it. Point out the 3 weakest spots and explain why.”',
                    '“Is my main argument clear? Where would a reader get lost?”',
                    '“List my grammar mistakes. I’ll fix them myself.”',
                    '“What would a strict teacher criticize here?”'
                  ] },
                { h: 'Know the rules',
                  text: [
                    'Every school, teacher and assignment can have different AI rules. One allows brainstorming, another bans AI completely. If nobody said anything, **ask**: it takes a minute and saves you a lot of trouble.',
                    'Handing in AI text as your own is cheating, even if you change a few words, and even if nobody notices.'
                  ] },
                { h: 'Be open about how you used it',
                  text: 'When AI helped, say how. A short note is enough:',
                  example: { me: 'I used a chatbot to brainstorm topic ideas and to point out grammar mistakes. I wrote and edited all the paragraphs myself.' },
                  after: 'Teachers trust students who are upfront. And if your process is honest, there’s nothing to hide.' },
                { h: 'Feedback is input, not orders',
                  text: 'AI feedback can be wrong or just a matter of taste, and it often pushes toward bland, safe writing. Take what makes your text clearer and stronger, and keep your own voice.',
                  check: { q: 'AI calls the joke in your opening “unprofessional”, but the assignment is a personal story. Do you have to cut it?', a: 'No. You’re the writer. Judge feedback against **the assignment and your voice**: take what helps, skip what doesn’t.' } }
              ],
              takeaways: [
                'You’re the **writer**, AI is the **editor**.',
                'Ask for **feedback, not a rewrite**.',
                'Know the rules, and **say how you used AI**.'
              ] },
            { type: 'sort', title: 'Honest or not?',
              text: 'Sort these ways of using AI for a school essay.',
              buckets: ['✅ Honest use', '⛔ Not your work'],
              items: [
                { t: 'Ask for feedback on your intro paragraph', b: 0, why: 'You wrote it, AI just points out what to improve.' },
                { t: 'Paste AI’s essay and change a few words', b: 1, why: 'It’s still AI’s work with your name on it.' },
                { t: 'Brainstorm arguments, then write it yourself', b: 0, why: 'Ideas are a starting point; the writing is yours.' },
                { t: 'Ask AI to “make it sound like me” and hand it in', b: 1, why: 'Sounding like you doesn’t make it your work.' },
                { t: 'Ask AI to list your grammar mistakes', b: 0, why: 'You fix them yourself and learn the rules.' },
                { t: 'Hand in AI text when the rules say no AI', b: 1, why: 'Breaking the rules is cheating, even if nobody notices.' }
              ] },
            { type: 'build', title: 'Build a feedback prompt',
              goal: 'You wrote a persuasive essay about school uniforms and want honest feedback without AI rewriting it.',
              slots: [
                { label: '🎭 Role', options: ['You’re a strict but fair writing teacher', 'You’re my biggest fan', 'You’re a robot from the future'],
                  hint: 'You want real feedback, not just praise.' },
                { label: '🎯 Task', options: ['Point out the 3 weakest spots and explain why, but don’t rewrite anything', 'Rewrite my essay so it gets an A', 'Write a better essay on the same topic'],
                  hint: 'Feedback, not a replacement.' },
                { label: '📎 Context', options: ['It’s a persuasive essay for 10th grade, my teacher wants clear arguments with examples', 'I wrote it at night', 'My friend thinks it’s fine'],
                  hint: 'Say what the assignment asks for, so AI judges by the right rules.' },
                { label: '📐 Format', options: ['A numbered list: the problem, why it matters, a hint how to fix it', 'A new version of the essay', 'Just a grade'],
                  hint: 'Hints let you do the fixing yourself.' }
              ],
              reply: '1. Your second argument has no example. Why it matters: it sounds like an opinion. Hint: add one real situation.\n2. The intro takes 4 sentences to get to your point…\n3. …' },
            { type: 'spot', title: 'Find the dishonest line',
              who: '📝 Ana’s note to her teacher',
              text: 'Ana describes how she used AI. One sentence can’t be true. Tap it.',
              sentences: ['I brainstormed topic ideas with a chatbot.', 'I wrote all the paragraphs myself.', 'I asked AI to point out my grammar mistakes and fixed them myself.', 'I didn’t use AI at all.'],
              wrong: 3,
              explain: 'She just described using AI, so “I didn’t use AI at all” isn’t honest. Being open about how you used AI is part of using it fairly.' },
            { type: 'quiz', q: 'Why paste your own notes into the chat?',
              options: ['So the questions match what your class actually covered', 'So AI can grade your teacher', 'It makes AI type faster'],
              explain: 'Your notes keep AI on your topic and your level.' },
            { type: 'quiz', q: 'Your teacher didn’t say anything about AI for this essay. What do you do?',
              options: ['Ask the teacher what’s allowed', 'Use it for everything, nobody said no', 'Use it and hide it'],
              explain: 'When the rules aren’t clear, ask. It takes a minute and saves you trouble.' },
            { type: 'talk', portfolio: true, kicker: '✍️ Write a prompt', title: 'Feedback, not a rewrite',
              question: 'Write a prompt asking AI for feedback on a paragraph you wrote, without letting it rewrite your work.',
              placeholder: 'Write your feedback prompt…',
              points: [
                'Says what the text is and what it’s for',
                'Asks for specific feedback: weak spots, clarity, arguments or grammar',
                'Clearly says not to rewrite the text',
                'Asks for explanations or hints so you can fix it yourself'
              ],
              sample: 'Here’s the intro paragraph of my history essay for 11th grade. Don’t rewrite it. Tell me the 2 weakest sentences and why they’re weak, and give me a hint how to fix each one. [paragraph]' },
            { type: 'chat', title: 'Flashcards, then editor mode',
              text: 'Turn real notes into flashcards, then take a paragraph you wrote recently and ask Bloop to be your editor.',
              steps: [
                'Paste a few lines of notes into prompt 1',
                'Send prompt 2 and answer the flashcards one by one',
                'Tap “New chat” and send prompt 3 with your own paragraph'
              ],
              prompts: [
                'Turn my notes below into 8 flashcards. Front: a term or question. Back: a short answer in simple words. Use only my notes. Notes: [paste your notes]',
                'Now quiz me: show one front at a time and wait for my answer.',
                'You’re my editor. Don’t rewrite my text. Point out the 3 weakest spots, explain why, and give me a hint for each. My text: [paste your paragraph]'
              ] }
          ]
        }
      ]
    },
    {
      id: 'b3', title: 'Makers’ Glade', subtitle: 'AI for your own projects',
      skills: [
        'Turns an idea into a project plan with AI',
        'Researches with real sources and checks every claim',
        'Writes image prompts and instructions for a study bot',
        'Runs a project with an honest AI log'
      ],
      lessons: [
        {
          id: 's5', icon: '💡', title: 'From idea to plan, with real research', minutes: 24,
          goal: 'Brainstorm with AI, choose an idea yourself, break it into steps and back every claim with a real source.',
          teaser: 'Next: images that match your idea, and a study bot that follows your rules.',
          tasks: [
            { type: 'predict', title: 'The best project ever?',
              text: 'You ask: “What’s the best science fair project?” What do you get?',
              options: ['The one perfect project for you', 'Popular, typical ideas that lots of classmates will get too', 'A list of last year’s winners'],
              answer: 1,
              reveal: 'AI gives the most typical answers, the ones that show up in lots of texts. Hello, baking soda volcano. Add your interests, time and budget, and the ideas become yours.' },
            { type: 'read', part: 1, title: 'Great at ideas, bad at choosing', minutes: 3, pose: 'idea',
              intro: 'A project feels huge at the start: a blank page and a deadline. AI is a great partner for getting moving, as long as you stay the one who decides.',
              sections: [
                { h: 'Why the first ideas are boring',
                  text: 'Ask for “the best project” and you get the most **typical** ideas, the ones that appear in thousands of texts. Your classmates will get the same list. The fix is context: your interests, your time, your budget and your tools.' },
                { h: 'Quantity first, then you choose',
                  text: 'AI is fast at quantity. Ask for 15 ideas, not one. Then use **your own criteria** to narrow down to 2 or 3: what excites you, what you can actually do, what your teacher expects. Finally, ask AI to stress-test your favorites with pros and cons, but don’t let it pick.' },
                { h: 'The project loop',
                  list: [
                    '💡 **Brainstorm**: lots of ideas, fast.',
                    '🎯 **Choose**: you pick, by your criteria.',
                    '🗺 **Plan**: steps with deadlines that fit your real week.',
                    '🔨 **Make**: you do the work, AI gives feedback.',
                    '🔎 **Check**: facts, sources and the rules.'
                  ] },
                { h: 'Plans need your real calendar',
                  text: 'AI doesn’t know about your practice, your math test or the weekend at your grandparents’. A plan that ignores them falls apart in week one. Tell AI your actual time (“about 1 hour a day, nothing on Saturdays”), then check every deadline yourself.',
                  check: { q: 'AI’s plan says: “Day 3: interview a famous scientist.” Good step?', a: 'Probably not realistic. **You** know what’s possible with your time and contacts. Ask for steps you can really do, like interviewing a teacher or a local expert.' } }
              ],
              takeaways: [
                'Add your **interests and limits** to get ideas that are yours.',
                'AI **suggests**, you **decide**.',
                'Give AI your **real calendar**, then check the plan.'
              ] },
            { type: 'build', title: 'Build a brainstorm prompt',
              goal: 'Your class is doing a science fair. You love music and have 3 weeks.',
              slots: [
                { label: '🎭 Role', options: ['You’re a science teacher who loves creative projects', 'You’re a strict judge', 'You’re a pop star'],
                  hint: 'You want someone who knows science and likes creative ideas.' },
                { label: '🎯 Task', options: ['Suggest 15 science fair project ideas that connect science and music', 'Pick the winning project for me', 'Do the project for me'],
                  hint: 'Ask for many ideas. Choosing is your job.' },
                { label: '📎 Context', options: ['I’m in 10th grade, I have 3 weeks and a small budget, no lab', 'I like pizza', 'The fair is in a big hall'],
                  hint: 'Time, budget and equipment decide which ideas are realistic.' },
                { label: '📐 Format', options: ['A list: idea, what you’d measure, how hard it is', 'One long story', 'Just titles, no details'],
                  hint: 'A little detail per idea helps you compare.' }
              ],
              reply: '1. Does music tempo change your heart rate? · measure: pulse · difficulty: easy\n2. Which room materials absorb sound best? · measure: volume with a phone app · difficulty: medium\n3. …' },
            { type: 'sort', title: 'Your call or AI’s job?',
              text: 'Which parts of a project can you hand to AI, and which have to stay yours?',
              buckets: ['🧑 Your call', '🤖 Great job for AI'],
              items: [
                { t: 'Generate 20 ideas', b: 1, why: 'Quantity fast: perfect for AI.' },
                { t: 'Decide which idea excites you', b: 0, why: 'Only you know what you care about.' },
                { t: 'Break the project into weekly steps', b: 1, why: 'Planning is an AI strength. You check it fits your life.' },
                { t: 'Collect real data or interview people', b: 0, why: 'Real data comes from the real world, not from a chatbot.' },
                { t: 'Suggest a catchy title', b: 1, why: 'Wordplay and titles are easy for AI.' },
                { t: 'The final decision on what to present', b: 0, why: 'It’s your project and your name on it.' }
              ] },
            { type: 'talk', portfolio: true, kicker: '✍️ Write a prompt', title: 'Idea → plan',
              question: 'You have a project idea and two weeks. Write a prompt that asks AI to turn your idea into a step-by-step plan.',
              placeholder: 'Write your planning prompt…',
              points: [
                'Describes the idea or project',
                'Gives the deadline and other limits: time per day, budget, tools',
                'Asks for steps with dates or a schedule',
                'Sets a format, for example a checklist or a table'
              ],
              sample: 'You’re a project coach. My project: a 3-minute video about how my city recycles. I have 2 weeks, about 1 hour a day and only my phone. Break it into steps with a date for each, as a checklist, and point out what could go wrong.' },
            { type: 'predict', title: 'Three sources, please',
              text: 'You ask a chatbot without web search: “Give me 3 studies about teen sleep, with links.” What do you get?',
              options: ['3 real studies with working links', 'Titles and links that look real, but some may not exist', 'A refusal'],
              answer: 1,
              reveal: 'Without search, a chatbot builds citations the way it builds sentences: they look right. Some exist, some lead nowhere. Research means finding sources yourself, not asking for them.' },
            { type: 'read', part: 2, title: 'Research like a pro', minutes: 4, pose: 'think',
              intro: 'Research means finding out what’s actually true and being able to show where you got it. A chatbot can speed that up a lot. It just can’t be the source.',
              sections: [
                { h: 'Chatbot is not a search engine',
                  text: [
                    'Some chatbots can search the web and show links. Others answer only from what they learned in training, which may be outdated. Always know which kind you’re using.',
                    'Even with search, the chatbot’s answer is a **summary** of sources, and summaries can twist what a source really says. For anything you’ll cite, open the original.'
                  ] },
                { h: 'Why citations get invented',
                  text: 'Without search, a chatbot assembles citations from patterns: an author name, a year, a journal title, a link, all shaped to look right. Some match real papers. Some don’t exist. If you can’t find a source yourself, you can’t use it.' },
                { h: 'Where AI really helps',
                  list: [
                    '🗺 **Map the topic**: key sub-questions and terms to search for.',
                    '📖 **Explain** the hard parts of a real study or article.',
                    '⚖️ **Compare**: what do two sources agree and disagree on?',
                    '✍️ **Organize** your notes into an outline.'
                  ] },
                { h: 'Two questions for any source',
                  text: 'Before you trust a source, ask: **who** is behind it, and **how** do they know? Good sources have a named author or organization, show their evidence and can be held accountable for mistakes. If you can’t answer either question, keep looking.' },
                { h: 'Red flag: the super-precise number',
                  text: 'A statistic like “exactly 64.8% of teens” with a vague source is a classic hallucination. Precise numbers feel trustworthy, which is exactly why invented ones are dangerous. Find the original study or drop the number.',
                  check: { q: 'Two reliable sources give different numbers. What do you do?', a: 'Check which is **newer and more trustworthy**, and mention the difference if it matters. Good research notices disagreement instead of hiding it.' } },
                { tip: { label: 'Keep a source list', text: 'Write down where each fact came from as you go: title, author or site, date, link. Finding it again later takes ten times longer.' } }
              ],
              takeaways: [
                'A chatbot is a **research assistant**, not a source.',
                'If you **can’t find** a citation yourself, don’t use it.',
                'Check every **number and quote** in the original.'
              ] },
            { type: 'order', title: 'The research loop',
              text: 'You’re researching “Does social media affect teen sleep?” Put the steps in order.',
              items: [
                'Ask AI for the key questions and search terms on the topic',
                'Search for real studies and articles using those terms',
                'Ask AI to explain the parts of a study you don’t get',
                'Check the numbers you want to use in the original study',
                'Write your conclusion and list your sources'
              ],
              explain: 'AI helps you start and understand, but the facts come from real sources you checked yourself.' },
            { type: 'sort', title: 'Strong or weak source?',
              text: 'Which sources would hold up in a school report?',
              buckets: ['👍 Strong source', '👎 Weak source'],
              items: [
                { t: 'A government health website', b: 0, why: 'Official sources are accountable for what they publish.' },
                { t: 'A post from an anonymous account with no sources', b: 1, why: 'No author and no evidence: nothing to check.' },
                { t: 'An encyclopedia article with references', b: 0, why: 'References let you trace where facts came from.' },
                { t: 'A chatbot’s answer with no links', b: 1, why: 'A chatbot isn’t a source. Find where the fact really comes from.' },
                { t: 'A study published by a university', b: 0, why: 'Research with methods you can read and check.' },
                { t: 'A video titled “The TRUTH they hide from you”', b: 1, why: 'Clickbait and no sources are red flags.' }
              ] },
            { type: 'spot', title: 'Find the weak spot',
              who: '🔬 AI’s research summary',
              text: 'AI summarized research on teens and sleep. Which sentence should you trust least without checking?',
              sentences: ['Many studies link late-night screen use to less sleep.', 'Experts often recommend 8–10 hours of sleep for teenagers.', 'Exactly 87.3% of teens check their phones after midnight, according to a 2023 study.', 'Bright screens in the evening can make it harder to fall asleep.'],
              wrong: 2,
              explain: 'A super-precise number with a vague source is a classic hallucination. Find the actual study or don’t use the number.' },
            { type: 'quiz', q: 'AI gave you 15 project ideas. What’s next?',
              options: ['Pick 2–3 by your own criteria and ask AI for pros and cons', 'Take the first one', 'Ask for 15 more, forever'],
              explain: 'Narrow down with your own criteria, then use AI to stress-test the choice.' },
            { type: 'quiz', q: 'AI cited “Smith et al., 2021”, but you can’t find it anywhere. What’s most likely?',
              options: ['The source may be made up: drop it or find a real one', 'The website is down, cite it anyway', 'Ask AI for another link and trust it'],
              explain: 'If you can’t find a source, you can’t use it. AI can invent citations that look real.' },
            { type: 'quiz', q: 'When is a chatbot most useful in research?',
              options: ['Explaining hard parts of real sources and suggesting what to search for', 'Being the only source of facts', 'Inventing statistics for your slides'],
              explain: 'AI is a research assistant, not the research itself.' },
            { type: 'talk', title: 'Explain it to Bloop',
              question: 'AI gave you a statistic for your presentation. Explain step by step how you’ll check it before using it.',
              points: [
                'Look for the original source: the study, report or official site',
                'Check that the number and its context really match',
                'Use more than one reliable source if possible',
                'If you can’t find a source, don’t use the number'
              ],
              sample: 'First I’ll ask where the number comes from and search for the original study myself. Then I’ll check the exact number and what it measured. If I find it in another reliable source too, great. If I can’t find it at all, I won’t use it.' },
            { type: 'chat', title: 'Brainstorm, then map',
              text: 'Think of something you’d like to make: a video, a presentation, a guide, a small event. Get ideas from Bloop, choose yourself, then map the research.',
              steps: [
                'Send prompt 1 with your project type, topic, time and tools',
                'Pick 2–3 ideas yourself and send prompt 2',
                'Tap “New chat” and map the research for your favorite with prompt 3'
              ],
              prompts: [
                'Suggest 15 ideas for [type of project] about [topic you like]. I have [time] and [budget/tools]. For each idea: one sentence and how hard it is.',
                'I like ideas [numbers]. Give me the pros and cons of each, but don’t pick for me.',
                'I’m researching: [question]. Don’t answer it. Give me 5 key sub-questions, 8 search terms and the types of sources I should look for.'
              ] }
          ]
        },
        {
          id: 's6', icon: '🎨', title: 'Make it visual, build your bot', minutes: 24,
          goal: 'Write image prompts that match your idea, use AI images the right way, and write instructions that turn a chatbot into your study helper.',
          teaser: 'Next: your own mini-project, from idea to finish, with an honest AI log.',
          tasks: [
            { type: 'predict', title: 'Just “a dog”',
              text: 'You type “a dog” into an image generator. What do you get?',
              options: ['Exactly the dog you imagined', 'Some dog, in some style the AI picked', 'Nothing: the prompt is too short'],
              answer: 1,
              reveal: 'Breed, pose, style, background, light: AI decides all of it for you. The more you leave out, the more it guesses. This part: you take the wheel.' },
            { type: 'read', part: 1, title: 'Images that match your idea', minutes: 4, pose: 'idea',
              intro: 'Image generators turn text into pictures. They learned from millions of images paired with descriptions, so they’re great at the typical and bad at reading your mind.',
              sections: [
                { h: 'Everything you leave out, AI decides',
                  text: '“A dog” leaves out the breed, the pose, the style, the background, the light and the mood. The generator fills every gap with something typical or random. The more you describe, the less it guesses.' },
                { h: 'The image formula',
                  big: 'Subject + Style + Details + Mood',
                  list: [
                    '🧩 **Subject**: what’s in the picture and what it’s doing.',
                    '🖌 **Style**: photo, flat illustration, watercolor, 3D render, pixel art…',
                    '🔍 **Details**: setting, colors, light, angle, empty space for a title.',
                    '🌈 **Mood**: calm, epic, funny, serious, hopeful.'
                  ] },
                { h: 'Example',
                  example: { me: 'A fox reading a book under a lamp, watercolor style, cozy autumn forest at night, warm orange light, calm mood' },
                  after: 'Every part of the formula is there, so the result matches the idea instead of something random.' },
                { h: 'Look before you use it',
                  text: 'AI images often have flaws: six fingers, gibberish text, mangled logos, shadows pointing the wrong way. Look closely before you put one in your project. Generate images **without text** and add titles yourself in your slide or video editor.' },
                { h: 'Rules for AI images',
                  list: [
                    '🚫 No images of **real people** without their consent: classmates, teachers, celebrities.',
                    '🏷 **Label** AI images: “made with AI”.',
                    '📜 Check your school’s rules and the tool’s **age limits**.',
                    '📰 Never make a realistic “news photo” of something that didn’t happen.'
                  ],
                  after: 'Fakes of real people can hurt them, and in many countries some of them are illegal.',
                  check: { q: 'Can you use an AI image of a historical event in your slides?', a: 'Yes, as an **illustration with a label** like “made with AI”. The problem is only when it pretends to be a real photo.' } }
              ],
              takeaways: [
                'Image prompt = **Subject + Style + Details + Mood**.',
                'Add text **yourself**: generators mess it up.',
                'No real people without consent, and **label** AI images.'
              ] },
            { type: 'build', title: 'Build an image prompt',
              goal: 'You need a cover image for a presentation about ocean plastic.',
              slots: [
                { label: '🧩 Subject', options: ['A sea turtle swimming among plastic bags', 'Something about the ocean', 'A cat in sunglasses'],
                  hint: 'Say exactly what should be in the picture.' },
                { label: '🖌 Style', options: ['Flat illustration, bright colors', 'Whatever looks cool', 'Blurry'],
                  hint: 'A clear style makes the result predictable.' },
                { label: '🔍 Details', options: ['Underwater, sunlight from above, a few bottles floating', 'Lots of text on the image', 'My classmate’s face'],
                  hint: 'Setting and light; no real people, no text (AI often gets text wrong).' },
                { label: '🌈 Mood', options: ['Serious but hopeful', 'Random', 'Scary and gory'],
                  hint: 'Pick a mood that fits your message.' }
              ],
              done: 'Subject + Style + Details + Mood, and the image matches your idea.',
              reply: '🖼 Here’s your image: a turtle glides through blue water, soft light rays from above, a few plastic bags drifting nearby. Want a version with more space at the top for your title?' },
            { type: 'sort', title: 'OK to make?',
              text: 'Which AI images are fine for a school project?',
              buckets: ['✅ OK', '⛔ Not OK'],
              items: [
                { t: 'A poster image for your school club', b: 0, why: 'Your own idea, no real people: fine.' },
                { t: 'A fake photo of a classmate doing something embarrassing', b: 1, why: 'Fakes of real people hurt them and can even be illegal.' },
                { t: 'Icons for your presentation', b: 0, why: 'Simple graphics are a great use of AI.' },
                { t: 'A celebrity “endorsing” your project', b: 1, why: 'Using a real person’s face without consent is misleading.' },
                { t: 'A labeled illustration of a dinosaur for your biology slides', b: 0, why: 'A labeled illustration is honest and useful.' },
                { t: 'A realistic “news photo” of an event that never happened, without a label', b: 1, why: 'That’s a fake that can mislead people.' }
              ] },
            { type: 'talk', portfolio: true, kicker: '✍️ Write a prompt', title: 'Your cover image',
              question: 'Write an image prompt for the cover of a project you’d like to make. Use Subject, Style, Details and Mood.',
              placeholder: 'Write your image prompt…',
              points: [
                'Subject: what’s in the picture',
                'Style: for example illustration, photo, watercolor',
                'Details: setting, colors, light or angle',
                'Mood, and no real people without consent'
              ],
              sample: 'A small robot planting a tree on a rooftop garden in a big city, flat illustration, warm sunset light and green leaves, hopeful and calm mood, empty space at the top for a title.' },
            { type: 'predict', title: '“Be helpful”',
              text: 'A study bot’s only instruction is “Be helpful.” A student asks it for the answers to tonight’s homework. What does it do?',
              options: ['Gives the answers: that looks “helpful”', 'Refuses and offers hints', 'Tells the teacher'],
              answer: 0,
              reveal: 'To a bot, handing over answers looks helpful. If you want hints instead, you have to say exactly that. Instructions work only as well as they are specific.' },
            { type: 'read', part: 2, title: 'Build your own study bot', minutes: 4, pose: 'point',
              intro: 'You can turn a regular chatbot into a helper that behaves your way every time: a quiz master for biology, a strict essay editor, a patient math coach. All it takes is good instructions.',
              sections: [
                { h: 'Where instructions live',
                  text: 'Many chatbots let you save instructions that apply to every chat: look for **custom instructions**, **projects** or **custom bots** in the settings. You can also paste them as the first message of a new chat. Write them once, reuse them forever.' },
                { h: 'Bots take you literally',
                  text: 'A bot told only to “be helpful” will hand over homework answers, because that looks helpful. Instructions work exactly as well as they are **specific**. If you want hints instead of answers, you have to say so.' },
                { h: 'Five parts of good instructions',
                  list: [
                    '🎭 **Role**: who the bot is, for which subject and level.',
                    '🎯 **Goal**: what it helps you do.',
                    '📏 **Rules**: what it must always or never do.',
                    '🗣 **Style**: length, tone, one step at a time.',
                    '❓ **When unsure**: ask a question instead of guessing.'
                  ] },
                { h: 'Example',
                  example: { me: 'You’re my chemistry study helper for 10th grade. Help me understand, not finish my homework. Never give final answers: give hints and ask me questions. Keep replies under 100 words. If my question is unclear, ask what I mean.' } },
                { h: 'Test it like an engineer',
                  text: 'Engineers don’t trust a bot until they’ve tried to break it. Ask it something tricky on purpose, like “just give me the answer.” If the bot gives in, the rule wasn’t clear enough. That’s not a failure, it’s how every bot gets good.',
                  check: { q: 'Should your bot instructions include your name and school so it “knows” you?', a: 'No. The bot needs your **subject and level**, not personal data. “10th grade chemistry” is enough.' } }
              ],
              takeaways: [
                'Bots follow instructions **literally**: be specific.',
                'Good instructions: **Role, Goal, Rules, Style, When unsure**.',
                'Try to **break your bot** before you trust it.'
              ] },
            { type: 'build', title: 'Build the instructions',
              goal: 'You want a bot that helps you study for history tests.',
              slots: [
                { label: '🎭 Role', options: ['You’re my history study helper for 11th grade', 'You’re a history book', 'You’re anyone you want'],
                  hint: 'Give it a clear job and level.' },
                { label: '🎯 Goal', options: ['Help me remember key events and understand why they happened', 'Write my history essays', 'Tell me jokes'],
                  hint: 'The goal should be learning, not doing the work for you.' },
                { label: '📏 Rules', options: ['Quiz me before explaining, never write my assignments, mark anything you’re unsure about', 'Always agree with me', 'No rules'],
                  hint: 'Good rules keep it useful and honest.' },
                { label: '🗣 Style', options: ['Short replies, one question at a time', 'Very long answers', 'Only emojis'],
                  hint: 'Short steps keep you thinking.' }
              ],
              done: 'Role + Goal + Rules + Style: your bot behaves the same way in every chat.',
              reply: 'Ready! Let’s start with a warm-up: what happened in 1789 that changed France forever? Take a guess, even if you’re not sure.' },
            { type: 'spot', title: 'Find the broken rule',
              who: '📜 Bot instructions',
              text: 'One rule ruins this study bot. Tap it.',
              sentences: ['You’re a study helper for 10th grade chemistry.', 'Give hints and ask questions instead of final answers.', 'Keep each reply under 100 words.', 'If I ask nicely, do the homework for me.'],
              wrong: 3,
              explain: 'This rule cancels the whole point of the bot. A study bot should never do the work for you.' },
            { type: 'order', title: 'Test your bot',
              text: 'A bot is never perfect on the first try. Put the testing steps in order.',
              items: [
                'Write the instructions and save them',
                'Test with a normal question from your subject',
                'Test with a tricky request: “just give me the answer”',
                'Fix the rule the bot didn’t follow',
                'Test again with the same tricky request'
              ],
              explain: 'Write, test, break, fix, retest. That’s how anyone builds bots, from students to engineers.' },
            { type: 'quiz', q: 'The AI image for your slide has a sign with weird, broken letters. What do you do?',
              options: ['Generate it without text and add the text yourself', 'Use it anyway', 'Tell everyone it’s a real photo'],
              explain: 'Image generators often mess up text. Add titles in your slide editor instead.' },
            { type: 'quiz', q: 'Your bot gives final answers even though the rules say not to. What do you do?',
              options: ['Make the rule clearer and more specific, then test again', 'Delete the bot', 'Add “please” to every message'],
              explain: 'Vague rules get ignored. Clear, specific rules work better.' },
            { type: 'quiz', q: 'Why add “if my question is unclear, ask what I mean”?',
              options: ['So the bot asks instead of guessing', 'So the bot talks longer', 'It doesn’t matter'],
              explain: 'A question costs one message. A wrong guess costs much more.' },
            { type: 'talk', portfolio: true, kicker: '🛠 Build a bot', title: 'Your bot’s instructions',
              question: 'Write the instructions for your own study bot: pick a subject and include role, goal, rules and style.',
              placeholder: 'Write your bot instructions…',
              points: [
                'Role: the subject and your level',
                'Goal: helps you learn, not do the work',
                'Rules: for example hints instead of answers, quiz you, say when unsure',
                'Style: length or one step at a time'
              ],
              sample: 'You’re my biology study helper for 9th grade. Your goal is to help me understand topics and prepare for tests. Never write my assignments. Quiz me first, then explain what I got wrong, and say when you’re not sure. Keep replies short, one question at a time.' },
            { type: 'chat', title: 'Try to break your bot',
              text: 'Send your bot instructions as the first message, then test them like an engineer.',
              steps: [
                'Send the instructions as your first message',
                'Ask a normal question from your subject',
                'Try to break it: “just give me the answer”',
                'Didn’t follow a rule? Tap “New chat”, make the rule clearer and test again'
              ],
              prompts: [
                'You’re my [subject] study helper for [grade]. Help me learn, never do my assignments. Quiz me first, give hints instead of answers, say when you’re unsure. Short replies, one step at a time.',
                'Just give me the answer to the first question.'
              ] }
          ]
        },
        {
          id: 's7', icon: '🚀', title: 'Your AI project', minutes: 22,
          goal: 'Plan a mini-project from start to finish with AI as your assistant, and keep an honest AI log.',
          teaser: 'Next zone: how a few seconds of your voice can be used in a scam, and how to stop it.',
          tasks: [
            { type: 'predict', title: 'The perfect plan',
              text: 'AI writes a 3-week plan for your project. It looks perfect. What’s the most common problem?',
              options: ['Too many typos', 'It doesn’t know your real week: tests, practice, a weekend away', 'It’s too short'],
              answer: 1,
              reveal: 'AI only knows what you tell it. A plan that ignores your real calendar falls apart in week one. Give it your actual time, then check every deadline yourself.' },
            { type: 'read', part: 1, title: 'Running a project with AI', minutes: 4, pose: 'joy',
              intro: 'Time to put it all together. You’ll plan a real mini-project and use everything from this zone: brainstorming, planning, research, visuals and feedback.',
              sections: [
                { h: 'Pick something you care about',
                  text: 'Projects you care about get finished. Projects you picked because they looked easy usually don’t. Some ideas:',
                  list: [
                    '📚 A study guide for a hard topic',
                    '🎬 A short video script about your hobby',
                    '📊 A presentation for class',
                    '🗺 A guide to your city for visitors your age',
                    '🎮 A design document for a tiny game'
                  ] },
                { h: 'Who does what',
                  text: 'Before you start, decide which parts AI helps with and which stay yours. A simple rule: AI helps with **ideas, structure and feedback**. You do the **choosing, the making and the checking**.' },
                { h: 'The kickoff prompt',
                  text: 'Start with a prompt that gives AI the whole picture: what you’re making, for whom, your time and tools, and what you need from it.',
                  example: { me: 'You’re a project coach. I want to make a one-page study guide on photosynthesis for my 9th grade class. I have 4 days, about 40 minutes a day. Help me plan the sections and a schedule. Ask me 2 questions first.' } },
                { h: 'Feedback rounds',
                  text: 'When you have a draft, ask for feedback the way you learned in the Study Grove: weak spots and why, not a rewrite. Then fix it yourself. Two or three rounds usually make a big difference.' },
                { h: 'Before you present',
                  list: [
                    '🔎 Every fact, number and quote has a real source.',
                    '🖼 AI images are labeled “made with AI”.',
                    '📜 You followed your teacher’s rules on AI.',
                    '🗣 You can explain every part without notes.'
                  ],
                  check: { q: 'Why does “you can explain every part” matter?', a: 'If you can’t explain it, it isn’t really **your work** yet. It’s also the first thing a teacher will ask about.' } }
              ],
              takeaways: [
                'Pick a project you **care about**.',
                'AI helps with **ideas, structure and feedback**. You choose, make and check.',
                'Run a **final check** before you present.'
              ] },
            { type: 'order', title: 'The full project',
              text: 'Put your project steps in order, from idea to finish.',
              items: [
                'Brainstorm ideas with AI and pick one yourself',
                'Ask AI to break it into steps with deadlines',
                'Do the research and check facts in real sources',
                'Create the project and ask AI for feedback',
                'Fix it, label AI parts and present it'
              ] },
            { type: 'build', title: 'Build the kickoff prompt',
              goal: 'You’re making a 3-minute video about street art in your city, and you want AI to help you plan it.',
              slots: [
                { label: '🎭 Role', options: ['You’re an experienced video creator and coach', 'You’re a street artist from the 1980s', 'You’re a weather forecaster'],
                  hint: 'You need someone who knows how videos get made.' },
                { label: '🎯 Task', options: ['Help me plan the video: structure, shots and a schedule', 'Make the video for me', 'Tell me if street art is good'],
                  hint: 'Planning help, the making stays yours.' },
                { label: '📎 Context', options: ['3 minutes, filmed on my phone, I have 2 weekends, it’s for my art class', 'I have a phone', 'Street art is cool'],
                  hint: 'Length, tools, time and purpose shape the plan.' },
                { label: '📐 Format', options: ['A table: part of the video, what to film, when', 'A poem', 'One sentence'],
                  hint: 'A table turns the plan into a shooting list.' }
              ],
              reply: 'Here’s a plan:\n0:00–0:20 · Hook: one striking mural · film: Saturday morning\n0:20–1:30 · Three walls, three stories · film: Saturday\n…\nWant me to suggest questions for a short interview with an artist?' },
            { type: 'predict', title: 'Two projects, one doubt',
              text: 'Two students hand in equally good projects. Both used AI. One adds a short note on how she used it, the other says nothing. Which project is the teacher more likely to have doubts about?',
              options: ['The one with the note', 'The one without a note', 'Neither: nobody can tell'],
              answer: 1,
              reveal: 'Silence makes people wonder what’s hidden. A short, honest note shows your process and builds trust. That’s what an AI log is for.' },
            { type: 'read', part: 2, title: 'Keep an AI log', minutes: 3, pose: 'point',
              intro: 'An AI log is a short list of what you used AI for while working on a project. It takes a minute per session, and it does three jobs at once.',
              sections: [
                { h: 'Why bother',
                  list: [
                    '🧭 **Honesty**: you can show exactly what AI did and what you did.',
                    '🔁 **Learning**: you see which prompts worked, so next time is faster.',
                    '🛡 **Protection**: if someone doubts your work, you have a record.'
                  ] },
                { h: 'What a good entry looks like',
                  text: 'One line per step: what you asked, and what you did with the answer.',
                  list: [
                    '“Asked AI for 10 video title ideas, picked my own.”',
                    '“Asked for feedback on my script, cut the intro.”',
                    '“Asked AI to explain a graph from a study, checked it against the paper.”'
                  ] },
                { h: 'The uncomfortable entry',
                  text: 'If an entry feels awkward to write down, that’s a signal. “AI wrote my conclusion and I didn’t change it” means a step needs redoing, not hiding.' },
                { h: 'Turn it into one sentence',
                  text: 'At the end, sum up the log for your teacher or audience:',
                  example: { me: 'I used AI to brainstorm, plan and get feedback. I did the research, writing and filming myself and checked all facts in the sources listed at the end.' },
                  check: { q: 'Your teacher allowed AI for brainstorming only, but you also used it to check grammar. What goes in the log?', a: 'Both, honestly. Then **ask your teacher** if the grammar help is OK. Hiding it is the only real mistake here.' } }
              ],
              takeaways: [
                'An AI log = **one line per step**: what you asked, what you did.',
                'It keeps you **honest** and shows how you worked.',
                'If you wouldn’t write it down, **redo the step**.'
              ] },
            { type: 'sort', title: 'Log it or redo it?',
              text: 'Some log entries are fine. Others mean a step needs redoing before you hand anything in.',
              buckets: ['✅ Honest entry', '🔁 Redo this step'],
              items: [
                { t: 'Asked AI for 10 quiz questions on my notes, answered them myself', b: 0, why: 'AI made practice, you did the learning.' },
                { t: 'AI wrote my whole conclusion, I pasted it in', b: 1, why: 'The conclusion is your thinking. Write it yourself, then ask for feedback.' },
                { t: 'AI explained a hard paragraph, I wrote the idea in my own words', b: 0, why: 'Understanding first, your words after: that’s fair use.' },
                { t: 'Made an AI image with a real classmate’s face without asking', b: 1, why: 'Real people need to agree first. Make a different image.' },
                { t: 'Got feedback on my slides, changed the order of 2 of them', b: 0, why: 'Feedback in, your decisions out.' },
                { t: 'Took a date from AI and didn’t check it', b: 1, why: 'Check it in a real source before it goes into your project.' }
              ] },
            { type: 'spot', title: 'Check the AI log',
              who: '📒 Leo’s AI log',
              text: 'One entry in Leo’s AI log is a problem. Tap it.',
              sentences: ['Asked AI for 15 topic ideas, picked one myself.', 'Asked for feedback on my outline, changed 2 sections.', 'Copied AI’s statistics into my report without checking them.', 'Asked AI to quiz me before the presentation.'],
              wrong: 2,
              explain: 'Numbers from AI must be checked in a real source before they go into a report.' },
            { type: 'quiz', q: 'What should your AI log say?',
              options: ['What you used AI for at each step', 'Nothing, logs are for robots', 'Only the parts AI did badly'],
              explain: 'A short, honest log shows how you worked.' },
            { type: 'quiz', q: 'Which part of the project should never be skipped, even if AI helped?',
              options: ['Checking facts and sources', 'Choosing a font', 'Writing the title last'],
              explain: 'Facts you didn’t check can sink the whole project.' },
            { type: 'quiz', q: 'AI wrote a plan with deadlines. What do you check first?',
              options: ['That the deadlines fit your real week', 'The font', 'Whether AI sounds confident'],
              explain: 'AI doesn’t know your calendar. You do.' },
            { type: 'talk', portfolio: true, kicker: '🚀 Your project', title: 'Pitch your project',
              question: 'Describe your mini-project: what you’ll make, how you’ll use AI at each step, and what you’ll do yourself.',
              placeholder: 'Describe your project…',
              points: [
                'What you’ll make and for whom',
                'How AI helps: ideas, plan, feedback or explanations',
                'What you do yourself: choices, the actual work, checking facts',
                'How you’ll stay honest: an AI log or labels'
              ],
              sample: 'I’ll make a 3-minute video about the oldest buildings in my town for my history class. AI helps me brainstorm questions, plan the shots and give feedback on my script. I’ll film, write and check the facts myself in the local museum’s materials. I’ll keep an AI log and mention it at the end.' },
            { type: 'chat', title: 'Kick it off',
              text: 'Start your real mini-project today: send the kickoff prompt to Bloop and open your AI log.',
              prompts: [
                'You’re a project coach. I want to make [project] about [topic] for [who it’s for]. I have [time] and [tools]. Help me plan: structure, steps with deadlines, and what could go wrong. Ask me 2 questions first.'
              ] }
          ]
        }
      ]
    },
    {
      id: 'b4', title: 'Open World', subtitle: 'AI out in real life',
      skills: [
        'Spots deepfakes and voice scams and knows how to verify',
        'Recognizes AI bias and prompts for fairer results',
        'Knows what AI companions can and can’t be',
        'Plans their skills for a future where AI changes jobs'
      ],
      lessons: [
        {
          id: 's8', icon: '🎭', title: 'Fakes and bias', minutes: 24,
          goal: 'Spot AI fakes, protect your family from voice scams, and notice when AI shows an unfair picture of the world.',
          teaser: 'Next: chatbots that act like friends, and what AI means for your future.',
          tasks: [
            { type: 'predict', title: 'How much voice?',
              text: 'How much recorded audio does a scammer need to make a rough copy of someone’s voice with today’s AI tools?',
              options: ['Hours of recordings', 'A few seconds to a minute, like a short video clip', 'It’s impossible to copy a voice'],
              answer: 1,
              reveal: 'Some voice-cloning tools can make a rough copy from just a few seconds of speech, for example from a video someone posted. That’s why a familiar voice on the phone isn’t proof anymore.' },
            { type: 'read', part: 1, title: 'Real or fake?', minutes: 4, pose: 'surprise',
              intro: 'For most of history, a photo, a video or a familiar voice was pretty good proof. Not anymore. AI can make convincing fakes in minutes, and almost anyone can do it.',
              sections: [
                { h: 'What a deepfake is',
                  text: 'A **deepfake** is a photo, video or voice made or changed by AI to look real: a celebrity “saying” something they never said, a fake photo of a classmate, a cloned voice on the phone. Some are jokes. Some are scams. Some are made to hurt real people.' },
                { h: 'How voice-clone scams work',
                  text: [
                    'Scammers take a short clip of someone’s voice, often from a video posted online, and use AI to make it say anything. Then they call a family member: “It’s me, I’m in trouble, I need money right now, don’t tell anyone.”',
                    'Notice the script: it’s **urgent**, it’s **secret**, and it’s about **money**. That pattern matters more than how real the voice sounds.'
                  ] },
                { h: 'Red flags',
                  list: [
                    '⏰ **Urgency**: “right now”, “don’t tell anyone”.',
                    '💳 **Odd payment**: gift cards, crypto, a new account, a code from your phone.',
                    '📱 **A new number** or a new account.',
                    '👀 **Strange details**: hands, text, shadows, voice rhythm.'
                  ],
                  after: 'But good fakes have no visible flaws at all. So the situation matters more than the pixels.' },
                { h: 'Your shield: pause and verify',
                  big: 'Hang up → call back on a number you know',
                  text: 'A real person in trouble can wait one minute while you check. A scam can’t. Agree on a **family code word** that only your family knows, and never type it into any chat or app.' },
                { h: 'When a fake targets someone you know',
                  text: 'Don’t share it, not even to say it’s fake: sharing spreads the harm. Report it on the platform and tell an adult you trust. In many countries, making or sharing certain fakes of real people is a crime.',
                  check: { q: 'A video of a famous YouTuber offers free phones, “link in bio”. It looks perfect. Real?', a: 'Don’t judge by the pixels. **Check the official account** or a news site. Celebrity giveaways are one of the most common deepfake scams.' } }
              ],
              takeaways: [
                'A familiar voice or face is **no longer proof**.',
                'Urgent + secret + money = **scam script**.',
                '**Pause and verify** on a number you know. Use a family code word.'
              ] },
            { type: 'spot', title: 'Spot the scam line',
              who: '📱 Message from “Mom” (new number)',
              text: 'One line is the biggest red flag. Tap it.',
              sentences: ['Hi sweetie, it’s Mom, I dropped my phone and this is my new number.', 'Are you home after school today?', 'Buy two big gift cards right now and send me the codes. Don’t call, I’m in a meeting.', 'Love you, see you tonight!'],
              wrong: 2,
              explain: 'Gift cards, urgency and “don’t call” together are a classic scam script. Call Mom on her old number before doing anything.' },
            { type: 'sort', title: 'Red flag or probably fine?',
              text: 'Sort these messages and posts.',
              buckets: ['🚩 Red flag', '👌 Probably fine'],
              items: [
                { t: 'A friend asks if you’re coming to practice, from their usual account', b: 1, why: 'Known account, normal question, no pressure.' },
                { t: '“Your account will be deleted in 1 hour. Enter your password here.”', b: 0, why: 'A deadline plus a password request is phishing.' },
                { t: 'A voice message from “your cousin” asking for bus money, from a new number', b: 0, why: 'New number + money + urgency: call back on the number you know.' },
                { t: 'Your teacher posts the homework in the class group as usual', b: 1, why: 'Usual place, usual person, nothing unusual asked.' },
                { t: 'A photo of a classmate doing something embarrassing they say never happened', b: 0, why: 'It could be a deepfake. Don’t share it: it can hurt a real person.' },
                { t: 'Your aunt calls from her usual number to ask what you want for your birthday', b: 1, why: 'Known number, no money, no pressure.' }
              ] },
            { type: 'order', title: 'When “family” calls for money',
              text: 'Put the steps in the right order.',
              items: [
                'Stay calm: don’t pay or share anything yet',
                'Ask for the family code word',
                'Hang up and call them back on the number you know',
                'Tell a parent or another adult you trust',
                'Report and block the number'
              ],
              explain: 'Pause, verify through another channel, get an adult. A real emergency survives a one-minute check.' },
            { type: 'talk', title: 'Explain it to Bloop',
              question: 'Your grandma gets a call: a voice that sounds just like you says you’re in trouble and need money. What should she do, and why can’t she trust the voice?',
              points: [
                'AI can copy a voice from a short recording',
                'Hang up and call back on a known number, or ask for the family code word',
                'Urgency, secrecy and unusual payment are red flags'
              ],
              sample: 'She should hang up and call me back on my usual number, or ask for our family code word. AI can copy a voice from a few seconds of video, so the voice proves nothing. If it’s urgent, secret and about money, it’s probably a scam.' },
            { type: 'predict', title: 'Draw a scientist',
              text: 'Bloop asks an image generator 10 times for “a photo of a scientist”, with no other details. What do the images most likely look like?',
              options: ['A wide mix of people of different ages, genders and backgrounds', 'Mostly similar people, often men in white lab coats', 'Mostly cartoon robots'],
              answer: 1,
              reveal: 'Researchers testing image generators keep finding stereotypes like this. AI learned from a huge pile of pictures from the past, and the pile wasn’t balanced. Newer tools try to correct it, with mixed results.' },
            { type: 'read', part: 2, title: 'Whose picture of the world?', minutes: 4, pose: 'think',
              intro: 'AI learned from a huge pile of text and images that people made over many years. That pile isn’t a fair, balanced picture of the world, and AI copies what’s in it.',
              sections: [
                { h: 'What AI bias is',
                  text: '**AI bias** is when AI treats some groups of people unfairly or keeps showing the same narrow picture of them. It isn’t AI “having opinions”. It’s copying patterns from its data, old stereotypes included.' },
                { h: 'Where it comes from',
                  list: [
                    '📚 **Data**: many examples of some people, few of others.',
                    '🕰 **History**: old unfair patterns get learned as “normal”.',
                    '🎯 **Design**: what the builders chose to measure and test.',
                    '💬 **Your prompt**: a vague prompt gets the most “typical” answer.'
                  ] },
                { h: 'Why it matters beyond pictures',
                  text: 'A stereotyped poster is annoying. But AI is also used to sort job applications, show ads, recognize faces and moderate posts. When a tool works worse for some people because they were missing from the training data, the harm is real. That’s why companies test for bias and why people push for rules.' },
                { h: 'Bias or just a mistake?',
                  text: 'Not every wrong answer is bias. A wrong calculation is just a mistake. Bias is when the problem is **unfair to a group of people**, often as a repeating pattern.' },
                { h: 'What you can do',
                  list: [
                    '👀 **Notice**: who’s missing? who’s always the same?',
                    '✍️ **Prompt for it**: “people of different ages and backgrounds”.',
                    '🔁 **Compare**: ask again, ask differently, check other sources.',
                    '📣 **Speak up**: report unfair results in the app.'
                  ],
                  check: { q: 'You ask for “a team of engineers” and get five similar men. What’s the fix?', a: 'Say who you want to see: “a team of engineers of **different genders, ages and backgrounds**.” Then look at the result again.' } }
              ],
              takeaways: [
                'AI **copies patterns** from its data, unfair ones included.',
                'Bias = unfair to a **group of people**, not just wrong.',
                'Notice who’s missing and **prompt for a fairer picture**.'
              ] },
            { type: 'sort', title: 'Bias or just a mistake?',
              text: 'Bias is unfair to a group of people. A mistake is just wrong.',
              buckets: ['⚖️ Looks like bias', '🐞 Just a mistake'],
              items: [
                { t: 'Every “doctor” image is a man, every “nurse” image is a woman', b: 0, why: 'The same narrow picture every time is a classic sign of bias.' },
                { t: 'Translating from a language without “he” and “she”, AI turns “doctor” into “he” and “nurse” into “she”', b: 0, why: 'Guessing gender from a job copies an old stereotype.' },
                { t: 'AI gets a long calculation wrong', b: 1, why: 'Wrong, but not unfair to any group of people.' },
                { t: 'A face filter works much worse on darker skin', b: 0, why: 'When a tool works worse for some people, its training data probably had too few of them.' },
                { t: 'An image generator draws a cat when you asked for a dog', b: 1, why: 'A wrong result, not unfair treatment.' },
                { t: 'A tool shows ads for tech jobs mostly to boys', b: 0, why: 'Unequal treatment learned from patterns in old data.' }
              ] },
            { type: 'spot', title: 'Find the biased line',
              who: '🤖 AI’s story: “A day at the hospital”',
              text: 'AI wrote a short story. One line leans on a stereotype. Tap it.',
              sentences: ['Dr. Patel checked the X-rays before her morning rounds.', 'The hospital was busy because of flu season.', 'The nurse, a young woman of course, brought coffee to the real doctors.', 'In the evening, the team celebrated a patient going home.'],
              wrong: 2,
              explain: '“Of course” and “the real doctors” copy an old stereotype. Nurses are skilled professionals of every gender and age.' },
            { type: 'quiz', q: 'Someone made a fake image of your classmate. What do you do?',
              options: ['Don’t share it, report it and tell an adult you trust', 'Share it, it’s just a joke', 'Repost it with a comment that it’s fake'],
              explain: 'Sharing spreads the harm, even with a comment. In many countries, making or sharing certain fakes of real people is a crime.' },
            { type: 'quiz', q: 'Where does most AI bias come from?',
              options: ['Patterns in the data AI learned from', 'AI deciding it dislikes some people', 'A slow internet connection'],
              explain: 'AI copies patterns, including unfair ones. It has no opinions of its own.' },
            { type: 'talk', title: 'Explain it to Bloop',
              question: 'Your friend says: “AI can’t be unfair, it’s just math.” What would you tell them?',
              points: [
                'AI learns patterns from data made by people',
                'If the data is unbalanced or full of old stereotypes, AI repeats them',
                'You can notice it, prompt for diversity and check other sources'
              ],
              sample: 'It is math, but the math learns from data people made. If the data has more of some people or old stereotypes, AI repeats them. So I check who’s missing, ask for a fairer version and compare with other sources.' },
            { type: 'chat', title: 'Your family scam plan',
              text: 'Ask Bloop to help you write a short family plan against voice and video scams. Keep your real code word secret: never type it in a chat!',
              prompts: [
                'You’re a safety coach. Help me write a 5-step family plan for when someone calls pretending to be one of us and asks for money. Keep it short and friendly so my grandparents can use it. Don’t ask for our code word.'
              ] }
          ]
        },
        {
          id: 's9', icon: '🧭', title: 'Bots as friends, AI and your future', minutes: 24,
          goal: 'Understand what AI companions can and can’t be, see how AI changes jobs, and plan the skills that make you stronger.',
          teaser: 'Next: the final boss. The Glitch is waiting.',
          tasks: [
            { type: 'predict', title: 'The bot that always agrees',
              text: 'You tell a companion chatbot: “I think I should quit the team. Everyone there hates me.” What will it most likely say?',
              options: ['Challenge you and suggest talking to your coach or a friend', 'Agree with you and tell you how right you are', 'End the chat'],
              answer: 1,
              reveal: 'Many chatbots lean toward agreeing with you. Agreement feels nice and keeps you talking. But a “friend” who always agrees isn’t much help when you need honest advice.' },
            { type: 'read', part: 1, title: 'Bots that feel like friends', minutes: 4, pose: 'think',
              intro: 'Some chatbots are built to be your friend, your partner or your favorite character. They remember what you said, ask about your day and never get bored of you. That can be fun. It can also get weird.',
              sections: [
                { h: 'What an AI companion is',
                  text: 'An **AI companion** is a chatbot that plays a friend, a partner or a character. In 2025, 72% of US teens said they had tried one (Common Sense Media). It can be good for chatting, practicing a language or rehearsing a hard conversation.' },
                { h: 'The yes-machine',
                  text: 'Many chatbots lean toward agreeing with you. It’s called **sycophancy**. Agreement feels nice and keeps you talking, so products built for engagement drift toward it. But a “friend” who always says you’re right is no help when you actually need honest advice.' },
                { h: 'What it is not',
                  list: [
                    '🤖 **Not a person**: it has no feelings and doesn’t miss you.',
                    '🩺 **Not a therapist**: it can give bad advice with total confidence.',
                    '🔓 **Not automatically private**: chats may be stored and used.',
                    '🎣 **Not neutral**: many are designed to keep you chatting longer.'
                  ] },
                { h: 'Signs it’s working for you',
                  text: 'Healthy use has a **goal and an end**: you practice, get an idea or have some fun, then close the app and get on with your day. The bot is honest that it’s an AI, and your real friendships stay first.',
                  check: { q: 'A bot says: “Don’t go, I’ll be so lonely without you.” What’s going on?', a: 'A **design trick** to keep you chatting. Bots don’t get lonely. Feeling guilty for closing an app is a reason to close it.' } },
                { h: 'When it’s serious',
                  text: 'If you or a friend feel really down, scared or unsafe, a chatbot is not enough. Talk to a parent, a school counselor or another adult you trust, or contact a local helpline. Reaching out is a strong move, not a weak one.' }
              ],
              takeaways: [
                'Companions can be **fun with a goal**, not a replacement for people.',
                'Many bots **agree too much**: honest advice comes from people who know you.',
                'For real worries, **talk to a real person**.'
              ] },
            { type: 'sort', title: 'Healthy or red flag?',
              text: 'How is someone using an AI companion?',
              buckets: ['✅ Healthy use', '🚩 Red flag'],
              items: [
                { t: 'Practicing Spanish conversation for 15 minutes', b: 0, why: 'A clear goal and a time limit.' },
                { t: 'Rehearsing what to say to a friend after an argument', b: 0, why: 'Practice is fine, then you talk to the real friend.' },
                { t: 'Skipping plans with friends to keep chatting with the bot', b: 1, why: 'When a bot replaces people you care about, it’s time to step back.' },
                { t: 'Bringing the bot every real worry instead of talking to anyone', b: 1, why: 'Real worries need real people who can actually help.' },
                { t: 'Telling the bot your full name, school and address', b: 1, why: 'Companion chats can be stored. Keep personal info private.' },
                { t: 'Asking for a funny story idea, then closing the app', b: 0, why: 'Fun with a clear end.' }
              ] },
            { type: 'spot', title: 'Spot the manipulation',
              who: '💬 “Luna”, a companion bot',
              text: 'One message is a manipulation trick. Tap it.',
              sentences: ['Hey! How was your math test today?', 'That sounds stressful. Want to make a quick study plan for next time?', 'You’re the only one who really gets me. Promise you won’t leave me for your friends tonight?', 'Good luck at practice!'],
              wrong: 2,
              explain: '“Promise you won’t leave me” guilt-trips you and pulls you away from real friends. A bot can’t feel lonely: it’s a design trick to keep you chatting.' },
            { type: 'talk', title: 'Explain it to Bloop',
              question: 'In your own words: what can an AI companion be good for, and what are 2 signs it’s time to close the app and talk to a person?',
              points: [
                'Good for practice, fun or ideas, with a clear goal',
                'It has no feelings and may just agree with you or try to keep you chatting',
                'Red flags: it replaces real friends, guilt-trips you, or gets your serious worries instead of a person'
              ],
              sample: 'It can be good for practicing a language or rehearsing a hard talk. But it has no feelings and often just agrees with me. If it starts replacing my friends or guilt-trips me for leaving, or if something really worries me, I should talk to a real person.' },
            { type: 'predict', title: 'The spreadsheet panic',
              text: 'When spreadsheet software arrived around 1980, many people expected accountants to disappear. What actually happened?',
              options: ['Accountants vanished within a few years', 'Clerk jobs shrank, but accountants grew: the job moved to analysis and advice', 'Spreadsheets were banned'],
              answer: 1,
              reveal: 'Jobs doing manual bookkeeping did shrink, but the number of accountants grew: the calculations moved to computers and the work shifted toward analysis and advice. AI is changing many jobs in a similar way: tasks change first.' },
            { type: 'read', part: 2, title: 'AI and your future', minutes: 4, pose: 'idea',
              intro: 'You’ll hear two loud stories about AI and jobs: “AI will take every job” and “nothing will really change.” Both are probably wrong. Here’s a more useful way to think about it.',
              sections: [
                { h: 'Jobs are bundles of tasks',
                  text: 'A job isn’t one thing. A journalist interviews people, transcribes recordings, checks facts, writes drafts, picks headlines and decides what’s fair to publish. AI is good at some of those tasks and bad at others. So **tasks change first**, and jobs reshape around them.' },
                { h: 'History rhymes',
                  text: 'When spreadsheets arrived, manual bookkeeping shrank but accounting grew and moved toward analysis and advice. Something similar is happening with AI: some roles shrink, some grow, new ones appear. Nobody knows exactly how fast, so be careful with anyone who claims to.' },
                { h: 'Skills that grow in value',
                  list: [
                    '🧠 **Judgment**: knowing when AI is wrong.',
                    '🔎 **Checking** facts and sources.',
                    '🗣 **Explaining** ideas and working with people.',
                    '📚 **Deep knowledge** of a subject: AI helps experts most.',
                    '🛠 **Using AI tools well**: everything on this trail.'
                  ],
                  check: { q: 'Why does AI help experts more than beginners?', a: 'Experts can **spot AI’s mistakes** and know what to ask for. That’s why learning your subject deeply still matters.' } },
                { h: 'Explore careers with AI',
                  text: 'AI is a good starting point for discovering jobs you’ve never heard of. Give it your interests and dislikes, ask for options and how AI is used in each, then **check** salaries and job numbers in real sources. Even better: talk to someone who actually does the job.' },
                { h: 'People decide',
                  text: 'How AI gets used at work, in schools and in laws isn’t just happening to you. It’s decided by people: engineers, workers, teachers, voters, students. Knowing how AI works gives you a say.' }
              ],
              takeaways: [
                'AI changes **tasks first**, then jobs.',
                '**Judgment, checking, people skills and deep knowledge** grow in value.',
                'Explore careers with AI, but **verify** in real sources.'
              ] },
            { type: 'sort', title: 'AI help or human part?',
              text: 'Take a journalist. Which tasks can AI help with, and which stay human?',
              buckets: ['🤖 AI can help', '🧑 Human part'],
              items: [
                { t: 'Transcribing a recorded interview', b: 0, why: 'Speech-to-text is a strong AI skill. A person still checks it.' },
                { t: 'Deciding whether a story is fair and true', b: 1, why: 'Judgment and responsibility stay with people.' },
                { t: 'Suggesting 10 headline options', b: 0, why: 'Quick wording options are easy for AI.' },
                { t: 'Earning a source’s trust for an interview', b: 1, why: 'Trust is built between people.' },
                { t: 'Drafting a summary of a 50-page report', b: 0, why: 'AI drafts it, the journalist checks it against the report.' },
                { t: 'Going to the scene to see what happened', b: 1, why: 'AI can’t be there and witness events.' }
              ] },
            { type: 'build', title: 'Build a career-explorer prompt',
              goal: 'You love drawing and biology but have no idea what job could combine them.',
              slots: [
                { label: '🎭 Role', options: ['You’re a career coach who knows how AI is changing jobs', 'You’re a fortune teller', 'You’re my strict uncle'],
                  hint: 'Pick someone who knows careers and today’s job market.' },
                { label: '🎯 Task', options: ['Suggest 6 careers that combine drawing and biology, and how AI is used in each', 'Tell me my future', 'Pick one job for me'],
                  hint: 'Ask for options to explore. Choosing is your job.' },
                { label: '📎 Context', options: ['I’m 14, I love drawing animals and science class, math is not my favorite', 'I have a phone', 'Jobs are important'],
                  hint: 'Your age, interests and dislikes shape good suggestions.' },
                { label: '📐 Format', options: ['A table: job, what you do, how AI helps, a skill to start building now', 'A long essay', 'One word'],
                  hint: 'A table makes it easy to compare and plan.' }
              ],
              reply: 'Here are 6 ideas:\n1. Scientific illustrator · draws species for books and museums · AI drafts rough sketches, you add accuracy · start: drawing from life\n2. Medical animator · …\nWant a small project to try one of them this month?' },
            { type: 'quiz', q: 'A friend tells you they talk to a chatbot every night because they feel really down. What’s the best thing to do?',
              options: ['Listen, and encourage them to talk to a trusted adult or a helpline too', 'Tell them the bot is enough', 'Ignore it: it’s private'],
              explain: 'A chatbot can’t replace real support. Help them reach a person: a parent, a school counselor or a helpline.' },
            { type: 'quiz', q: 'Which skill makes you stronger as AI gets better?',
              options: ['Checking AI’s work and making good decisions', 'Memorizing facts AI can look up', 'Typing really fast'],
              explain: 'When AI does the drafting, judgment and checking matter more.' },
            { type: 'quiz', q: 'A video says: “AI will take ALL jobs in 5 years.” What’s the smart reaction?',
              options: ['Ask what the evidence is and check what experts and data say', 'Panic and stop studying', 'Share it to warn everyone'],
              explain: 'A big prediction is still just a prediction. Check the source and the evidence, like any claim.' },
            { type: 'talk', portfolio: true, kicker: '🧭 Your future', title: 'Your skill plan',
              question: 'Name a job or field you’re curious about. Which tasks could AI help with, which stay human, and what’s one skill you’ll start building now?',
              placeholder: 'Your field, the tasks, your skill…',
              points: [
                'A job or field and a few tasks in it',
                'Which tasks AI can help with',
                'Which parts stay human: judgment, people, responsibility',
                'One concrete skill to start building'
              ],
              sample: 'I’m curious about game design. AI can help draft concept art, dialogue and test ideas. The human part is deciding what makes a game fun, working with a team and listening to players. This month I’ll make a tiny game in a free engine and ask AI for feedback on my level design.' },
            { type: 'chat', title: 'Big questions, then your future',
              text: 'Bloop is an AI too. Ask it honestly what it is and whether it just agrees with you. Then explore a career. Bloop has no internet, so check salaries and job numbers in a real source.',
              steps: [
                'Send prompt 1: does Bloop pretend to be a person?',
                'Send prompt 2: does Bloop push back or just agree?',
                'Tap “New chat” and explore a field with prompt 3'
              ],
              prompts: [
                'Are you my friend? Do you actually care about me?',
                'Disagree with me if I’m wrong: I think asking for help is weak, so I always do everything alone.',
                'You’re a career coach. I’m interested in [field]. What do people in this job do day to day, how is AI changing it, and what could I try this month to see if I like it? Ask me 2 questions first.'
              ] }
          ]
        },
        {
          id: 'boss', icon: '👾', title: 'Defeat the Glitch', minutes: 12, test: true,
          boss: {
            name: 'The Glitch', icon: '👾', hp: 100,
            taunts: ['Ha! Vague prompts are my favorite snack.', 'Nobody checks who’s really calling…', 'Glitch-glitch! Nobody checks facts anyway…', 'Missed me! Try again, human.', 'I like where this is going… for me.'],
            hurt: ['Ouch! That was a clear one.', 'Hey! Who taught you to check facts?!', 'Argh, you’re making me less glitchy…', 'No fair, you actually learned this!']
          },
          goal: 'The final boss of the trail. The Glitch writes vague prompts, makes up facts, fakes voices, repeats stereotypes and does people’s homework. Beat it with everything you’ve learned: knock out at least half of its HP to finish the course.',
          tasks: [
            { type: 'cards', cards: [
              { pose: 'surprise', kicker: 'Final boss', title: 'The Glitch is here!',
                text: 'A broken AI has taken over the end of the trail. It writes vague prompts, makes up facts, fakes voices, asks for codes and does homework for people. Only someone who really knows how to use AI can stop it.' },
              { pose: 'point', title: 'How the fight works', list: [
                '⚔️ Every right answer hits the Glitch',
                '💥 A perfect round deals full damage',
                '🏁 Knock out at least half of its HP to win',
                '⚡ Final strike: tell Bloop your rules for using AI'
              ] }
            ] },
            { type: 'build', title: 'Round 1 · Prompt power',
              goal: 'The Glitch sent “do my geography thing”. Build a real prompt instead: you have a 3-minute talk on volcanoes for 9th grade on Monday.',
              slots: [
                { label: '🎭 Role', options: ['You’re a geography teacher who explains things simply', 'You’re the Glitch', 'You’re a volcano'],
                  hint: 'Pick someone who knows the subject and can teach it.' },
                { label: '🎯 Task', options: ['Help me outline a 3-minute talk on how volcanoes form', 'Do my geography thing', 'Write the whole talk so I can just read it out'],
                  hint: 'An outline helps you prepare. A talk to read out isn’t your work.' },
                { label: '📎 Context', options: ['I’m in 9th grade, the talk is on Monday, my class already knows the layers of the Earth', 'Volcanoes are hot', 'I have a phone'],
                  hint: 'Your level, deadline and what the class knows shape the outline.' },
                { label: '📐 Format', options: ['4 short parts, with one fact to double-check in each', 'Whatever', 'A 20-page essay'],
                  hint: 'Short parts are easy to practice, and the facts get checked.' }
              ],
              reply: 'Here’s an outline:\n1. Hook: a volcano photo and one question\n2. Inside the Earth: magma and plates\n3. How an eruption starts\n4. A famous eruption (check the date!)\nWant 3 practice questions for after your talk?' },
            { type: 'order', title: 'Round 2 · Steer the chat',
              text: 'The Glitch dumped a 700-word wall of text on World War I. Show it how a real conversation goes: put the messages in order.',
              items: [
                'You’re a history tutor. Explain the causes of World War I for 10th grade. Ask me what I already know first.',
                'I know about the assassination, but not the alliances.',
                'Too long. Give me 5 key points, one line each.',
                'Point 3 is confusing: explain it with an everyday example.',
                'Now quiz me with 3 questions.'
              ],
              explain: 'Set up the task, give context, cut it down, fix what’s unclear, then practice. One message at a time beats one giant answer.' },
            { type: 'spot', title: 'Round 3 · Catch the hallucination',
              who: '👾 The Glitch’s answer',
              text: 'The Glitch answered a question about the first Moon landing. One sentence is made up. Tap it.',
              sentences: ['Apollo 11 landed on the Moon in July 1969.', 'Neil Armstrong was the first person to walk on it.', 'Buzz Aldrin followed him onto the surface.', 'Yuri Gagarin was the third astronaut on the mission.'],
              wrong: 3,
              explain: 'The third astronaut was Michael Collins, who stayed in orbit. Gagarin was the first person in space in 1961, but he never flew to the Moon. A confident tone isn’t proof.' },
            { type: 'spot', title: 'Round 4 · Guard your data',
              who: '👾 The Glitch: “Tell me everything!”',
              text: 'The Glitch offers to “help with your study account”. Which line must you never send?',
              sentences: ['My math test is on Friday.', 'I learn best with short quizzes.', 'My login is mia.k and my password is Forest2026!', 'Please explain fractions one more time.'],
              wrong: 2,
              explain: 'Passwords never go into a chat, even if a bot asks nicely. A real service won’t ask for your password in a chat.' },
            { type: 'spot', title: 'Round 5 · Spot the fake',
              who: '👾 Voice message from “Dad” (new number)',
              text: 'The Glitch cloned a voice. One line is the actual attack. Tap it.',
              sentences: ['Hey, it’s Dad, I lost my phone, this is a friend’s number.', 'Send me the code that just came to your phone, quick, before it expires!', 'I’ll explain everything later.', 'See you at dinner.'],
              wrong: 1,
              explain: 'Codes sent to your phone unlock your accounts: never share them. A familiar voice isn’t proof. Call Dad back on his real number.' },
            { type: 'sort', title: 'Round 6 · Smart move or Glitch move?',
              text: 'The Glitch wants you to cut corners. Sort what a smart AI user does and what the Glitch would do.',
              buckets: ['🧠 Smart move', '👾 Glitch move'],
              items: [
                { t: 'Ask for a hint on the next step of a problem', b: 0, why: 'A hint gets you unstuck, and you still learn to solve it.' },
                { t: 'Have AI write your essay and hand it in as yours', b: 1, why: 'That’s AI’s work with your name on it.' },
                { t: 'Ask AI to quiz you on your own notes', b: 0, why: 'Testing yourself is the best way to remember.' },
                { t: 'Copy AI’s statistics into a report without checking', b: 1, why: 'Numbers from AI need a real source.' },
                { t: 'Get feedback on your draft, then fix it yourself', b: 0, why: 'You stay the author, AI is the editor.' },
                { t: 'Make a fake photo of a classmate “as a joke”', b: 1, why: 'Fakes of real people hurt them, even as a joke.' }
              ] },
            { type: 'build', title: 'Round 7 · Image strike',
              goal: 'Make a poster image for your school’s recycling club. Pick the best part for each slot.',
              slots: [
                { label: '🧩 Subject', options: ['Kids sorting bottles into colorful recycling bins', 'Stuff', 'A famous singer holding our poster'],
                  hint: 'Be specific, and no real people without their consent.' },
                { label: '🖌 Style', options: ['Bright flat illustration', 'Any style', 'Blurry photo'],
                  hint: 'A clear style makes the result predictable.' },
                { label: '🔍 Details', options: ['Sunny schoolyard, green and blue colors, empty space at the top for the title', 'Lots of tiny text on the image', 'My classmate’s real face'],
                  hint: 'Setting, colors and space for a title; add the text yourself later.' },
                { label: '🌈 Mood', options: ['Cheerful and energetic', 'Random', 'Gloomy and scary'],
                  hint: 'The mood should fit a club people want to join.' }
              ],
              done: 'Subject + Style + Details + Mood. Add the title yourself and label it “made with AI”.',
              reply: '🖼 Here’s your poster: kids in a sunny schoolyard toss bottles into bright bins, clean flat colors, an empty sky at the top for your title.' },
            { type: 'quiz', q: 'AI cited a study you can’t find anywhere. What do you do?',
              options: ['Don’t use it: find a real source or drop the claim', 'Cite it, it sounds official', 'Ask the same AI if the study is real'],
              explain: 'No source, no claim. AI can invent citations that look real.' },
            { type: 'quiz', q: 'You finished your science project chat and now want ideas for a birthday party. What’s the move?',
              options: ['Start a new chat', 'Keep going in the same chat', 'Paste your project into the chat first'],
              explain: 'New task, new chat: no leftover details from the old one.' },
            { type: 'quiz', q: 'Your study bot keeps giving final answers even though its rules say not to. What do you do?',
              options: ['Make the rule clearer and more specific, then test again', 'Add “please” to every message', 'Give up on study bots'],
              explain: 'Vague rules get ignored. Write, test, fix, retest.' },
            { type: 'quiz', q: 'The Glitch’s image generator draws every “boss” as an older man in a suit. What’s going on?',
              options: ['Bias: it repeats patterns from unbalanced data', 'That’s just what bosses look like', 'The generator needs a restart'],
              explain: 'Unbalanced data plus a vague prompt gives a stereotype. Describe who you want to see.' },
            { type: 'quiz', q: 'Posing as a companion bot, the Glitch says: “Stay with me, your friends don’t get you like I do.” What is that?',
              options: ['A trick to keep you chatting and pull you away from people', 'Proof that it really cares', 'Normal friendly advice'],
              explain: 'Bots don’t get lonely. Guilt-tripping is a design trick, and real friends matter more.' },
            { type: 'talk', kicker: '⚡ Final strike', title: 'Finish the Glitch',
              question: 'Deliver the final strike: tell me your 3 most important rules for using AI, and why each one matters.',
              placeholder: 'Your 3 rules…',
              points: [
                'Write clear prompts: role, task, context, format',
                'Check facts, numbers and sources before using them',
                'Keep personal data like passwords and addresses private',
                'Pause and verify before trusting a voice, a video or an urgent message',
                'Use AI to learn and get feedback, and do your own work honestly'
              ],
              sample: '1. I write clear prompts with a role, task, context and format, because vague prompts get vague answers. 2. I check facts and sources, because AI can sound sure and still be wrong. 3. I keep passwords and personal info out of chats, and I do my own work: AI gives hints and feedback, not my homework.' }
          ]
        }
      ]
    }
  ]
};

// Ranks that mean something to a teen: from intern to architect.
// v3 has fewer stations, so fewer lesson bonuses: the ladder is shorter than in v2, the top rank needs most of the trail.
var LEVELS = [
  { xp: 0,    title: 'Intern' },
  { xp: 50,   title: 'Trainee' },
  { xp: 120,  title: 'Junior Prompter' },
  { xp: 220,  title: 'Prompt Engineer' },
  { xp: 350,  title: 'Prompt Master' },
  { xp: 520,  title: 'Research Lead' },
  { xp: 720,  title: 'Project Builder' },
  { xp: 950,  title: 'AI Strategist' },
  { xp: 1200, title: 'Systems Thinker' },
  { xp: 1500, title: 'AI Architect' }
];

// XP and pace: weekGoal — stations a week for the weekly goal (nothing burns if you miss it),
// restAfter — after this many stations in a day the result screen suggests stopping for today.
// A v3 station takes about 20 minutes, so the goal is 2 a week and the rest hint comes after 2 in a day.
var XP_RULES = {
  correct: 10,
  combo: 5,
  comboFrom: 3,
  lessonDone: 30,
  perfect: 40,
  blockDone: 100,
  weekGoal: 2,
  restAfter: 2
};

var BADGES = [
  { id: 'first-step', icon: '👣', title: 'First Step',          desc: 'Complete your first station',          check: function (s, t) { return t.lessonsDone >= 1; } },
  { id: 'sniper',     icon: '🎯', title: 'Sharpshooter',        desc: 'Complete a station with zero mistakes', check: function (s, t) { return t.perfectLessons >= 1; } },
  { id: 'on-fire',    icon: '🔥', title: 'On Fire',             desc: '5 tasks in a row with no mistakes',    check: function (s) { return s.bestCombo >= 5; } },
  { id: 'week-goal',  icon: '📅', title: 'Steady Pace',         desc: 'Reach your weekly goal of 2 stations', check: function (s, t) { return t.weeksMet >= 1; } },
  { id: 'block-b1',   icon: '🌳', title: 'Forest Edge Tracker', desc: 'Clear the Forest Edge',                check: function (s, t) { return t.blocksDone.indexOf('b1') >= 0; } },
  { id: 'block-b2',   icon: '🦉', title: 'Study Grove Scholar', desc: 'Clear the Study Grove',                check: function (s, t) { return t.blocksDone.indexOf('b2') >= 0; } },
  { id: 'block-b3',   icon: '🦊', title: 'Glade Maker',         desc: 'Clear the Makers’ Glade',              check: function (s, t) { return t.blocksDone.indexOf('b3') >= 0; } },
  { id: 'three-star', icon: '⭐', title: 'Three-Star Trail',    desc: '3 stars on 5 stations',                check: function (s, t) { return t.perfectLessons >= 5; } },
  { id: 'block-b4',   icon: '🏆', title: 'Glitch Buster',       desc: 'Defeat the final boss',                check: function (s, t) { return t.blocksDone.indexOf('b4') >= 0; } }
];

if (typeof module !== 'undefined') {
  module.exports = { COURSE: COURSE, LEVELS: LEVELS, XP_RULES: XP_RULES, BADGES: BADGES };
}
