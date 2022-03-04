const NPM_VERSION = '8.5';
const NPM_GLOBAL_DIR = '/home/runner/.npm-global';

const env = {
  ...process.env,
  PATH: `${NPM_GLOBAL_DIR}/bin:${process.env.PATH}`,
};

module.exports = {
  env,
  NPM_VERSION,
  NPM_GLOBAL_DIR,
};
