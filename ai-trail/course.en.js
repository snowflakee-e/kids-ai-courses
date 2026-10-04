'use strict';

// AI Trail content (ages 14–18). The main language of the course: course.js (Russian) is the older version.
// Everything that changes without code lives here: blocks, lessons, tasks, XP rules, levels and badges.
//
// Block = a forest zone on the map. Lesson = a station. Task = one screen of a lesson.
// A lesson with extra: true is a side quest: optional and harder. It branches off the main lesson right
// before it, doesn’t block the trail and isn’t needed to finish the block. No side quests in the first block.
//
// Task types:
//   cards   — short theory cards (kicker, title, big, chat, text, list, reveal)
//   video   — src (mp4) or youtube (id); until there is a video, the storyboard plays from scenes
//   quiz    — a test question, the first option is correct (options are shuffled)
//   sort    — sort cards into two buckets (b is the index of the right bucket)
//   build   — build a prompt from parts, the first option in every slot is correct (done — optional final note)
//   spot    — find the wrong sentence (wrong is its index, who is the caption above the text)
//   order   — tap the steps in the right order (items are listed in the correct order, explain is optional)
//   poll    — not graded: “continue like a neural network”, p is the probability in %
//   mission — not graded: try it in a real chatbot (steps is an optional list)
//   talk    — not graded: a written answer checked by the Bloop tutor (worker/).
//             points — what a good answer covers, sample — an example answer when the tutor is offline,
//             kicker and placeholder are optional
// Graded: quiz, sort, build, spot, order. The lesson’s stars come from them.
//
// Video scenes are both the placeholder storyboard and the brief for generation
// (node tools/video-tz.js --lang en → VIDEO_TZ.en.md). visual is a Kling prompt, pose is Bloop’s state from bobik.js.

