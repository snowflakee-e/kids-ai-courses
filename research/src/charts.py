"""Графики для исследования. Запуск: python3 research/src/charts.py → SVG в research/src/charts/."""
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
import numpy as np

OUT = Path(__file__).parent / "charts"
OUT.mkdir(exist_ok=True)

# Палитра: эталон из dataviz-скилла, светлая тема (документ для печати)
SURFACE = "#ffffff"
INK = "#0b0b0b"
INK2 = "#52514e"
MUTED = "#8a8984"
GRID = "#e6e5e1"
S = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948"]
NEG = "#e34948"
POS = "#2a78d6"

plt.rcParams.update({
    "font.family": "Inter",
    "font.size": 9.5,
    "text.color": INK,
    "axes.edgecolor": GRID,
    "axes.labelcolor": INK2,
    "xtick.color": INK2,
    "ytick.color": INK2,
    "axes.facecolor": SURFACE,
    "figure.facecolor": SURFACE,
    "svg.fonttype": "path",
})


def clean(ax, grid_axis="x"):
    for s in ("top", "right", "left", "bottom"):
        ax.spines[s].set_visible(False)
    ax.tick_params(length=0)
    ax.grid(axis=grid_axis, color=GRID, linewidth=0.8)
    ax.set_axisbelow(True)


def rbar_h(ax, y, w, h, color, left=0):
    """Горизонтальный столбец: скругление 4px только на конце с данными."""
    ax.barh(y, w, height=h, left=left, color=color, linewidth=0)


def save(fig, name):
    fig.savefig(OUT / f"{name}.svg", bbox_inches="tight", pad_inches=0.05)
    plt.close(fig)


# 1. Платформы подростков США (Pew Research, 2025)
def platforms():
    plats = ["YouTube", "TikTok", "Instagram"]
    used = [92, 68, 63]
    daily = [73, 61, 55]
    const = [20, 21, 12]
    series = [("Пользуются", used, S[0]), ("Каждый день", daily, S[1]), ("«Почти постоянно»", const, S[2])]
    fig, ax = plt.subplots(figsize=(7.2, 2.9))
    y = np.arange(len(plats))
    h = 0.22
    for i, (lab, vals, c) in enumerate(series):
        ys = y - h - 0.02 + i * (h + 0.02)
        ax.barh(ys, vals, height=h, color=c, label=lab, linewidth=0)
        for yy, v in zip(ys, vals):
            ax.text(v + 1, yy, f"{v}%", va="center", fontsize=8.5, color=INK)
    ax.set_yticks(y, plats, fontsize=10, color=INK)
    ax.invert_yaxis()
    ax.set_xlim(0, 100)
    ax.set_xticks([0, 25, 50, 75, 100], ["0", "25%", "50%", "75%", "100%"])
    clean(ax)
    ax.legend(loc="lower center", bbox_to_anchor=(0.5, 1.0), ncol=3, frameon=False, fontsize=9)
    save(fig, "c1_platforms")


# 2. Дети и ИИ: ключевые цифры
def ai_use():
    rows = [
        ("Подростки 13–17, Великобритания: пользуются генеративным ИИ (Ofcom, 2023)", 79),
        ("Подростки 13–17, США: пробовали ИИ-компаньонов (Common Sense, 2025)", 72),
        ("Подростки 13–17, США: пользовались чат-ботами (Pew, 2025)", 64),
        ("Дети 9–17, Великобритания: используют чат-боты (Internet Matters, 2025)", 64),
        ("Подростки 13–17, США: ИИ для учёбы (Pew, 2025)", 54),
        ("Дети 7–12, Великобритания: пользуются генеративным ИИ (Ofcom, 2023)", 40),
        ("Пользователи 9–17, UK: «как разговор с другом» (Internet Matters)", 35),
        ("Подростки 13–17, США: чат-боты каждый день (Pew, 2025)", 30),
    ]
    fig, ax = plt.subplots(figsize=(7.2, 3.6))
    y = np.arange(len(rows))
    vals = [r[1] for r in rows]
    ax.barh(y, vals, height=0.55, color=S[0], linewidth=0)
    for yy, v in zip(y, vals):
        ax.text(v + 1, yy, f"{v}%", va="center", fontsize=9, color=INK, fontweight="semibold")
    ax.set_yticks(y, [r[0] for r in rows], fontsize=8.6, color=INK)
    ax.invert_yaxis()
    ax.set_xlim(0, 100)
    ax.set_xticks([0, 25, 50, 75, 100], ["0", "25%", "50%", "75%", "100%"])
    clean(ax)
    save(fig, "c2_ai_use")


