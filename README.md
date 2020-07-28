# my-ci-bot

> A GitHub App built with [Probot](https://github.com/probot/probot) that A Probot app

my-ci-bot is a simple bot which was created to automate few tasks done manually till now.

* Ask for reviewers based on the changed files
* Add labels to PR depending on the changed files
* Comment on the PR on different events.
* Trigger your jenkins pipeline if change in specified files.

You need to create 4 files for this bot to work properly.

* labels.yml
* comments.yml
* reviewers.yml
* paths.yml

For example on how to define these files please see each file is present in this project's root with more description.
You'll need to have these files inside `.github/bot-files/` directory in your project

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Contributing

If you have suggestions for how my-ci-bot could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2020 Tarun Khandelwal <tarkhand@redhat.com>
