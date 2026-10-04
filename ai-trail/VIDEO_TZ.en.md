# ТЗ на английские ролики «AI Trail»

Файл собирается из `course.en.js` командой `node tools/video-tz.js --lang en > VIDEO_TZ.en.md`. Сцены правь в `course.en.js`, не здесь. Длительность сцен общая с русской версией: если меняешь `sec`, поменяй и в `course.js`, иначе упадёт тест.

## Формат

- Аудитория: англоязычные подростки 14–15 лет. Тон «старший брат или сестра»: быстро, с юмором, без сюсюканья.
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
| Ведущий HeyGen | Аватар-ведущий 20–25 лет читает «Голос», Блуп — стикер-реакция в углу | Если тесты покажут, что робот для 14–15 лет выглядит детским |
| Скринкаст | Запись реального чата: плохой промпт → хороший | Уроки про промпты и ошибки ИИ: дешевле и убедительнее анимации |

Проверь до массового запуска: аватар HeyGen по фото может не распознать лицо у робота с экраном вместо лица. Сделай одну сцену и посмотри на синхрон губ.

## Как подключить готовый ролик

Положи файл по пути из строки «файл» под заголовком ролика и в `course.en.js` у задания `video` заполни `src` (например, `src: 'videos/l1.mp4'`) или `youtube: 'ID'`. Раскадровка отключится сама, а кнопка «Дальше» откроется после 90% просмотра.

## Автоматизация

`node tools/video-tz.js --lang en --json` отдаёт те же сцены в JSON. Сценарий для Make.com: JSON → итерация по сценам → генерация (HeyGen: голос и аватар, Kling: визуал) → ожидание готовности → склейка → загрузка файла → путь в `src`.

## 1. What is AI: «How AI learned to spot cats»

46 сек по раскадровке · голос ≈ 42 сек · 16:9 · файл `ai-trail/en/videos/l1.mp4`

| # | Сек | Голос, с | Блуп | Экран | Голос | Визуал (промпт Kling) |
|---|---|---|---|---|---|---|
| 1 | 7 | 6.5 | hello | How does AI tell a cat from a dog? | How does AI know a photo shows a cat and not a dog? Let me show you. | Cute flat-style robot mascot waves at camera in a sunny cartoon forest clearing, photos of a cat and a dog float beside it |
| 2 | 10 | 8.8 | think | Rules don’t work | You could write rules: pointy ears, whiskers. But dogs can have whiskers too, and a cat can flatten its ears. The rules break. | Checklist with "triangle ears" and "whiskers" crossing out one by one, confused dog with whiskers, flat 2D motion graphics |
| 3 | 9 | 8.8 | point | 1,000,000 examples | So instead, AI is shown a million photos: this is a cat, this isn’t. At first it gets it wrong all the time. | Endless wall of small cat and dog photos with labels scrolling fast, robot watching, flat colorful style |
| 4 | 6 | 5 | surprise | Mistake → adjust → try again | After every mistake, AI tweaks its settings a tiny bit. Millions of times. | Robot turning many small knobs on a control panel, red cross turns into green check, fast loop |
| 5 | 8 | 6.9 | joy | Learning = examples + mistakes | In the end, it recognizes cats even in photos it has never seen. That’s what we call learning. | New cat photo appears, robot highlights it with a green frame and the label "cat", confetti |
| 6 | 6 | 5.8 | wink | AI only knows what it learned from | But if you only show AI ginger cats, it might not recognize a black one. | Row of ginger cats, then a black cat appears with a question mark above it, robot shrugs |

## 2. Why you need AI: «AI and homework: the right way and the wrong way»

41 сек по раскадровке · голос ≈ 37 сек · 16:9 · файл `ai-trail/en/videos/l2.mp4`

