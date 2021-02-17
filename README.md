# Dumbignore
Generate an ultimate all-in-one `.gitignore` based on `.gitignore`s of random GitHub repositories.

## Usage
1. Specify these 3 environment variables in your .env:
  - `GITHUB_TOKEN=my-token` A [personal GitHub token](https://github.com/settings/tokens) to use the GitHub API.
  - `USE_REPOS=250` The amount of repositories you want to use .gitignore from
2. [Install yarn](https://yarnpkg.com/getting-started/install)
3. Install packages using `$ yarn`
4. Run the script using `$ yarn start`
5. Enjoy your new **dumbignore** in output.txt
