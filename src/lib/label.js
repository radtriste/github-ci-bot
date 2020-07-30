const globToRegExp = require('glob-to-regexp');
const { getChangedFiles } = require("./utils");

async function addLabels(context) {
    const labels = await context.config('bot-files/labels.yml');
    let labelsToAdd = await getRequiredLables(context, labels);
    context.github.issues.addLabels(context.issue({
        labels: labelsToAdd
    }));
}

async function getRequiredLables(context, labels) {
    let path_labels = new Set();
    let default_label = labels.default;
    let changed_files = await getChangedFiles(context);
    for (let index in labels.allLabels) {
        for (let path of labels.allLabels[index]['paths']) {
            let re = globToRegExp(path);
            for (let file of changed_files) {
                if (re.test(file)) {
                    labels.allLabels[index]['label'].forEach(label => {
                        path_labels.add(label);
                    });
                }
            }
        }
    }
    path_labels = Array.from(path_labels);
    let labelsToAdd = default_label.concat(path_labels);
    return labelsToAdd;
}

module.exports = {
    addLabels
};