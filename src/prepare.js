
const child_process = require('child_process');

const { step } = require(`../src/helpers`);
const { NPM_GLOBAL_DIR, env } = require(`../src/defs`);

const actionRootDir = `${__dirname}/../`;
const cwd = process.env.GITHUB_WORKSPACE;


module.exports = async function () {
  /**
   * Installing action dependencies before executing any actions
   */
  step('NPM Dir change', () => {
    child_process.execSync(`mkdir -p ${NPM_GLOBAL_DIR}`, {
      stdio: [0, 1, 2],
      cwd,
    });
    child_process.execSync(`npm config set prefix '${NPM_GLOBAL_DIR}'`, {
      stdio: [0, 1, 2],
      cwd,
    });
    child_process.execSync(`echo "${NPM_GLOBAL_DIR}/bin" >> $GITHUB_PATH`);
  });

  // make sure that node_modules are installed
  step('Npm action modules install', () => {
    child_process.execSync('npm install --production', {
      stdio: [0, 1, 2],
      cwd: actionRootDir,
      env,
    });
  });

  const { npmVersionCheck, getNpmVersion } = require(`../src/utils`);
  const core = require('@actions/core');
  // set new npm dir in pipeline paths
  core.addPath(`${NPM_GLOBAL_DIR}/bin`);

  step('NPM upgrade', () => {
    child_process.execSync(`npm install -g npm@${getNpmVersion()}`, {
      stdio: [0, 1, 2],
      cwd,
    });
  });

  await npmVersionCheck();

}
