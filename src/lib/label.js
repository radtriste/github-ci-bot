const globToRegExp = require('glob-to-regexp')
const { getChangedFiles } = require('./utils')

async function addLabels (context) {
  const labels = await context.config('bot-files/labels.yml')
  const labelsToAdd = await getRequiredLables(context, labels)
  context.github.issues.addLabels(context.issue({
    labels: labelsToAdd
  }))
}

async function getRequiredLables (context, labels) {
  let pathLabels = new Set()
  const defaultLabel = labels.default
  const changedFiles = await getChangedFiles(context)
  for (const index in labels.allLabels) {
    for (const path of labels.allLabels[index].paths) {
      const re = globToRegExp(path)
      for (const file of changedFiles) {
        if (re.test(file)) {
          labels.allLabels[index].label.forEach(label => {
            pathLabels.add(label)
          })
        }
      }
    }
  }
  pathLabels = Array.from(pathLabels)
  const labelsToAdd = defaultLabel.concat(pathLabels)
  return labelsToAdd
}

module.exports = {
  addLabels
}
