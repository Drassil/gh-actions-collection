const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");
const glob = require("glob");

async function run() {
  try {
    let accessToken = core.getInput("access_token");
    if (!accessToken) {
      accessToken = process.env.ACCESS_TOKEN;
    }

    let requiredPathsInput = core.getInput("required_paths");
    if (!requiredPathsInput) {
      requiredPathsInput = process.env.REQUIRED_PATHS;
    }
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

      let repo = `${github.context.repo.owner}/${github.context.repo.repo}`;
      await exec.exec(
        "gh",
        [
          "pr",
          "view",
          prNumber,
          "--repo",
          repo,
          "--json",
          "baseRefName,headRefName",
        ],
        {
          silent: true,
          env: {
            GH_TOKEN: accessToken,
          },
          listeners: {
            stdout: (data) => {
              const prData = JSON.parse(data.toString());
              baseRef = prData.baseRefName;
              headRef = prData.headRefName;
            },
            stderr: (data) => {
              console.error(data.toString());
            },
          },
        }
      );

      await exec.exec("git", ["fetch", "--force", "origin", baseRef, headRef], {
        silent: true,
        listeners: {
          stdout: (data) => {
            console.log(data.toString());
          },
          stderr: (data) => {
            console.error(data.toString());
          },
        },
      });

      console.log("Fetched branches.");

      console.log("Getting merge base...");

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
            stderr: (data) => {
              console.error(data.toString());
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
            stderr: (data) => {
              console.error(data.toString());
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
          stderr: (data) => {
            console.error(data.toString());
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
