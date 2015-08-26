Contributing
============

If you wish to contribute please read the following quick guide.

# Want a Feature?
You can request a new feature by submitting an issue. If you would like to implement a new feature feel free to issue a
Pull Request.


# Pull requests (PRs)
PRs are awesome. However, before you submit your pull request consider the following guidelines:

 - Search GitHub for an open or closed Pull Request that relates to your submission. You don't want to duplicate effort.
 - When issuing PRs that change code, make your changes in a new git branch based on master:

   ```bash
   git checkout -b my-fix-branch master
   ```

 - Documentation (i.e: README.md) changes can be made directly against master.
 - Run the full test suite before submitting and make sure all tests pass (obviously =P).
 - Try to follow our [**coding style rules**](https://github.com/showdownjs/code-style/blob/master/README.md).
   Breaking them prevents the PR to pass the tests.
 - Refrain from fixing multiple issues in the same pull request. It's preferable to open multiple small PRs instead of one
   hard to review big one. Also, don't reuse old forks (or PRs) to fix new issues.
 - If the PR introduces a new feature or fixes an issue, please add the appropriate test case.
 - We use commit notes to generate the changelog. It's extremely helpful if your commit messages adhere to the
 [**AngularJS Git Commit Guidelines**](https://github.com/showdownjs/code-style/blob/master/README.md#commit-message-convention).
 - If we suggest changes then:
   - Make the required updates.
   - Re-run the Angular test suite to ensure tests are still passing.
   - Rebase your branch and force push to your GitHub repository (this will update your Pull Request):

   ```bash
   git rebase master -i
   git push origin my-fix-branch -f
   ```
 - After your pull request is merged, you can safely delete your branch.

If you have time to contribute to this project, we feel obliged that you get credit for it.
These rules enable us to review your PR faster and will give you appropriate credit in your GitHub profile.
We thank you in advance for your contribution!


# Joining the team
We're looking for members to help maintaining Showdown.
Please see [this issue](https://github.com/showdownjs/showdown/issues/114) to express interest or comment on this note.
