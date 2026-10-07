'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../catalog.js');

const ids = list => list.map(c => c.id).sort();

test('every course has a valid age range inside 6–17', () => {
    for (const c of C.COURSES) {
        const [min, max] = c.ages;
        assert.ok(Number.isInteger(min) && Number.isInteger(max), c.id);
        assert.ok(min <= max, c.id);
        assert.ok(min >= C.MIN_AGE && max <= C.MAX_AGE, c.id);
    }
});

test('every course fits one of the age groups, so no course is hidden by every filter', () => {
    for (const c of C.COURSES) assert.ok(C.groupOf(c), c.id);
});

test('ages 6–8 show only courses whose whole age range is inside 6–8', () => {
    const list = C.coursesInRange(6, 8);
    assert.ok(list.length > 0);
    for (const c of list) assert.ok(c.ages[0] >= 6 && c.ages[1] <= 8, c.id);
    // курс для 6–7 лет входит в 6–8
    assert.ok(list.some(c => c.id === 'hello-ai'));
    // курсы для 9–11 не попадают
    assert.ok(!list.some(c => c.ages[1] > 8));
});

test('a course that only partly overlaps the range is not shown', () => {
    // AI Trail 14–17 частично в 12–14, но в 12–14 его быть не должно
    assert.ok(!C.coursesInRange(12, 14).some(c => c.id === 'ai-trail'));
    assert.ok(C.coursesInRange(14, 17).some(c => c.id === 'ai-trail'));
});

test('no range means all courses', () => {
    assert.equal(C.coursesInRange(null, null).length, C.COURSES.length);
});

test('exact age shows every course that includes that age', () => {
    assert.deepEqual(ids(C.coursesForAge(7)), ['ai-tales', 'hello-ai', 'teach-bloop']);
    const at14 = ids(C.coursesForAge(14));
    assert.ok(at14.includes('my-bot') && at14.includes('ai-trail'));
    assert.ok(!at14.includes('study-coach'));
});

test('parseRange reads group ids and single ages', () => {
    assert.deepEqual(C.parseRange('6-8'), { min: 6, max: 8 });
    assert.deepEqual(C.parseRange('7'), { min: 7, max: 7 });
    assert.equal(C.parseRange('all'), null);
    assert.equal(C.parseRange('9-6'), null);
    assert.equal(C.parseRange(''), null);
});

test('labels', () => {
    assert.equal(C.rangeLabel(6, 8), 'Ages 6–8');
    assert.equal(C.rangeLabel(7, 7), 'Age 7');
    assert.equal(C.courseAges(C.findCourse('hello-ai')), 'Ages 6–7');
});

test('course links: separate page, cabinet or trial lesson', () => {
    assert.equal(C.courseHref(C.findCourse('ai-trail'), '../../'), '../../ai-trail/');
    assert.equal(C.courseHref(C.findCourse('prompts'), ''), '../kids-ai-cabinet/?start=prompts');
    assert.equal(C.courseHref(C.findCourse('ai-tales'), ''), null);
});

test('interest filter', () => {
    const art = C.coursesForInterest('art');
    assert.ok(art.length > 0 && art.every(c => c.interests.includes('art')));
    for (const c of C.COURSES) for (const i of c.interests) assert.ok(C.INTERESTS[i], c.id + ': ' + i);
});
