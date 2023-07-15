const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");
const glob = require("glob");
// const prepare = require("../src/prepare");

async function run() {
  try {
    // await prepare();
    const accessToken = core.getInput("access_token");
    const requiredPathsInput = core.getInput("required_paths");
    const requiredPaths = requiredPathsInput
      ? requiredPathsInput.split(",")
      : [];

    // Set the access token for the GitHub CLI
    process.env.GH_TOKEN = accessToken;

    // Get the PR number
    let prNumber;
    switch (github.context.eventName) {
      case "issue_comment":
        prNumber = github.context.issue.number;
        break;
      case "workflow_dispatch":
        prNumber = github.context.payload.inputs.pr_number;
        break;
      case "pull_request":
        prNumber = github.context.payload.pull_request.number;
        break;
    }

    // Get the changed paths
    let changedPaths;
    if (prNumber) {
      // Fetch the base and head refs
      let baseRef, headRef;
      await exec.exec(
        "gh",
        ["pr", "view", prNumber, "--json", "baseRefName,headRefName"],
        {
          silent: true,
          listeners: {
            stdout: (data) => {
              const prData = JSON.parse(data.toString());
              baseRef = prData.baseRefName;
              headRef = prData.headRefName;
            },
          },
        }
      );

      // Fetch the branches
      await exec.exec("git", ["fetch", "origin", baseRef, headRef]);

      // Get the last merged commit
      let lastMergedCommit;
      await exec.exec(
        "git",
        ["merge-base", `origin/${baseRef}`, `origin/${headRef}`],
        {
          silent: true,
          listeners: {
            stdout: (data) => {
              lastMergedCommit = data.toString().trim();
            },
          },
        }
      );

      // Get the changed paths
      await exec.exec(
        "git",
        ["diff", "--name-only", `${lastMergedCommit}..origin/${headRef}`],
        {
          silent: true,
          listeners: {
            stdout: (data) => {
              changedPaths = data.toString().split("\n");
            },
          },
        }
      );
    } else {
      // Get the changed paths from the last commit
      await exec.exec("git", ["diff", "--name-only", "HEAD~1"], {
        silent: true,
        listeners: {
          stdout: (data) => {
            changedPaths = data.toString().split("\n");
          },
        },
      });
    }

    // Check if the changed paths match the required paths
    let requiredPathsMatched = true;
    for (const requiredPath of requiredPaths) {
      const matchedPaths = glob.sync(requiredPath, {
        matchBase: true,
        dot: true,
        nocase: true,
      });
      if (
        !matchedPaths.some((matchedPath) => changedPaths.includes(matchedPath))
      ) {
        requiredPathsMatched = false;
        break;
      }
    }

    // Set the outputs
    core.setOutput("changed_files", changedPaths.join(","));
    core.setOutput("required_paths_matched", requiredPathsMatched.toString());
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
