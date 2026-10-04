'use strict';

// ТЗ на ролики из сцен в course.js.
//   node tools/video-tz.js          > VIDEO_TZ.md   — таблицы для человека
//   node tools/video-tz.js --json   > videos.json   — сцены для автоматизации (Make.com)

const { COURSE } = require('../course.js');

const videos = [];
COURSE.blocks.filter(b => !b.soon).forEach(block => {
    block.lessons.forEach(lesson => {
        lesson.tasks.filter(t => t.type === 'video').forEach(v => {
            videos.push({
                block: block.id,
                lesson: lesson.id,
                lessonTitle: lesson.title,
                title: v.title,
                durationSec: v.scenes.reduce((s, sc) => s + sc.sec, 0),
                aspect: '16:9',
                file: `videos/${lesson.id}.mp4`,
                scenes: v.scenes.map((sc, i) => ({ n: i + 1, ...sc }))
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
out.push(`# ТЗ на ролики «${COURSE.title}»`);
out.push('');
out.push('Файл собирается из `course.js` командой `node tools/video-tz.js > VIDEO_TZ.md`. Сцены правь в `course.js`, не здесь: из них же играет раскадровка-заглушка в уроке.');
out.push('');
out.push('## Формат');
out.push('');
out.push(`- Аудитория: ${COURSE.age}. Тон «старший брат или сестра»: быстро, с юмором, без сюсюканья.`);
out.push('- Длина 30–40 секунд, одна идея на ролик. Хук — в первые 3 секунды.');
out.push('- 16:9, 1920×1080 для урока. Из того же материала — нарезка 9:16 для Reels и TikTok (реклама курса).');
out.push('- Субтитры вшиты: подростки часто смотрят без звука. Текст из колонки «Экран» — крупно, 3–6 слов.');
out.push('- Блуп — состояние из `bobik.js` (колонка «Блуп»), палитра `peach`.');
out.push('');
out.push('## Как снимать');
out.push('');
out.push('| Вариант | Как | Когда брать |');
out.push('|---|---|---|');
out.push('| Блуп-анимация | PNG Блупа в нужной позе из `bobik.js` → Kling image-to-video по колонке «Визуал» → озвучка колонки «Голос» (голос HeyGen или ElevenLabs) → сборка в CapCut | Основной вариант для теории |');
out.push('| Ведущий HeyGen | Аватар-ведущий 20–25 лет читает «Голос», Блуп — стикер-реакция в углу | Если тесты покажут, что робот для 14–15 лет выглядит детским |');
out.push('| Скринкаст | Запись реального чата: плохой промпт → хороший | Уроки «Как правильно спросить» и «ИИ тоже ошибается»: дешевле и убедительнее анимации |');
out.push('');
out.push('Проверь до массового запуска: аватар HeyGen по фото может не распознать лицо у робота с экраном вместо лица. Сделай одну сцену и посмотри на синхрон губ.');
out.push('');
out.push('## Как подключить готовый ролик');
out.push('');
out.push('Положи файл в `ai-trail/videos/` и в `course.js` у задания `video` заполни `src: \'videos/l1.mp4\'` (или `youtube: \'ID\'`). Раскадровка отключится сама, а кнопка «Дальше» откроется после 90% просмотра.');
out.push('');
out.push('## Автоматизация');
out.push('');
out.push('`node tools/video-tz.js --json` отдаёт те же сцены в JSON. Сценарий для Make.com: JSON → итерация по сценам → генерация (HeyGen: голос и аватар, Kling: визуал) → ожидание готовности → склейка → загрузка файла → путь в `src`.');
out.push('');

videos.forEach((v, i) => {
    out.push(`## ${i + 1}. ${v.lessonTitle}: «${v.title}»`);
    out.push('');
    out.push(`${v.durationSec} сек · ${v.aspect} · файл \`${v.file}\``);
    out.push('');
    out.push('| # | Сек | Блуп | Экран | Голос | Визуал (промпт Kling) |');
    out.push('|---|---|---|---|---|---|');
    v.scenes.forEach(sc => {
        out.push(`| ${sc.n} | ${sc.sec} | ${sc.pose} | ${cell(sc.screen)} | ${cell(sc.voice)} | ${cell(sc.visual)} |`);
    });
    out.push('');
});

process.stdout.write(out.join('\n'));
