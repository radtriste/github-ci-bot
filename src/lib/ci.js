const globToRegExp = require('glob-to-regexp');
const { getChangedFiles } = require("./utils");

async function isCIRequired(context) {
    const trigger_paths = await context.config('bot-files/paths.yml');
    let require = 0;
    let changed_files = await getChangedFiles(context);
    for (let path of trigger_paths.files) {
        let re = globToRegExp(path);
        for (let file of changed_files) {
            if (re.test(file)) {
                require = require + 1;
                break;
            }
            if (require > 0) {
                return true;
            }
        }
    }
}

module.exports = {
    isCIRequired
};