const globToRegExp = require('glob-to-regexp')
const { getChangedFiles } = require('./utils')

async function isCIRequired (context) {
  const triggerPaths = await context.config('bot-files/paths.yml')
  const changedFiles = await getChangedFiles(context)

  return triggerPaths.files.map(file => globToRegExp(file)).find(fileExpr => changedFiles.find(changedFile => fileExpr.test(changedFile))) !== undefined
}

module.exports = {
  isCIRequired
}
