const globToRegExp = require('glob-to-regexp');
const { getChangedFiles } = require('./utils');

async function askToReview(context) {
  const reviewersInfo = await context.config('bot-files/reviewers.yml');
  context.github.pulls.createReviewRequest(
    context.issue({
      reviewers: await getPossibleReviewers(context, reviewersInfo)
    })
  );
}

async function getPossibleReviewers(context, reviewersInfo) {
  const changedFiles = await getChangedFiles(context);
  const pathReviewersSet = reviewersInfo.review
    .filter(reviewPath => reviewPath.paths.map(path => globToRegExp(path)).find(re => changedFiles.find(file => re.test(file))))
    .flatMap(pathReview => pathReview.reviewers)
    .filter(reviewer => reviewer !== context.payload.pull_request.user.login)
    .reduce((acc, reviewer) => acc.add(reviewer), new Set());

  return reviewersInfo.default.concat(Array.from(pathReviewersSet));
}

module.exports = {
  askToReview
};
