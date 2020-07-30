async function isFirstPR (context) {
  return await context.github.issues.listForRepo(context.repo({
    state: 'all',
    creator: context.payload.pull_request.user.login
  })).data.find(data => data.pull_request) !== undefined
}

module.exports = {
  isFirstPR
}
