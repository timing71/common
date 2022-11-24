import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import duration from 'dayjs/plugin/duration.js';

dayjs.extend(customParseFormat);
dayjs.extend(duration);

export default dayjs;
