## Version Control

Backk starter project comes with predefined Git hooks:
-pre-commit
-commit-msg
-post-commit

These hooks are defined in `.husky` directory. You can modify them for your need.

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
