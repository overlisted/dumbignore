require("dotenv").config();

const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  userAgent: "Dumbignore Generator"
});

const fetch = require("node-fetch");
const fs = require("fs");
const base64 = require("base-64");
const utf8 = require("utf8");

const dumbignoreId = 339607210;

const fetchAllRepos = async (amount, since) => {
  let result = [];
  
  while(result.length < amount) {
    const { data: chunk } = await octokit.repos.listPublic({ since: result.length > 0 ? result[result.length - 1].id : since });
    
    result = result.concat(chunk);
  }
  
  return result.slice(0, amount);
};

const fetchGitignore = async full_name => {
  try {
    const request = await octokit.request(`GET /repos/${full_name}/contents/.gitignore`);
    
    const file = request.data;
    if(file.encoding !== "base64") return;

    return utf8.decode(base64.decode(file.content.replaceAll("\n", "")));
  } catch(e) {
    if(e.status === 451) console.info(`${full_name} is banned by DCMA`);
    if(e.status !== 404) console.error(e);
  }
}

// array: T[], callback: (item: T, index: integer, array: T[], filtered: T[], toFilter: T[]) => R
const extendedFilter = (array, callback) => {
  const result = [];
  for(let i = 0; i < array.length; i++) {
    if(callback(array[i], i, array, result, array.slice(i + 1))) result.push(array[i]);
  }
  
  return result;
}

const arrayStartsWith = (a, b) => {
  for(let i = 0; i < b.length; i++) {
    if(b[i] != a[i]) return false;
  }
  
  return true;
}

const includes = (gi, rule) => gi.some(it => arrayStartsWith(rule.split("/"), it.split("/")));
const removeFirstSlash = rule => rule.startsWith("/") ? rule.slice(1) : rule.startsWith("!/") ? "!" + rule : rule;
const removeLastSlash = rule => rule.endsWith("/") ? rule.slice(0, -1) : rule;
const removeExtraSlashes = rule => removeLastSlash(removeFirstSlash(rule));
const cleanup = gi => extendedFilter(gi.map(removeExtraSlashes), (it, i, _, filtered, toFilter) => it.length > 0 && it[0] !== "#" && !includes(toFilter, it) && !includes(filtered, it));

const randomMax = max => Math.floor(Math.random() * max);
const randomMaxPadding = (max, padding) => {
  const random = randomMax(max);
  return random + padding > max ? max - padding : random;
};

const asyncMap = async (array, callback, batchSize) => {
  let result = [];
  let batch;
  
  for(let a = 0; a < array.length; a += batchSize ?? 1) {
    batch = [];
    for(let b = 0; b < batchSize ?? 1; b++) {
      const i = a + b;
      if(i < array.length) batch.push(callback(array[i], i, array));
    }
    result = result.concat(await Promise.all(batch));
  }
  
  return result;
}

const main = async () => {
  console.log("=> Fetching repos");
  const useRepos = parseInt(process.env.USE_REPOS);
  const repos = await fetchAllRepos(useRepos, randomMaxPadding(dumbignoreId, useRepos));
  
  console.log("=> Downloading .gitignores");
  const optionalGitignores = await asyncMap(
    repos, 
    it => fetchGitignore(it.full_name), 
    parseInt(process.env.PARALLEL_DOWNLOADS)
  );
  
  const gitignores = optionalGitignores.filter(it => !!it).map(it => it.split("\n"));
  
  console.log("=> Cleaning up");
  const allinone = cleanup(gitignores.reduce((a, b) => a.concat(b)));
  
  fs.writeFileSync("output.txt", allinone.join("\n"));
  console.log(`There you go! Your new useless .gitignore is in output.txt (${allinone.length} lines)`);
};

main();
