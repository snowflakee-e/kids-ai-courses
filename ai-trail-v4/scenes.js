'use strict';

// Картинки для мини-игры «Найди глюки» (glitch): «сгенерированная ИИ» сцена, нарисованная кодом, и места ошибок.
// viewBox 0 0 400 300. spots: { x, y, r — зона нажатия, label — что не так, why — почему ИИ так ошибается }.
// Цвета фиксированные, не из темы: это «фотография», она одинакова в светлой и тёмной теме.
var SCENES = {
  park: {
    prompt: 'A sunny afternoon in the park: a girl waving, her dog, a clock tower, a sign with the park rules',
    alt: 'An AI picture of a park: a clock tower, a tree, a girl waving, her dog and a sign.',
    svg: [
      // небо, облака, птицы
      '<rect width="400" height="300" fill="#BFE3FF"/>',
      '<g fill="#FFFFFF" opacity=".9"><ellipse cx="190" cy="40" rx="34" ry="11"/><ellipse cx="212" cy="32" rx="22" ry="10"/><ellipse cx="260" cy="70" rx="24" ry="8"/></g>',
      '<path d="M120 40l6 5 6-5M140 30l5 4 5-4" fill="none" stroke="#2F3A4A" stroke-width="2" stroke-linecap="round"/>',
      // солнце справа вверху: все тени должны падать влево
      '<circle cx="345" cy="48" r="26" fill="#FFD43B"/><circle cx="345" cy="48" r="34" fill="#FFD43B" opacity=".25"/>',
      // трава и дорожка
      '<rect y="200" width="400" height="100" fill="#9ED17A"/>',
      '<path d="M0 290 C120 250 220 300 400 262 L400 300 L0 300Z" fill="#E8D9B5"/>',
      // башня с часами
      '<rect x="30" y="62" width="60" height="148" fill="#D9C7A7"/><path d="M24 64 L60 30 L96 64Z" fill="#B5523B"/>',
      '<rect x="48" y="150" width="24" height="60" rx="12" fill="#8C6A4F"/>',
      '<circle cx="60" cy="98" r="21" fill="#FFFFFF" stroke="#5B4636" stroke-width="3"/>',
      '<g font-family="Arial, sans-serif" font-size="9" font-weight="700" fill="#2B2B2B" text-anchor="middle">',
      '<text x="60" y="87">13</text><text x="75" y="101">3</text><text x="60" y="115">6</text><text x="45" y="101">9</text></g>',
      '<path d="M60 98 L60 88 M60 98 L68 102" stroke="#2B2B2B" stroke-width="2" stroke-linecap="round"/>',
      // скамейка (без ошибок) и её тень влево
      '<ellipse cx="96" cy="252" rx="30" ry="4" fill="#4F7F3A" opacity=".45"/>',
      '<rect x="98" y="232" width="56" height="6" rx="2" fill="#8C6A4F"/><rect x="98" y="222" width="56" height="5" rx="2" fill="#8C6A4F"/>',
      '<path d="M104 238 V252 M148 238 V252" stroke="#5B4636" stroke-width="3"/>',
      // дерево: тень вправо, к солнцу — ошибка
      '<ellipse cx="190" cy="209" rx="36" ry="6" fill="#4F7F3A" opacity=".55"/>',
      '<rect x="145" y="130" width="12" height="78" fill="#7A5235"/>',
      '<circle cx="151" cy="112" r="34" fill="#4E9A3C"/><circle cx="132" cy="124" r="20" fill="#5BAE47"/><circle cx="170" cy="122" r="20" fill="#5BAE47"/>',
      // цветы
      '<g fill="#FF7AA2"><circle cx="40" cy="236" r="4"/><circle cx="52" cy="244" r="4"/><circle cx="222" cy="232" r="4"/></g>',
      '<g fill="#FFFFFF"><circle cx="28" cy="246" r="3"/><circle cx="236" cy="240" r="3"/></g>',
      // девочка машет: тень влево (верно), на руке шесть пальцев — ошибка
      '<ellipse cx="234" cy="263" rx="22" ry="4" fill="#4F7F3A" opacity=".45"/>',
      '<path d="M244 236 V262 M256 236 V262" stroke="#2F3A4A" stroke-width="5" stroke-linecap="round"/>',
      '<path d="M236 240 L250 200 L264 240Z" fill="#7C5CFF"/>',
      '<path d="M244 212 L230 228" stroke="#F2C29B" stroke-width="5" stroke-linecap="round"/>',
      '<path d="M257 210 L272 180" stroke="#F2C29B" stroke-width="5" stroke-linecap="round"/>',
      '<circle cx="274" cy="175" r="5" fill="#F2C29B"/>',
      '<path d="M270 172 L264 162 M272 170 L269 159 M275 170 L275 158 M277 170 L281 159 M279 172 L286 163 M279 176 L287 172" stroke="#E2AE84" stroke-width="2.2" stroke-linecap="round"/>',
      '<circle cx="250" cy="192" r="12" fill="#F2C29B"/><path d="M238 190 Q250 172 262 190 Q258 180 250 180 Q242 180 238 190Z" fill="#3B2A20"/>',
      '<circle cx="246" cy="193" r="1.5" fill="#2B2B2B"/><circle cx="254" cy="193" r="1.5" fill="#2B2B2B"/><path d="M246 198 Q250 201 254 198" fill="none" stroke="#2B2B2B" stroke-width="1.4" stroke-linecap="round"/>',
      // собака с пятью лапами — ошибка; тень влево
      '<ellipse cx="292" cy="268" rx="24" ry="4" fill="#4F7F3A" opacity=".45"/>',
      '<path d="M284 252 V267 M291 253 V268 M298 253 V268 M306 253 V268 M313 252 V267" stroke="#8A5A35" stroke-width="4" stroke-linecap="round"/>',
      '<ellipse cx="299" cy="248" rx="20" ry="10" fill="#A86B3C"/>',
      '<circle cx="321" cy="238" r="9" fill="#A86B3C"/><ellipse cx="317" cy="232" rx="4" ry="7" fill="#7A4A26"/>',
      '<circle cx="324" cy="236" r="1.5" fill="#2B2B2B"/><circle cx="330" cy="240" r="2" fill="#2B2B2B"/>',
      '<path d="M279 244 Q270 236 274 228" fill="none" stroke="#A86B3C" stroke-width="4" stroke-linecap="round"/>',
      // табличка с перепутанными буквами — ошибка
      '<ellipse cx="340" cy="252" rx="18" ry="3" fill="#4F7F3A" opacity=".45"/>',
      '<rect x="352" y="186" width="6" height="66" fill="#7A5235"/>',
      '<rect x="318" y="156" width="74" height="38" rx="4" fill="#FFF8E7" stroke="#7A5235" stroke-width="2.5"/>',
      '<g font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#2E5B2E" text-anchor="middle">',
      '<text x="355" y="171">PAKR</text><text x="355" y="186">RUELS</text></g>'
    ].join(''),
    spots: [
      { x: 60, y: 92, r: 24, label: 'The clock shows 13', why: 'AI copies how clocks look, not how they work. Numbers and dials often come out wrong.' },
      { x: 276, y: 168, r: 18, label: 'Six fingers', why: 'Hands are hard for image generators: fingers bend, hide and overlap in photos, so AI often adds or loses one.' },
      { x: 299, y: 258, r: 24, label: 'The dog has five legs', why: 'AI learned “dog-shaped” patterns, not anatomy. Extra or missing legs are a classic glitch.' },
      { x: 355, y: 175, r: 28, label: 'The sign is gibberish', why: 'Image generators draw letter shapes, not words. Text often turns into almost-words.' },
      { x: 190, y: 209, r: 26, label: 'The tree’s shadow points at the sun', why: 'Shadows fall away from the light. Every other shadow here goes left, this one goes right. AI doesn’t understand light, it imitates it.' }
    ]
  }
};

if (typeof module !== 'undefined') module.exports = { SCENES: SCENES };
