# @atomist/yaml-updater

[![Build Status](https://travis-ci.org/atomist/yaml-updater.svg?branch=master)](https://travis-ci.org/atomist/yaml-updater)
[![Slack Status](https://join.atomist.com/badge.svg)](https://join.atomist.com/)

[Node][node] [TypeScript][ts]
module [`@atomist/yaml-updater`][yaml-updater] for creating clean
changes to YAML files producing reasonable diffs from the original.
This module was developed for you with [Rug][docs]

[node]: https://nodejs.org/
[ts]: https://www.typescriptlang.org/
[yaml-updater]: https://www.npmjs.com/package/@atomist/yaml-updater
[docs]: http://docs.atomist.com/

## Using

## Support

General support questions should be discussed in the `#support`
channel on our community Slack team
at [atomist-community.slack.com][slack].

If you find a problem, please create an [issue][].

[issue]: https://github.com/atomist/yaml-updater/issues

## Development

You will need to install [node][] to build and test this project.

### Build and Test

Command | Reason
------- | ------
`npm install` | to install all the required packages
`npm run lint` | to run tslint against the TypeScript
`npm run compile` | to compile all TypeScript into JavaScript
`npm test` | to run tests and ensure everything is working
`npm run autotest` | run tests continuously (you also need to run `tsc -w`)

### Release

To create a new release of the project, simply push a tag of the form
`M.N.P` where `M`, `N`, and `P` are integers that form the next
appropriate [semantic version][semver] for release.  The version in
the package.json is replaced by the build and is totally ignored!  For
example:

[semver]: http://semver.org

```
$ git tag -a 1.2.
$ git push --tags
```

The Travis CI build (see badge at the top of this page) will publish
the NPM module and automatically create a GitHub release using the tag
name for the release and the comment provided on the annotated tag as
the contents of the release notes.

---
Created by [Atomist][atomist].
Need Help?  [Join our Slack team][slack].

[atomist]: https://www.atomist.com/
[slack]: https://join.atomist.com
