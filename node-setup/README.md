# Action: action-node-setup

This GitHub Action installs your npm modules with cache support and injects extra information into your pipeline that can be used by your workflows. It includes the `extra-info` action.

## Inputs

- `node_version`: The Node.js version used for the Node.js commands. Default is 'lts/*'.
- `npm_version`: The npm version used for the npm commands. Default is ''.
- `package_json_file`: The file name of the package.json from where to retrieve the package version. Default is 'package.json'.
- `package_json_dir`: The directory of the package.json from where to retrieve the package version. Default is ''.
- `project_id`: The project identifier to avoid cache collisions with other workflows. Default is 'default'.
- `install_command`: The install command. Default is 'npm install'.
- `cache_command`: The command to run if `cache_npm_modules: true` and cache hits. Default is 'npm ls --parseable | wc -l'.
- `cache_npm_modules`: Enable/disable caching of the local node_modules folder. Default is false.
- `cache_global_npm_modules`: Enable/disable caching of the global node_modules folder. Default is false.

## Outputs

- `github_branch`: The GitHub branch name.
- `package_version`: The package version of the repository. The `PACKAGE_VERSION` environment variable is also exported.

## Usage

This action is used in a workflow file as follows:

```yaml
- name: Setup Node.js environment
  uses: your-username/action-node-setup@v1
  with:
    node_version: '14'
    npm_version: '7'
    package_json_file: 'package.json'
    package_json_dir: 'my-app'
    project_id: 'my-app'
    install_command: 'npm ci'
    cache_command: 'npm ls --parseable | wc -l'
    cache_npm_modules: true
    cache_global_npm_modules: true
```

In this example, the action will set up a Node.js environment with Node.js version 14 and npm version 7. It will retrieve the package version from `my-app/package.json` and use it as the project identifier for caching. The action will run `npm ci` to install modules and `npm ls --parseable | wc -l` if the cache hits. It will cache both local and global node_modules folders.

## How it works

The action first prepares the environment by setting up Node.js and npm versions and retrieving the package version from the specified package.json file. It then caches the global npm modules if `cache_global_npm_modules` is set to true. After that, it caches the local node_modules folder if `cache_npm_modules` is set to true. If the cache doesn't hit, it installs the modules using the specified install command. If the cache hits, it runs the specified cache command.
