const parser = require('git-diff-parser')
const fetch = require('node-fetch')

async function getChangedFiles (context) {
  const changedFiles = new Set()

  const response = await fetch(context.payload.pull_request.diff_url)
  const diff = parser(await response.text())
  for (const commit of diff.commits) {
    for (const file of commit.files) {
      changedFiles.add(file.name.toString())
    }
  }

  return changedFiles
}

module.exports = {
  getChangedFiles
}
