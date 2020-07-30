const globToRegExp = require('glob-to-regexp')
const { getChangedFiles } = require('./utils')

async function askToReview (context) {
  const allReviewers = await context.config('bot-files/reviewers.yml')
  const availableReviewers = await getPossibleReviewers(context, allReviewers)
  context.github.pulls.createReviewRequest(
    context.issue({
      reviewers: availableReviewers
    })
  )
}

async function getPossibleReviewers (context, allReviewers) {
  let pathReviewers = new Set()
  const defaultReviewers = allReviewers.default
  const changedFiles = await getChangedFiles(context)
  for (const index in allReviewers.review) {
    for (const path of allReviewers.review[index].paths) {
      const re = globToRegExp(path)
      for (const file of changedFiles) {
        if (re.test(file)) {
          allReviewers.review[index].reviewers.forEach(reviewer => {
            pathReviewers.add(reviewer)
          })
        }
      }
    }
  }
  pathReviewers = Array.from(pathReviewers)
  const reviewersList = defaultReviewers.concat(pathReviewers)
  const pullRequestAuthor = context.payload.pull_request.user.login
  return reviewersList.filter(reviewer => reviewer !== pullRequestAuthor)
}

module.exports = {
  askToReview
}
