/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  // Your code here
  app.log('Yay, the app was loaded!')
  app.on('pull_request.opened' , async context => {
    //const prComment = context.issue({ body: 'Thanks for opening the pull request!' })
    const changed_files = context.payload.pull_request.changed_files
    if (1 == changed_files){
      const prComment = context.issue({ body: 'Change detected in the Jenkinsfile' })
    } else {
      const prComment = context.issue({ body: 'Thanks for making the PR' })
    }
    return context.github.issues.createComment(prComment)
  })
  app.on('pull_request.edited' , async context => {
    const prComment = context.issue({ body: 'Pull Request is edited, meed to run the integration tests again' })
    return context.github.issues.createComment(prComment)
  })
  app.on('pull_request.closed' , async context => {
    const prComment = context.issue({ body: 'Pull Request is closed' })
    return context.github.issues.createComment(prComment)
  })
  app.on('pull_request.reopened' , async context => {
    var prComment
    var diff_url = context.payload.pull_request.diff_url
    //if ('Jenkinsfile' in changed_files){
      //prComment = context.issue({ body: 'Change detected in the Jenkinsfile' })
    //} else {
     // prComment =  context.issue({ body: 'Normal Change' })
   // }
    // var parseDiff = require("parse-diff")
    // var fetchUrl = require("fetch").fetchUrl;
    
    // fetchUrl(diff_url, function(error, meta, body){
    // //console.log("response", body.toString());
    // var files = parseDiff(body.toString());
    // console.log(files)
    // files.forEach(function(file) {
    //   console.log(file.from); // number of hunks
    //   //console.log(file.chunks[0].changes.length) // hunk added/deleted/context lines
    // // each item in changes is a string
    //   //console.log(file.deletions); // number of deletions in the patch
    //   //console.log(file.additions); // number of additions in the patch
    //   });
    //   prComment = context.issue({ body: files })
      
    //   //return context.github.issues.createComment(prComment)
    // });
    prComment = context.issue({ body: 'Pull Request is reopened' })
    
    
    // context.github.pulls.createReviewRequest(
    //   context.issue ({
    //     reviewers: ['Kevin-Mok']
    //   })
    // )
    
    context.github.issues.addLabels(context.issue({
            labels: ['needs review']
          }))
    return context.github.issues.createComment(prComment)
  })
}
