const child_process = require('child_process');
const exec = require('@actions/exec');
const semver = require('semver');
const { NPM_VERSION, env } = require('./defs');
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
    .execSync('npm --version', { cwd, env })
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
    return core.getInput('npm_version') || NPM_VERSION
}

module.exports = {
  npmVersionCheck,
  getNpmVersion
};
