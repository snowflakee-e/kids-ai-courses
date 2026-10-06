"""Графики для исследования по Ближнему Востоку. Запуск: python3 research/middle-east/charts.py"""
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))
import charts as base  # общая палитра и оформление

import matplotlib.pyplot as plt
import numpy as np

S, INK, INK2, GRID = base.S, base.INK, base.INK2, base.GRID
clean = base.clean
OUT = Path(__file__).parent / "charts"
OUT.mkdir(exist_ok=True)


def save(fig, name):
    fig.savefig(OUT / f"{name}.svg", bbox_inches="tight", pad_inches=0.05)
    plt.close(fig)


# 1. PIRLS 2021: чтение в 4 классе
def pirls():
    rows = [("Катар", 485), ("ОАЭ", 483), ("Саудовская Аравия", 449), ("Египет", 378)]
    fig, ax = plt.subplots(figsize=(7.2, 2.2))
    y = np.arange(len(rows))
    ax.barh(y, [r[1] for r in rows], height=0.5, color=S[0], linewidth=0)
    for yy, (_, v) in zip(y, rows):
        ax.text(v - 4, yy, str(v), va="center", ha="right", fontsize=9, color="#ffffff", fontweight="semibold")
    ax.axvline(500, color=INK2, linewidth=1)
    ax.text(502, -0.62, "500 — средний уровень шкалы", fontsize=8.3, color=INK2, va="bottom")
    ax.set_yticks(y, [r[0] for r in rows], fontsize=9.5, color=INK)
    ax.invert_yaxis()
    ax.set_xlim(300, 560)
    ax.set_xticks([300, 350, 400, 450, 500, 550])
    clean(ax)
    save(fig, "m1_pirls")


# 2. Цифровая жизнь детей: ключевые доли
def digital():
    rows = [
        ("Школьники Саудовской Аравии играют в видеоигры (2021–22)", 82.2),
        ("Дети ОАЭ «не могут жить без гаджетов» (2024)", 80),
        ("Дети до 18 в Омане в соцсетях (2024)", 78),
        ("Дети ОАЭ видели жестокий контент в сети (2024)", 58),
        ("Подростки 11–17 в ОАЭ скрывают активность от родителей", 53),
        ("Подростки 11–17 в Египте скрывают активность от родителей", 53),
        ("Дети 4–17 в ОАЭ: больше 7 часов экрана в будний день (2025)", 37.7),
        ("Саудовские геймеры: признаки игрового расстройства", 20.5),
        ("Дети 10–17 в Иордании пережили цифровое насилие (2024)", 15.8),
        ("Родители в Иордании пользуются родительским контролем", 9),
    ]
    fig, ax = plt.subplots(figsize=(7.2, 4.0))
    y = np.arange(len(rows))
    vals = [r[1] for r in rows]
    ax.barh(y, vals, height=0.56, color=S[1], linewidth=0)
    for yy, v in zip(y, vals):
        ax.text(v + 1, yy, f"{v:g}%".replace(".", ","), va="center", fontsize=9, color=INK, fontweight="semibold")
    ax.set_yticks(y, [r[0] for r in rows], fontsize=8.5, color=INK)
    ax.invert_yaxis()
    ax.set_xlim(0, 100)
    ax.set_xticks([0, 25, 50, 75, 100], ["0", "25%", "50%", "75%", "100%"])
    clean(ax)
    save(fig, "m2_digital")


# 3. Доля времени детей в приложениях: Саудовская Аравия и Египет (Kaspersky, 2024–25)
def apps():
    apps_ = ["YouTube", "WhatsApp", "Roblox", "TikTok", "YouTube Kids"]
    ksa = [33.97, 11.21, 10.84, 7.01, 8.94]
    egy = [27.49, 19.47, 6.30, 10.45, None]
    fig, ax = plt.subplots(figsize=(7.2, 2.9))
    y = np.arange(len(apps_))
    h = 0.34
    for i, (lab, vals, c) in enumerate((("Саудовская Аравия", ksa, S[0]), ("Египет", egy, S[2]))):
        ys = y - h / 2 - 0.02 + i * (h + 0.04)
        for yy, v in zip(ys, vals):
            if v is None:
                ax.text(0.6, yy, "Египет: нет данных", va="center", fontsize=8, color=INK2)
                continue
            ax.barh(yy, v, height=h, color=c, linewidth=0, label=lab if yy == ys[0] else None)
            ax.text(v + 0.4, yy, f"{v:.1f}%".replace(".", ","), va="center", fontsize=8.5, color=INK)
    ax.set_yticks(y, apps_, fontsize=9.5, color=INK)
    ax.invert_yaxis()
    ax.set_xlim(0, 40)
    ax.set_xticks([0, 10, 20, 30, 40], ["0", "10%", "20%", "30%", "40%"])
    clean(ax)
    ax.legend(loc="lower center", bbox_to_anchor=(0.5, 1.0), ncol=2, frameon=False, fontsize=9)
    save(fig, "m3_apps")


