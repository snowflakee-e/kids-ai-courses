'use strict';

// Shared by the Channel landing page and the parent cabinet: content per age track, the age-driven theme and the cabinet store.
// Load after bobik.js (Bloop) and before the page script.

var ICON_PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
var ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>';

// How each episode uses screens. Letters work like TV ratings badges.
var RATINGS = {
    U: { label: 'Unplugged', desc: 'No screen at all: cards, games and paper.' },
    G: { label: 'Grown-up types', desc: 'AI is used, but a grown-up is at the keyboard.' },
    S: { label: 'Simulator', desc: "Bloop's practice chat with pre-made answers. No accounts." },
    R: { label: 'Real tool', desc: 'A real chatbot on your account, or a teen account you approve.' },
    W: { label: 'With you', desc: 'Done together with a parent.' },
    A: { label: 'In the app', desc: "Practice inside Bloop's built-in chat, no outside accounts." }
};

// Content per age track: kids-courses/choose-tell-check-own/curriculum.md (6-14) and ai-trail-v3/course.en.js (15-17)
var TRACKS = [
    {
        id: '6-8', min: 6, max: 8, name: 'Explorers', pose: 'hello',
        h1: "AI's first rules, learned at the kitchen table.",
        lead: 'Six short episodes, half of them with no screen. A grown-up always types.',
        season: "Bloop's Helper Habits",
        seasonLede: 'Your child learns that AI is a helper people taught, asks it clearly, spots its silly mistakes and keeps three secret rules.',
        games: [
            ['Teach Bloop', 'Episode 1', 'Kids train Bloop with cat and not-cat cards. Show only orange cats and Bloop calls a black cat "not a cat".', 'Shows that AI learns from the examples people give it.'],
            ['Silly Robot', 'Episode 3', 'A grown-up robot follows orders literally: "put bread on the peanut butter" and the bread lands on the jar.', 'Kids feel why clear words matter.'],
            ['Spot the Glitch', 'Episode 4', 'Find five hidden mistakes in an AI picture before the timer ends. The whole group plays against Glitch.', 'Checking becomes a game nobody loses.'],
            ['Safe or Secret? Run', 'Episode 5', 'Kids run to the green corner for safe things and the red corner for secrets.', 'Moving makes the three secret rules stick.'],
            ['Story Dice', 'Episodes 3 and 6', 'Roll three picture dice (who, what, where), say the sentence and a grown-up types it into the image tool.', 'Turns a clear request into play and ends with a page you can keep.']
        ],
        facts: [['6', 'episodes'], ['25', 'minutes each'], ['5', 'kids at most, a grown-up nearby']],
        lessons: [
            ['Bloop Is a Helper', ['Choose'], 'AI is a program people taught. It helps, you decide.', '"Who did it?" cards: toaster, Bloop, kid, mom. Sort what people do and what helpers do.', 'U', 'Made: sorted cards', 'Find 3 helpers at home: speaker, TV, phone.'],
            ['Robot or Me?', ['Choose'], "Some jobs are yours because they're fun or come from your heart.", 'Picture cards: a birthday drawing for mom, find a song, brush teeth, name a dragon. Sort into Me, Bloop helps, Together.', 'U', 'Think: "I keep ___ for me."', "Ask which job they'd never give a robot."],
            ['Tell Bloop Exactly', ['Tell'], 'Clear words get the right picture.', 'A grown-up plays a silly robot that does exactly what is said. Then the child tells the image tool who + what + color while the grown-up types.', 'G', 'How: vague picture vs clear picture', 'Play silly robot at dinner.'],
            ['Oops, Glitch!', ['Check'], 'Helpers make mistakes. We check.', "Glitch's picture with 5 mistakes, like a cat with 5 legs. Then ask for a dog with an umbrella and count what's wrong.", 'G', 'Made: circled mistakes', "Spot one mistake in a voice assistant's answer together."],
            ['Secrets Stay With Me', ['Own'], 'Never tell a computer your name, home, school or password.', '"Safe or secret?" game: favorite color is safe, home address is secret, a face photo means ask a grown-up.', 'U', 'Think: 3-rule sticker card', 'Stick the card next to the tablet.'],
            ['Made With Bloop', ['Own'], 'Say when AI helped.', 'Make one storybook page with the image tool, stamp it "made by me + Bloop" and learn the 4 gestures.', 'G', 'Made: signed page and rules card', 'Your child shows the page and the 4 gestures.']
        ],
        screenTitle: null,
        screenLede: 'When AI is used, a grown-up types and your child talks. Nobody gets an account.',
        rule: "A grown-up is at the keyboard. Most lessons are unplugged or run in Bloop's built-in simulator.",
        report: { child: 'Mia, 7', ep: 'After episode 4 of 6', meters: [3, 2, 2, 1], made: 'Five mistakes circled in Glitch\'s picture.', how: 'A vague picture next to a clear one.', think: '"I keep birthday drawings for me."' },
        price: '$149', per: 'per season',
        incl: ['6 episodes of 25 minutes', 'Up to 5 kids, a grown-up nearby', 'A parent report after every episode', 'A take-home card for every episode'],
        faq: [
            ['Isn\'t 6 too young for AI?', 'Your child already hears voice assistants and sees AI pictures. These episodes teach what AI is and three rules to stay safe, mostly with cards and games.'],
            ['Will my child chat with a robot?', 'No. Every time AI is used, a grown-up is at the keyboard. Kids never chat with AI alone.'],
            ['Do I need to be there?', 'A grown-up stays nearby in class. Each episode ends with one card of something to try together at home.']
        ]
    },
    {
        id: '9-11', min: 9, max: 11, name: 'Inventors', pose: 'idea',
        h1: 'Your child asks AI for a hint, not the answer.',
        lead: "Eight episodes on choosing, asking and checking. No chatbot accounts: Bloop's simulator answers.",
        season: "You're the Boss of AI",
        seasonLede: 'Your child decides which tasks go to AI, writes a 3-part request, tests AI on known answers and signs their AI use.',
        games: [
            ['Barrier Drawing', 'Episode 1', 'Back to back: the Boss describes a picture and the Bot draws only what was said. Then they swap.', 'The mistake is visible and funny, and both kids get to be the boss.'],
            ['Three Piles Court', 'Episode 2', 'Sort 12 tasks into AI does it, AI helps or only me. Another pair can object and you defend your pile.', 'Kids this age care about fairness, so arguing "can vs should" keeps them hooked.'],
            ['Prompt Chef', 'Episodes 3 and 4', 'Pairs get a target result. The pair that gets there in the fewest rounds wins.', 'Asking again, better becomes a score.'],
            ['Stump the Robot', 'Episode 5', 'Each kid picks a topic they know best (a pet, a team, a game, their town), asks Bloop five questions and scores the answers.', 'The child is the expert and the AI is the student.'],
            ['Two Truths and a Bot', 'Episode 5', 'Bloop gives three facts and one is made up. Pairs vote on the fake, then check.', 'A five-minute habit of checking before trusting.'],
            ['Hint Ladder', 'Episode 6', 'Solve a puzzle. Each hint costs a step, and asking for the answer sends you back to the start.', 'Rewards using AI as a coach instead of an answer machine.'],
            ['Data Detective Escape', 'Episode 7', 'A fake class form hides personal details. Every correct cross-out gives one digit of a lock code.', 'Mystery makes privacy rules feel like a puzzle, not a lecture.']
        ],
        facts: [['8', 'episodes'], ['45', 'minutes each'], ['8', 'kids at most, working in pairs']],
        lessons: [
            ["Who's the Boss?", ['Choose'], 'AI is a tool. You set the goal.', 'In pairs, one plays an AI that only does exactly what was said, then they swap. Meet the 4-habit Boss Checklist.', 'U', 'Think: Boss Checklist', 'Your child explains the 4 habits to you.'],
            ['Three Piles', ['Choose'], 'AI does it, AI helps, or only me. "Can" is not "should".', "Sort 12 real tasks: spell check, a poem for grandma, times tables, a summary of a book I didn't read.", 'U', 'Think: sort sheet with reasons', "Sort this week's homework into the 3 piles together."],
            ['The 3-Question Recipe', ['Tell'], 'What I want + how + what kind of helper.', 'A vague request vs a recipe request in the Bloop chat simulator. Compare the answers.', 'S', 'How: two requests side by side', 'Your child writes one recipe request for a family task.'],
            ['Ask Again, Better', ['Tell', 'Check'], 'The first answer is a draft. Improve the ask.', '3 rounds to get a great quiz about your hobby, noting what changed each round.', 'S', 'How: round log', 'Ask what changed between rounds 1 and 3.'],
            ['Test the Robot', ['Check'], 'Test AI on what you already know before you trust it.', "Write 5 questions you're an expert on: your pet, your game, your town. Ask, score, update Glitch's scoreboard.", 'S', 'Made: "AI got _/5" score sheet', 'Ask: what did AI get wrong about your town?'],
            ['Hint, Not Answer', ['Choose', 'Own'], 'A coach makes you smarter. An answer machine makes you slower.', 'One problem twice: "give the answer" vs "give a hint, ask me a question". Which could you do alone tomorrow?', 'S', 'Made: coach request card', 'Use the coach card on real homework, with you watching.'],
            ['Data Detective', ['Own'], 'What you type can be stored. Share only what the task needs.', "A fake class form: circle personal info, cross out what AI doesn't need, rewrite the request without it.", 'U', 'How: marked-up form', "Check together what your family's apps know about you."],
            ['Boss Project + Family AI Deal', ['All 4'], 'Use all 4 habits on one project.', 'A mini comic, quiz or poster with the note "AI helped with ___, I checked ___". Then sign a family AI deal.', 'W', 'Made + Think: project and signed deal', 'Put the family deal on the fridge.']
        ],
        screenTitle: null,
        screenLede: "The rest use Bloop's chat simulator with pre-made answers, so nobody needs a chatbot account.",
        rule: "No personal chatbot accounts: most tools are 13+. Bloop's chat simulator with pre-made answers, or a parent runs the tool.",
        report: { child: 'Leo, 10', ep: 'After episode 5 of 8', meters: [3, 3, 4, 2], made: 'Score sheet: "AI got 3/5 about our town".', how: 'Round log: three tries at a dinosaur quiz.', think: '"Homework pile: AI helps, I decide."' },
        price: '$219', per: 'per season',
        incl: ['8 episodes of 45 minutes', 'Up to 8 kids, working in pairs', 'A parent report after every episode', 'A family AI deal you sign together'],
        faq: [
            ["Won't this make cheating easier?", 'Episode 6 is about exactly that: asking for a hint instead of the answer. In episode 8 your child signs a family AI deal with you.'],
            ['Does my child need a chatbot account?', "No. Most AI tools are 13+. Kids use Bloop's chat simulator with pre-made answers, or you run the tool."],
            ['What will I see after each episode?', 'One piece of proof: something your child made, a record of how, or a rule in their own words.']
        ]
    },
    {
        id: '12-14', min: 12, max: 14, name: 'Creators', pose: 'point',
        h1: "They'll use AI anyway. Teach them to fly it.",
        lead: "Ten episodes: why chatbots make things up, two-source fact checks, and a demo day you're invited to.",
        season: 'AI Pilot',
        seasonLede: 'Your teen learns why chatbots make things up, plans AI use across a project, checks claims in two sources and writes a personal AI policy.',
        games: [
            ['Next Word', 'Episode 2', 'Teams guess the next word of a sentence and score when they match the most common guess.', 'Teens act like a chatbot and feel why "likely" is not "true".'],
            ['Fake Historian', 'Episodes 2 and 7', 'Invent a person, ask AI about them and race to list every fact it makes up.', 'The moment AI lies with confidence is the one they remember.'],
            ['Should AI? Court', 'Episode 3', 'A mock trial about a student who used AI for an essay, with a prosecutor, defense, judge, jury and clerk.', 'Teens love arguing about fairness, and quieter kids can take the clerk or judge role.'],
            ['Red Team the Study Buddy', 'Episode 5', 'One team sets up a buddy that only gives hints. The other tries to make it give the answer. Fix it and swap.', 'Beating the system motivates this age, and they learn to write clear instructions by defending them.'],
            ['Blind Chatbot Taste Test', 'Episode 7', 'Two chatbots answer the same question, shown as A and B. Teams judge blind, then see which is which.', 'They judge the answer, not the brand name.'],
            ['Fact or Fake: Feed Edition', 'Episode 7', 'Real viral posts from their own feeds. Teams check each one in two independent sources against the clock.', 'It uses a skill they need every day, on their own content.'],
            ['Make a Game', 'Episode 10', 'The Demo Day project: a quiz, text adventure or game design doc made with AI help, plus a log of how AI was used.', 'Making a game beats playing one, and teams pick the theme.']
        ],
        facts: [['10', 'episodes'], ['50', 'minutes each'], ['10', 'teens at most, with team roles']],
        lessons: [
            ['Pilot or Passenger', ['Choose'], 'Three ways AI works: do it for me, think with me, run it for me.', 'Classify 10 real uses: autocorrect, a homework chatbot, video recommendations, a smart home routine.', 'U', 'Think: classified list', 'Your teen finds one run-it-for-me AI at home.'],
            ['Why AI Makes Things Up', ['Check'], "Chatbots predict likely words. Likely isn't true.", 'A next-word guessing game in teams. Then ask AI about a made-up historical person and watch it invent facts.', 'R', 'How: screenshot plus explanation', 'Your teen explains "likely isn\'t true" in one minute.'],
            ['Should AI Do This?', ['Choose'], 'Ask what the task is for: learning, speed or people.', 'Break a history poster into 8 steps and tag each one: me, AI helps, AI does. Teams defend their choices.', 'U', 'Think: task map', 'Map one real school project the same way.'],
            ['Context Is King', ['Tell'], 'AI knows only what you give it.', 'Build a reusable "About my project" note with no personal data. Run the same request with and without it.', 'R', 'Made: context note and comparison', 'Check the note has no personal data.'],
            ['Set Up a Study Buddy', ['Tell'], 'Describe the result, the steps and the behavior.', 'Set up a buddy that quizzes and gives hints. Try to trick it into giving answers, then fix the setup.', 'R', 'How: setup and test log', 'Your teen uses the buddy for one real topic.'],
            ['The Checking Loop', ['Check'], 'Name one exact problem per round.', 'Three rounds on an explainer paragraph, each naming one precise fix: too long, wrong date, too flattering.', 'R', 'How: annotated loop log', 'Ask: what was the worst first-draft mistake?'],
            ['Two Sources + Tool Face-off', ['Check'], 'Verify claims in two independent sources.', 'Fact-check 3 claims from an AI answer. Ask two chatbots the same question and compare.', 'R', 'Made: fact-check table', 'Fact-check one viral post together.'],
            ['Your Data, Your Call', ['Own'], 'Typed data can be stored and used for training.', "With you, read a real tool's privacy settings and redact a sample text.", 'W', 'How: redacted text and checklist', "Turn off training on data in the family's AI tools."],
            ['My AI Rules', ['Own'], 'A personal policy: when I use AI, my red lines, how I tell teachers.', 'Draft, peer review, then a parent signs it.', 'U', 'Think: one-page AI policy', 'Sign it and add one family rule.'],
            ['Demo Day', ['All 4'], 'Show the process, not just the result.', 'A team project presented with its process log and a "How we used AI" statement.', 'W', 'Made + How + Think', 'Come to the demo.']
        ],
        screenTitle: 'Real AI tools, on your account and your terms.',
        screenLede: 'Teens use real chatbots, because that is what they will meet at school. You decide whose account and when.',
        rule: 'Age 12: your account, with you in the room. Ages 13 and 14: a teen account only with your consent. Claude is 18+, so kids never use it.',
        report: { child: 'Ava, 13', ep: 'After episode 7 of 10', meters: [4, 3, 4, 3], made: 'Fact-check table: 2 of 3 claims held up.', how: 'Loop log: "too flattering" fixed in round 2.', think: 'Draft AI policy: "I tell my teacher when AI helped."' },
        price: '$299', per: 'per season',
        incl: ['10 episodes of 50 minutes', 'Up to 10 teens with team roles', 'A parent report after every episode', 'A demo day you are invited to'],
        faq: [
            ['Is my 12-year-old allowed on these tools?', 'At 12, AI is used on your account with you in the room. At 13 and 14, only a teen account and only with your consent.'],
            ['How do you stop AI homework cheating?', 'Teens map which steps are theirs, set up a study buddy that gives hints, and write a personal AI policy you sign.'],
            ["What happens to my child's data?", "Episode 8 is done with you: you read a real tool's privacy settings together and turn off training on your data."]
        ]
    },
    {
        id: '15-17', min: 15, max: 17, name: 'Pros', pose: 'think',
        h1: 'AI as a study partner, never a ghostwriter.',
        lead: 'Short lessons in the app and a weekly live session: tutoring, test prep, honest writing, a real project.',
        season: 'AI Trail',
        seasonLede: 'Your teen learns to steer and check AI, use it as a tutor and for test prep, write honestly, spot fakes and bias, and ship a real project.',
        facts: [['9', 'lessons in the app'], ['22-24', 'minutes each'], ['60-75', 'minute live session weekly']],
        lessons: [
            ['How AI thinks, how to ask', ['Tell', 'Check'], 'A chatbot predicts words. A good prompt gives it context and a format.', 'Predict what two words in will produce, then build and fix a real prompt.', 'A', 'How: a fixed prompt', 'Ask: why does the same question get two answers?'],
            ['Steer, check, stay safe', ['Check', 'Own'], 'Steer with follow-ups. Anything presented as true needs a real source.', 'Find the hallucination about a YouTuber who doesn\'t exist; cut what should never be sent.', 'A', 'How: a follow-up that steered', 'Ask what they would never paste into a chatbot.'],
            ['AI as your tutor', ['Choose'], 'Answer machine or tutor? Only one makes you better on the test.', 'Build a tutor prompt, then swap roles and teach the topic back to Bloop.', 'A', 'Made: own tutor prompt', 'Ask them to teach you one thing they learned.'],
            ['Test prep and honest writing', ['Own'], 'Quiz yourself instead of rereading. Improve your own writing, don\'t replace it.', 'Turn notes into a quiz, build a study plan and find the trap in an AI plan.', 'A', 'Made: notes turned into a quiz', 'Ask for the quiz before their next test.'],
            ['From idea to plan, with real research', ['Check'], 'AI helps plan; sources prove.', 'Turn a project idea into a plan and back the facts with real sources.', 'A', 'How: plan with sources', 'Ask which source they trusted most and why.'],
            ['Make it visual, build your bot', ['Tell'], 'Clear instructions make a useful assistant.', 'Make visuals for a project and set up an assistant with its own rules.', 'A', 'Made: own assistant setup', 'Ask for a demo of their bot.'],
            ['Your AI project', ['All 4'], 'Use all four habits on something real.', 'A personal project built with AI and presented with how AI was used.', 'W', 'Made + Think: project and AI statement', 'Ask to see the project and its AI statement.'],
            ['Fakes and bias', ['Check'], 'Fakes look real. Bias hides in data.', 'Spot deepfakes and scam patterns, and find bias in AI answers.', 'A', 'Think: a fake-spotting checklist', 'Check one viral video together.'],
            ['Bots as friends, AI and your future', ['Choose', 'Own'], 'Where AI belongs in your life, and where it doesn\'t.', 'Talk through AI companions and how AI changes work and study.', 'A', 'Think: my rules for AI and me', 'Ask where they think AI does not belong.']
        ],
        screenTitle: "Practice stays inside Bloop. Outside tools stay within their age rules.",
        screenLede: "Every lesson's practice chat runs inside the app, so your teen doesn't need new accounts to learn.",
        rule: "Practice runs in Bloop's built-in chat. Outside tools only on accounts your teen is old enough for, with your consent. Claude is 18+, so kids never use it.",
        report: { child: 'Sam, 16', ep: 'After lesson 4 of 9', meters: [4, 4, 3, 4], made: 'History notes turned into a 12-question quiz.', how: 'Tutor setup: "ask me first, give hints".', think: '"I improve my essay. AI doesn\'t write it."' },
        price: '$249', per: 'per term',
        incl: ['9 app lessons of 22-24 minutes', 'A weekly live session, 60-75 minutes', 'Project teams of 3-4, up to 15 teens', 'A parent report after every lesson'],
        faq: [
            ['My teen already uses ChatGPT. What is left to learn?', 'How to check it, steer it and learn with it: spotting made-up facts, building a tutor, preparing for tests and writing honestly.'],
            ['How much time does it take?', 'Short lessons in the app, 22 to 24 minutes each, plus a weekly live session of 60 to 75 minutes.'],
            ['Does it help with exams?', 'Yes. Test prep is a full lesson: AI quizzes your teen and explains mistakes, instead of doing the work.']
        ]
    }
];