| # | Сек | Голос, с | Блуп | Экран | Голос | Визуал (промпт Kling) |
|---|---|---|---|---|---|---|
| 1 | 7 | 5.8 | hello | AI for homework: allowed or not? | Is using AI for homework cheating or fine? It depends on how you use it. | Robot mascot next to a school desk with notebook and phone, big question mark, flat cartoon style |
| 2 | 10 | 9.2 | sad | ❌ “Write my essay” | The wrong way: “write an essay about autumn”. You hand it in, get a grade and learn nothing. And teachers notice texts like that. | Phone chat with a long generated essay, teacher character raises an eyebrow, red cross stamp |
| 3 | 9 | 8.1 | idea | ✅ “Explain it like I’m 10” | The right way: “explain fractions like I’m 10 years old”. You get the topic, and then you solve the problems yourself. | Pizza sliced into fractions 1/2, 1/4, 1/8 appears from the chat, light bulb above a teen head |
| 4 | 8 | 7.7 | point | ✅ “Find the mistakes in my text” | Or: “here’s my essay, find the mistakes and explain them”. The text is yours, and AI works as your tutor. | Handwritten text with a few words highlighted in yellow and short notes on the margin |
| 5 | 7 | 5.8 | joy | AI = a 24/7 tutor | Use AI like a tutor that never gets tired of questions. That’s the real superpower. | Robot mascot in a tiny graduation cap gives a thumbs up, clock showing 24/7, green check |

## 3. How to ask the right way: «One question, two answers»

42 сек по раскадровке · голос ≈ 39 сек · 16:9 · файл `ai-trail/en/videos/l3.mp4`

| # | Сек | Голос, с | Блуп | Экран | Голос | Визуал (промпт Kling) |
|---|---|---|---|---|---|---|
| 1 | 6 | 5.8 | hello | Why does AI give the “wrong” answer? | Sometimes you ask AI something and it answers something totally different. Let’s figure out why. | Teen looks at a phone with a confused face, chat bubble with a long useless answer, flat cartoon |
| 2 | 9 | 8.5 | sad | “Help with my report” | Here’s a request: “help with my report”. AI doesn’t know the topic, your age or how much time you have. It’s guessing. | Robot blindfolded throwing darts at a target, darts miss, playful flat animation |
| 3 | 11 | 10.4 | point | Role + Task + Context + Format | Now try this: “You’re a biology teacher. Make an outline for a report on bees. I’m 14, the talk is 3 minutes. Give me a 5-point outline.” | Four colorful puzzle pieces labeled Role, Task, Context, Format snap together into one prompt |
| 4 | 9 | 8.1 | delight | Spot-on answer | And now the answer hits the target: a clear outline of the right length. Same AI, the task just got clear. | Dart hits the bullseye, a neat 5-point plan about bees appears on the phone, bees fly around |
| 5 | 7 | 6.2 | wink | Not quite? Clarify! | If you don’t like the answer, don’t start over. Just clarify: “shorter”, “simpler”, “add an example”. | Chat with short follow-up messages "shorter", "simpler", "add an example", answer shrinks and gets clearer |

## 4. AI makes mistakes too: «Why AI makes mistakes with a straight face»

36 сек по раскадровке · голос ≈ 33 сек · 16:9 · файл `ai-trail/en/videos/l4.mp4`

| # | Сек | Голос, с | Блуп | Экран | Голос | Визуал (промпт Kling) |
|---|---|---|---|---|---|---|
| 1 | 5 | 3.8 | hello | Can AI be wrong? | Spoiler: yes, and how. And with a very confident face. | Robot mascot in sunglasses looking overconfident, cartoon forest background |
| 2 | 9 | 8.8 | think | Word by word | A chatbot writes its answer one word at a time, each time picking the most likely next word. It doesn’t check a textbook. | Words appear one by one on a chat bubble, each with a small probability bar above it |
| 3 | 9 | 8.1 | surprise | Sounds true ≠ is true | So it can make up a date, a quote or even a whole book, just because it sounds like the truth. | Book with a made-up title appears, then a magnifying glass reveals the cover is empty |
| 4 | 8 | 7.7 | point | Check 2 sources | Your superpower is checking. Verify important facts in at least two reliable sources: a textbook, an encyclopedia, an official website. | Two trusted sources (textbook and encyclopedia website) side by side with green checkmarks |
| 5 | 5 | 4.2 | victory | You decide, not AI | AI is a helper. But you always decide what to believe. | Teen holds a phone confidently, robot jumps with joy next to them, sunny forest |
