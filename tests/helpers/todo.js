/* global Proxy */
import { test } from 'qunit';

export default function todo(description, callback) {
  test(`[TODO] ${description}`, function todoTest(assert) {
    let results = [];
    let hijackedAssert = hijackAssert(assert, results);
    callback(hijackedAssert);
    assertTestStatus(assert, results);
  });
}

function hijackAssert(assert, results) {
  let handler = {
    get(target, propKey /*, receiver*/) {
      const origMethod = target[propKey];

      if (typeof origMethod === 'function' && propKey === 'pushResult') {
        return function captureResult(assertion) {
          results.push(assertion);
        };
      } else {
        return origMethod;
      }
    },
  };

  return new Proxy(assert, handler);
}

function assertTestStatus(assert, results) {
  const totalFailures = results.reduce((c, r) => {
    return r.result === false ? c + 1 : c;
  }, 0);
  const totalWasMet = assert.test.expected === null || assert.test.expected === results.length;
  const todoIsComplete = totalWasMet && totalFailures === 0;

  if (todoIsComplete) {
    results.push({
      actual: true,
      expected: false,
      message:
        'TODO COMPLETED | This TODO is now complete (all assertions pass) and MUST be converted from todo() to test()',
      result: false,
    });

    results.forEach(r => {
      assert.pushResult(r);
    });
  } else {
    // ideally we could report which assertions still fail; however, doing so
    //   would result in testem reporting these assertions as failures, so we must
    //   skip the test. It would be neat if we could still print something like
    //   the below.
    /*
    results.forEach(r => {
      let result = r.result;
      r.result = true;
      r.message = `[TODO ${result === true ? 'COMPLETED' : 'INCOMPLETE'}] ${r.message}`;
      assert.pushResult(r);
    });
    */

    assert.test.expected = 0;
    assert.test.skip = true;
    assert.test.testReport.expected = 0;
    assert.test.testReport.skipped = true;
  }
}
