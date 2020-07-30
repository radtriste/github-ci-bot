const globToRegExp = require('glob-to-regexp');
const { getChangedFiles } = require("./utils");

async function askToReview(context) {
    const allReviewers = await context.config('bot-files/reviewers.yml');
    let availableReviewers = await getPossibleReviewers(context, allReviewers);
    context.github.pulls.createReviewRequest(
        context.issue({
            reviewers: availableReviewers
        })
    );
}

async function getPossibleReviewers(context, allReviewers) {
    let path_reviewers = new Set();
    let default_reviewers = allReviewers.default;
    let changed_files = await getChangedFiles(context);
    for (let index in allReviewers.review) {
        for (let path of allReviewers.review[index]['paths']) {
            let re = globToRegExp(path);
            for (let file of changed_files) {
                if (re.test(file)) {
                    allReviewers.review[index]['reviewers'].forEach(reviewer => {
                        path_reviewers.add(reviewer);
                    });
                }
            }
        }
    }
    path_reviewers = Array.from(path_reviewers);
    let reviewersList = default_reviewers.concat(path_reviewers);
    const pullRequestAuthor = context.payload.pull_request.user.login;
    return reviewersList.filter(reviewer => reviewer != pullRequestAuthor);
}

module.exports = {
    askToReview
};