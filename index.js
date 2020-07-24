/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {


  app.on('pull_request.opened' , async context => {
    const yaml = require('js-yaml');
    const fs   = require('fs');
    const comments = await yaml.safeLoad(fs.readFileSync('comments.yml', 'utf8'));
    if (await isFirstPR(context)){
      context.github.issues.createComment(context.issue({body: comments.prFirstTimeContributor}))
    }

    const trigger_paths =  await yaml.safeLoad(fs.readFileSync('paths.yml', 'utf8'));
    const allReviewersList = await yaml.safeLoad(fs.readFileSync('reviewers.yml', 'utf8'));
    await askReview(context, allReviewersList.reviewers)
    await filterFilesandComment(context, trigger_paths)
    await addLabels(context)
  })
  // app.on('pull_request' , async context => {
  //   context.payload.pull_request.user.
  //   if (context.payload.pull_request.draft){
  //     context.github.issues.createComment(context.issue({body: "PR converted to draft I'll remove the needs review label now"}))
  //   } 
  // })

  app.on('pull_request.edited' , async context => {
    const yaml = require('js-yaml');
    const fs   = require('fs');
    const comments = await yaml.safeLoad(fs.readFileSync('comments.yml', 'utf8'));

    context.github.issues.createComment(context.issue({ body: comments.prEdit}))

    const trigger_paths =  await yaml.safeLoad(fs.readFileSync('paths.yml', 'utf8'));
    const allReviewersList = await yaml.safeLoad(fs.readFileSync('reviewers.yml', 'utf8'));
    await askReview(context, allReviewersList.reviewers)
    await filterFilesandComment(context, trigger_paths)
    await addLabels(context)
  })


  app.on('pull_request.closed' , async context => {
    const prComment = context.issue({ body: 'Pull Request is closed' })
    return context.github.issues.createComment(prComment)
  })


  app.on('pull_request.reopened' , async context => {
    
    const yaml = require('js-yaml');
    const fs   = require('fs');
    const comments = await yaml.safeLoad(fs.readFileSync('comments.yml', 'utf8'));
    context.github.issues.createComment(context.issue({ body: comments.prReopen}))
    const trigger_paths =  await yaml.safeLoad(fs.readFileSync('paths.yml', 'utf8'));
    const allReviewersList = await yaml.safeLoad(fs.readFileSync('reviewers.yml', 'utf8'));
    
    await askReview(context, allReviewersList.reviewers)
    if (await ifCIRequired(context, trigger_paths)){
      context.github.issues.createComment(context.issue({ body: comments.prCiTrigger}))
    }
    //await filterFilesandComment(context, trigger_paths)
    await addLabels(context)
  })

}


async function ifCIRequired(context, trigger_paths){
  let require = 0
  let changed_files = await getChangedFiles(context)
  trigger_paths.files.forEach(path =>{
      for (let changed of changed_files){
          if(changed.match("^".concat(path))){
            require = require + 1
            break;
          }
      }
  })
  if (require > 0){
    return true
  } else {
    return false
  }
}

async function getChangedFiles(context){
  let changed_files = new Set()
  const parser = require("git-diff-parser");
  const fetch = require("node-fetch");
  const response =  await fetch(context.payload.pull_request.diff_url);
  const diff  = parser(await response.text());
  for (let commit of diff.commits){
        for (let file of commit.files){
          changed_files.add(file.name.toString())
        }
      }

  return changed_files;
}

async function getPossibleReviewers(context, reviewersList){
  const pullRequestAuthor = context.payload.pull_request.user.login
  availableReviewers = reviewersList.filter(reviewer => reviewer != pullRequestAuthor)
  return availableReviewers
}

async function askReview(context, reviewersList){
  let availableReviewers = await getPossibleReviewers(context, reviewersList);
  context.github.pulls.createReviewRequest(
    context.issue ({
      reviewers: availableReviewers
    })
  )
}

async function addLabels(context){
  context.github.issues.addLabels(context.issue({
    labels: ['needs review']
  }))
}

async function isFirstPR(context){
  const respone = await context.github.issues.listForRepo(context.repo({
    state: 'all',
    creator: context.payload.pull_request.user.login
  }))
  const countPR = respone.data.filter(data => data.pull_request);
  if (countPR.length === 1){
    return true
  } else {
    return false
  }
}