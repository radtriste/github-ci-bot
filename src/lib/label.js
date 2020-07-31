const globToRegExp = require("glob-to-regexp");
const { getChangedFiles } = require("./utils");

async function addLabels(context) {
  const labelsInfo = await context.config("bot-files/labels.yml");
  context.github.issues.addLabels(
    context.issue({
      labels: await getRequiredLables(context, labelsInfo)
    })
  );
}

async function getRequiredLables(context, labelsInfo) {
  const changedFiles = await getChangedFiles(context);
  const pathLabelsSet = labelsInfo.labels
    .filter(labelPath =>
      labelPath.paths
        .map(path => globToRegExp(path))
        .find(re => changedFiles.find(file => re.test(file)))
    )
    .flatMap(pathLabel => pathLabel.labels)
    .reduce((acc, label) => acc.add(label), new Set());
  return labelsInfo.default.concat(Array.from(pathLabelsSet));
}

module.exports = {
  addLabels
};
