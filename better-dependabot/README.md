# Better Dependabot GitHub Action

## Introduction

The Better Dependabot GitHub Action automates the process of updating NPM packages and creating pull requests for those updates. Unlike traditional dependabot updates, this action allows for more granular control over the update process, including specifying the version target for updates and adding custom arguments for the `npm-check-updates` package.

## Features

- Checks for existing pull requests to avoid duplicate updates.
- Updates NPM packages based on a specified version target (`latest`, `newest`, `greatest`, `minor`, `patch`, `semver`).
- Creates a new branch and pull request with the updated `package.json` and `package-lock.json` files.
- Allows for custom npm arguments to fine-tune the update process.

## Inputs

| Input          | Description                                                                                           | Required | Default |
|----------------|-------------------------------------------------------------------------------------------------------|----------|---------|
| `node_version` | Node version used for the Node.js commands.                                                           | No       | `lts/*` |
| `npm_version`  | NPM version used for the npm commands.                                                                | No       | `''`    |
| `version_target` | Determines the version to upgrade to. Options: `latest`, `newest`, `greatest`, `minor`, `patch`, `semver`. | No       | `patch` |
| `ncu_args`     | Extra arguments for the `npm-check-updates` command.                                                  | No       | `''`    |
| `token`        | A GitHub PAT (Personal Access Token) for authenticating GitHub CLI operations.                        | Yes      | N/A     |
| `target_branch` | The target branch for the PR                        | No      | `main`     |
| `context` | It is used inside the branch name. E.g: You can use it to differentiate multiple PRs in a monorepo          | No      | `default`     |
| `audit_command` | Audit command to use                                                                                   | No     | `npm audit --package-lock-only` fix |
| `package_manager` | package manager to use                                                                                | No | `npm` |
| `working_directory` | Change the working directory of the action                                                           | No | `` |


## Usage

To use the Better Dependabot GitHub Action in your workflow, follow these steps:

1. Create a `.github/workflows` directory in your repository (if it doesn't already exist).
2. Create a new YAML file within the `.github/workflows` directory. For example, `better-dependabot.yml`.
3. Add the following configuration to your YAML file, adjusting the inputs as necessary:

```yaml
name: Automated Dependency Updates

on:
  schedule:
    - cron: '0 0 * * 0' # Weekly on Sunday at 00:00
  workflow_dispatch: # Allows manual triggering

jobs:
  update-dependencies:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Better Dependabot
        uses: Drassil/gh-actions-collection/better-dependabot@master
        with:
          node_version: '20' # Example: specify the Node.js version
          version_target: 'minor' # Example: target minor version updates
          ncu_args: '--filter /react/' # Example: update react packages only
          token: ${{ secrets.GITHUB_TOKEN }} # Use a GitHub PAT or `${{ secrets.GITHUB_TOKEN }}`
          target_branch: 'main'
```

## Example Workflow
The provided example in the Usage section sets up a weekly job that checks and updates your NPM dependencies, targeting minor versions, and focuses on packages related to React.

For more detailed control or different scheduling, adjust the cron syntax in the on.schedule field or modify the input parameters as needed.

## Support
For support or questions about using this GitHub Action, please open an issue in the repository.
