# Changed Files Action

This action checks the files changed in a pull request or push event and matches them against a list of required paths.

## Inputs

### `access_token`

**Required** The GitHub token used to fetch the pull request details. Default is `secrets.GITHUB_TOKEN`.

### `required_paths`

A comma-separated list of paths that will be checked against the changed files. The paths can use the glob format (e.g., `**` to match any file in any directory). This input is optional.

## Outputs

### `changed_files`

A space-separated list of the files that were changed in the pull request or push event.

### `required_paths_matched`

A boolean value indicating whether all the required paths were matched by the changed files. If there are no required paths, this output will not be set.

## Example usage

```yaml
uses: @drassil/gh-actions-collection/changed-files@master
with:
  access_token: ${{ secrets.GITHUB_TOKEN }}
  required_paths: "**"
```

In this example, the action will check if any file in any directory was changed.