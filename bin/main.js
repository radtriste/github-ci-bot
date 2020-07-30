/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {

  const globToRegExp = require('glob-to-regexp');

  app.on('pull_request.opened', async context => {
    const comments = await context.config('bot-files/comments.yml')
    if (await firstPR(context)) {
      context.github.issues.createComment(context.issue({ body: comments.prFirstTimeContributor }))
    }
    if (context.payload.pull_request.draft) {
      context.github.issues.createComment(context.issue({ body: "looks like you opened a draft PR" }))
    }
    await askReview(context)
    await addLabels(context)
    if (await CIRequired(context)) {
      context.github.issues.createComment(context.issue({ body: comments.prCiTrigger }))
    }
  })

  // app.on('pull_request', async context =>{
  //   context.github.issues.createComment(context.issue({ body: context.github.pulls.listFiles.toString() }))
  // })

  app.on(['pull_request.edited', 'pull_request.synchronize'], async context => {
    const comments = await context.config('bot-files/comments.yml')
    context.github.issues.createComment(context.issue({ body: comments.prEdit }))
    await askReview(context)
    await addLabels(context)
    if (await CIRequired(context)) {
      context.github.issues.createComment(context.issue({ body: comments.prCiTrigger }))
    }
  })


  app.on('pull_request.closed', async context => {
    // const prComment = context.issue({ body: 'Pull Request is closed' })
    // return context.github.issues.createComment(prComment)
  })


  app.on('pull_request.reopened', async context => {
    const comments = await context.config('bot-files/comments.yml')
    context.github.issues.createComment(context.issue({ body: comments.prReopen }))
    if (await CIRequired(context)) {
      context.github.issues.createComment(context.issue({ body: comments.prCiTrigger }))
    }
    await askReview(context)
    await addLabels(context)
  })

  async function CIRequired(context) {
    const trigger_paths = await context.config('bot-files/paths.yml')
    let require = 0
    let changed_files = await getChangedFiles(context)
    for (let path of trigger_paths.files) {
      let re = globToRegExp(path)
      for (let file of changed_files) {
        if (re.test(file)) {
          require = require + 1
          break;
        }
        if (require > 0) {
          return true
        }
      }
    }
  }

  async function getChangedFiles(context) {
    let changed_files = new Set()
    const parser = require("git-diff-parser");
    const fetch = require("node-fetch");
    const response = await fetch(context.payload.pull_request.diff_url);
    const diff = parser(await response.text());
    for (let commit of diff.commits) {
      for (let file of commit.files) {
        changed_files.add(file.name.toString())
      }
    }

    return changed_files;
  }

  async function getPossibleReviewers(context, allReviewers) {
    let path_reviewers = new Set()
    let default_reviewers = allReviewers.default
    let changed_files = await getChangedFiles(context)
    for (let index in allReviewers.review) {
      for (let path of allReviewers.review[index]['paths']) {
        let re = globToRegExp(path)
        for (let file of changed_files) {
          if (re.test(file)) {
            allReviewers.review[index]['reviewers'].forEach(reviewer => {
              path_reviewers.add(reviewer)
            })
          }
        }
      }
    }
    path_reviewers = Array.from(path_reviewers)
    let reviewersList = default_reviewers.concat(path_reviewers)
    const pullRequestAuthor = context.payload.pull_request.user.login
    availableReviewers = reviewersList.filter(reviewer => reviewer != pullRequestAuthor)
    return availableReviewers
  }

  async function askReview(context) {
    const allReviewers = await context.config('bot-files/reviewers.yml')
    let availableReviewers = await getPossibleReviewers(context, allReviewers);
    context.github.pulls.createReviewRequest(
      context.issue({
        reviewers: availableReviewers
      })
    )
  }

  async function addLabels(context) {
    const labels = await context.config('bot-files/labels.yml')
    let labelsToAdd = await getRequiredLables(context, labels)
    context.github.issues.addLabels(context.issue({
      labels: labelsToAdd
    }))
  }

  async function getRequiredLables(context, labels) {
    let path_labels = new Set()
    let default_label = labels.default
    let changed_files = await getChangedFiles(context)
    for (let index in labels.allLabels) {
      for (let path of labels.allLabels[index]['paths']) {
        let re = globToRegExp(path)
        for (let file of changed_files) {
          if (re.test(file)) {
            labels.allLabels[index]['label'].forEach(label => {
              path_labels.add(label)
            })
          }
        }
      }
    }
    path_labels = Array.from(path_labels)
    let labelsToAdd = default_label.concat(path_labels)
    return labelsToAdd
  }

  async function firstPR(context) {
    const respone = await context.github.issues.listForRepo(context.repo({
      state: 'all',
      creator: context.payload.pull_request.user.login
    }))
    const countPR = respone.data.filter(data => data.pull_request);
    if (countPR.length === 1) {
      return true
    } else {
      return false
    }
  }
}