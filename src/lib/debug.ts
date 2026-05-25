/**
 * Tiny dev console logger. Tagged + colored so it stands out in DevTools.
 * No-op in production builds.
 */

const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

function log(tag: string, color: string, ...args: unknown[]) {
  if (!isDev || typeof window === 'undefined') return;
  // eslint-disable-next-line no-console
  console.log(`%c[${tag}]`, `color:${color};font-weight:600`, ...args);
}

export const apiLog = (...args: unknown[]) => log('api', '#3DDC97', ...args);
export const authLog = (...args: unknown[]) => log('auth', '#5B6CFF', ...args);
