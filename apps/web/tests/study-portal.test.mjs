/**
 * AuPro Study Portal test suite (2-1 SEM Preparation, OS only).
 *
 * 1. Subjects: 5 listed, OS available, the other 4 marked coming soon.
 * 2. OS units: 7 units, with topics, one-line explanations and real questions.
 * 3. Vector search: the same in-app TF-IDF engine as the FAQ chatbot
 *    finds the right OS question for plain-language queries, and returns
 *    nothing confident for unrelated words.
 * 4. Drive link: the portal points at the real sem 2-1 Drive folder.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  studySubjects,
  studyQuestionBank,
  studyVectorDB,
  STUDY_DRIVE_URL,
} from '../app/lib/study-data.ts';

test('subjects: 5 listed, OS ready, other 4 coming soon', () => {
  assert.equal(studySubjects.length, 5);
  const os = studySubjects.find((s) => s.id === 'os');
  assert.ok(os);
  assert.equal(os.comingSoon, false);
  assert.equal(os.code, 'AI2104');
  const comingSoon = studySubjects.filter((s) => s.comingSoon);
  assert.equal(comingSoon.length, 4);
  assert.deepEqual(
    comingSoon.map((s) => s.id).sort(),
    ['coa', 'dms', 'oop', 'psqt']
  );
});

test('OS: 7 units, each with topics and real questions', () => {
  const os = studySubjects.find((s) => s.id === 'os');
  assert.equal(os.units.length, 7);
  for (const unit of os.units) {
    assert.ok(unit.topics.length >= 2, `unit ${unit.id} needs topics`);
    assert.ok(unit.questions.length >= 1, `unit ${unit.id} needs questions`);
    for (const t of unit.topics) {
      assert.ok(t.name.length > 0);
      assert.ok(t.expl.length > 0);
      assert.equal(t.expl.includes('—'), false, 'no em dashes in copy');
    }
    for (const q of unit.questions) {
      assert.ok(q.text.length > 0);
      assert.ok(q.paper.length > 0);
      assert.ok(q.year.length > 0);
      assert.ok(q.marks.length > 0);
    }
  }
  const priorities = os.units.map((u) => u.id + ':' + u.priority);
  assert.ok(priorities.includes('2:high'));
  assert.ok(priorities.includes('4:high'));
  assert.ok(priorities.includes('5:high'));
  assert.ok(priorities.includes('7:low'));
});

test('question bank: 32 real OS questions, all with paper and marks', () => {
  assert.equal(studyQuestionBank.length, 32);
  const ids = new Set(studyQuestionBank.map((e) => e.id));
  assert.equal(ids.size, 32, 'ids must be unique');
  for (const entry of studyQuestionBank) {
    assert.ok(entry.question.length > 0);
    assert.ok(entry.answer.length > 0);
    assert.ok(entry.keywords.length >= 3);
    assert.ok(entry.category.startsWith('Operating Systems, Unit '));
  }
});

test('vector search: Banker query finds the Banker question', () => {
  const results = studyVectorDB.query("Banker's algorithm deadlock", 3);
  assert.ok(results.length > 0);
  assert.equal(results[0].entry.id, 'os-u4-bankers');
  assert.ok(results[0].confidencePercent >= 25);
});

test('vector search: page faults query finds the page fault question', () => {
  const results = studyVectorDB.query('page faults FIFO LRU optimal', 3);
  assert.ok(results.length > 0);
  assert.equal(results[0].entry.id, 'os-u5-pagefaults');
  assert.ok(results[0].confidencePercent >= 25);
});

test('vector search: scheduling query finds a scheduling question', () => {
  const results = studyVectorDB.query('Round Robin CPU scheduling example', 3);
  assert.ok(results.length > 0);
  assert.equal(results[0].entry.id, 'os-u2-rr');
  assert.ok(results[0].confidencePercent >= 25);
});

test('vector search: unrelated words return nothing confident', () => {
  const results = studyVectorDB.query('zebra mango cricket', 3);
  assert.ok(results.every((r) => r.confidencePercent < 25));
});

test('Drive link points at the sem 2-1 folder', () => {
  assert.equal(
    STUDY_DRIVE_URL,
    'https://drive.google.com/drive/folders/10XfL3TjQ5CQL7oqQMEHO-aaa3TrpGP_Z'
  );
});
