const child_process = require('child_process');

const { step } = require(`../src/helpers`);
const { NPM_GLOBAL_DIR, env } = require(`../src/defs`);

const actionRootDir = `${__dirname}/../`;
const cwd = process.env.GITHUB_WORKSPACE;

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
    child_process.execSync('npm install', {
        stdio: [0, 1, 2],
        cwd: actionRootDir,
        env,
    });
});

// now we can require the action modules
const { npmVersionCheck, getNpmVersion, getBranchName } = require(`../src/utils`);
const core = require('@actions/core');
const github = require('@actions/github');
// set new npm dir in pipeline paths
core.addPath(`${NPM_GLOBAL_DIR}/bin`);

console.log(process.env);

console.log(core.getInput('package_json_path'), cwd)

const packageJsonPath = core.getInput('package_json_path') || `${cwd}/package.json`;

const packageJson = require(packageJsonPath);

step('NPM upgrade', () => {
    child_process.execSync(`npm install -g npm@${getNpmVersion()}`, {
        stdio: [0, 1, 2],
        cwd,
    });
});

/**
 *
 * @param {Error} error
 */
function setFailed(error) {
    console.log(error.message, error.stack);
    core.setFailed(error.message);
}

// most @actions toolkit packages have async methods
async function run() {
    try {
        await npmVersionCheck();

        const branch = getBranchName();

        core.setOutput('github_branch', branch);

        core.exportVariable('COMMIT_SHA', github.context.sha);
        core.exportVariable('PACKAGE_VERSION', packageJson.version);

    } catch (error) {
        setFailed(error);
    }
}

run();
