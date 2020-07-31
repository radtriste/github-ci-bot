const { askToReview } = require('../src/lib/review');
const { addLabels } = require('../src/lib/label');
const { isCIRequired } = require('../src/lib/ci');
const { isFirstPR } = require('../src/lib/pr');

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  app.on('pull_request.opened', async context => {
    const comments = await context.config('bot-files/comments.yml');
    if (await isFirstPR(context)) {
      context.github.issues.createComment(context.issue({ body: comments.prFirstTimeContributor }));
    }
    if (context.payload.pull_request.draft) {
      context.github.issues.createComment(context.issue({ body: 'looks like you opened a draft PR' }));
    }
    await askToReview(context);
    await addLabels(context);
    if (await isCIRequired(context)) {
      context.github.issues.createComment(context.issue({ body: comments.prCiTrigger }));
    }
  });

  // app.on('pull_request', async context =>{
  //   context.github.issues.createComment(context.issue({ body: context.github.pulls.listFiles.toString() }))
  // })

  app.on(['pull_request.edited', 'pull_request.synchronize'], async context => {
    const comments = await context.config('bot-files/comments.yml');
    context.github.issues.createComment(context.issue({ body: comments.prEdit }));
    await askToReview(context);
    await addLabels(context);
    if (await isCIRequired(context)) {
      context.github.issues.createComment(context.issue({ body: comments.prCiTrigger }));
    }
  });

  app.on('pull_request.reopened', async context => {
    const comments = await context.config('bot-files/comments.yml');
    context.github.issues.createComment(context.issue({ body: comments.prReopen }));
    if (await isCIRequired(context)) {
      context.github.issues.createComment(context.issue({ body: comments.prCiTrigger }));
    }
    await askToReview(context);
    await addLabels(context);
  });
};