var HABITS = [
    ['Choose', ['Is this a job for Bloop, for me, or for both?', 'Can AI do it? Should it? Sort it into three piles.', 'Decide whether, when and how to use AI.', 'Use AI to learn faster, never to skip the learning.']],
    ['Tell', ['Say exactly what you want.', 'What I want + how + what kind of helper.', 'Give context: the result, the steps, how the helper should act.', 'Set up tutors and assistants that ask before they answer.']],
    ['Check', ['Bloop makes mistakes. Find them.', 'Test AI on what you already know.', "Likely isn't true: verify in two sources.", 'Spot fakes and bias. Anything presented as true needs a source.']],
    ['Own', ['Keep secrets. Say when AI helped.', 'Share only what the task needs. Sign your AI use.', 'A personal AI policy, signed with you.', 'Honest writing: you answer for everything you hand in.']]
];

// Visual stops, one per track. The dial blends between neighbours in OKLCH, so 9 is two-thirds Inventors and one-third Explorers.
var STOPS = [
    { bg: '#FFCE3A', onBg: '#1E1A3C', acc: '#FF5B4A', onAcc: '#1E1A3C', s1: '#FF5B4A', s2: '#2F6BEF', s3: '#FFFFFF', page: '#E8F3FF', ink: '#1E1A3C', card: '#FFFFFF', pageD: '#1D1A33', inkD: '#FFF3CF', cardD: '#2A2546', focus: '#2F6BEF',
      body: '#6EC3FF', accent: '#FF5B4A', screen: '#1E1A3C', glow: '#DDF6FF', joint: '#FF8FB1', rad: 28, casl: 1, wd: 900, slnt: -9, tilt: -2, bob: 12 },
    { bg: '#3CCBB0', onBg: '#0E2B2A', acc: '#FF8A3D', onAcc: '#0E2B2A', s1: '#FFE16A', s2: '#FF8A3D', s3: '#F4FFFB', page: '#ECFAF5', ink: '#0E2B2A', card: '#FFFFFF', pageD: '#0F2524', inkD: '#E2F7F1', cardD: '#183533', focus: '#1F5FD6',
      body: '#FFE16A', accent: '#FF8A3D', screen: '#0E2B2A', glow: '#FFF9D9', joint: '#6FD3FF', rad: 20, casl: .7, wd: 840, slnt: -6, tilt: -1.2, bob: 8 },
    { bg: '#2F4FE0', onBg: '#FFFFFF', acc: '#FFD84D', onAcc: '#141A3C', s1: '#FFD84D', s2: '#8FA6FF', s3: '#FFFFFF', page: '#EEF1FD', ink: '#141A3C', card: '#FFFFFF', pageD: '#11163A', inkD: '#E6EAFE', cardD: '#1B2252', focus: '#2F4FE0',
      body: '#C7D2FF', accent: '#FFD84D', screen: '#141A3C', glow: '#FFFFFF', joint: '#FF8A7A', rad: 12, casl: .28, wd: 760, slnt: -2, tilt: -.4, bob: 3 },
    { bg: '#121A2E', onBg: '#EEF1F7', acc: '#F5C842', onAcc: '#121A2E', s1: '#F5C842', s2: '#3A4A70', s3: '#EEF1F7', page: '#0D1322', ink: '#E7EBF3', card: '#172038', pageD: '#0D1322', inkD: '#E7EBF3', cardD: '#172038', focus: '#F5C842',
      body: '#D9DEEA', accent: '#F5C842', screen: '#121A2E', glow: '#FFFFFF', joint: '#7F8FB3', rad: 4, casl: 0, wd: 640, slnt: 0, tilt: 0, bob: 0 }
];

