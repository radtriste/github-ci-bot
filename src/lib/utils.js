const parser = require('git-diff-parser');
const fetch = require('node-fetch');

async function getChangedFiles(context) {
  const url = context.payload.pull_request.diff_url;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`[ERROR] fetching ${url}. Status ${response.status}. Description ${response.statusText}`);
  }
  const diff = parser(await response.text());
  return Array.from(diff.commits.reduce((newSet, commit) => commit.files.reduce((newSetFiles, file) => newSetFiles.add(file.name.toString()), newSet), new Set()));
}

module.exports = {
  getChangedFiles
};
