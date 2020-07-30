const globToRegExp = require('glob-to-regexp')
const { getChangedFiles } = require('./utils')

async function askToReview(context) {
  context.github.pulls.createReviewRequest(
    context.issue({
      reviewers: await getPossibleReviewers(context, await context.config('bot-files/reviewers.yml'))
    })
  )
}

async function getPossibleReviewers(context, allReviewers) {
  const pathReviewers = new Set()
  const changedFiles = await getChangedFiles(context)
  for (const index in allReviewers.review) {
    for (const path of allReviewers.review[index].paths) {
      const re = globToRegExp(path)
      if (changedFiles.find(file => re.test(file))) {
        allReviewers.review[index].reviewers.forEach(reviewer => {
          pathReviewers.add(reviewer)
        })
      }
    }
  }
  return allReviewers.default.concat(Array.from(pathReviewers))
    .filter(reviewer => reviewer !== context.payload.pull_request.user.login)
}

module.exports = {
  askToReview
}
