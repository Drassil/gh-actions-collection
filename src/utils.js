const child_process = require('child_process');
const exec = require('@actions/exec');
const semver = require('semver');
const core = require('@actions/core');
const cwd = process.env.GITHUB_WORKSPACE;

/**
 * We must be sure that our npm is of the right version
 */
async function npmVersionCheck() {
  let npmVersionTest2;
  const options = {};
  options.listeners = {
    stdout: (data) => {
      npmVersionTest2 = data.toString().trim();
    },
  };
  const npmVersionTest1 = child_process
    .execSync('npm --version', { cwd })
    .toString()
    .trim();
  await exec.exec('npm --version', [], options);

  const npmVersion = getNpmVersion();

  if (
    !semver.satisfies(npmVersionTest1, `~${npmVersion}`) ||
    !semver.satisfies(npmVersionTest2, `~${npmVersion}`)
  ) {
    throw new Error(
      `Npm version is ${npmVersionTest1} (on execSync) | ${npmVersionTest2} (on gh exec), it should be at least 7+. Something went wrong with the previous installtion`,
    );
  }
}

function getNpmVersion() {
  return core.getInput('npm_version')
}

const VALID_REF_PREFIX = 'refs/heads/';

function getBranchName() {
  let branchName;

  /**
   * When the workflow is invoked from manual flow, the branch name
   * is in GITHUB_REF, otherwise, we have to look into GITHUB_BASE_REF
   */
  if (process.env.GITHUB_REF.startsWith(VALID_REF_PREFIX)) {
    // coming from a manual workflow trigger
    branchName = process.env.GITHUB_REF.replace(VALID_REF_PREFIX, '');
  } else {
    // coming from a PR
    branchName = process.env.GITHUB_HEAD_REF;
  }

  return branchName;
}

/**
 *
 * @param {Error} error
 */
function setFailed(error) {
  console.log(error.message, error.stack);
  core.setFailed(error.message);
}


module.exports = {
  npmVersionCheck,
  getNpmVersion,
  getBranchName,
  setFailed
};