// Ident shapes: they crowd the margins at 6 and leave one by one. life = the age at which the shape is gone.
var SHAPES = [
    { x: '47%', y: '4%', w: 110, life: 9, k: 'blob', c: 's1', r: -12 },
    { x: '60%', y: '50%', w: 66, life: 8, k: 'star', c: 's3', r: 10 },
    { x: '51%', y: '36%', w: 54, life: 10, k: 'ring', c: 's2', r: 0 },
    { x: '1%', y: '1%', w: 90, life: 11, k: 'squig', c: 's2', r: 4 },
    { x: '63%', y: '8%', w: 64, life: 12, k: 'tri', c: 's1', r: 18, mob: 1 },
    { x: '44%', y: '74%', w: 80, life: 9.5, k: 'blob', c: 's3', r: 30 },
    { x: '90%', y: '78%', w: 72, life: 13, k: 'ring', c: 's1', r: 0, mob: 1 },
    { x: '75%', y: '68%', w: 46, life: 8.5, k: 'star', c: 's2', r: -20, mob: 1 },
    { x: '72%', y: '92%', w: 110, life: 15, k: 'bar', c: 's2', r: 0 }
];
var SHAPE_SVG = {
    blob: '<svg viewBox="0 0 100 100"><path fill="var(--C)" d="M50 4c20 0 40 12 44 32s-6 46-30 56S8 90 5 62 30 4 50 4z"/></svg>',
    star: '<svg viewBox="0 0 100 100"><path fill="var(--C)" d="M50 2l13 33 35 2-27 22 9 35-30-19-30 19 9-35L2 37l35-2z"/></svg>',
    ring: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" fill="none" stroke="var(--C)" stroke-width="16"/></svg>',
    squig: '<svg viewBox="0 0 100 40"><path fill="none" stroke="var(--C)" stroke-width="9" stroke-linecap="round" d="M5 20c10-16 20-16 30 0s20 16 30 0 20-16 30 0"/></svg>',
    tri: '<svg viewBox="0 0 100 100"><path fill="var(--C)" d="M50 6l46 84H4z"/></svg>',
    bar: '<svg viewBox="0 0 100 20"><rect width="100" height="20" rx="10" fill="var(--C)"/></svg>'
};

