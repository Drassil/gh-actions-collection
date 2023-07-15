const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");
const glob = require("glob");

async function run() {
  try {
    const accessToken = core.getInput("access_token");
    const requiredPathsInput = core.getInput("required_paths");
    const requiredPaths = requiredPathsInput
      ? requiredPathsInput.split(",")
      : [];

    process.env.GH_TOKEN = accessToken;

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

    let changedPaths;
    if (prNumber) {
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

      await exec.exec("git", ["fetch", "origin", baseRef, headRef]);

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
      await exec.exec("git", ["diff", "--name-only", "HEAD~1"], {
        silent: true,
        listeners: {
          stdout: (data) => {
            changedPaths = data.toString().split("\n");
          },
        },
      });
    }

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

    console.log("Changed files", changedPaths);
    console.log("Required paths matched", requiredPathsMatched);

    core.setOutput("changed_files", changedPaths.join(","));
    core.setOutput("required_paths_matched", requiredPathsMatched.toString());

    // Set the outputs as environment variables
    core.exportVariable("CHANGED_FILES", changedPaths.join(","));
    core.exportVariable(
      "REQUIRED_PATHS_MATCHED",
      requiredPathsMatched.toString()
    );
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
