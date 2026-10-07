'use strict';

// ТЗ на ролики из сцен курса.
//   node tools/video-tz.js                  > VIDEO_TZ.md      — русские ролики, таблицы для человека
//   node tools/video-tz.js --lang en        > VIDEO_TZ.en.md   — английские ролики
//   node tools/video-tz.js [--lang en] --json                  — сцены в JSON для автоматизации (Make.com)

const LANG = process.argv.includes('--lang') && process.argv[process.argv.indexOf('--lang') + 1] === 'en' ? 'en' : 'ru';
const { COURSE } = require(LANG === 'en' ? '../course.en.js' : '../course.js');

// Темп озвучки, слов в секунду: по нему проверяем, влезает ли голос в сцену
const RATE = { ru: 2.2, en: 2.6 };
// Ролик лежит рядом со страницей своего языка: src в курсе — относительный путь от неё
const DIR = { ru: 'ai-trail/', en: 'ai-trail/en/' };

const L = {
    ru: {
        title: `# ТЗ на ролики «${COURSE.title}»`,
        source: 'Файл собирается из `course.js` командой `node tools/video-tz.js > VIDEO_TZ.md`. Сцены правь в `course.js`, не здесь: из них же играет раскадровка-заглушка в уроке. Английские ролики — в `VIDEO_TZ.en.md`.',
        format: [
            `- Аудитория: ${COURSE.age}. Тон «старший брат или сестра»: быстро, с юмором, без сюсюканья.`,
            '- Голос: русский, живой, темп около 130 слов в минуту.',
            '- Субтитры и текст на экране — на русском. Маскот — Блуп.'
        ],
        file: 'videos/',
        courseFile: 'course.js'
    },
    en: {
        title: `# ТЗ на английские ролики «${COURSE.title}»`,
        source: 'Файл собирается из `course.en.js` командой `node tools/video-tz.js --lang en > VIDEO_TZ.en.md`. Сцены правь в `course.en.js`, не здесь. Английская версия — основная: русская (`course.js`) пока на прежнем контенте, её ролики в `VIDEO_TZ.md`.',
        format: [
            '- Аудитория: англоязычные подростки 14–17 лет. Тон «старший брат или сестра»: быстро, с юмором, без сюсюканья.',
            '- Голос: носитель английского, темп около 150 слов в минуту. Выбери один акцент на весь курс, американский или британский, и не смешивай.',
            '- Субтитры и текст на экране — на английском. Маскот — Bloop (русский Блуп).',
            '- Уже есть русские ролики с живым ведущим? В HeyGen есть перевод видео с синхроном губ. Для анимации Блупа проще переозвучить по колонке «Голос».'
        ],
        file: 'videos/',
        courseFile: 'course.en.js'
    }
}[LANG];

const words = text => text.split(/\s+/).filter(Boolean).length;
const voiceSec = text => Math.round(words(text) / RATE[LANG] * 10) / 10;

const videos = [];
COURSE.blocks.filter(b => !b.soon).forEach(block => {
    block.lessons.forEach(lesson => {
        lesson.tasks.filter(t => t.type === 'video').forEach(v => {
            videos.push({
                lang: LANG,
                block: block.id,
                lesson: lesson.id,
                lessonTitle: lesson.title,
                title: v.title,
                durationSec: v.scenes.reduce((s, sc) => s + sc.sec, 0),
                aspect: '16:9',
                src: `${L.file}${lesson.id}.mp4`,
                file: `${DIR[LANG]}${L.file}${lesson.id}.mp4`,
                scenes: v.scenes.map((sc, i) => ({ n: i + 1, ...sc, voiceSec: voiceSec(sc.voice) }))
            });
        });
    });
});

if (process.argv.includes('--json')) {
    process.stdout.write(JSON.stringify(videos, null, 2) + '\n');
    process.exit(0);
}

const cell = text => String(text).replace(/\|/g, '\\|').replace(/\n/g, ' ');

const out = [];
out.push(L.title, '', L.source, '');
out.push('## Формат', '');
out.push(...L.format);
out.push('- Длина 35–50 секунд, одна идея на ролик. Хук — в первые 3 секунды.');
out.push('- 16:9, 1920×1080 для урока. Из того же материала — нарезка 9:16 для Reels и TikTok (реклама курса).');
out.push('- Субтитры вшиты: подростки часто смотрят без звука. Текст из колонки «Экран» — крупно, 3–6 слов.');
out.push('- Блуп — состояние из `bobik.js` (колонка «Блуп»), палитра `peach`.');
out.push(`- Колонка «Голос, с» — оценка длины озвучки при темпе ${RATE[LANG]} слова в секунду. ⚠️ значит, что голос не влезает в сцену: растяни сцену или сократи текст.`);
out.push('');
out.push('## Как снимать', '');
out.push('| Вариант | Как | Когда брать |');
out.push('|---|---|---|');
out.push('| Блуп-анимация | PNG Блупа в нужной позе из `bobik.js` → Kling image-to-video по колонке «Визуал» → озвучка колонки «Голос» (голос HeyGen или ElevenLabs) → сборка в CapCut | Основной вариант для теории |');
out.push('| Ведущий HeyGen | Аватар-ведущий 20–25 лет читает «Голос», Блуп — стикер-реакция в углу | Если тесты покажут, что робот для 14–18 лет выглядит детским |');
out.push('| Скринкаст | Запись реального чата: плохой промпт → хороший | Уроки про промпты и ошибки ИИ: дешевле и убедительнее анимации |');
out.push('');
out.push('Проверь до массового запуска: аватар HeyGen по фото может не распознать лицо у робота с экраном вместо лица. Сделай одну сцену и посмотри на синхрон губ.');
out.push('');
out.push('## Как подключить готовый ролик', '');
out.push(`Положи файл по пути из строки «файл» под заголовком ролика и в \`${L.courseFile}\` у задания \`video\` заполни \`src\` (например, \`src: '${L.file}l1.mp4'\`) или \`youtube: 'ID'\`. Раскадровка отключится сама, а кнопка «Дальше» откроется после 90% просмотра.`);
out.push('');
out.push('## Автоматизация', '');
out.push(`\`node tools/video-tz.js${LANG === 'en' ? ' --lang en' : ''} --json\` отдаёт те же сцены в JSON. Сценарий для Make.com: JSON → итерация по сценам → генерация (HeyGen: голос и аватар, Kling: визуал) → ожидание готовности → склейка → загрузка файла → путь в \`src\`.`);
out.push('');

videos.forEach((v, i) => {
    const voiceTotal = Math.round(v.scenes.reduce((s, sc) => s + sc.voiceSec, 0));
    out.push(`## ${i + 1}. ${v.lessonTitle}: «${v.title}»`, '');
    out.push(`${v.durationSec} сек по раскадровке · голос ≈ ${voiceTotal} сек · ${v.aspect} · файл \`${v.file}\``, '');
    out.push('| # | Сек | Голос, с | Блуп | Экран | Голос | Визуал (промпт Kling) |');
    out.push('|---|---|---|---|---|---|---|');
    v.scenes.forEach(sc => {
        const fit = sc.voiceSec > sc.sec ? ` ⚠️` : '';
        out.push(`| ${sc.n} | ${sc.sec} | ${sc.voiceSec}${fit} | ${sc.pose} | ${cell(sc.screen)} | ${cell(sc.voice)} | ${cell(sc.visual)} |`);
    });
    out.push('');
});

process.stdout.write(out.join('\n'));