# 3. Геймификация и внешние награды: эффекты
def effects():
    rows = [
        ("Геймификация → знания (g)", 0.49, "Sailer & Homner, 2020"),
        ("Геймификация → мотивация (g)", 0.36, "Sailer & Homner, 2020"),
        ("Геймификация → поведение (g)", 0.25, "Sailer & Homner, 2020"),
        ("Награда «за участие» → внутр. мотивация (d)", -0.40, "Deci et al., 1999"),
        ("Награда «за завершение» → внутр. мотивация (d)", -0.36, "Deci et al., 1999"),
        ("Награда «за результат» → внутр. мотивация (d)", -0.28, "Deci et al., 1999"),
    ]
    fig, ax = plt.subplots(figsize=(7.2, 3.0))
    y = np.arange(len(rows))
    for yy, (lab, v, src) in zip(y, rows):
        c = POS if v > 0 else NEG
        ax.barh(yy, v, height=0.55, color=c, linewidth=0)
        ax.text(v + (0.015 if v > 0 else -0.015), yy, f"{v:+.2f}".replace("-", "−"),
                va="center", ha="left" if v > 0 else "right", fontsize=9, color=INK, fontweight="semibold")
    ax.set_yticks(y, [r[0] for r in rows], fontsize=8.8, color=INK)
    ax.invert_yaxis()
    ax.axvline(0, color=INK2, linewidth=1)
    ax.set_xlim(-0.6, 0.65)
    ax.set_xticks([-0.4, -0.2, 0, 0.2, 0.4], ["−0.4", "−0.2", "0", "+0.2", "+0.4"])
    clean(ax)
    ax.text(0.33, -0.95, "помогает", color=INK2, fontsize=8.5, ha="center")
    ax.text(-0.33, -0.95, "вредит", color=INK2, fontsize=8.5, ha="center")
    save(fig, "c3_effects")


# 4. Короткие видео и когнитивные функции (Nguyen et al., 2025)
def shortform():
    rows = [("Тормозный контроль (самоконтроль)", -0.41), ("Внимание", -0.38),
            ("Когнитивные функции в целом", -0.34), ("Психика: стресс", -0.34), ("Психика: тревожность", -0.33)]
    fig, ax = plt.subplots(figsize=(7.2, 2.4))
    y = np.arange(len(rows))
    vals = [abs(r[1]) for r in rows]
    ax.barh(y, vals, height=0.55, color=S[1], linewidth=0)
    for yy, (lab, v) in zip(y, rows):
        ax.text(abs(v) + 0.008, yy, f"|r| = {abs(v):.2f}", va="center", fontsize=9, color=INK)
    ax.set_yticks(y, [r[0] for r in rows], fontsize=8.8, color=INK)
    ax.invert_yaxis()
    ax.set_xlim(0, 0.5)
    ax.set_xticks([0, 0.1, 0.2, 0.3, 0.4, 0.5], ["0", ".1", ".2", ".3", ".4", ".5"])
    ax.set_xlabel("сила связи: больше коротких видео → хуже показатель, |r|", fontsize=8.5)
    clean(ax)
    save(fig, "c4_shortform")


# 5. Длина одного блока активности по возрасту (рабочая рекомендация)
def segments():
    groups = ["5–7 лет", "8–10 лет", "11–13 лет", "14–17 лет"]
    seg = [(5, 8), (8, 12), (10, 15), (12, 20)]
    lesson = [(20, 30), (30, 45), (45, 60), (45, 75)]
    fig, axes = plt.subplots(1, 2, figsize=(7.2, 2.5), sharey=True)
    y = np.arange(len(groups))
    for ax, data, title, xmax in ((axes[0], seg, "Один блок без смены активности, мин", 25),
                                  (axes[1], lesson, "Всё занятие, мин", 80)):
        for yy, (a, b), c in zip(y, data, S[:4]):
            ax.barh(yy, b - a, left=a, height=0.45, color=c, linewidth=0)
            ax.text(b + xmax * 0.015, yy, f"{a}–{b}", va="center", fontsize=9, color=INK)
        ax.set_xlim(0, xmax)
        ax.set_title(title, fontsize=9.5, color=INK, loc="left")
        clean(ax)
    axes[0].set_yticks(y, groups, fontsize=9.5, color=INK)
    axes[0].invert_yaxis()
    fig.tight_layout(w_pad=2)
    save(fig, "c5_segments")


