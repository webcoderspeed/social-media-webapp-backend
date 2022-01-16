import logger from 'pino';
import dayjs from 'dayjs';

export const log = (level) => logger({
  prettyPrint: true,
  level: level,
  base: {
    pid: false
  },
  timestamp: () => `,"time":"${dayjs().format()}"`,
})

export const info = ({ info }) => log('info').info(...info);
export const warn = ({ warn }) => log('warn').warn(...warn);
export const error = ({ error }) => log('error').error(...error);
export const debug = ({ debug }) => log('debug').debug(...debug);
export const fatal = ({ fatal }) => log('fatal').fatal(...fatal);
export const trace = ({ trace }) => log('trace').trace(...trace);



