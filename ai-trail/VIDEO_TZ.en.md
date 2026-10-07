# ТЗ на английские ролики «AI Trail»

Файл собирается из `course.en.js` командой `node tools/video-tz.js --lang en > VIDEO_TZ.en.md`. Сцены правь в `course.en.js`, не здесь. Английская версия — основная: русская (`course.js`) пока на прежнем контенте, её ролики в `VIDEO_TZ.md`.

## Формат

- Аудитория: англоязычные подростки 14–17 лет. Тон «старший брат или сестра»: быстро, с юмором, без сюсюканья.
- Голос: носитель английского, темп около 150 слов в минуту. Выбери один акцент на весь курс, американский или британский, и не смешивай.
- Субтитры и текст на экране — на английском. Маскот — Bloop (русский Блуп).
- Уже есть русские ролики с живым ведущим? В HeyGen есть перевод видео с синхроном губ. Для анимации Блупа проще переозвучить по колонке «Голос».
- Длина 35–50 секунд, одна идея на ролик. Хук — в первые 3 секунды.
- 16:9, 1920×1080 для урока. Из того же материала — нарезка 9:16 для Reels и TikTok (реклама курса).
- Субтитры вшиты: подростки часто смотрят без звука. Текст из колонки «Экран» — крупно, 3–6 слов.
- Блуп — состояние из `bobik.js` (колонка «Блуп»), палитра `peach`.
- Колонка «Голос, с» — оценка длины озвучки при темпе 2.6 слова в секунду. ⚠️ значит, что голос не влезает в сцену: растяни сцену или сократи текст.

## Как снимать

| Вариант | Как | Когда брать |
|---|---|---|
| Блуп-анимация | PNG Блупа в нужной позе из `bobik.js` → Kling image-to-video по колонке «Визуал» → озвучка колонки «Голос» (голос HeyGen или ElevenLabs) → сборка в CapCut | Основной вариант для теории |
| Ведущий HeyGen | Аватар-ведущий 20–25 лет читает «Голос», Блуп — стикер-реакция в углу | Если тесты покажут, что робот для 14–18 лет выглядит детским |
| Скринкаст | Запись реального чата: плохой промпт → хороший | Уроки про промпты и ошибки ИИ: дешевле и убедительнее анимации |

Проверь до массового запуска: аватар HeyGen по фото может не распознать лицо у робота с экраном вместо лица. Сделай одну сцену и посмотри на синхрон губ.

## Как подключить готовый ролик

Положи файл по пути из строки «файл» под заголовком ролика и в `course.en.js` у задания `video` заполни `src` (например, `src: 'videos/l1.mp4'`) или `youtube: 'ID'`. Раскадровка отключится сама, а кнопка «Дальше» откроется после 90% просмотра.

## Автоматизация

`node tools/video-tz.js --lang en --json` отдаёт те же сцены в JSON. Сценарий для Make.com: JSON → итерация по сценам → генерация (HeyGen: голос и аватар, Kling: визуал) → ожидание готовности → склейка → загрузка файла → путь в `src`.

## 1. Meet your AI: «What’s going on inside a chatbot»

42 сек по раскадровке · голос ≈ 35 сек · 16:9 · файл `ai-trail/en/videos/l1.mp4`

| # | Сек | Голос, с | Блуп | Экран | Голос | Визуал (промпт Kling) |
|---|---|---|---|---|---|---|
| 1 | 7 | 6.2 | hello | How does a chatbot answer? | You type a question, and a chatbot answers in seconds. What’s actually going on in there? | Cute flat-style robot mascot waves at camera next to a giant phone with a chat on screen, cartoon forest clearing |
| 2 | 10 | 8.8 | think | It read a giant library | Before you ever met it, the model read a huge amount of text: books, websites, articles. It learned which words usually go together. | Robot flying through an endless library, pages of text streaming into its antenna, flat 2D motion graphics |
| 3 | 9 | 6.9 | point | Next word, next word, next word | Then it writes your answer one word at a time, each time picking a word that fits best. | Chat bubble filling in word by word, each new word pops out of a small slot machine, playful flat animation |
| 4 | 9 | 7.7 | surprise | Sounds right ≠ is right | That’s why it sounds so smooth. But it doesn’t check facts as it goes, so it can be confidently wrong. | Robot in sunglasses confidently presenting a chart with an obvious mistake, a small red question mark appears |
| 5 | 7 | 5.8 | wink | Your job: steer and check | So you steer it with good questions and check what matters. That’s the whole skill. | Teen holding a phone like a steering wheel, robot gives a thumbs up, green check marks pop up |

