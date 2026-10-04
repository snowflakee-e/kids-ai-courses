import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

const ORIGIN = 'https://snowflakee-e.github.io';

// Подмена Workers AI: запоминает вызовы и отвечает тем, что вернёт handler
function fakeAI(handler) {
    const calls = [];
    return { calls, run: async (model, input) => { calls.push({ model, input }); return handler(model, input); } };
}

const checkBody = (extra = {}) => ({
    lang: 'ru',
    mode: 'check',
    lesson: 'Что такое ИИ',
    context: { question: 'Как ИИ учится?', points: ['много примеров', 'поправки после ошибок'] },
    messages: [{ role: 'user', content: 'Ему показывают много картинок' }],
    ...extra
});

function post(body, origin = ORIGIN) {
    return new Request('https://bloop-tutor.example.workers.dev/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(origin ? { Origin: origin } : {}) },
        body: typeof body === 'string' ? body : JSON.stringify(body)
    });
}

test('preflight from the course site is allowed', async () => {
    const res = await worker.fetch(new Request('https://x.dev/', { method: 'OPTIONS', headers: { Origin: ORIGIN } }), { AI: fakeAI(() => '') });
    assert.equal(res.status, 204);
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), ORIGIN);
});

test('other sites and requests without Origin are rejected', async () => {
    const ai = fakeAI(() => ({ response: 'hi' }));
    assert.equal((await worker.fetch(post(checkBody(), 'https://evil.example'), { AI: ai })).status, 403);
    assert.equal((await worker.fetch(post(checkBody(), null), { AI: ai })).status, 403);
    assert.equal(ai.calls.length, 0);
});

test('ALLOWED_ORIGINS overrides the default list', async () => {
    const env = { AI: fakeAI(() => ({ response: 'ok' })), ALLOWED_ORIGINS: 'https://my.site' };
    assert.equal((await worker.fetch(post(checkBody(), 'https://my.site'), env)).status, 200);
    assert.equal((await worker.fetch(post(checkBody()), env)).status, 403);
});

test('check mode: system prompt holds the task, verdict is parsed and removed', async () => {
    const ai = fakeAI(() => ({ response: 'VERDICT: partly\nХорошо, а что происходит после **ошибки**?' }));
    const res = await worker.fetch(post(checkBody()), { AI: ai });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.verdict, 'partly');
    assert.equal(data.reply, 'Хорошо, а что происходит после ошибки?');

    const { model, input } = ai.calls[0];
    assert.equal(model, '@cf/google/gemma-4-26b-a4b-it');
    assert.equal(input.messages[0].role, 'system');
    assert.match(input.messages[0].content, /Как ИИ учится\?/);
    assert.match(input.messages[0].content, /- поправки после ошибок/);
    assert.match(input.messages[0].content, /Говори только о текущем задании/);
    assert.deepEqual(input.messages.slice(1), [{ role: 'user', content: 'Ему показывают много картинок' }]);
});

test('mistake mode in English: no verdict, context in the prompt', async () => {
    const ai = fakeAI(() => ({ choices: [{ message: { content: '<think>plan</think>The tower is by Eiffel. VERDICT: yes' } }] }));
    const res = await worker.fetch(post({
        lang: 'en', mode: 'mistake', lesson: 'AI makes mistakes too',
        context: { question: 'Find the hallucination', answer: 'Built in 1889', correct: 'Designed by Leonardo', explain: 'Leonardo died long before.' },
        messages: [{ role: 'user', content: 'Why is my answer wrong?' }]
    }), { AI: ai });
    const data = await res.json();
    assert.equal(data.verdict, null);
    assert.equal(data.reply, 'The tower is by Eiffel. VERDICT: yes');
    assert.match(ai.calls[0].input.messages[0].content, /Student’s answer: Built in 1889/);
    assert.match(ai.calls[0].input.messages[0].content, /Answer in English/);
});

test('bad input is rejected before calling the model', async () => {
    const ai = fakeAI(() => ({ response: 'x' }));
    const env = { AI: ai };
    const bad = [
        'not json',
        checkBody({ mode: 'free-chat' }),
        checkBody({ context: { question: '', points: ['a'] } }),
        checkBody({ context: { question: 'q', points: [] } }),
        checkBody({ messages: [] }),
        checkBody({ messages: [{ role: 'assistant', content: 'hi' }] }),
        checkBody({ messages: [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }] }),
        checkBody({ messages: Array.from({ length: 13 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'x' })) }),
        'x'.repeat(17000)
    ];
    for (const body of bad) assert.equal((await worker.fetch(post(body), env)).status, 400, JSON.stringify(body).slice(0, 60));
    assert.equal(ai.calls.length, 0);
});

test('long messages are trimmed to the limits', async () => {
    const ai = fakeAI(() => ({ response: 'ok' }));
    await worker.fetch(post(checkBody({ messages: [{ role: 'user', content: 'я'.repeat(2000) }] })), { AI: ai });
    assert.equal(ai.calls[0].input.messages[1].content.length, 600);
});

test('falls back to the second model when the first fails', async () => {
    const ai = fakeAI(model => {
        if (model.includes('gemma')) throw new Error('model unavailable');
        return { response: 'Запасная модель ответила' };
    });
    const res = await worker.fetch(post(checkBody()), { AI: ai });
    assert.equal(res.status, 200);
    assert.equal((await res.json()).reply, 'Запасная модель ответила');
    assert.deepEqual(ai.calls.map(c => c.model), ['@cf/google/gemma-4-26b-a4b-it', '@cf/meta/llama-3.3-70b-instruct-fp8-fast']);
});

test('daily quota error returns 503 quota without trying the fallback', async () => {
    const ai = fakeAI(() => { throw new Error('4006: you have used up your daily free allocation of 10,000 neurons'); });
    const res = await worker.fetch(post(checkBody()), { AI: ai });
    assert.equal(res.status, 503);
    assert.deepEqual(await res.json(), { error: 'quota' });
    assert.equal(ai.calls.length, 1);
});

test('MODEL variable switches the model', async () => {
    const ai = fakeAI(() => ({ response: 'ok' }));
    await worker.fetch(post(checkBody()), { AI: ai, MODEL: '@cf/openai/gpt-oss-20b' });
    assert.equal(ai.calls[0].model, '@cf/openai/gpt-oss-20b');
});

test('rate limiter blocks when the binding says so', async () => {
    const ai = fakeAI(() => ({ response: 'ok' }));
    const res = await worker.fetch(post(checkBody()), { AI: ai, LIMITER: { limit: async () => ({ success: false }) } });
    assert.equal(res.status, 429);
    assert.equal(ai.calls.length, 0);
});
