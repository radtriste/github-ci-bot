const globToRegExp = require("glob-to-regexp");
const { getChangedFiles } = require("./utils");

/**
 * driver function to ask for reviews on the PR, gets all the required reviewers(defined in reviewers.yml) relevant to PR by getPossibleReviewers 
 * @param {string} context The context from which the PR is coming from
 */
async function askToReview(context) {
  const reviewersInfo = await context.config("bot-files/reviewers.yml");
  context.github.pulls.createReviewRequest(
    context.issue({
      reviewers: await getPossibleReviewers(context, reviewersInfo)
    })
  );
}
/**
 * Calculates all the required reviewers needed for the PR and return them as an Array
 * @param {string} context The context from which the PR is coming from
 * @param {Object} reviewersInfo The parsed yaml defined in reviewers.yml
 * @returns {Array} All the required reviewers
 */
async function getPossibleReviewers(context, reviewersInfo) {
  const changedFiles = await getChangedFiles(context);
  const pathReviewersSet = reviewersInfo.review
    .filter(reviewPath =>
      reviewPath.paths
        .map(path => globToRegExp(path))
        .find(re => changedFiles.find(file => re.test(file)))
    )
    .flatMap(pathReview => pathReview.reviewers)
    .reduce((acc, reviewer) => acc.add(reviewer), new Set());

  return reviewersInfo.default
    .concat(Array.from(pathReviewersSet))
    .filter(reviewer => reviewer !== context.payload.pull_request.user.login);
}

module.exports = {
  askToReview
};