## 2. Your first real prompt: «One question, two answers»

42 сек по раскадровке · голос ≈ 33 сек · 16:9 · файл `ai-trail/en/videos/l2.mp4`

| # | Сек | Голос, с | Блуп | Экран | Голос | Визуал (промпт Kling) |
|---|---|---|---|---|---|---|
| 1 | 6 | 5.4 | hello | Why does AI miss the point? | Ever asked AI something and got a useless wall of text? Let’s fix that. | Teen looks at a phone with a confused face, a huge chat bubble of text scrolls endlessly, flat cartoon |
| 2 | 9 | 7.7 | sad | “Help with my report” | “Help with my report.” AI doesn’t know the topic, your level, or how much time you have. So it guesses. | Robot blindfolded throwing darts at a target, darts miss, playful flat animation |
| 3 | 11 | 8.5 | point | Role + Task + Context + Format | Now try: “You’re a biology teacher. Outline my report on bees. It’s a three-minute talk for tenth grade. Give me five points.” | Four colorful puzzle pieces labeled Role, Task, Context, Format snap together into one prompt |
| 4 | 9 | 6.2 | delight | Same AI, better answer | Same AI, but now the answer fits: the right length, the right level, ready to use. | Dart hits the bullseye, a neat 5-point outline about bees appears on the phone, bees fly around |
| 5 | 7 | 5 | wink | Not quite? Follow up! | Still not right? Don’t start over. Follow up: shorter, simpler, add an example. | Chat with short follow-up messages “shorter”, “simpler”, “add an example”, the answer shrinks and gets clearer |

## 3. Check it, protect yourself: «Why AI makes mistakes with a straight face»

36 сек по раскадровке · голос ≈ 28 сек · 16:9 · файл `ai-trail/en/videos/l4.mp4`

| # | Сек | Голос, с | Блуп | Экран | Голос | Визуал (промпт Kling) |
|---|---|---|---|---|---|---|
| 1 | 5 | 3.1 | hello | Can AI be wrong? | Spoiler: yes. And with a very confident face. | Robot mascot in sunglasses looking overconfident, cartoon forest background |
| 2 | 9 | 8.5 | think | Word by word | A chatbot writes its answer one word at a time, each time picking a likely next word. It doesn’t open a textbook. | Words appear one by one on a chat bubble, each with a small probability bar above it |
| 3 | 9 | 6.9 | surprise | Sounds true ≠ is true | So it can make up a date, a quote, even a whole book, just because it sounds right. | Book with a made-up title appears, then a magnifying glass reveals the cover is empty |
| 4 | 8 | 5.8 | point | Check 2 sources | Your superpower is checking. Verify important facts in two reliable sources before you use them. | Two trusted sources (textbook and encyclopedia website) side by side with green checkmarks |
| 5 | 5 | 3.5 | victory | You decide, not AI | AI is a helper. You decide what to believe. | Teen holds a phone confidently, robot jumps with joy next to them, sunny forest |

## 4. AI as your tutor: «Answer machine or tutor?»

41 сек по раскадровке · голос ≈ 32 сек · 16:9 · файл `ai-trail/en/videos/l5.mp4`

| # | Сек | Голос, с | Блуп | Экран | Голос | Визуал (промпт Kling) |
|---|---|---|---|---|---|---|
| 1 | 7 | 6.5 | hello | Answer machine or tutor? | AI can do your homework for you. Or it can make you better at it. Your call. | Robot mascot standing between two doors labeled ANSWERS and TUTOR, flat cartoon forest |
| 2 | 9 | 7.7 | sad | ❌ “Solve this for me” | Ask it to solve everything, and you get answers today. Then you freeze on the test, where there’s no AI. | Teen at an exam desk staring at a blank sheet, a phone locked in a box nearby, sweat drop, flat style |
| 3 | 10 | 6.9 | idea | ✅ “Give me a hint” | Ask for a hint instead: “Don’t solve it. What’s the first step?” Now your brain does the work. | Chat bubble with a small glowing hint, a light bulb switches on above the teen’s head |
| 4 | 9 | 6.5 | point | ✅ “Check my work” | Or solve it yourself and ask: “Where did I go wrong?” A personal tutor, even at midnight. | Notebook with a solution, one line highlighted in yellow with a short note, moon in the window |
| 5 | 6 | 4.6 | joy | Try first, then ask | Try first, then ask. That’s how AI makes you smarter, not lazier. | Robot in a tiny graduation cap high-fives the teen, confetti, green check |