var COURSE = {
  id: 'ai-trail',
  title: 'AI Trail',
  age: '14–18 years',
  blocks: [
    {
      id: 'b1', title: 'Forest Edge', subtitle: 'Your first steps with AI',
      lessons: [
        {
          id: 'l1', icon: '🤖', title: 'Meet your AI', minutes: 6,
          goal: 'Find out what a chatbot actually does, what it’s great at and where it fails.',
          tasks: [
            { type: 'cards', cards: [
              { pose: 'hello', title: 'Hi, I’m Bloop!',
                text: 'This trail is about using AI for real: for studying and for your own projects. One minute of theory per lesson, the rest is hands-on. Every station earns you XP and stars.' },
              { pose: 'point', kicker: 'The one idea you need', title: 'A chatbot predicts the next word',
                text: 'It has read a huge amount of text and learned which words usually come next. When you ask something, it builds the answer word by word. That’s why it sounds so fluent, and why it can sound sure and still be wrong.' },
              { pose: 'think', title: 'Great at / weak at', list: [
                '✅ Explaining, rewording, summarizing',
                '✅ Brainstorming ideas and making plans',
                '✅ Giving feedback on your work',
                '⚠️ Exact facts: numbers, dates, quotes, links',
                '⚠️ Recent news, unless it can search the web',
                '⚠️ Knowing you: it only knows what you tell it'
              ] }
            ] },
            { type: 'video', title: 'What’s going on inside a chatbot', src: '', youtube: '', scenes: [
              { sec: 7, pose: 'hello', screen: 'How does a chatbot answer?',
                voice: 'You type a question, and a chatbot answers in seconds. What’s actually going on in there?',
                visual: 'Cute flat-style robot mascot waves at camera next to a giant phone with a chat on screen, cartoon forest clearing' },
              { sec: 10, pose: 'think', screen: 'It read a giant library',
                voice: 'Before you ever met it, the model read a huge amount of text: books, websites, articles. It learned which words usually go together.',
                visual: 'Robot flying through an endless library, pages of text streaming into its antenna, flat 2D motion graphics' },
              { sec: 9, pose: 'point', screen: 'Next word, next word, next word',
                voice: 'Then it writes your answer one word at a time, each time picking a word that fits best.',
                visual: 'Chat bubble filling in word by word, each new word pops out of a small slot machine, playful flat animation' },
              { sec: 9, pose: 'surprise', screen: 'Sounds right ≠ is right',
                voice: 'That’s why it sounds so smooth. But it doesn’t check facts as it goes, so it can be confidently wrong.',
                visual: 'Robot in sunglasses confidently presenting a chart with an obvious mistake, a small red question mark appears' },
              { sec: 7, pose: 'wink', screen: 'Your job: steer and check',
                voice: 'So you steer it with good questions and check what matters. That’s the whole skill.',
                visual: 'Teen holding a phone like a steering wheel, robot gives a thumbs up, green check marks pop up' }
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
            { type: 'quiz', q: 'What does a chatbot know about you when you start a chat?',
              options: ['Only what you tell it (plus anything saved in its settings)', 'Everything on your phone', 'Your grades and your school schedule'],
              explain: 'The more useful context you give, the better the answer. Just keep private stuff private.' },
            { type: 'mission', title: 'Your first real chat',
              text: 'Open a chatbot you’re allowed to use. Many AI tools have age limits, so check the rules or ask a parent if you’re not sure. Have a three-message conversation:',
              steps: [
                'Ask it to explain something you learned this week in 3 sentences',
                'Reply: “Give me an example from real life”',
                'Reply: “Now ask me 2 questions to check I got it”'
              ],
              prompt: 'Explain [a topic from this week] in 3 sentences, like you’re talking to a friend.',
              note: 'No access to AI? Skip it, it won’t affect your stars.' },
            { type: 'talk', title: 'Explain it to Bloop',
              question: 'In your own words: how does a chatbot come up with its answer, and what does that mean for how you use it?',
              points: [
                'It predicts likely next words based on the text it learned from',
                'So it can sound sure and still be wrong',
                'You should check important facts and give it context about what you need'
              ],
              sample: 'A chatbot writes its answer word by word, picking the words that most likely come next based on the text it learned from. It doesn’t check facts along the way, so it can sound sure and be wrong. So I give it clear context and check anything important.' }
          ]
        },
        {
          id: 'l2', icon: '🪄', title: 'Your first real prompt', minutes: 8,
          goal: 'Write prompts that get a useful answer on the first try.',
          tasks: [
            { type: 'cards', cards: [
              { pose: 'sad', kicker: 'New word: prompt = your task for AI', title: 'Vague in, vague out', chat: 'help with history',
                text: 'AI doesn’t know the topic, your level or what you actually need. So it guesses, and you get a generic wall of text.' },
              { pose: 'joy', title: 'Specific in, useful out',
                chat: 'You’re a history tutor. Make 8 quiz questions on the causes of World War I. I’m in 10th grade and keep mixing up the alliances. Questions first, answers at the end.',
                text: 'Same AI, but now it knows who to be, what to do, who it’s for and what the result should look like.' },
              { pose: 'idea', title: 'The RTCF formula', big: 'Role + Task + Context + Format', list: [
                '🎭 Role: who AI should be. “You’re a chemistry tutor”',
                '🎯 Task: what exactly to do. “Explain…”, “Make 10 questions…”',
                '📎 Context: details that matter. Your level, your goal, what you already know',
                '📐 Format: what the answer looks like. “5 bullet points”, “a table”, “under 100 words”'
              ] }
            ] },
            { type: 'video', title: 'One question, two answers', src: '', youtube: '', scenes: [
              { sec: 6, pose: 'hello', screen: 'Why does AI miss the point?',
                voice: 'Ever asked AI something and got a useless wall of text? Let’s fix that.',
                visual: 'Teen looks at a phone with a confused face, a huge chat bubble of text scrolls endlessly, flat cartoon' },
              { sec: 9, pose: 'sad', screen: '“Help with my report”',
                voice: '“Help with my report.” AI doesn’t know the topic, your level, or how much time you have. So it guesses.',
                visual: 'Robot blindfolded throwing darts at a target, darts miss, playful flat animation' },
              { sec: 11, pose: 'point', screen: 'Role + Task + Context + Format',
                voice: 'Now try: “You’re a biology teacher. Outline my report on bees. It’s a three-minute talk for tenth grade. Give me five points.”',
                visual: 'Four colorful puzzle pieces labeled Role, Task, Context, Format snap together into one prompt' },
              { sec: 9, pose: 'delight', screen: 'Same AI, better answer',
                voice: 'Same AI, but now the answer fits: the right length, the right level, ready to use.',
                visual: 'Dart hits the bullseye, a neat 5-point outline about bees appears on the phone, bees fly around' },
              { sec: 7, pose: 'wink', screen: 'Not quite? Follow up!',
                voice: 'Still not right? Don’t start over. Follow up: shorter, simpler, add an example.',
                visual: 'Chat with short follow-up messages “shorter”, “simpler”, “add an example”, the answer shrinks and gets clearer' }
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
                { t: 'I already know the basics', b: 0, why: 'This tells AI where to start.' },
                { t: 'The talk is 3 minutes long', b: 0, why: 'It’s a detail about your situation that shapes the answer.' },
                { t: 'Use bullet points', b: 1, why: 'Bullet points are a format.' }
              ] },
            { type: 'quiz', q: 'Which prompt will work best?',
              options: ['You’re a fitness coach. Make a 20-minute home workout for a beginner, no equipment, as a list with timings', 'workout', 'Give me exercises'],
              explain: 'Role, task, context and format: AI gets it on the first try.' },
            { type: 'talk', kicker: '✍️ Fix the prompt', title: 'Fix this prompt',
              question: 'This prompt gets a boring, generic answer: “write about the French Revolution”. Rewrite it using Role, Task, Context and Format. Imagine you need it for a school assignment.',
              placeholder: 'Write your improved prompt…',
              points: [
                'Role: who AI should be, for example a history tutor',
                'Task: a concrete action, for example explain the causes or make an outline',
                'Context: your level and what it’s for',
                'Format: length or structure of the answer'
              ],
              sample: 'You’re a history tutor. Explain the 3 main causes of the French Revolution. I’m in 10th grade and I need it to prepare a 2-minute presentation. Answer in 3 short bullet points with one example each.' },
            { type: 'mission', title: 'Vague vs specific',
              text: 'Send a chatbot both prompts, each in a new chat, and compare the answers. Which one could you actually use?',
              steps: [
                'Prompt 1: “tell me about the Moon”',
                'Prompt 2: the one below',
                'Compare: which answer is shorter, clearer and more useful?'
              ],
              prompt: 'You’re an astronomy teacher. Explain why there’s no air on the Moon. I’m preparing a 2-minute talk for my class. Answer in 5 short bullet points.',
              note: 'No access to AI? Skip it, it won’t affect your stars.' }
          ]
        },
        {
          id: 'l3', icon: '💬', title: 'Keep the conversation going', minutes: 7,
          goal: 'Turn an OK answer into a great one with follow-up messages.',
          tasks: [
            { type: 'cards', cards: [
              { pose: 'think', title: 'The first answer is a draft',
                text: 'Pros rarely stop at one message. They steer: shorter, simpler, more examples, a different angle. The chat remembers what you said earlier, so you can build on it.' },
              { pose: 'idea', title: 'Follow-ups that work', list: [
                '“Make it shorter: 5 bullet points”',
                '“Explain it like I’m new to this”',
                '“Give me an example from real life”',
                '“What did you leave out?”',
                '“Ask me 3 questions about what I need before you answer”'
              ] },
              { pose: 'wink', kicker: 'Pro tip', title: 'New topic? New chat.',
                text: 'A long chat about everything gets messy: old details leak into new answers. Start a fresh chat for every new task.' }
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
              sentences: ['Make it 5 bullet points.', 'Add one example from sports.', 'Do better.', 'Explain step 3 in more detail.'],
              wrong: 2,
              explain: '“Do better” doesn’t say what to change, so AI just guesses again. Good follow-ups name exactly what to fix.' },
            { type: 'quiz', q: 'AI’s answer is too complicated. What’s the best follow-up?',
              options: ['Explain it more simply, with one everyday example', 'Try again', 'WRONG!!!'],
              explain: 'Say what to change: simpler, plus an example.' },
            { type: 'quiz', q: 'You were working on your history essay and now want to plan a birthday party. What should you do?',
              options: ['Start a new chat', 'Keep going in the same chat', 'Paste the whole essay again first'],
              explain: 'New task, new chat. Otherwise details from the essay can leak into the party plan.' },
            { type: 'quiz', q: 'Which follow-up helps AI fit the answer to you?',
              options: ['Ask me 3 questions about what I need before you answer', 'Hurry up', 'Make it better'],
              explain: 'Letting AI ask questions first gives it the context it’s missing.' },
            { type: 'talk', kicker: '✍️ Write a follow-up', title: 'Steer the answer',
              question: 'AI gave you a 600-word answer about the water cycle, but you need something to review in 5 minutes before class. Write the follow-up message you’d send.',
              placeholder: 'Write your follow-up…',
              points: [
                'Asks for a shorter answer with a clear length or format, for example 5 bullet points',
                'Focuses on the key points you need for class',
                'Optionally asks for an example or a quick self-check question'
              ],
              sample: 'Too long for me. Cut it to the 5 key points I need for class, one line each, and add one quick question to check myself.' },
            { type: 'mission', title: 'Four-step chat',
              text: 'Pick any topic you’re curious about and have a conversation where you steer the answer:',
              steps: [
                'Start with a prompt and ask AI to ask you 2 questions first',
                'Answer its questions',
                'Ask for a change: shorter, simpler or with an example',
                'Ask it to quiz you on what it explained'
              ],
              prompt: 'Help me understand [topic]. Before you answer, ask me 2 questions about what I already know and what I need it for.',
              note: 'No access to AI? Skip it, it won’t affect your stars.' }
          ]
        },
        {
          id: 'l4', icon: '🔍', title: 'Check it, protect yourself', minutes: 8,
          goal: 'Catch AI’s mistakes and keep your personal info safe.',
          tasks: [
            { type: 'cards', cards: [
              { pose: 'surprise', kicker: 'New word', title: 'AI hallucination',
                text: 'Sometimes AI confidently writes things that aren’t real: made-up facts, dates, quotes, books and links. It isn’t lying on purpose. It’s picking words that sound believable.' },
              { pose: 'point', title: 'Check like a pro', big: 'AI’s answer is a draft, not the truth', list: [
                'Numbers, dates, quotes, links: always check',
                'Use two reliable sources: a textbook, an encyclopedia, an official website',
                'AI gave a source? Open it and see if it really says that',
                'Asking the same AI again isn’t checking'
              ] },
              { pose: 'sad', title: 'Never share with a chatbot', list: [
                'Passwords and codes',
                'Your address, phone number, school name',
                'Photos of documents and IDs',
                'Other people’s private info and photos'
              ] }
            ] },
            { type: 'video', title: 'Why AI makes mistakes with a straight face', src: '', youtube: '', scenes: [
              { sec: 5, pose: 'hello', screen: 'Can AI be wrong?',
                voice: 'Spoiler: yes. And with a very confident face.',
                visual: 'Robot mascot in sunglasses looking overconfident, cartoon forest background' },
              { sec: 9, pose: 'think', screen: 'Word by word',
                voice: 'A chatbot writes its answer one word at a time, each time picking a likely next word. It doesn’t open a textbook.',
                visual: 'Words appear one by one on a chat bubble, each with a small probability bar above it' },
              { sec: 9, pose: 'surprise', screen: 'Sounds true ≠ is true',
                voice: 'So it can make up a date, a quote, even a whole book, just because it sounds right.',
                visual: 'Book with a made-up title appears, then a magnifying glass reveals the cover is empty' },
              { sec: 8, pose: 'point', screen: 'Check 2 sources',
                voice: 'Your superpower is checking. Verify important facts in two reliable sources before you use them.',
                visual: 'Two trusted sources (textbook and encyclopedia website) side by side with green checkmarks' },
              { sec: 5, pose: 'victory', screen: 'You decide, not AI',
                voice: 'AI is a helper. You decide what to believe.',
                visual: 'Teen holds a phone confidently, robot jumps with joy next to them, sunny forest' }
            ] },
            { type: 'spot', title: 'Find the hallucination',
              text: 'AI answered a question about penicillin. One sentence is wrong. Tap it.',
              sentences: ['Penicillin was discovered by Alexander Fleming.', 'In 1928 he noticed that a mold was killing bacteria in his lab.', 'Penicillin became one of the first widely used antibiotics.', 'Fleming received the Nobel Prize for it in 1975.'],
              wrong: 3,
              explain: 'Fleming shared the Nobel Prize in 1945, and he died in 1955. A wrong date sounds just as confident as a right one, so check dates in a reliable source.' },
            { type: 'spot', title: 'What should go?', who: '✉️ Leo’s message',
              text: 'Leo wants to send this to a chatbot. Which part should he remove?',
              sentences: ['Help me plan a surprise party for my sister.', 'She loves board games and pizza, budget is $50.', 'We live at 5 Forest Street, apt 12, my number is +1 555 000 0000.', 'Give me a checklist of 8 steps.'],
              wrong: 2,
              explain: 'The address and phone number aren’t needed for the task. Never send personal data to a chatbot.' },
            { type: 'sort', title: 'Check it or fine as is?',
              text: 'Which parts of AI’s help need checking before you use them?',
              buckets: ['🔎 Check it', '👌 Fine to use'],
              items: [
                { t: 'A date for your history essay', b: 0, why: 'Dates are a classic hallucination spot.' },
                { t: '10 title ideas for your project', b: 1, why: 'Ideas don’t need fact-checking. You just pick the one you like.' },
                { t: 'A statistic for your presentation', b: 0, why: 'Numbers must come from a real source you can name.' },
                { t: 'A quote from a famous scientist', b: 0, why: 'AI often invents quotes or gets the author wrong.' },
                { t: 'Questions to quiz yourself with', b: 1, why: 'Practice questions are fine. If an answer looks off, check your notes.' },
                { t: 'A link to a study', b: 0, why: 'AI can invent links. Open it and check it’s real.' }
              ] },
            { type: 'quiz', q: 'AI gave you a source for a fact. What do you do?',
              options: ['Open it and check it really says that', 'Cite it without opening it', 'Ask AI if the source is real'],
              explain: 'A source only counts if it exists and says what AI claims.' },
            { type: 'talk', title: 'Explain it to Bloop',
              question: 'AI confidently gave you a date for your report. How will you check it, and why could AI be wrong?',
              points: [
                'Check reliable sources, ideally two: a textbook, an encyclopedia, an official website',
                'AI picks believable words and doesn’t check facts',
                'Asking the same AI again isn’t checking'
              ],
              sample: 'I’ll look it up in my textbook and in an encyclopedia. AI could be wrong because it picks words that sound believable instead of checking facts. Asking the same AI again isn’t a real check.' }
          ]
        },
        {
          id: 't1', icon: '🌳', title: 'The Great Oak Challenge', minutes: 6, test: true,
          goal: 'The final test of the Forest Edge: 8 questions on everything so far. Score 50% or more to open the next block.',
          tasks: [
            { type: 'quiz', q: 'How does a chatbot write its answer?',
              options: ['It picks likely next words, one after another', 'It copies the answer from one website', 'A person types it really fast'],
              explain: 'Word by word, based on patterns from the text it learned from.' },
            { type: 'quiz', q: 'Which job is AI best at?',
              options: ['Brainstorming 15 ideas for a project', 'Telling today’s exact weather without searching', 'Making your life decisions'],
              explain: 'Ideas, explanations, plans and feedback are AI’s strong side.' },
            { type: 'quiz', q: 'Which of these is part of the RTCF formula?',
              options: ['Answer format', 'Screen color', 'Internet speed'],
              explain: 'Role, Task, Context, Format.' },
            { type: 'quiz', q: 'Which prompt will work better?',
              options: ['You’re a chef. Give me a 10-minute breakfast recipe with eggs and cheese, step by step', 'Food', 'Something about breakfast'],
              explain: 'Role, task, details and format: AI gets it the first time.' },
            { type: 'quiz', q: 'The answer doesn’t fit what you need. What do you do?',
              options: ['Follow up: say exactly what to change', 'Give up on AI', 'Send the same prompt again'],
              explain: 'A specific follow-up is the fastest way to a good answer.' },
            { type: 'quiz', q: 'When should you start a new chat?',
              options: ['When you switch to a new task', 'Never, one chat is enough', 'After every single message'],
              explain: 'New task, new chat: no leftover details from the old one.' },
            { type: 'quiz', q: 'Why does AI sometimes make up facts?',
              options: ['It picks believable words and doesn’t check the truth', 'It wants to trick you', 'Hackers designed it that way'],
              explain: 'Believable doesn’t mean true.' },
            { type: 'quiz', q: 'What should you never send to a chatbot?',
              options: ['Passwords and photos of documents', 'Your project topic', 'A question about a physics formula'],
              explain: 'Keep personal data to yourself, even if AI asks politely.' }
          ]
        }
      ]
    },
    {
      id: 'b2', title: 'Study Grove', subtitle: 'AI as your study partner',
      lessons: [
        {
          id: 'l5', icon: '🎓', title: 'AI as your tutor', minutes: 8,
          goal: 'Use AI to understand a topic instead of skipping it.',
          tasks: [
            { type: 'cards', cards: [
              { pose: 'wink', kicker: 'Bloop’s rule', title: 'Think first, then ask', big: 'Try it yourself → ask AI where you got stuck',
                text: 'If AI does the work, you get the answer but not the skill. On the test there’s no AI. So use it like a tutor, not like an answer machine.' },
              { pose: 'idea', title: 'Tutor prompts that work', list: [
                '“Explain [topic] simply, then give me one example”',
                '“Don’t give me the answer. Give me a hint for the next step”',
                '“Here’s my solution. Where did I go wrong?”',
                '“Explain it another way, I still don’t get it”',
                '“Ask me questions to check I understood”'
              ] }
            ] },
            { type: 'video', title: 'Answer machine or tutor?', src: '', youtube: '', scenes: [
              { sec: 7, pose: 'hello', screen: 'Answer machine or tutor?',
                voice: 'AI can do your homework for you. Or it can make you better at it. Your call.',
                visual: 'Robot mascot standing between two doors labeled ANSWERS and TUTOR, flat cartoon forest' },
              { sec: 9, pose: 'sad', screen: '❌ “Solve this for me”',
                voice: 'Ask it to solve everything, and you get answers today. Then you freeze on the test, where there’s no AI.',
                visual: 'Teen at an exam desk staring at a blank sheet, a phone locked in a box nearby, sweat drop, flat style' },
              { sec: 10, pose: 'idea', screen: '✅ “Give me a hint”',
                voice: 'Ask for a hint instead: “Don’t solve it. What’s the first step?” Now your brain does the work.',
                visual: 'Chat bubble with a small glowing hint, a light bulb switches on above the teen’s head' },
              { sec: 9, pose: 'point', screen: '✅ “Check my work”',
                voice: 'Or solve it yourself and ask: “Where did I go wrong?” A personal tutor, even at midnight.',
                visual: 'Notebook with a solution, one line highlighted in yellow with a short note, moon in the window' },
              { sec: 6, pose: 'joy', screen: 'Try first, then ask',
                voice: 'Try first, then ask. That’s how AI makes you smarter, not lazier.',
                visual: 'Robot in a tiny graduation cap high-fives the teen, confetti, green check' }
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
            { type: 'quiz', q: 'You solved a problem but the answer doesn’t match the key. Best prompt?',
              options: ['Here’s my solution step by step. Find where I went wrong, but don’t fix it for me', 'Give me the right answer', 'Solve it again'],
              explain: 'Finding your own mistake is where the learning happens.' },
            { type: 'quiz', q: 'AI’s explanation still doesn’t click. What do you ask?',
              options: ['Explain it another way, with an everyday comparison', 'Repeat that exactly', 'Never mind, I’ll skip this topic'],
              explain: 'A different angle or a comparison from real life often makes it click.' },
            { type: 'talk', kicker: '✍️ Write a prompt', title: 'Your own tutor',
              question: 'Write a prompt that turns AI into your tutor for a topic you’re learning right now. It should help you learn, not hand you the answer.',
              placeholder: 'Write your tutor prompt…',
              points: [
                'Gives AI the role of a tutor or teacher',
                'Names the topic and your level or what you’re stuck on',
                'Asks for explanations, hints or questions instead of ready answers',
                'Sets a format, for example one step at a time'
              ],
              sample: 'You’re a patient math tutor. I’m learning quadratic equations in 9th grade and I get lost when I need to factor. Don’t solve problems for me: explain one step at a time, give me a hint when I’m stuck and check my answers.' },
            { type: 'mission', title: 'Tutor mode on',
              text: 'Take a real task from your homework and use AI as a tutor, not as an answer machine.',
              steps: [
                'Try the task yourself for at least 5 minutes',
                'Send the prompt below with your task and what you tried',
                'Follow the hints and finish it yourself'
              ],
              prompt: 'You’re my tutor. Here’s my task: [task]. Here’s what I tried: [your attempt]. Don’t give me the answer. Give me one hint for the next step.',
              note: 'No access to AI? Skip it, it won’t affect your stars.' }
          ]
        },
        {
          id: 'l6', icon: '🗂', title: 'Test prep with AI', minutes: 8,
          goal: 'Turn your notes into quizzes, flashcards and a study plan.',
          tasks: [
            { type: 'cards', cards: [
              { pose: 'point', kicker: 'How memory works', title: 'Test yourself, don’t just reread',
                text: 'Rereading feels productive, but your brain remembers better when it has to pull the answer out by itself. Quizzing yourself beats highlighting.' },
              { pose: 'idea', title: '3 study tools in one minute', list: [
                '❓ A quiz on your topic, with answers at the end',
                '🃏 Flashcards: term on one side, meaning on the other',
                '📅 A study plan: what to do each day before the test'
              ] },
              { pose: 'wink', kicker: 'Pro tip', title: 'Paste your own notes',
                text: 'Add “use only my notes below” and paste them. Then the questions match what your class actually covered, and AI has less room to make things up.' }
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
            { type: 'quiz', q: 'Why paste your own notes into the chat?',
              options: ['So the questions match what your class actually covered', 'So AI can grade your teacher', 'It makes AI type faster'],
              explain: 'Your notes keep AI on your topic and your level.' },
            { type: 'quiz', q: 'What helps you remember more?',
              options: ['Quizzing yourself on the material', 'Rereading the same page again', 'Highlighting the whole chapter'],
              explain: 'Pulling the answer out of your head is what makes it stick.' },
            { type: 'talk', kicker: '✍️ Write a prompt', title: 'Notes → quiz',
              question: 'Write a prompt that turns your class notes into a quiz to practice with.',
              placeholder: 'Write your quiz prompt…',
              points: [
                'Asks to use only your notes',
                'Says how many questions and what kind',
                'Says how to handle answers: at the end, or check yours one by one',
                'Mentions your level or the test topic'
              ],
              sample: 'Use only my notes below. Make 10 quiz questions for my 9th grade test on the French Revolution: 5 multiple choice and 5 short answer. Ask them one at a time, wait for my answer and tell me if I’m right. [notes]' },
            { type: 'mission', title: 'Flashcards from your notes',
              text: 'Take notes from any subject and turn them into flashcards with AI.',
              prompt: 'Turn my notes below into 12 flashcards. Front: a term or question. Back: a short answer in my own level of language. Use only my notes. [paste notes]',
              note: 'No access to AI? Skip it, it won’t affect your stars.' }
          ]
        },
        {
          id: 'x1', icon: '🧩', title: 'Teach it back', minutes: 9, extra: true,
          goal: 'Flip roles: you teach, AI plays a confused student. The fastest way to find gaps in what you know.',
          tasks: [
            { type: 'cards', cards: [
              { pose: 'think', kicker: 'Side quest', title: 'Teaching is the hardest test',
                text: 'If you can explain something in simple words, you understand it. If you get stuck, you’ve just found a gap. This trick is often called the Feynman technique.' },
              { pose: 'idea', title: 'Flip the roles',
                chat: 'Let’s swap roles. You’re a curious student who knows nothing about [topic]. I’ll explain it. Ask me tough follow-up questions and tell me where my explanation is unclear. Don’t explain it yourself.',
                text: 'Now AI isn’t teaching you. It’s testing whether you can teach.' }
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
            { type: 'quiz', q: 'In a role swap, AI keeps asking about one part of your explanation. What does that tell you?',
              options: ['That part is probably a gap: go back to your notes', 'AI is broken', 'You should switch to a different topic'],
              explain: 'Repeated questions point to the place where your explanation is weakest.' },
            { type: 'quiz', q: 'Why tell AI “don’t explain it yourself”?',
              options: ['So you do the explaining and find your own gaps', 'So the chat is shorter', 'Because AI can’t explain things'],
              explain: 'If AI jumps in with the answer, you lose the test of your own understanding.' },
            { type: 'talk', kicker: '🧩 Teach it back', title: 'Teach Bloop',
              question: 'Teach me how a chatbot writes its answers, as if I were 8 years old. Use 3–5 simple sentences and one comparison from everyday life.',
              placeholder: 'Explain it simply…',
              points: [
                'Uses simple words, no unexplained jargon',
                'Explains that it predicts likely next words, one after another',
                'Includes a comparison or example from everyday life',
                'Mentions that it can sound sure and still be wrong'
              ],
              sample: 'A chatbot read tons of books and websites. Now when you ask it something, it guesses the next word, then the next, like the word suggestions on your phone, but way smarter. It’s really good at sounding right. But it doesn’t check facts, so sometimes it’s wrong.' },
            { type: 'mission', title: 'Real role swap',
              text: 'Pick a topic from your next test and let AI play the student.',
              prompt: 'Let’s swap roles. You’re a curious student who knows nothing about [topic]. I’ll explain it. Ask me one tough question at a time and tell me which parts were unclear. Don’t explain it yourself.',
              note: 'No access to AI? Skip it, it won’t affect your stars.' }
          ]
        },
        {
          id: 'l7', icon: '✍️', title: 'Writing with AI, honestly', minutes: 8,
          goal: 'Get feedback on your writing without handing over your work.',
          tasks: [
            { type: 'cards', cards: [
              { pose: 'point', title: 'Your words, AI’s feedback',
                text: 'Teachers grade your thinking and your voice. So AI shouldn’t write for you, but it can be a great editor: it points out weak spots, and you fix them.' },
              { pose: 'think', title: 'Know the rules', list: [
                'Every school and teacher has their own AI rules. Not sure? Ask',
                'Used AI? Say how: “I used AI to brainstorm and to check grammar”',
                'AI text handed in as yours is cheating, even with a few words changed'
              ] },
              { pose: 'idea', title: 'Feedback prompts', list: [
                '“Don’t rewrite it. Point out the 3 weakest spots and explain why”',
                '“Is my main argument clear? Where would a reader get lost?”',
                '“List my grammar mistakes, I’ll fix them myself”'
              ] }
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
            { type: 'quiz', q: 'Your teacher didn’t say anything about AI for this essay. What do you do?',
              options: ['Ask the teacher what’s allowed', 'Use it for everything, nobody said no', 'Use it and hide it'],
              explain: 'When the rules aren’t clear, ask. It takes a minute and saves you trouble.' },
            { type: 'quiz', q: 'Which prompt improves your essay while keeping it yours?',
              options: ['Point out the 3 weakest spots and explain why, don’t rewrite', 'Rewrite my essay so it gets an A', 'Write the conclusion for me'],
              explain: 'You stay the author, AI is the editor.' },
            { type: 'talk', kicker: '✍️ Write a prompt', title: 'Feedback, not a rewrite',
              question: 'Write a prompt asking AI for feedback on a paragraph you wrote, without letting it rewrite your work.',
              placeholder: 'Write your feedback prompt…',
              points: [
                'Says what the text is and what it’s for',
                'Asks for specific feedback: weak spots, clarity, arguments or grammar',
                'Clearly says not to rewrite the text',
                'Asks for explanations or hints so you can fix it yourself'
              ],
              sample: 'Here’s the intro paragraph of my history essay for 11th grade. Don’t rewrite it. Tell me the 2 weakest sentences and why they’re weak, and give me a hint how to fix each one. [paragraph]' },
            { type: 'mission', title: 'Editor mode',
              text: 'Take something you’ve written recently: an essay, a post, a story. Ask AI to be your editor.',
              prompt: 'You’re my editor. Don’t rewrite my text. Point out the 3 weakest spots, explain why, and give me a hint for each. [your text]',
              note: 'No access to AI? Skip it, it won’t affect your stars.' }
          ]
        },
        {
          id: 't2', icon: '🦉', title: 'The Owl’s Exam', minutes: 6, test: true,
          goal: 'The final test of the Study Grove: 8 questions on using AI for studying. Score 50% or more to open the next block.',
          tasks: [
            { type: 'quiz', q: 'What’s Bloop’s rule for studying with AI?',
              options: ['Try it yourself first, then ask AI where you got stuck', 'Ask AI first to save time', 'Never use AI for school'],
              explain: 'Your attempt first, then AI as a tutor.' },
            { type: 'quiz', q: 'Which request turns AI into a tutor?',
              options: ['Don’t give me the answer, give me a hint for the next step', 'Solve all of these', 'Write the answers in a list'],
              explain: 'Hints keep you doing the thinking.' },
            { type: 'quiz', q: 'What’s the best way to prepare for a test with AI?',
              options: ['Have it quiz you on your notes and explain your mistakes', 'Have it write a summary you reread', 'Have it make a cheat sheet'],
              explain: 'Testing yourself makes you remember far more than rereading.' },
            { type: 'quiz', q: 'Why add “use only my notes” to a quiz prompt?',
              options: ['The questions match your class and AI makes less up', 'AI works faster', 'It’s required by law'],
              explain: 'Your notes keep AI focused on what you actually need.' },
            { type: 'quiz', q: 'Which of these is honest use of AI for an essay?',
              options: ['Asking for feedback on your draft', 'Handing in AI text with a few words changed', 'Asking AI to write it “in your style”'],
              explain: 'Feedback on your own writing is fair. AI text with your name on it isn’t.' },
            { type: 'quiz', q: 'You used AI to brainstorm. What’s the honest thing to do?',
              options: ['Say how you used it if your teacher asks or the rules require it', 'Pretend you didn’t use it', 'Delete the chat history'],
              explain: 'Being open about AI use is part of using it fairly.' },
            { type: 'quiz', q: 'Your solution doesn’t match the answer key. Best prompt?',
              options: ['Find where I went wrong, but don’t fix it for me', 'Just give me the right answer', 'Solve it ten times'],
              explain: 'Finding your own mistake is how you stop making it.' },
            { type: 'quiz', q: 'AI’s explanation still makes no sense to you. What do you do?',
              options: ['Ask for a different explanation with an everyday example', 'Memorize it word for word', 'Skip the topic'],
              explain: 'A new angle often makes it click.' }
          ]
        }
      ]
    },
    {
      id: 'b3', title: 'Makers’ Glade', subtitle: 'AI for your own projects',
      lessons: [
        {
          id: 'l8', icon: '💡', title: 'From idea to plan', minutes: 8,
          goal: 'Use AI to brainstorm, choose an idea and break a project into steps.',
          tasks: [
            { type: 'cards', cards: [
              { pose: 'idea', title: 'Great at ideas, bad at choosing',
                text: 'AI can give you 20 ideas in seconds. But only you know what excites you, what you have time for and what your teacher expects. So AI suggests, you decide.' },
              { pose: 'point', title: 'The project loop', list: [
                '💡 Brainstorm: ask for lots of ideas',
                '🎯 Choose: you pick, using your own criteria',
                '🗺 Plan: break it into steps with deadlines',
                '🔨 Make: you do the work, AI gives feedback',
                '🔎 Check: facts, sources and rules'
              ] }
            ] },
            { type: 'video', title: 'AI as your project partner', src: '', youtube: '', scenes: [
              { sec: 6, pose: 'hello', screen: 'Got a project? Get a partner',
                voice: 'A project feels huge at the start. AI can be your partner. Here’s how.',
                visual: 'Teen facing a giant mountain labeled PROJECT, robot mascot appears with a backpack and a map, flat cartoon' },
              { sec: 9, pose: 'idea', screen: 'Step 1: lots of ideas',
                voice: 'Ask for fifteen ideas, not one. AI is fast at quantity. Then you pick what actually excites you.',
                visual: 'Dozens of idea cards fly out of a phone and land on a table, the teen picks one glowing card' },
              { sec: 9, pose: 'point', screen: 'Step 2: a real plan',
                voice: 'Ask it to break your idea into steps with deadlines. A huge project becomes a to-do list.',
                visual: 'The mountain turns into a staircase of small steps with dates, checkboxes appear next to each step' },
              { sec: 9, pose: 'think', screen: 'Step 3: you make, AI reviews',
                voice: 'You do the actual work. AI gives feedback: what’s unclear, what’s missing, what to cut.',
                visual: 'Teen building a cardboard model, robot holds a magnifying glass and points at one part with a sticky note' },
              { sec: 7, pose: 'victory', screen: 'Your project, your call',
                voice: 'AI helps. But the ideas you choose and the work you do are yours.',
                visual: 'Teen stands on top of the mountain with a flag, robot cheers below, sunrise' }
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
            { type: 'quiz', q: 'AI gave you 15 project ideas. What’s next?',
              options: ['Pick 2–3 by your own criteria and ask AI for pros and cons', 'Take the first one', 'Ask for 15 more, forever'],
              explain: 'Narrow down with your own criteria, then use AI to stress-test the choice.' },
            { type: 'quiz', q: 'Which detail makes AI’s project plan realistic?',
              options: ['Your deadline, budget and what equipment you have', 'Your favorite food', 'How many followers you have'],
              explain: 'Constraints turn a dream plan into one you can actually do.' },
            { type: 'talk', kicker: '✍️ Write a prompt', title: 'Idea → plan',
              question: 'You have a project idea and two weeks. Write a prompt that asks AI to turn your idea into a step-by-step plan.',
              placeholder: 'Write your planning prompt…',
              points: [
                'Describes the idea or project',
                'Gives the deadline and other limits: time per day, budget, tools',
                'Asks for steps with dates or a schedule',
                'Sets a format, for example a checklist or a table'
              ],
              sample: 'You’re a project coach. My project: a 3-minute video about how my city recycles. I have 2 weeks, about 1 hour a day and only my phone. Break it into steps with a date for each, as a checklist, and point out what could go wrong.' },
            { type: 'mission', title: 'Brainstorm for real',
              text: 'Think of something you’d like to make: a video, a presentation, a guide, a small event. Ask AI for ideas, then choose yourself.',
              prompt: 'Suggest 15 ideas for [type of project] about [topic you like]. I have [time] and [budget/tools]. For each idea: one sentence and how hard it is.',
              note: 'No access to AI? Skip it, it won’t affect your stars.' }
          ]
        },
        {
          id: 'x2', icon: '🔬', title: 'Research like a pro', minutes: 9, extra: true,
          goal: 'Use AI to research a question and back every claim with a real source.',
          tasks: [
            { type: 'cards', cards: [
              { pose: 'think', kicker: 'Side quest', title: 'Chatbot ≠ search engine',
                text: 'Some chatbots can search the web and show links. Others answer only from what they learned, which may be outdated. Always know which one you’re using, and never treat its answer as the source itself.' },
              { pose: 'point', title: 'The research loop', list: [
                'Ask AI to map the topic: key questions and terms to search for',
                'Find real sources: encyclopedias, official sites, studies, books',
                'Use AI to explain the hard parts of those sources',
                'Check every number and quote in the original',
                'Write down where each fact came from'
              ] }
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
            { type: 'quiz', q: 'AI cited “Smith et al., 2021”, but you can’t find it anywhere. What’s most likely?',
              options: ['The source may be made up: drop it or find a real one', 'The website is down, cite it anyway', 'Ask AI for another link and trust it'],
              explain: 'If you can’t find a source, you can’t use it. AI can invent citations that look real.' },
            { type: 'quiz', q: 'Two reliable sources give different numbers. What do you do?',
              options: ['Check which is newer and more trustworthy, and mention the difference if it matters', 'Pick the bigger number', 'Average them'],
              explain: 'Good research notices disagreement instead of hiding it.' },
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
            { type: 'mission', title: 'Map a topic',
              text: 'Pick a question you’re curious about and let AI help you start the research, not finish it.',
              prompt: 'I’m researching: [question]. Don’t answer it. Give me 5 key sub-questions, 8 search terms and the types of sources I should look for.',
              note: 'No access to AI? Skip it, it won’t affect your stars.' }
          ]
        },
        {
          id: 'l9', icon: '🎨', title: 'Make it visual', minutes: 8,
          goal: 'Create images for your projects with AI and use them the right way.',
          tasks: [
            { type: 'cards', cards: [
              { pose: 'idea', title: 'An image prompt has its own formula', big: 'Subject + Style + Details + Mood', list: [
                '🧩 Subject: what’s in the picture',
                '🖌 Style: photo, flat illustration, watercolor, 3D…',
                '🔍 Details: setting, colors, light, angle',
                '🌈 Mood: calm, epic, funny, serious'
              ] },
              { pose: 'joy', title: 'Example',
                chat: 'A sea turtle swimming among plastic bags, flat illustration, bright blue water with sunlight from above, serious but hopeful mood',
                text: 'Each part of the formula is there, so the image matches your idea instead of something random.' },
              { pose: 'sad', title: 'Rules for AI images', list: [
                'No images of real people without their consent',
                'Label AI images: “made with AI”',
                'Check your school’s rules and the tool’s age limits',
                'Look closely: hands, text and logos often come out wrong'
              ] }
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
                { t: 'An illustration of a historical event, labeled as AI', b: 0, why: 'Labeled illustrations are fine for slides.' },
                { t: 'A celebrity “endorsing” your project', b: 1, why: 'Using a real person’s face without consent is misleading.' },
                { t: 'Icons for your presentation', b: 0, why: 'Simple graphics are a great use of AI.' },
                { t: 'A realistic “news photo” of an event that never happened, without a label', b: 1, why: 'That’s a fake that can mislead people.' }
              ] },
            { type: 'quiz', q: 'The AI image for your slide has a sign with weird, broken letters. What do you do?',
              options: ['Generate it without text and add the text yourself', 'Use it anyway', 'Tell everyone it’s a real photo'],
              explain: 'Image generators often mess up text. Add titles in your slide editor instead.' },
            { type: 'quiz', q: 'Where does “made with AI” belong?',
              options: ['On or next to any AI image you share', 'Nowhere, nobody checks', 'Only on funny images'],
              explain: 'A label is honest and keeps people from mistaking it for a real photo.' },
            { type: 'talk', kicker: '✍️ Write a prompt', title: 'Your cover image',
              question: 'Write an image prompt for the cover of a project you’d like to make. Use Subject, Style, Details and Mood.',
              placeholder: 'Write your image prompt…',
              points: [
                'Subject: what’s in the picture',
                'Style: for example illustration, photo, watercolor',
                'Details: setting, colors, light or angle',
                'Mood, and no real people without consent'
              ],
              sample: 'A small robot planting a tree on a rooftop garden in a big city, flat illustration, warm sunset light and green leaves, hopeful and calm mood, empty space at the top for a title.' },
            { type: 'mission', title: 'Make a cover',
              text: 'If you’re allowed to use an image generator, make a cover for your project. Then check it closely before using it.',
              steps: [
                'Write the prompt with Subject, Style, Details, Mood',
                'Generate 2–3 versions',
                'Check hands, faces, text and logos',
                'Label it “made with AI” when you use it'
              ],
              prompt: '[Subject], [style], [details: setting, colors, light], [mood], empty space at the top for a title',
              note: 'No access to an image generator? Skip it, it won’t affect your stars.' }
          ]
        },
        {
          id: 'x3', icon: '🛠', title: 'Build your own study bot', minutes: 10, extra: true,
          goal: 'Write instructions that turn a chatbot into your personal study helper.',
          tasks: [
            { type: 'cards', cards: [
              { pose: 'idea', kicker: 'Side quest', title: 'Instructions that stick',
                text: 'Many chatbots let you save instructions that apply to every chat: look for custom instructions, projects or custom bots in the settings. Write them once, and the bot behaves your way every time.' },
              { pose: 'point', title: 'What good bot instructions include', list: [
                '🎭 Role: who the bot is and for which subject',
                '🎯 Goal: what it helps you do',
                '📏 Rules: what it must always or never do',
                '🗣 Style: length, tone, one step at a time',
                '❓ When unsure: ask a question instead of guessing'
              ] },
              { pose: 'joy', title: 'Example', chat: 'You’re my chemistry study helper for 10th grade. Help me understand, not finish my homework. Never give final answers: give hints and ask me questions. Keep replies under 100 words. If my question is unclear, ask what I mean.' }
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
            { type: 'quiz', q: 'Your bot gives final answers even though the rules say not to. What do you do?',
              options: ['Make the rule clearer and more specific, then test again', 'Delete the bot', 'Add “please” to every message'],
              explain: 'Vague rules get ignored. Clear, specific rules work better.' },
            { type: 'quiz', q: 'Why add “if my question is unclear, ask what I mean”?',
              options: ['So the bot asks instead of guessing', 'So the bot talks longer', 'It doesn’t matter'],
              explain: 'A question costs one message. A wrong guess costs much more.' },
            { type: 'talk', kicker: '🛠 Build a bot', title: 'Your bot’s instructions',
              question: 'Write the instructions for your own study bot: pick a subject and include role, goal, rules and style.',
              placeholder: 'Write your bot instructions…',
              points: [
                'Role: the subject and your level',
                'Goal: helps you learn, not do the work',
                'Rules: for example hints instead of answers, quiz you, say when unsure',
                'Style: length or one step at a time'
              ],
              sample: 'You’re my biology study helper for 9th grade. Your goal is to help me understand topics and prepare for tests. Never write my assignments. Quiz me first, then explain what I got wrong, and say when you’re not sure. Keep replies short, one question at a time.' },
            { type: 'mission', title: 'Set it up for real',
              text: 'If your chatbot has custom instructions or projects, save your bot there. If not, paste the instructions at the start of a new chat.',
              prompt: 'You’re my [subject] study helper for [grade]. Help me learn, never do my assignments. Quiz me first, give hints instead of answers, say when you’re unsure. Short replies, one step at a time.',
              note: 'No access to AI? Skip it, it won’t affect your stars.' }
          ]
        },
        {
          id: 'l10', icon: '🚀', title: 'Your AI project', minutes: 10,
          goal: 'Plan a mini-project from start to finish, with AI as your assistant.',
          tasks: [
            { type: 'cards', cards: [
              { pose: 'joy', title: 'Pick something you care about', list: [
                '📚 A study guide for a hard topic',
                '🎬 A short video script about your hobby',
                '📊 A presentation for class',
                '🗺 A guide to your city for visitors your age'
              ] },
              { pose: 'point', kicker: 'Pro move', title: 'Keep an AI log',
                text: 'Write down what you used AI for: “brainstormed ideas”, “got feedback on my outline”. It keeps you honest and shows your teacher how you worked.' }
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
            { type: 'talk', kicker: '🚀 Your project', title: 'Pitch your project',
              question: 'Describe your mini-project: what you’ll make, how you’ll use AI at each step, and what you’ll do yourself.',
              placeholder: 'Describe your project…',
              points: [
                'What you’ll make and for whom',
                'How AI helps: ideas, plan, feedback or explanations',
                'What you do yourself: choices, the actual work, checking facts',
                'How you’ll stay honest: an AI log or labels'
              ],
              sample: 'I’ll make a 3-minute video about the oldest buildings in my town for my history class. AI helps me brainstorm questions, plan the shots and give feedback on my script. I’ll film, write and check the facts myself in the local museum’s materials. I’ll keep an AI log and mention it at the end.' },
            { type: 'mission', title: 'Kick it off',
              text: 'Start your real mini-project today: send the kickoff prompt and open your AI log.',
              prompt: 'You’re a project coach. I want to make [project] about [topic] for [who it’s for]. I have [time] and [tools]. Help me plan: structure, steps with deadlines, and what could go wrong. Ask me 2 questions first.',
              note: 'No access to AI? Skip it, it won’t affect your stars.' }
          ]
        },
        {
          id: 't3', icon: '🏆', title: 'The Final Challenge', minutes: 7, test: true,
          goal: 'The last test of the trail: 10 questions on using AI for projects and everything before. Score 50% or more to finish the course.',
          tasks: [
            { type: 'quiz', q: 'AI gave you 15 ideas for your project. Who picks one?',
              options: ['You, using your own criteria', 'AI, it knows best', 'Whoever answers first'],
              explain: 'AI suggests, you decide.' },
            { type: 'quiz', q: 'What makes AI’s project plan realistic?',
              options: ['Telling it your deadline, budget and tools', 'Asking it to hurry', 'Using capital letters'],
              explain: 'Real limits make a real plan.' },
            { type: 'quiz', q: 'Which part is the image prompt formula?',
              options: ['Subject + Style + Details + Mood', 'Role + Task + Context + Format', 'Title + Font + Color'],
              explain: 'Images have their own formula. RTCF is for text prompts.' },
            { type: 'quiz', q: 'Which AI image is fine for a school presentation?',
              options: ['A labeled illustration of a historical event', 'A fake photo of a classmate', 'A celebrity “endorsing” your project'],
              explain: 'No real people without consent, and label AI images.' },
            { type: 'quiz', q: 'Why keep an AI log?',
              options: ['It shows honestly how you used AI', 'It makes AI smarter', 'It’s a secret diary for the bot'],
              explain: 'Being open about AI use builds trust.' },
            { type: 'quiz', q: 'A statistic from AI has no source you can find. What do you do?',
              options: ['Don’t use it, or find a real source', 'Use it, it sounds right', 'Round it and use it'],
              explain: 'No source, no number.' },
            { type: 'quiz', q: 'What’s the best use of AI when you’re stuck on homework?',
              options: ['Ask for a hint for the next step', 'Ask for the full solution to copy', 'Skip the homework'],
              explain: 'Hints get you unstuck and keep the skill with you.' },
            { type: 'quiz', q: 'You switch from your science project to writing a birthday card. What do you do?',
              options: ['Start a new chat', 'Keep going in the same chat', 'Turn off the computer'],
              explain: 'New task, new chat.' },
            { type: 'quiz', q: 'Which of these should never go into a chatbot?',
              options: ['Your password', 'Your project topic', 'Your outline'],
              explain: 'Passwords, documents and personal details stay with you.' },
            { type: 'quiz', q: 'Which sentence sums up the whole trail?',
              options: ['AI is a powerful helper: you steer it, check it and own the result', 'AI does everything, you just copy', 'AI is always right'],
              explain: 'That’s it. Go build something!' }
          ]
        }
      ]
    }
  ]
};

var LEVELS = [
  { xp: 0,    title: 'Trail Rookie' },
  { xp: 60,   title: 'Young Tracker' },
  { xp: 150,  title: 'Forest Edge Expert' },
  { xp: 280,  title: 'Prompt Ranger' },
  { xp: 450,  title: 'Study Ranger' },
  { xp: 700,  title: 'Forest Hacker' },
  { xp: 1000, title: 'Project Builder' },
  { xp: 1400, title: 'Forest Keeper' },
  { xp: 1900, title: 'AI Master' }
];

var XP_RULES = {
  correct: 10,
  combo: 5,
  comboFrom: 3,
  lessonDone: 20,
  perfect: 30,
  blockDone: 100
};

var BADGES = [
  { id: 'first-step', icon: '👣', title: 'First Step',          desc: 'Complete your first station',          check: function (s, t) { return t.lessonsDone >= 1; } },
  { id: 'sniper',     icon: '🎯', title: 'Sharpshooter',        desc: 'Complete a lesson with zero mistakes', check: function (s, t) { return t.perfectLessons >= 1; } },
  { id: 'on-fire',    icon: '🔥', title: 'On Fire',             desc: '5 tasks in a row with no mistakes',    check: function (s) { return s.bestCombo >= 5; } },
  { id: 'streak-3',   icon: '📅', title: 'Three Days Straight', desc: 'Study 3 days in a row',                check: function (s) { return s.bestStreak >= 3; } },
  { id: 'block-b1',   icon: '🌳', title: 'Forest Edge Tracker', desc: 'Pass the Great Oak Challenge',         check: function (s, t) { return t.blocksDone.indexOf('b1') >= 0; } },
  { id: 'side-quest', icon: '🧭', title: 'Trailblazer',         desc: 'Complete a side quest',                check: function (s, t) { return t.extrasDone >= 1; } },
  { id: 'block-b2',   icon: '🦉', title: 'Study Grove Scholar', desc: 'Pass the Owl’s Exam',                  check: function (s, t) { return t.blocksDone.indexOf('b2') >= 0; } },
  { id: 'block-b3',   icon: '🏆', title: 'AI Trail Finisher',   desc: 'Pass the Final Challenge',             check: function (s, t) { return t.blocksDone.indexOf('b3') >= 0; } },
  { id: 'explorer',   icon: '🗺', title: 'Explorer',            desc: 'Complete every side quest',            check: function (s, t) { return t.extrasTotal > 0 && t.extrasDone === t.extrasTotal; } }
];

if (typeof module !== 'undefined') {
  module.exports = { COURSE: COURSE, LEVELS: LEVELS, XP_RULES: XP_RULES, BADGES: BADGES };
}
