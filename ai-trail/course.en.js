'use strict';

// English content of the AI Trail course. Same structure and ids as course.js (see the format notes there):
// the engine, XP rules and lesson order are shared, only the texts differ.

var COURSE = {
  id: 'ai-trail',
  title: 'AI Trail',
  age: '14–15 years',
  blocks: [
    {
      id: 'b1', title: 'Forest Edge', subtitle: 'What AI is and how to work with it',
      lessons: [
        {
          id: 'l1', icon: '🤖', title: 'What is AI', minutes: 5,
          goal: 'Find out what AI really is and how it learns.',
          tasks: [
            { type: 'cards', cards: [
              { pose: 'hello', title: 'Hi, I’m Bloop!',
                text: 'I’ll guide you along the AI Trail. Each station is a short lesson: a bit of theory, a video, some practice and a mini-test. Correct answers earn you XP and stars.' },
              { pose: 'point', kicker: 'The key idea in 10 seconds', title: 'AI is a program that learned from examples',
                text: 'A regular program is written step by step by a person: “button pressed → turn on the light”. Nobody explains the rules to AI. It’s shown millions of examples and finds the patterns by itself.' },
              { pose: 'think', title: 'What that looks like', list: [
                'Shown a million photos labeled “cat” → AI recognizes cats in new photos',
                'Given a mountain of text to read → AI writes text and answers questions',
                'Given thousands of hours of speech → AI understands voice commands'
              ] },
              { pose: 'wink', title: 'What AI is not',
                text: 'AI isn’t alive. It has no feelings or opinions of its own, and it doesn’t “know” the world the way you do. It’s just really good at guessing which answer fits, based on what it has seen before.',
                reveal: { q: 'Do you think AI gets jokes?',
                  a: 'It knows how jokes usually work and can write a similar one. But does it find them funny? Nope. It feels nothing.' } }
            ] },
            { type: 'video', title: 'How AI learned to spot cats', src: '', youtube: '', scenes: [
              { sec: 7, pose: 'hello', screen: 'How does AI tell a cat from a dog?',
                voice: 'How does AI know a photo shows a cat and not a dog? Let me show you.',
                visual: 'Cute flat-style robot mascot waves at camera in a sunny cartoon forest clearing, photos of a cat and a dog float beside it' },
              { sec: 10, pose: 'think', screen: 'Rules don’t work',
                voice: 'You could write rules: pointy ears, whiskers. But dogs can have whiskers too, and a cat can flatten its ears. The rules break.',
                visual: 'Checklist with "triangle ears" and "whiskers" crossing out one by one, confused dog with whiskers, flat 2D motion graphics' },
              { sec: 9, pose: 'point', screen: '1,000,000 examples',
                voice: 'So instead, AI is shown a million photos: this is a cat, this isn’t. At first it gets it wrong all the time.',
                visual: 'Endless wall of small cat and dog photos with labels scrolling fast, robot watching, flat colorful style' },
              { sec: 6, pose: 'surprise', screen: 'Mistake → adjust → try again',
                voice: 'After every mistake, AI tweaks its settings a tiny bit. Millions of times.',
                visual: 'Robot turning many small knobs on a control panel, red cross turns into green check, fast loop' },
              { sec: 8, pose: 'joy', screen: 'Learning = examples + mistakes',
                voice: 'In the end, it recognizes cats even in photos it has never seen. That’s what we call learning.',
                visual: 'New cat photo appears, robot highlights it with a green frame and the label "cat", confetti' },
              { sec: 6, pose: 'wink', screen: 'AI only knows what it learned from',
                voice: 'But if you only show AI ginger cats, it might not recognize a black one.',
                visual: 'Row of ginger cats, then a black cat appears with a question mark above it, robot shrugs' }
            ] },
            { type: 'sort', title: 'AI or a regular program?',
              text: 'Hint: AI is needed when a program has to recognize or guess something, not just follow a command.',
              buckets: ['🤖 Uses AI', '⚙️ Regular program'],
              items: [
                { t: 'TikTok recommendations feed', b: 0, why: 'AI guesses which video you’ll like.' },
                { t: 'Alarm set for 7:00', b: 1, why: 'It just goes off at a set time.' },
                { t: 'Bunny-ear camera filter', b: 0, why: 'AI finds your face in the video and tracks it.' },
                { t: 'Calculator', b: 1, why: 'It follows exact rules, nothing to guess.' },
                { t: 'Translating text from a photo', b: 0, why: 'AI recognizes the letters and translates the meaning.' },
                { t: 'Microwave timer', b: 1, why: 'It counts down seconds, no AI involved.' }
              ] },
            { type: 'quiz', q: 'How does AI learn to recognize cats in photos?',
              options: ['It looks at a huge number of labeled photos', 'A programmer describes every cat by hand', 'AI is born already knowing everything'],
              explain: 'AI learns from examples: the more there are and the more varied they are, the better the result.' },
            { type: 'quiz', q: 'AI has only seen ginger cats. What happens with a photo of a black cat?',
              options: ['It might not recognize it as a cat', 'It definitely will, it’s AI', 'It will turn the cat ginger'],
              explain: 'AI only knows what it learned from. Examples that are all alike create blind spots.' },
            { type: 'quiz', q: 'Which of these is true about AI?',
              options: ['It’s a program that finds patterns', 'AI has feelings and opinions', 'AI always knows the right answer'],
              explain: 'AI is a powerful tool, but it has no feelings and no guarantee of being right.' }
          ]
        },
        {
          id: 'l2', icon: '🧭', title: 'Why you need AI', minutes: 5,
          goal: 'Find out where AI really helps, and where it only does harm.',
          tasks: [
            { type: 'cards', cards: [
              { pose: 'idea', kicker: 'AI is a helper', title: 'A booster, not a cheat sheet',
                text: 'AI helps you think faster. But if you hand it all the work, you won’t learn anything. And AI won’t be next to you during a test.' },
              { pose: 'point', title: 'Green zones', list: [
                '📚 Explain a tough topic in simple words',
                '💡 Brainstorm ideas for a project, a video or a gift',
                '🗓 Make a plan: test prep, workouts',
                '✍️ Find the mistakes in your own writing',
                '🗣 Practice a foreign language in conversation'
              ] },
              { pose: 'sad', title: 'Red zones', list: [
                'Handing in AI-written text as your own',
                'Sending photos of documents, your address, passwords',
                'Using AI to make mean stuff or fakes about people',
                'Blindly trusting health or money advice: that’s for adults and experts'
              ] },
              { pose: 'wink', title: 'Bloop’s rule', big: 'Think for yourself first, then call in AI',
                text: 'Try to solve it yourself, then ask AI to explain where you went wrong. That way your brain gets a workout instead of a nap.',
                reveal: { q: 'Why not just ask for the answer?',
                  a: 'You’ll get an answer, but not a skill. And the skill stays with you even when AI isn’t around.' } }
            ] },
            { type: 'video', title: 'AI and homework: the right way and the wrong way', src: '', youtube: '', scenes: [
              { sec: 7, pose: 'hello', screen: 'AI for homework: allowed or not?',
                voice: 'Is using AI for homework cheating or fine? It depends on how you use it.',
                visual: 'Robot mascot next to a school desk with notebook and phone, big question mark, flat cartoon style' },
              { sec: 10, pose: 'sad', screen: '❌ “Write my essay”',
                voice: 'The wrong way: “write an essay about autumn”. You hand it in, get a grade and learn nothing. And teachers notice texts like that.',
                visual: 'Phone chat with a long generated essay, teacher character raises an eyebrow, red cross stamp' },
              { sec: 9, pose: 'idea', screen: '✅ “Explain it like I’m 10”',
                voice: 'The right way: “explain fractions like I’m 10 years old”. You get the topic, and then you solve the problems yourself.',
                visual: 'Pizza sliced into fractions 1/2, 1/4, 1/8 appears from the chat, light bulb above a teen head' },
              { sec: 8, pose: 'point', screen: '✅ “Find the mistakes in my text”',
                voice: 'Or: “here’s my essay, find the mistakes and explain them”. The text is yours, and AI works as your tutor.',
                visual: 'Handwritten text with a few words highlighted in yellow and short notes on the margin' },
              { sec: 7, pose: 'joy', screen: 'AI = a 24/7 tutor',
                voice: 'Use AI like a tutor that never gets tired of questions. That’s the real superpower.',
                visual: 'Robot mascot in a tiny graduation cap gives a thumbs up, clock showing 24/7, green check' }
            ] },
            { type: 'sort', title: 'OK or not OK?',
              text: 'Sort these ways of using AI.',
              buckets: ['✅ OK', '⛔ Not OK'],
              items: [
                { t: 'Ask it to explain a topic in simple words', b: 0, why: 'You figure it out, AI helps you understand.' },
                { t: 'Copy an essay from the chat and hand it in', b: 1, why: 'That’s cheating, and your writing skills won’t grow.' },
                { t: 'Brainstorm 10 ideas for a school project', b: 0, why: 'Ideas are a great start; you choose and finish the work.' },
                { t: 'Send a photo of your passport so AI can fill in a form', b: 1, why: 'Documents and personal data don’t go into a chatbot.' },
                { t: 'Make a test prep plan', b: 0, why: 'AI is great at breaking a big task into steps.' },
                { t: 'Make a fake picture of a classmate', b: 1, why: 'Fakes about real people hurt, and sometimes they’re even illegal.' }
              ] },
            { type: 'quiz', q: 'Which request helps you learn, not just hand something in?',
              options: ['Explain how to solve equations like this and give me one to practice', 'Solve all the equations from my homework', 'Write the answers, I’ll copy them'],
              explain: 'When AI explains and lets you practice, the skill stays with you.' },
            { type: 'quiz', q: 'What is safe to tell a chatbot?',
              options: ['Your report topic and what you’re stuck on', 'Your home address and phone number', 'Your account password'],
              explain: 'Keep your address, phone number, passwords and documents to yourself.' },
            { type: 'quiz', q: 'AI suggested which pills to take for a headache. What should you do?',
              options: ['Ask an adult or a doctor', 'Take them right away, AI is smart', 'Take a double dose to be sure'],
              explain: 'AI can be wrong about health. Adults and doctors make these decisions.' }
          ]
        },
        {
          id: 'l3', icon: '🪄', title: 'How to ask the right way', minutes: 6,
          goal: 'Learn to write requests that get spot-on answers from AI.',
          tasks: [
            { type: 'cards', cards: [
              { pose: 'think', kicker: 'New word', title: 'A prompt is your task for AI',
                text: 'Everything you type into a chat with AI is called a prompt. Your prompt decides whether you get a masterpiece or a mess.' },
              { pose: 'sad', title: 'A bad prompt', chat: 'Tell me about space',
                text: 'AI doesn’t know who you are, why you need it or how long to make it. You’ll get a long, boring wall of text.' },
              { pose: 'joy', title: 'A good prompt',
                chat: 'You’re an astronomy teacher. Explain why there’s no air on the Moon. I’m 14 and preparing a 2-minute talk. Answer in 5 short bullet points.',
                text: 'It has everything AI needs to hit the target.' },
              { pose: 'idea', title: 'The RTCF formula', big: 'Role + Task + Context + Format', list: [
                '🎭 Role — who AI should be: “You’re a chemistry teacher”',
                '🎯 Task — what to do: “Explain…”, “Come up with…”',
                '📎 Context — details: your age, your goal, what you already know',
                '📐 Format — how to answer: “5 bullet points”, “as a table”, “under 100 words”'
              ] }
            ] },
            { type: 'video', title: 'One question, two answers', src: '', youtube: '', scenes: [
              { sec: 6, pose: 'hello', screen: 'Why does AI give the “wrong” answer?',
                voice: 'Sometimes you ask AI something and it answers something totally different. Let’s figure out why.',
                visual: 'Teen looks at a phone with a confused face, chat bubble with a long useless answer, flat cartoon' },
              { sec: 9, pose: 'sad', screen: '“Help with my report”',
                voice: 'Here’s a request: “help with my report”. AI doesn’t know the topic, your age or how much time you have. It’s guessing.',
                visual: 'Robot blindfolded throwing darts at a target, darts miss, playful flat animation' },
              { sec: 11, pose: 'point', screen: 'Role + Task + Context + Format',
                voice: 'Now try this: “You’re a biology teacher. Make an outline for a report on bees. I’m 14, the talk is 3 minutes. Give me a 5-point outline.”',
                visual: 'Four colorful puzzle pieces labeled Role, Task, Context, Format snap together into one prompt' },
              { sec: 9, pose: 'delight', screen: 'Spot-on answer',
                voice: 'And now the answer hits the target: a clear outline of the right length. Same AI, the task just got clear.',
                visual: 'Dart hits the bullseye, a neat 5-point plan about bees appears on the phone, bees fly around' },
              { sec: 7, pose: 'wink', screen: 'Not quite? Clarify!',
                voice: 'If you don’t like the answer, don’t start over. Just clarify: “shorter”, “simpler”, “add an example”.',
                visual: 'Chat with short follow-up messages "shorter", "simpler", "add an example", answer shrinks and gets clearer' }
            ] },
            { type: 'build', title: 'Build a prompt',
              goal: 'You need to prepare for a history test on Ancient Rome. Pick the best part for each slot.',
              slots: [
                { label: '🎭 Role', options: ['You’re a history teacher', 'You’re a pirate', 'You’re a cat'],
                  hint: 'You need someone who knows the subject.' },
                { label: '🎯 Task', options: ['Write 10 self-check questions about the Roman Empire', 'Tell me something interesting', 'Write a poem about summer'],
                  hint: 'The task should help with the test specifically.' },
                { label: '📎 Context', options: ['I’m in 8th grade, the test is on Friday, I mix up the dates', 'The weather is nice today', 'My favorite color is blue'],
                  hint: 'Context means details that matter for the task.' },
                { label: '📐 Format', options: ['Questions as a list, answers at the end', 'Whatever you like', 'One long paragraph'],
                  hint: 'The format should make practice easy.' }
              ],
              reply: 'Great, here are your self-check questions:\n1. Who was the first Roman emperor?\n2. What was the Roman Senate?\n3. Why did the Romans build aqueducts?\n…\nAnswers at the end 👇' },
            { type: 'quiz', q: 'Which prompt will work better?',
              options: ['You’re a coach. Make a home workout plan with no equipment for a 14-year-old: 3 times a week, 30 minutes each', 'Workouts', 'Give me exercises'],
              explain: 'It has a role, a task, context and a format, so AI knows exactly what you need.' },
            { type: 'quiz', q: '“Answer as a table with 3 columns” — which part of the formula is that?',
              options: ['Format', 'Role', 'Context'],
              explain: 'Format is how the answer should look.' },
            { type: 'quiz', q: 'AI’s answer is too complicated. What should you do?',
              options: ['Write: “Explain it more simply, with a real-life example”', 'Close the chat forever', 'Repeat the same question in caps'],
              explain: 'A follow-up request is the best way to polish an answer.' },
            { type: 'mission', title: 'Mission in a real AI',
              text: 'Open a chatbot your parents or school allow you to use. Send this prompt, then just send “tell me about the Moon”. Compare the answers.',
              prompt: 'You’re an astronomy teacher. Explain why there’s no air on the Moon. I’m 14 and preparing a 2-minute talk. Answer in 5 short bullet points.',
              note: 'No access to AI? Skip it, it doesn’t affect your stars.' }
          ]
        },
        {
          id: 'l4', icon: '🔍', title: 'AI makes mistakes too', minutes: 6,
          goal: 'Understand why AI sometimes makes things up, and learn to catch it.',
          tasks: [
            { type: 'poll', title: 'Think like a neural network',
              text: 'A chatbot writes its answer one word at a time: each time, it guesses the most likely next word. Try it yourself.',
              phrase: 'The cat is sitting on the…',
              options: [{ t: 'windowsill', p: 46 }, { t: 'couch', p: 31 }, { t: 'fence', p: 19 }, { t: 'Moon', p: 4 }],
              explain: 'That’s how a chatbot works: it picks a likely word, then the next one, and so on for the whole answer. It doesn’t check facts along the way. The percentages here are approximate.' },
            { type: 'cards', cards: [
              { pose: 'surprise', kicker: 'New word', title: 'AI hallucination',
                text: 'Sometimes AI confidently writes things that aren’t real: made-up facts, dates, books and quotes. This is called a hallucination. It isn’t lying on purpose; it’s just picking words that sound believable.' },
              { pose: 'think', title: 'Where AI slips up most', list: [
                'Exact numbers and dates',
                'Recent news: it may have learned from old data',
                'Links and book titles: it can invent them',
                'Mental math: it can miscalculate'
              ] },
              { pose: 'point', title: 'How to catch mistakes', big: 'AI’s answer is a draft, not the truth', list: [
                'Check any important fact in two reliable sources',
                'Ask AI: “How do you know that? Give me a source”',
                'Sounds too good to be true? Double-check it'
              ] }
            ] },
            { type: 'video', title: 'Why AI makes mistakes with a straight face', src: '', youtube: '', scenes: [
              { sec: 5, pose: 'hello', screen: 'Can AI be wrong?',
                voice: 'Spoiler: yes, and how. And with a very confident face.',
                visual: 'Robot mascot in sunglasses looking overconfident, cartoon forest background' },
              { sec: 9, pose: 'think', screen: 'Word by word',
                voice: 'A chatbot writes its answer one word at a time, each time picking the most likely next word. It doesn’t check a textbook.',
                visual: 'Words appear one by one on a chat bubble, each with a small probability bar above it' },
              { sec: 9, pose: 'surprise', screen: 'Sounds true ≠ is true',
                voice: 'So it can make up a date, a quote or even a whole book, just because it sounds like the truth.',
                visual: 'Book with a made-up title appears, then a magnifying glass reveals the cover is empty' },
              { sec: 8, pose: 'point', screen: 'Check 2 sources',
                voice: 'Your superpower is checking. Verify important facts in at least two reliable sources: a textbook, an encyclopedia, an official website.',
                visual: 'Two trusted sources (textbook and encyclopedia website) side by side with green checkmarks' },
              { sec: 5, pose: 'victory', screen: 'You decide, not AI',
                voice: 'AI is a helper. But you always decide what to believe.',
                visual: 'Teen holds a phone confidently, robot jumps with joy next to them, sunny forest' }
            ] },
            { type: 'spot', title: 'Find the hallucination',
              text: 'AI answered a question about the Eiffel Tower. One sentence is made up. Tap it.',
              sentences: ['The Eiffel Tower stands in Paris.', 'It was built for the 1889 World’s Fair.', 'The tower is about 330 meters tall.', 'The tower was designed by Leonardo da Vinci.'],
              wrong: 3,
              explain: 'Leonardo da Vinci died more than 350 years before the tower was built. It was built by engineer Gustave Eiffel’s company, which is where the name comes from.' },
            { type: 'spot', title: 'What should go?', who: '✉️ Emma’s message',
              text: 'Emma wants to send this message to a chatbot. Which part should she remove first?',
              sentences: ['Hi! Help me come up with a birthday gift for my mom.', 'She likes flowers and books, my budget is $20.', 'I live at 5 Forest Street, apartment 12, my number is +1 555 000 0000.', 'Answer with a list of 5 ideas.'],
              wrong: 2,
              explain: 'Her address and phone number aren’t needed for this task. Never send personal data to chatbots.' },
            { type: 'quiz', q: 'What is an AI hallucination?',
              options: ['AI confidently makes up something that isn’t real', 'AI dreams while it’s switched off', 'AI freezes and stops answering'],
              explain: 'A hallucination is a believable but made-up answer.' },
            { type: 'quiz', q: 'AI gave you the date of an event for your report. What do you do?',
              options: ['Check it in a textbook or encyclopedia', 'Paste it straight into the report', 'Ask AI again and trust the second answer'],
              explain: 'Asking the same AI again isn’t checking. You need an independent, reliable source.' }
          ]
        },
        {
          id: 't1', icon: '🌳', title: 'The Great Oak Challenge', minutes: 5, test: true,
          goal: 'The final test of the Forest Edge: 8 questions covering every station. Score 50% or more to complete the block.',
          tasks: [
            { type: 'quiz', q: 'AI is…',
              options: ['A program that learns from examples', 'A living creature inside a computer', 'A regular calculator, just faster'],
              explain: 'AI finds patterns in a huge number of examples.' },
            { type: 'quiz', q: 'Where is AI definitely at work here?',
              options: ['A voice assistant understands what you say', 'A timer counts down 5 minutes', 'A flashlight turns on with a button'],
              explain: 'Understanding natural speech is a job for AI. A timer and a flashlight just follow a command.' },
            { type: 'quiz', q: 'For AI to recognize dogs of every breed, it needs…',
              options: ['Lots of different photos of different breeds', 'One very sharp photo', 'Only photos of dachshunds'],
              explain: 'Varied examples remove blind spots.' },
            { type: 'quiz', q: 'Which way of using AI builds your skills?',
              options: ['Ask it to explain the mistakes in your solution', 'Ask it to do everything for you', 'Copy the answer without reading it'],
              explain: 'You solve, AI explains — that way the skill stays with you.' },
            { type: 'quiz', q: 'Which of these is part of the RTCF formula?',
              options: ['Answer format', 'Screen color', 'Internet speed'],
              explain: 'Role, Task, Context, Format.' },
            { type: 'quiz', q: 'Which prompt will work better?',
              options: ['You’re a chef. Give me a 10-minute breakfast recipe with eggs and cheese, step by step', 'Food', 'Something about breakfast'],
              explain: 'Role, task, details and format — AI gets it the first time.' },
            { type: 'quiz', q: 'Why does AI sometimes make up facts?',
              options: ['It picks believable words and doesn’t check the truth', 'It wants to trick you', 'Hackers designed it that way'],
              explain: 'A chatbot guesses likely words. Believable doesn’t mean true.' },
            { type: 'quiz', q: 'What should you never send to a chatbot?',
              options: ['Passwords and document details', 'Your report topic', 'A question about physics homework'],
              explain: 'Keep personal data to yourself, even if AI asks very politely.' }
          ]
        }
      ]
    },
    {
      id: 'b2', title: 'Prompt Thicket', subtitle: 'Precise tasks for AI', soon: true,
      lessons: [{ title: 'Roles and style' }, { title: 'Multi-step conversations' }, { title: 'AI for studying' }]
    },
    {
      id: 'b3', title: 'Creators’ Glade', subtitle: 'Pictures, music and your own projects', soon: true,
      lessons: [{ title: 'Pictures from words' }, { title: 'Voice and music' }, { title: 'Your own AI project' }]
    }
  ]
};

