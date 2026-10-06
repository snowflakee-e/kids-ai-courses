# Исследования: как учить детей ИИ

`kids-ai-teaching-research.pdf` — исследование на 45 страниц: методики, возрастные группы 5–7 / 8–10 / 11–13 / 14–17, интересы детей, опыт педагогов, вовлечение через дофамин без вреда, мультфильмы и рилсы, шаблоны занятий, безопасность и право, метрики, план на 90 дней, 60+ источников.

## Как пересобрать

```bash
python3 research/src/charts.py                      # графики → research/src/charts/*.svg (нужен matplotlib)
NODE_PATH=$(npm root -g) node research/src/build.js # HTML → PDF через Chromium (нужен playwright)
```

Текст правится в `research/src/parts/*.html` (файлы склеиваются по порядку имён), оформление — в `research/src/style.css`. `research/src/report.html` собирается автоматически.

## Ближний Восток

`kids-ai-teaching-research-middle-east.pdf` — дополнение для стран Залива, Египта, Иордании, Ливана и Ирака: школьные программы по ИИ, рынок и цены, культура, религия и язык, возрастные группы, интересы детей, правила вовлечения, персонаж и рилсы, законы по странам, план выхода на рынок.

```bash
python3 research/middle-east/charts.py
NODE_PATH=$(npm root -g) node research/src/build.js research/middle-east research/kids-ai-teaching-research-middle-east.pdf "Как учить детей ИИ на Ближнем Востоке — исследование"
```

Текст — `research/middle-east/parts/*.html`, свои цвета и колонтитул — `research/middle-east/extra.css`.
