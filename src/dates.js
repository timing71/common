import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import duration from 'dayjs/plugin/duration.js';
import toObject from 'dayjs/plugin/toObject.js';

dayjs.extend(customParseFormat);
dayjs.extend(duration);
dayjs.extend(toObject);

export default dayjs;
