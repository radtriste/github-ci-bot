async function isFirstPR (context) {
  const respone = await context.github.issues.listForRepo(context.repo({
    state: 'all',
    creator: context.payload.pull_request.user.login
  }))
  const countPR = respone.data.filter(data => data.pull_request)
  if (countPR.length === 1) {
    return true
  } else {
    return false
  }
}

module.exports = {
  isFirstPR
}
