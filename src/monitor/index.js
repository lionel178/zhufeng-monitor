import { injectJsError } from './lib/jsError';
import { injectXHR } from './lib/xhr';
import { blackScreen } from './lib/blankScreen';
import { timing } from './lib/timing';

injectJsError();
injectXHR();
blackScreen();
timing();
