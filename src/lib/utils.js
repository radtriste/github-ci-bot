const parser = require("git-diff-parser");
const fetch = require("node-fetch");

async function getChangedFiles(context) {
    let changed_files = new Set();

    const response = await fetch(context.payload.pull_request.diff_url);
    const diff = parser(await response.text());
    for (let commit of diff.commits) {
        for (let file of commit.files) {
            changed_files.add(file.name.toString());
        }
    }

    return changed_files;
}

module.exports = {
    getChangedFiles
};