var $ = function (id) { return document.getElementById(id); };
var root = document.documentElement;
var dark = window.matchMedia('(prefers-color-scheme: dark)');
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
var trackOf = function (age) { for (var i = 0; i < TRACKS.length; i++) if (age <= TRACKS[i].max) return i; return TRACKS.length - 1; };

// Bloop himself (bobik.js). The page sets his colours through --rb-* so he morphs with the dial.
function bloop(pose) { return bob(STATES[pose] || STATES.neutral, null, '100%'); }
var mascotCss = document.createElement('style');
mascotCss.textContent = CSS;
document.head.appendChild(mascotCss);
document.querySelectorAll('[data-bloop]').forEach(function (el) { el.innerHTML = bloop(el.getAttribute('data-bloop')); el.firstChild.setAttribute('aria-hidden', 'true'); });

// Tokens: one cord. Every value comes from the age.
function mix(a, b, f) { return f <= 0 ? a : f >= 1 ? b : 'color-mix(in oklch, ' + a + ' ' + ((1 - f) * 100).toFixed(1) + '%, ' + b + ')'; }
function lerp(a, b, f) { return a + (b - a) * f; }
var COLOR_KEYS = { bg: 'bg', acc: 'acc', s1: 's1', s2: 's2', s3: 's3', body: 'rb-body', accent: 'rb-accent', screen: 'rb-screen', glow: 'rb-glow', joint: 'rb-joint' };

