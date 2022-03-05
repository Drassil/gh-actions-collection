const prepare = require('../src/prepare')

const GITHUB_WORKSPACE = process.env.GITHUB_WORKSPACE;

async function run() {
  await prepare();

  // now we can require the action modules
  const { getBranchName, setFailed } = require(`../src/utils`);
  const core = require('@actions/core');

  try {
    const packageJsonPath = core.getInput('package_json_path') || `${GITHUB_WORKSPACE}/package.json`;

    const packageJson = require(packageJsonPath);

    const branch = getBranchName();

    core.setOutput('github_branch', branch);

    core.setOutput('package_version', packageJson.version);
    core.exportVariable('PACKAGE_VERSION', packageJson.version);

  } catch (error) {
    setFailed(error);
  }
}

run();
