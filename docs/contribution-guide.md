If you wish to contribute, this is your starting point.

This document contains guidelines to help you make your contribution clear and consistent.
These guidelines also help us to review your PR faster and, as a result, will give you
appropriate credit in your GitHub profile.

If you have time to contribute to this project, we are happy to give you credit for it.

We thank you in advance for your contribution!

### Features

You can request a new feature by submitting an issue. If you would like to implement a new feature,
feel free to issue a Pull Request.

### Pull requests

Pull Requests (PRs) are awesome. Get familiar with the following guidelines before you begin:

1. Search the project for a Pull Request related to your submission. You don't want to duplicate effort.
1. A PR that contains code changes should be created from a git branch based on **develop**:

    ```bash
    git checkout -b my-fix-branch develop
    ```

1. Follow our [coding style rules][coding-rules].
1. Run full test suite and ensure all tests pass.
    1. If some tests fail, ensure that you follow [coding style rules][coding-rules].
1. One PR - one issue. Refrain from fixing multiple issues in the same pull request. Several small PRs are preferable instead of a big one.
1. If the PR introduces a new feature or fixes an issue, **please add the appropriate test case(s)**.
1. Follow [conventional commit guidelines][conventional-commits] for your commit message(s) when saving changes in your branch and PR.
1. Add your name to the [Credits](credits.md) file. We like to give credit where it's due.

1. If we suggest changes:
    1. Make the required updates.
    1. Re-run test suite to ensure tests are still green.
    1. Rebase your branch and force push to your GitHub repository (this will update your Pull Request):

        ```bash
        git rebase develop -i
        git push origin my-fix-branch -f
        ```

1. After your pull request is merged, you can safely delete your branch.


[coding-rules]: https://github.com/showdownjs/code-style/blob/master/README.md
[conventional-commits]: https://www.conventionalcommits.org/