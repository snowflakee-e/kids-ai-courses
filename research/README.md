# Исследование: как учить детей ИИ

`kids-ai-teaching-research.pdf` — исследование на 45 страниц: методики, возрастные группы 5–7 / 8–10 / 11–13 / 14–17, интересы детей, опыт педагогов, вовлечение через дофамин без вреда, мультфильмы и рилсы, шаблоны занятий, безопасность и право, метрики, план на 90 дней, 60+ источников.

## Как пересобрать

```bash
python3 research/src/charts.py                      # графики → research/src/charts/*.svg (нужен matplotlib)
NODE_PATH=$(npm root -g) node research/src/build.js # HTML → PDF через Chromium (нужен playwright)
```

Текст правится в `research/src/parts/*.html` (файлы склеиваются по порядку имён), оформление — в `research/src/style.css`. `research/src/report.html` собирается автоматически.
