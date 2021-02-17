require("dotenv").config();

const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  userAgent: "Dumbignore Generator"
});

const fetch = require("node-fetch");
const fs = require("fs");

const fetchAllRepos = async (amount, since) => {
  let result = [];
  
  while(result.length < amount) {
    const { data: chunk } = await octokit.repos.listPublic({ since: result.length > 0 ? result[result.length - 1].id : since });
    
    result = result.concat(chunk);
  }
  
  return result.slice(0, amount);
};

const fetchGitignore = async repoName => {
  const res = await fetch(`https://raw.githubusercontent.com/${repoName}/master/.gitignore`);
  if(!res.ok) return;
  
  return await res.text();
}

const includes = (gi, rule) => gi.some(it => rule.startsWith(it));
const merge = (a, b) => a.concat(b.filter(it => !includes(a, it)));
const cleanup = gi => gi.filter(it => it.length > 0 && it[0] !== "#");

const main = async () => {
  console.log("=> Fetching repos");
  const useRepos = parseInt(process.env.USE_REPOS);
  const repos = await fetchAllRepos(useRepos, process.env.USE_REPOS_SINCE_ID);
  
  console.log("=> Downloading .gitignores");
  const optionalGitignores = await Promise.all(repos.map(it => fetchGitignore(it.full_name)));
  const gitignores = optionalGitignores.filter(it => !!it).map(it => it.split("\n"));
  
  console.log("=> Merging");
  const allinone = gitignores.map(cleanup).reduce(merge);
  
  fs.writeFileSync("output.txt", allinone.join("\n"));
  console.log(`There you go! Your new useless .gitignore is in output.txt (${allinone.length} lines)`);
};

main();
