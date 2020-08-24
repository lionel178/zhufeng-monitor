import getLastEvent from '../utils/getLastEvent';
import getSelector from '../utils/getSelector';
import tracker from '../utils/tracker';

export function injectJsError() {
  // 监听全局未捕获的错误
  window.addEventListener(
    'error',
    function (event) {
      let lastEvent = getLastEvent();

      if (event.target && (event.target.src || event.target.href)) {
        tracker.send({
          kind: 'stability',
          type: 'error',
          errorType: 'resourceError', // js 或 css 资源加载错误
          filename: event.target.src || event.target.href,
          tagName: event.target.tagName, // SCRIPT
          selector: getSelector(event.target),
        });
      } else {
        tracker.send({
          kind: 'stability',
          type: 'error',
          errorType: 'jsError',
          message: event.message,
          filename: event.filename,
          position: `${event.lineno}:${event.colno}`,
          stack: getLines(event.error.stack),
          selector: lastEvent ? getSelector(lastEvent.path) : '',
        });
      }
    },
    true
  );

  window.addEventListener('unhandledrejection', function (event) {
    let lastEvent = getLastEvent();
    let message;
    let reason = event.reason;
    let filename;
    let line = 0;
    let column = 0;
    let stack = '';
    if (typeof reason === 'string') {
      message = reason;
    } else if (typeof reason === 'object') {
      message = reason.message;
      if (reason.stack) {
        let matchResult = reason.stack.match(/at\s+(.+):(\d+):(\d+)/);
        filename = matchResult[1];
        line = matchResult[2];
        column = matchResult[3];
      }
      stack = getLines(reason.stack);
    }
    tracker.send({
      kind: 'stability',
      type: 'error',
      errorType: 'promiseError',
      message,
      filename,
      position: `${line}:${column}`,
      stack,
      selector: lastEvent ? getSelector(lastEvent.path) : '',
    });
  });
}

function getLines(stack) {
  return stack
    .split('\n')
    .slice(1)
    .map((item) => item.replace(/^\s+at\s+/g, ''))
    .join('^');
}
