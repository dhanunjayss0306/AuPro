/**
 * AuPro Study Portal test suite (2-1 SEM Preparation).
 *
 * 1. Subjects: 5 listed, OS units ready, the other 4 marked units soon
 *    (their Drive files are still open).
 * 2. OS units: 7 units, with topics, one-line explanations and real questions.
 * 3. Vector search: the same in-app TF-IDF engine as the FAQ chatbot
 *    finds the right OS question for plain-language queries, and returns
 *    nothing confident for unrelated words.
 * 4. Drive link: the portal points at the real sem 2-1 Drive folder.
 * 5. Subject files: every subject opens its syllabus, study materials,
 *    previous papers and study guides, same to same as the Drive folder.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  studySubjects,
  studyQuestionBank,
  studyVectorDB,
  STUDY_DRIVE_URL,
  studySubjectFiles,
  studyPreviewUrl,
} from '../app/lib/study-data.ts';

test('subjects: 5 listed, OS units ready, other 4 units soon', () => {
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

test('question bank: 44 entries, all with paper and marks', () => {
  assert.equal(studyQuestionBank.length, 44);
  const ids = new Set(studyQuestionBank.map((e) => e.id));
  assert.equal(ids.size, 44, 'ids must be unique');
  for (const entry of studyQuestionBank) {
    assert.ok(entry.question.length > 0);
    assert.ok(entry.answer.length > 0);
    assert.ok(entry.keywords.length >= 3);
    assert.ok(entry.category.startsWith('Operating Systems, '));
    assert.equal(entry.answer.includes('—'), false, 'no em dashes in answers');
  }
  const unitQuestions = studyQuestionBank.filter((e) =>
    e.category.startsWith('Operating Systems, Unit ') && !e.id.includes('weightage')
  );
  assert.equal(unitQuestions.length, 32, '32 real paper questions');
  const guideEntries = studyQuestionBank.filter((e) =>
    !e.category.startsWith('Operating Systems, Unit ') || e.id.includes('weightage')
  );
  assert.equal(guideEntries.length, 12, '12 guide entries: weightage, most asked, exam pattern, study order, per-unit weightage, must read');
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

test('vector search: weightage question finds the weightage answer', () => {
  const results = studyVectorDB.query('What is the weightage of this lesson?', 3);
  assert.ok(results.length > 0);
  assert.equal(results[0].entry.id, 'os-weightage');
  assert.ok(results[0].confidencePercent >= 25);
});

test('vector search: most asked question finds the most asked list', () => {
  const results = studyVectorDB.query('What are the highest asked questions?', 3);
  assert.ok(results.length > 0);
  assert.equal(results[0].entry.id, 'os-most-asked');
  assert.ok(results[0].confidencePercent >= 25);
});

test('vector search: exam pattern question finds the exam pattern answer', () => {
  const results = studyVectorDB.query('What is the exam pattern? How many marks?', 3);
  assert.ok(results.length > 0);
  assert.equal(results[0].entry.id, 'os-exam-pattern');
  assert.ok(results[0].confidencePercent >= 25);
});

test('vector search: which unit first finds the study order answer', () => {
  const results = studyVectorDB.query('Which unit should I study first?', 3);
  assert.ok(results.length > 0);
  assert.equal(results[0].entry.id, 'os-which-unit-first');
  assert.ok(results[0].confidencePercent >= 25);
});

test('vector search: weightage of one unit finds that unit weightage', () => {
  const results = studyVectorDB.query('What is the weightage of Unit 5?', 3);
  assert.ok(results.length > 0);
  assert.equal(results[0].entry.id, 'os-u5-weightage');
  assert.ok(results[0].confidencePercent >= 25);
});

test('vector search: weightage of a chapter finds that unit weightage', () => {
  const results = studyVectorDB.query('weightage of chapter 4', 3);
  assert.ok(results.length > 0);
  assert.equal(results[0].entry.id, 'os-u4-weightage');
  assert.ok(results[0].confidencePercent >= 25);
});

test('vector search: overall weightage still finds the overall answer', () => {
  const results = studyVectorDB.query('What is the weightage of this lesson?', 3);
  assert.ok(results.length > 0);
  assert.equal(results[0].entry.id, 'os-weightage');
  assert.ok(results[0].confidencePercent >= 25);
});

test('vector search: questions I have to read finds the must-read list', () => {
  const results = studyVectorDB.query('What are the questions I have to read?', 3);
  assert.ok(results.length > 0);
  assert.equal(results[0].entry.id, 'os-must-read');
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

test('subject files: all 5 subjects open their Drive files, same to same', () => {
  const expected = {
    os: { syllabus: 1, studyMaterials: 10, previousPapers: 7, guides: 3 },
    psqt: { syllabus: 1, studyMaterials: 10, previousPapers: 6, guides: 2 },
    coa: { syllabus: 2, studyMaterials: 7, previousPapers: 9, guides: 2 },
    oop: { syllabus: 1, studyMaterials: 11, previousPapers: 8, guides: 2 },
    dms: { syllabus: 1, studyMaterials: 6, previousPapers: 4, guides: 2 },
  };
  let total = 0;
  for (const [id, counts] of Object.entries(expected)) {
    const files = studySubjectFiles[id];
    assert.ok(files, `${id} needs a files entry`);
    assert.match(files.folderUrl, /^https:\/\/drive\.google\.com\/drive\/folders\/[A-Za-z0-9_-]+$/);
    for (const [section, count] of Object.entries(counts)) {
      assert.equal(files[section].length, count, `${id} ${section}`);
      total += count;
    }
  }
  assert.equal(total, 95, '95 Drive files across the 5 subjects');
});

test('subject files: every file links to its real Drive file', () => {
  const urls = new Set();
  const ids = new Set();
  for (const files of Object.values(studySubjectFiles)) {
    for (const section of ['syllabus', 'studyMaterials', 'previousPapers', 'guides']) {
      for (const f of files[section]) {
        assert.ok(f.name.length > 0);
        assert.ok(f.id.length > 0);
        assert.ok(['pdf', 'image'].includes(f.kind), `${f.name} needs pdf or image kind`);
        assert.match(f.size, /^\d+(\.\d+)? (KB|MB|B)$/, `${f.name} needs a readable size`);
        assert.match(f.url, /^https:\/\/drive\.google\.com\/file\/d\/[A-Za-z0-9_-]+\/view\?usp=drivesdk$/);
        assert.ok(f.url.includes(`/d/${f.id}/`), 'url must carry the file id');
        assert.equal(
          studyPreviewUrl(f.id),
          `https://drive.google.com/file/d/${f.id}/preview`
        );
        assert.equal(f.name.includes('—'), false, 'no em dashes in file names');
        if (f.note) assert.equal(f.note.includes('—'), false, 'no em dashes in notes');
        assert.ok(!urls.has(f.url), `duplicate Drive link: ${f.url}`);
        assert.ok(!ids.has(f.id), `duplicate Drive id: ${f.id}`);
        urls.add(f.url);
        ids.add(f.id);
      }
    }
  }
  assert.equal(urls.size, 95);
  assert.equal(ids.size, 95);
});

test('subject files: exactly one image, the PSQT photo', () => {
  const images = [];
  for (const files of Object.values(studySubjectFiles)) {
    for (const section of ['syllabus', 'studyMaterials', 'previousPapers', 'guides']) {
      for (const f of files[section]) {
        if (f.kind === 'image') images.push(f.name);
      }
    }
  }
  assert.deepEqual(images, ['PSQT question paper, page 1 (photo)']);
});

test('subject files: OS guides include the lesson-wise study plan', () => {
  const os = studySubjectFiles.os;
  const plan = os.guides.find((g) => g.name === 'Lesson-wise study plan');
  assert.ok(plan);
  assert.equal(
    plan.url,
    'https://drive.google.com/file/d/1CSZdaOa6pmtRssC0CZoh4ee7V_Tw3dDL/view?usp=drivesdk'
  );
});
