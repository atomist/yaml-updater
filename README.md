# @atomist/yaml-updater

[![atomist sdm goals](http://badge.atomist.com/T29E48P34/atomist/yaml-updater/00cff505-6345-430a-b615-382c43c7eb1a)](https://app.atomist.com/workspace/T29E48P34)
[![npm version](https://img.shields.io/npm/v/@atomist/yaml-updater.svg)](https://www.npmjs.com/package/@atomist/yaml-updater)

[Node][node] [TypeScript][ts] module
[`@atomist/yaml-updater`][yaml-updater] for creating clean changes to
YAML files producing reasonable diffs from the original.  This module
was originally developed for use with [Atomist][atomist] [code
transforms][docs].

[node]: https://nodejs.org/
[ts]: https://www.typescriptlang.org/
[yaml-updater]: https://www.npmjs.com/package/@atomist/yaml-updater
[docs]: https://docs.atomist.com/

## Using

Add this package to your package's dependencies.

```
$ npm install @atomist/yaml-updater
```

This module defines and exports several functions for formatting and
updating YAML.  The published module contains the TypeScript type
definitions.  To use from TypeScript, import the functions you want to
use.  For example:

```typescript
import { updateYamlDocument } from "@atomist/yaml-updater";
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
object.  Currently the only `options` object parameter used all the
update functions is "keepArrayIndent".  If the value of that property
is true, the resulting YAML will have arrays indented compared to
their parent object.  If the value is false, the indentation of the
array will be at the same level as its parent object.  For example, if
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

The `updateYamlDocuments` function also uses the "updateAll" `options`
property.  If `true`, the `updates` provided to `updateYamlDocuments`
will be applied to all YAML documents.  If `false`, the `updates` will
only be applied to YAML documents with keys that match those in the
`updates` object.  For example, given the following YAML:

```yaml
---
first: element
second: element
---
first: thing
second: thing
third: thing
```

calling

```typescript
const updated = updateYamlDocuments({ third: "item" }, docs, { updateAll: false });
```

with `docs` being the above YAML documents, would result in:

```yaml
---
first: element
second: element
---
first: thing
second: thing
third: item
```

while calling

```typescript
const updated = updateYamlDocuments({ third: "item" }, docs, { updateAll: true });
```

would result in:

```yaml
---
first: element
second: element
third: item
---
first: thing
second: thing
third: item
```

[typedoc]: http://typedoc.org/ (TypeDoc)
[gh-pages]: https://atomist.github.io/yaml-updater/ (@atomist/yaml-updater TypeDocs)
[tests]: src/yaml.test.ts (yaml-updater Tests)

## Support

General support questions should be discussed in the `#support`
channel in the [Atomist community Slack workspace][slack].

If you find a problem, please create an [issue][].

[issue]: https://github.com/atomist/yaml-updater/issues

## Development

You will need to install [Node.js][node] to build and test this
project.

[node]: https://nodejs.org/ (Node.js)

### Build and test

Install dependencies.

```
$ npm install
```

Use the `build` package script to compile, test, lint, and build the
documentation.

```
$ npm run build
```

### Release

Releases are handled via the [Atomist SDM][atomist-sdm].  Just press
the 'Approve' button in the Atomist dashboard or Slack.

[atomist-sdm]: https://github.com/atomist/atomist-sdm (Atomist Software Delivery Machine)

---

Created by [Atomist][atomist].
Need Help?  [Join our Slack workspace][slack].

[atomist]: https://atomist.com/ (Atomist - How Teams Deliver Software)
[slack]: https://join.atomist.com/ (Atomist Community Slack)