# 4. Частное образование: доля учеников в частных школах
def private():
    rows = [("Шарджа (ОАЭ), 2025", 83), ("Катар, 2024–25", 64), ("Саудовская Аравия, 2025*", 17)]
    fig, ax = plt.subplots(figsize=(7.2, 1.7))
    y = np.arange(len(rows))
    ax.barh(y, [r[1] for r in rows], height=0.5, color=S[6], linewidth=0)
    for yy, (_, v) in zip(y, rows):
        ax.text(v + 1, yy, f"{v}%", va="center", fontsize=9, color=INK, fontweight="semibold")
    ax.set_yticks(y, [r[0] for r in rows], fontsize=9.5, color=INK)
    ax.invert_yaxis()
    ax.set_xlim(0, 100)
    ax.set_xticks([0, 25, 50, 75, 100], ["0", "25%", "50%", "75%", "100%"])
    clean(ax)
    save(fig, "m4_private")


# 5. Репетиторство в Египте по ступеням
def tutoring():
    rows = [("Начальная школа", 56), ("Средняя (preparatory)", 64), ("Старшая (secondary)", 81), ("Техническая старшая", 28)]
    fig, ax = plt.subplots(figsize=(7.2, 1.9))
    y = np.arange(len(rows))
    ax.barh(y, [r[1] for r in rows], height=0.5, color=S[3], linewidth=0)
    for yy, (_, v) in zip(y, rows):
        ax.text(v + 1, yy, f"{v}%", va="center", fontsize=9, color=INK, fontweight="semibold")
    ax.set_yticks(y, [r[0] for r in rows], fontsize=9.5, color=INK)
    ax.invert_yaxis()
    ax.set_xlim(0, 100)
    ax.set_xticks([0, 25, 50, 75, 100], ["0", "25%", "50%", "75%", "100%"])
    clean(ax)
    save(fig, "m5_tutoring")


# 6. Цены за одно занятие, дирхамы ОАЭ (диапазоны)
def prices():
    rows = [
        ("Вечерние уроки в Саудовской Аравии (тариф министерства)", 49, 98),
        ("Групповые онлайн-уроки кодинга, ОАЭ", 50, 65),
        ("BrightCHAMPS, ОАЭ (1 урок)", 68, 75),
        ("Рекомендация: живая мини-группа", 60, 100),
        ("Репетитор 1:1, Дубай (час)", 100, 200),
        ("JetLearn 1:1 (≈ $50)", 180, 190),
    ]
    fig, ax = plt.subplots(figsize=(7.2, 2.7))
    y = np.arange(len(rows))
    for yy, (lab, a, b) in zip(y, rows):
        c = S[2] if lab.startswith("Рекомендация") else S[0]
        ax.barh(yy, max(b - a, 3), left=a, height=0.5, color=c, linewidth=0)
        ax.text(b + 3, yy, f"{a}–{b}", va="center", fontsize=8.8, color=INK)
    ax.set_yticks(y, [r[0] for r in rows], fontsize=8.8, color=INK)
    ax.invert_yaxis()
    ax.set_xlim(0, 230)
    ax.set_xticks([0, 50, 100, 150, 200])
    ax.set_xlabel("дирхамов ОАЭ за занятие (1 SAR ≈ 0,98 AED)", fontsize=8.5)
    clean(ax)
    save(fig, "m6_prices")


# 7. ИИ в школе ОАЭ против курса: занятий в месяц
def exposure():
    rows = [("Школа ОАЭ, цикл 1–2 (6–13 лет)", 2, 0), ("Школа ОАЭ, цикл 3 (14–17 лет)", 4, 0),
            ("Курс: 1 живое занятие в неделю + приложение", 4, 12)]
    fig, ax = plt.subplots(figsize=(7.2, 1.8))
    y = np.arange(len(rows))
    for yy, (lab, live, app) in zip(y, rows):
        ax.barh(yy, live - 0.15, height=0.5, color=S[0], linewidth=0, label="Занятия с учителем" if yy == 0 else None)
        if app:
            ax.barh(yy, app - 0.15, left=live, height=0.5, color=S[2], linewidth=0, label="Короткие сессии в приложении")
        ax.text(live + app + 0.3, yy, f"{live + app}", va="center", fontsize=9, color=INK, fontweight="semibold")
    ax.set_yticks(y, [r[0] for r in rows], fontsize=9, color=INK)
    ax.invert_yaxis()
    ax.set_xlim(0, 18)
    ax.set_xlabel("занятий в месяц", fontsize=8.5)
    clean(ax)
    ax.legend(loc="lower center", bbox_to_anchor=(0.5, 1.0), ncol=2, frameon=False, fontsize=8.5)
    save(fig, "m7_exposure")


if __name__ == "__main__":
    pirls(); digital(); apps(); private(); tutoring(); prices(); exposure()
    print("ok:", sorted(p.name for p in OUT.glob("*.svg")))
