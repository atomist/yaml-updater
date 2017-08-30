# @atomist/yaml-updater

[![Build Status](https://travis-ci.org/atomist/yaml-updater.svg?branch=master)](https://travis-ci.org/atomist/yaml-updater)

[Node][node] [TypeScript][ts]
module [`@atomist/yaml-updater`][yaml-updater] for creating clean
changes to YAML files producing reasonable diffs from the original.
This module was originally developed for use
with [Atomist][www] [Rugs][docs].

[node]: https://nodejs.org/
[ts]: https://www.typescriptlang.org/
[yaml-updater]: https://www.npmjs.com/package/@atomist/yaml-updater
[www]: https://www.atomist.com/
[docs]: http://docs.atomist.com/

## Using

This module defines and exports several functions for formatting and
updating YAML.  The published module contains the TypeScript type
definitions.  To use from TypeScript, import the functions you want to
use.  For example:

```typescript
import { updateYamlDocument } from "@atomist/yaml-updater/Yaml";
```

Each function is documented using [TypeDoc][typedoc], which are
published at [https://atomist.github.io/yaml-updater/][gh-pages].
The [tests][] are pretty complete and a great source of examples for
what functions are available and how to use them.

In general, updating a property value adds property and value if it
does not exist.  If the property does exist in the original YAML, its
value will be updated.  If its current value is an object, the value
will be recursively updated, resulting in nested properties being
add/updated without affecting elements of the original YAML that do
not appear in the updates.  If the updated value is `null` or
`undefined`, the key and value will be removed from the YAML if it
exists.  If it does not exist, there will be no change.

Most functions take an optional last `options` parameter that is an
object.  Currently the only used parameter in the `options` object is
"keepArrayIndent".  If the value of that property is true, the
resulting YAML will have arrays indented compared to their parent
object.  If the value is false, the indentation of the array will be
at the same level as its parent object.  For example, if
`keepArrayIndent: true`, you will get

```yaml
parent:
  - first array item
  - second array item
```

while if `keepArrayIndent: false`, you will get

```yaml
parent:
- first array item
- second array item
```

Both are valid YAML and equivalent representation of the same data
structure.  Note that only arrays that are updated in some way will be
modified, so we recommend you base the value for this option on the
format of the original YAML document you are updating.

[typedoc]: http://typedoc.org/ (TypeDoc)
[gh-pages]: https://atomist.github.io/yaml-updater/ (@atomist/yaml-updater TypeDocs)
[tests]: src/YamlTest.ts (yaml-updater Tests)

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
`npm run autotest` | run tests continuously (you may also need to run `tsc -w`)
`npm run clean` | remove stray compiled JavaScript files and build directory

### Release

To create a new release of the project, simply push a tag of the form
`M.N.P` where `M`, `N`, and `P` are integers that form the next
appropriate [semantic version][semver] for release.  The version in
the package.json is replaced by the build and is totally ignored!  For
example:

[semver]: http://semver.org

```
$ git tag -a 1.2.3
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
