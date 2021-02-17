# Dumbignore
Generate an ultimate all-in-one `.gitignore` based on `.gitignore`s of random GitHub repositories.

## Usage
1. Specify these 3 environment variables in your .env:
  - `GITHUB_TOKEN=my-token` A [personal GitHub token](https://github.com/settings/tokens) to use the GitHub API.
  - `USE_REPOS=250` The amount of repositories you want to use .gitignore from
  - `USE_REPOS_SINCE_ID=1` The minimal repository ID (leave 1 if you don't care)
2. Install packages using `$ yarn`
3. Run the script using `$ yarn start`
4. Enjoy your new **dumbignore** in output.txt
