const child_process = require("child_process");

const { step } = require(`../src/helpers`);

const cwd = process.env.GITHUB_WORKSPACE;

module.exports = async function () {
  const { npmVersionCheck, getNpmVersion } = require(`../src/utils`);

  const npmVersion = getNpmVersion();
  if (npmVersion) {
    step("NPM setup specific version", () => {
      child_process.execSync(`npm install -g npm@${getNpmVersion()}`, {
        stdio: [0, 1, 2],
        cwd,
      });
    });

    await npmVersionCheck();
  }
};