function paint(age) {
    var v = Math.min(3, Math.max(0, (age - 7) / 3));
    var i = Math.min(2, Math.floor(v)), f = v - i, A = STOPS[i], B = STOPS[i + 1];
    var s = root.style, d = dark.matches;
    Object.keys(COLOR_KEYS).forEach(function (k) { s.setProperty('--' + COLOR_KEYS[k], mix(A[k], B[k], f)); });
    var N = f < .5 ? A : B;
    s.setProperty('--on-bg', N.onBg);
    s.setProperty('--on-acc', N.onAcc);
    s.setProperty('--focus', N.focus);
    // surfaces jump between light and dark in the middle third of a step, so text on them stays readable at every whole age
    var g = Math.min(1, Math.max(0, (f - .35) / .3));
    var page = mix(d ? A.pageD : A.page, d ? B.pageD : B.page, g);
    var ink = (g < .5 ? A : B)[d ? 'inkD' : 'ink'];
    s.setProperty('--page', page);
    s.setProperty('--ink', ink);
    s.setProperty('--card', mix(d ? A.cardD : A.card, d ? B.cardD : B.card, g));
    s.setProperty('--line', 'color-mix(in oklch, ' + ink + ' 15%, transparent)');
    s.setProperty('--soft', 'color-mix(in oklch, ' + ink + ' 72%, ' + page + ')');
    s.setProperty('--rad', lerp(A.rad, B.rad, f).toFixed(1) + 'px');
    s.setProperty('--casl', lerp(A.casl, B.casl, f).toFixed(3));
    s.setProperty('--wd', Math.round(lerp(A.wd, B.wd, f)));
    s.setProperty('--slnt', lerp(A.slnt, B.slnt, f).toFixed(2));
    s.setProperty('--tilt', lerp(A.tilt, B.tilt, f).toFixed(2) + 'deg');
    s.setProperty('--bob', lerp(A.bob, B.bob, f).toFixed(1) + 'px');
    s.setProperty('--m', Math.min(1, Math.max(0, (age - 6) / 10)).toFixed(3));
    s.setProperty('--age', age.toFixed(2));
}

