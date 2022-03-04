const path = require('path');
const child_process = require('child_process');

const actionPath = path.join(__dirname, `../`)

const { step } = require(`${actionPath}/src/helpers`);
const { NPM_GLOBAL_DIR, NPM_VERSION, env } = require(`${actionPath}/src/defs`);


const cwd = process.env.GITHUB_WORKSPACE;

const packageJson = require(`${cwd}/package.json`);


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

step('NPM upgrade', () => {
    child_process.execSync(`npm install -g npm@${NPM_VERSION}`, {
        stdio: [0, 1, 2],
        cwd,
    });
});

// make sure that node_modules are installed
step('Npm action modules install', () => {
    child_process.execSync('npm install', {
        stdio: [0, 1, 2],
        cwd: __dirname,
        env,
    });
});

// now we can require the action modules
const { npmVersionCheck } = require(`${actionPath}/src/utils`);
const core = require('@actions/core');
const github = require('@actions/github');
// set new npm dir in pipeline paths
core.addPath(`${NPM_GLOBAL_DIR}/bin`);

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

        const ref = github.head_ref || github.ref_name;

        const branch = ref.replace('refs/heads/', '');
        const branch_id = branch.split('/');

        core.setOutput('github_branch', branch.toLowerCase());
        core.setOutput('github_branch_id', branch_id[0].toLowerCase());

        core.exportVariable('COMMIT_SHA', github.context.sha);
        core.exportVariable('PACKAGE_VERSION', packageJson.version);

    } catch (error) {
        setFailed(error);
    }
}

run();
