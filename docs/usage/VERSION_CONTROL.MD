## Version Control

Backk starter project comes with predefined Git hooks:
-pre-commit
-commit-msg
-post-commit

These hooks are defined in `.husky` directory. You can modify them for your need.

**IMPORTANT!**:
Commit message hooks requires that the commit message begins with one of following PATCH, MINOR or MAJOR followed by a colon:
- PATCH: <your commit message>
- MINOR: <your commit message>
- MAJOR: <your commit message>

Commit hook will pump the NPM version in package.json according to SEMVER change as specified in the commit message.
Commit hook will also create Git tag for the version.


Pre-commit hook will execute `lint-staged`.
Lint-staged actions are defined in `package.json` and you can modify them for your need:

package.json
```json
"lint-staged": {
    "*.ts": [
      "npm run format",
      "npm run lint",
      "npm test",
      "npm run generateApiSpecs",
      "git add generated/openapi",
      "npm run generateClientsIfNeeded",
      "git add generated/clients"
    ]
  }
```
