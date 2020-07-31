const globToRegExp = require("glob-to-regexp");
const { getChangedFiles } = require("./utils");

/**
 * checks if we need to run the Jenkins job(based to trigger only on comment) and comment the required phrase, which is defined in comments.yml
 * @param {string} context - The context from which the PR is coming from
 * @returns {boolean} true/false depending on the method logic
 */
<<<<<<< HEAD

async function isCIRequired(context) {
  const triggerPaths = await context.config("bot-files/paths.yml");
=======
async function isCIRequired (context) {
  const triggerPaths = await context.config('bot-files/paths.yml');
>>>>>>> review comments
  const changedFiles = await getChangedFiles(context);

  return (
    triggerPaths.files
      .map(file => globToRegExp(file))
      .find(fileExpr =>
        changedFiles.find(changedFile => fileExpr.test(changedFile))
      ) !== undefined
  );
}

module.exports = {
  isCIRequired
};