var LEVELS = [
  { xp: 0,    title: 'Trail Rookie' },
  { xp: 60,   title: 'Young Tracker' },
  { xp: 150,  title: 'Forest Edge Expert' },
  { xp: 280,  title: 'Prompt Ranger' },
  { xp: 450,  title: 'Forest Hacker' },
  { xp: 700,  title: 'Forest Keeper' },
  { xp: 1000, title: 'AI Master' }
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
  { id: 'first-step', icon: '👣', title: 'First Step',          desc: 'Complete your first station',        check: function (s, t) { return t.lessonsDone >= 1; } },
  { id: 'sniper',     icon: '🎯', title: 'Sharpshooter',        desc: 'Complete a lesson with zero mistakes', check: function (s, t) { return t.perfectLessons >= 1; } },
  { id: 'on-fire',    icon: '🔥', title: 'On Fire',             desc: '5 tasks in a row with no mistakes',  check: function (s) { return s.bestCombo >= 5; } },
  { id: 'streak-3',   icon: '📅', title: 'Three Days Straight', desc: 'Study 3 days in a row',              check: function (s) { return s.bestStreak >= 3; } },
  { id: 'block-b1',   icon: '🌳', title: 'Forest Edge Tracker', desc: 'Pass the Great Oak Challenge',       check: function (s, t) { return t.blocksDone.indexOf('b1') >= 0; } }
];

if (typeof module !== 'undefined') {
  module.exports = { COURSE: COURSE, LEVELS: LEVELS, XP_RULES: XP_RULES, BADGES: BADGES };
}
