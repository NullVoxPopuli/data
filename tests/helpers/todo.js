import QUnit, { test } from 'qunit';

export default function todo(description, callback) {
  test(`[TODO] ${description}`, async function todoTest(assert) {
    await callback(assert);

    assertTestStatus(assert);
  });
}

function assertTestStatus(assert) {
  const results = QUnit.config.current.assertions;
  const totalFailures = results.reduce((c, r) => {
    return r.result === false ? c + 1 : c;
  }, 0);
  const totalWasMet = assert.test.expected === null || assert.test.expected === results.length;
  const todoIsComplete = totalWasMet && totalFailures === 0;

  if (todoIsComplete) {
    assert.pushResult({
      actual: true,
      expected: false,
      message:
        'TODO COMPLETED | This TODO is now complete (all assertions pass) and MUST be converted from todo() to test()',
      result: false,
    });
  } else {
    results.forEach(r => {
      let result = r.result;
      r.result = true;
      r.message = `[TODO ${result === true ? 'COMPLETED' : 'INCOMPLETE'}] ${r.message}`;
    });

    assert.test.expected = 0;
    assert.test.skip = true;
    assert.test.testReport.expected = 0;
    assert.test.testReport.skipped = true;
  }
}
