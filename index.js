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
    
    await filterFilesandComment(context)
    // context.github.issues.addLabels(context.issue({
    //         labels: ['needs review']
    //       }))
  })



  async function filterFilesandComment(context){
    const paths = await context.config("config.yml")
    var changed_files = new Set()
    const parser = require("git-diff-parser");
    var fetchUrl = require("fetch").fetchUrl;
  
    fetchUrl(context.payload.pull_request.diff_url, function(error, meta, body){
    const diff  = parser(body.toString());
    diff.commits.forEach(function(commit){
      commit.files.forEach(function(file){
        changed_files.add(file.name)
      })
    })

   // for (let i in triggerFileConfig.files){
     // console.log(i)
      // if (changed_files.has(i)){
      //   return context.github.issues.createComment(context.issue({ body: "I'll trigger Jenkins now"}))
      // }
   // }
    // triggerFileConfig.files.forEach(function(file){
    //   if(changed_files.has(file)){
    //     prComment = conext.issue({ body: "Change detected in files location, needs to trigger the Jenkins job for the PR"});
    //     break;
    //   } else {
    //     prComment = context.issue({ body: "Well thank you for your PR, Congrats no need to run that Jenkins job"})
    //   }
    // })
    // if(changed_files.has('Jenkinsfile')){
    //   prComment = context.issue({ body: "Change is detected in the Jenkinsfile" })
    // } else {
    //   prComment = context.issue({ body: "Well congrats you didn't change anything in Jenkinsfile" })
    // }
    return context.github.issues.createComment(context.issue({ body: paths.toString()}))
    });
  }
}