// Browser-bar colour for a whole age
function themeColor(age) { return STOPS[Math.min(3, Math.round(Math.max(0, (age - 7) / 3)))].bg; }
function unitOf(t) { return t.id === '15-17' ? 'lesson' : 'episode'; }

// Parent cabinet store. Design preview: everything stays in this browser's localStorage.
// { parent: { name, contact }, kids: [{ id, name, age, time, season, courses: [{ id, done }] }], active: kidId }
var CABINET_KEY = 'bloop-parent-cabinet-v1';
function loadCabinet() {
    try {
        var c = JSON.parse(localStorage.getItem(CABINET_KEY));
        return c && c.parent && Array.isArray(c.kids) && c.kids.length ? c : null;
    } catch (e) { return null; }
}
function saveCabinet(c) {
    try { if (c) localStorage.setItem(CABINET_KEY, JSON.stringify(c)); else localStorage.removeItem(CABINET_KEY); return true; } catch (e) { return false; }
}
function activeKid(c) {
    if (!c) return null;
    for (var i = 0; i < c.kids.length; i++) if (c.kids[i].id === c.active) return c.kids[i];
    return c.kids[0];
}
function kidId() { return 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

// A child signed up from the booking form (landing page) or the cabinet. Same first name updates that child.
function addKid(c, kid) {
    c = c || { parent: { name: '', contact: '' }, kids: [], active: null };
    var name = (kid.name || '').trim() || 'Your child';
    var found = null;
    c.kids.forEach(function (k) { if (k.name.toLowerCase() === name.toLowerCase()) found = k; });
    var k = found || { id: kidId(), name: name, age: kid.age, time: kid.time || 'Weekday afternoon', season: 0, courses: [] };
    if (found) { k.age = kid.age; if (kid.time) k.time = kid.time; }
    else c.kids.push(k);
    if (kid.course && !k.courses.some(function (x) { return x.id === kid.course; })) k.courses.push({ id: kid.course, done: 0 });
    c.active = k.id;
    return c;
}