## 5. From idea to plan: «AI as your project partner»

40 сек по раскадровке · голос ≈ 30 сек · 16:9 · файл `ai-trail/en/videos/l8.mp4`

| # | Сек | Голос, с | Блуп | Экран | Голос | Визуал (промпт Kling) |
|---|---|---|---|---|---|---|
| 1 | 6 | 5.4 | hello | Got a project? Get a partner | A project feels huge at the start. AI can be your partner. Here’s how. | Teen facing a giant mountain labeled PROJECT, robot mascot appears with a backpack and a map, flat cartoon |
| 2 | 9 | 6.9 | idea | Step 1: lots of ideas | Ask for fifteen ideas, not one. AI is fast at quantity. Then you pick what actually excites you. | Dozens of idea cards fly out of a phone and land on a table, the teen picks one glowing card |
| 3 | 9 | 6.5 | point | Step 2: a real plan | Ask it to break your idea into steps with deadlines. A huge project becomes a to-do list. | The mountain turns into a staircase of small steps with dates, checkboxes appear next to each step |
| 4 | 9 | 5.8 | think | Step 3: you make, AI reviews | You do the actual work. AI gives feedback: what’s unclear, what’s missing, what to cut. | Teen building a cardboard model, robot holds a magnifying glass and points at one part with a sticky note |
| 5 | 7 | 5.4 | victory | Your project, your call | AI helps. But the ideas you choose and the work you do are yours. | Teen stands on top of the mountain with a flag, robot cheers below, sunrise |

## 6. Real or fake?: «How a voice-clone scam works»

38 сек по раскадровке · голос ≈ 32 сек · 16:9 · файл `ai-trail/en/videos/l11.mp4`

| # | Сек | Голос, с | Блуп | Экран | Голос | Визуал (промпт Kling) |
|---|---|---|---|---|---|---|
| 1 | 7 | 6.5 | hello | The call that sounds like family | Your phone rings. It sounds exactly like your brother. He’s in trouble and needs money, right now. | Teen holding a ringing phone, caller ID shows an unknown number, worried cartoon face, flat 2D style |
| 2 | 8 | 6.2 | think | A few seconds of voice | Scammers can copy a voice from a short clip someone posted online. AI does the rest. | A short video clip turns into a sound wave that flows into a robot, which prints out a copy of the wave |
| 3 | 8 | 5.8 | surprise | Urgent + secret + money | Notice the pattern: it’s urgent, it’s secret, and it’s about money. That’s the scam script. | Three red flags pop up one by one, labeled URGENT, SECRET, MONEY |
| 4 | 8 | 7.3 | point | Hang up, call back | So hang up and call back on the number you already know. Or ask for your family code word. | Teen ends the call and taps a saved contact, a shield icon with a secret word appears |
| 5 | 7 | 5.8 | wink | Pause beats panic | A real person in trouble can wait one minute while you check. A scam can’t. | A one-minute timer, the scam call dissolves into pixels, the robot mascot gives a thumbs up |

## 7. Whose picture of the world?: «Why AI repeats stereotypes»

39 сек по раскадровке · голос ≈ 33 сек · 16:9 · файл `ai-trail/en/videos/l12.mp4`

| # | Сек | Голос, с | Блуп | Экран | Голос | Визуал (промпт Kling) |
|---|---|---|---|---|---|---|
| 1 | 9 | 8.8 | hello | Same picture every time? | Ask AI for a CEO, a nurse or a gamer, and you might get the same type of person again and again. Why? | A grid of nearly identical cartoon CEOs in suits, the robot mascot scratches its head |
| 2 | 9 | 8.8 | think | It learned from the past | AI learned from millions of old pictures and texts. If most of them showed one kind of person, AI treats that as normal. | Robot reading a huge stack of old photos, most look alike, a few different ones slide off the pile |
| 3 | 7 | 5.8 | surprise | Patterns become rules | So a pattern from the past turns into a rule for the future. That’s bias. | The stack of photos turns into a rubber stamp that prints the same face over and over |
| 4 | 9 | 6.2 | point | Ask better, check more | You can push back: describe who you want to see, compare answers and notice who’s missing. | Teen types a detailed prompt, the grid fills with people of different ages, genders and backgrounds |
| 5 | 5 | 3.5 | wink | Notice it, name it | Spotting bias is a skill. Now you have it. | Robot hands the teen a magnifying glass badge, confetti |