# 6. Схема по Schultz (1997): дофамин сигналит ошибку предсказания награды
def rpe():
    t = np.linspace(0, 10, 500)
    base = 1.0

    def spike(c, a, w=0.18):
        return a * np.exp(-((t - c) ** 2) / (2 * w ** 2))

    panels = [
        ("1. Награда неожиданная", base + spike(7, 3.2), None, 7),
        ("2. Награду научились ждать", base + spike(3, 3.0), 3, 7),
        ("3. Ждали, но награды нет", base + spike(3, 3.0) - 0.9 * np.exp(-((t - 7.3) ** 2) / (2 * 0.5 ** 2)), 3, 7),
    ]
    fig, axes = plt.subplots(1, 3, figsize=(7.2, 2.2), sharey=True)
    for ax, (title, yv, cue, rew) in zip(axes, panels):
        ax.plot(t, yv, color=S[6], linewidth=2, solid_capstyle="round")
        if cue is not None:
            ax.axvline(cue, color=S[0], linewidth=1)
            ax.text(cue, 4.55, "сигнал", ha="center", fontsize=8, color=INK2)
        ax.axvline(rew, color=S[3], linewidth=1)
        ax.text(rew, 4.55, "награда" if "нет" not in title else "(нет)", ha="center", fontsize=8, color=INK2)
        ax.set_title(title, fontsize=9, color=INK, loc="left", pad=16)
        ax.set_ylim(0, 4.4)
        ax.set_xticks([])
        ax.set_yticks([])
        for s in ("top", "right", "left"):
            ax.spines[s].set_visible(False)
        ax.spines["bottom"].set_color(GRID)
    axes[0].set_ylabel("активность\nдофаминовых нейронов", fontsize=8, color=INK2)
    fig.tight_layout(w_pad=1.2)
    save(fig, "c6_rpe")


# 7. Структура занятия по возрастам (минуты)
def lesson_timeline():
    groups = ["5–7 лет · 30 мин", "8–10 лет · 45 мин", "11–13 лет · 60 мин", "14–17 лет · 60 мин"]
    parts = ["Разогрев/повтор", "Новое (порциями)", "Практика с ИИ", "Игра/движение", "Свой проект", "Рефлексия"]
    data = [
        [4, 6, 5, 7, 5, 3],
        [5, 10, 12, 5, 9, 4],
        [6, 12, 16, 4, 17, 5],
        [5, 10, 18, 2, 20, 5],
    ]
    fig, ax = plt.subplots(figsize=(7.2, 2.8))
    y = np.arange(len(groups))
    gap = 0.35
    for yi, row in enumerate(data):
        left = 0
        for pi, v in enumerate(row):
            ax.barh(yi, v - gap, left=left, height=0.5, color=S[pi], linewidth=0,
                    label=parts[pi] if yi == 0 else None)
            if v >= 5:
                ax.text(left + (v - gap) / 2, yi, str(v), ha="center", va="center", fontsize=8,
                        color="#ffffff" if pi in (0, 1, 5, 6) else INK)
            left += v
    ax.set_yticks(y, groups, fontsize=9.2, color=INK)
    ax.invert_yaxis()
    ax.set_xlim(0, 62)
    ax.set_xticks([0, 10, 20, 30, 40, 50, 60])
    ax.set_xlabel("минуты от начала занятия", fontsize=8.5)
    clean(ax)
    ax.legend(loc="lower center", bbox_to_anchor=(0.5, 1.0), ncol=3, frameon=False, fontsize=8.5)
    save(fig, "c7_lesson")


# 8. Структура ролика 30–45 с
def reel():
    parts = [("Хук", 0, 3), ("Проблема / вопрос", 3, 10), ("Демонстрация / поворот", 10, 30),
             ("Развязка", 30, 40), ("Призыв / петля", 40, 45)]
    fig, ax = plt.subplots(figsize=(7.2, 1.35))
    for i, (lab, a, b) in enumerate(parts):
        ax.barh(0, b - a - 0.25, left=a, height=0.5, color=S[i], linewidth=0)
        if i == 0:
            ax.text(a, 0.36, lab, ha="left", va="bottom", fontsize=8.3, color=INK)
        else:
            ax.text((a + b) / 2, -0.36, lab, ha="center", va="top", fontsize=8.3, color=INK)
        ax.text((a + b) / 2 - 0.12, 0, f"{a}–{b}" + ("" if i == 0 else " с"), ha="center", va="center",
                fontsize=7.8, color="#ffffff" if i in (0, 1) else INK)
    ax.set_xlim(0, 45)
    ax.set_ylim(-0.9, 0.75)
    ax.axis("off")
    save(fig, "c8_reel")


if __name__ == "__main__":
    platforms()
    ai_use()
    effects()
    shortform()
    segments()
    rpe()
    lesson_timeline()
    reel()
    print("ok:", sorted(p.name for p in OUT.glob("*.svg")))
