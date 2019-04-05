/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as assert from "power-assert";

import {
    formatYamlKey,
    updateYamlDocument,
    updateYamlDocuments,
    updateYamlDocumentWithString,
    updateYamlKey,
} from "../lib/yaml";

/* tslint:disable:max-file-line-count */

describe("Yaml", () => {

    describe("formatYamlKey", () => {

        it("should properly format a YAML key value", () => {
            assert(formatYamlKey("artist", "Arcade Fire") === "artist: Arcade Fire\n");
        });

        it("should properly format a YAML array", () => {
            const albums = ["Funeral", "Neon Bible", "The Suburbs", "Reflektor"];
            const expected = `albums:
- Funeral
- Neon Bible
- The Suburbs
- Reflektor
`;
            assert(formatYamlKey("albums", albums) === expected);
        });

        it("should properly indent a YAML array", () => {
            const albums = ["Funeral", "Neon Bible", "The Suburbs", "Reflektor"];
            const expected = `albums:
  - Funeral
  - Neon Bible
  - The Suburbs
  - Reflektor
`;
            const options = { keepArrayIndent: true };
            assert(formatYamlKey("albums", albums, options) === expected);
        });

    });

    describe("updateYamlKey", () => {

        it("should add a key with a string value to an empty string", () => {
            const original = "";
            const expected = "artist: Arcade Fire\n";
            const value = "Arcade Fire";
            assert(updateYamlKey("artist", value, original) === expected);
        });

        it("should update a key with a string value", () => {
            const original = "artist: Unknown\n";
            const expected = "artist: Arcade Fire\n";
            const value = "Arcade Fire";
            assert(updateYamlKey("artist", value, original) === expected);
        });

        it("should update a key without newline with a string value", () => {
            const original = "artist: Unknown";
            const expected = "artist: Arcade Fire\n";
            const value = "Arcade Fire";
            assert(updateYamlKey("artist", value, original) === expected);
        });

        it("should update a key with a string value respecting lines and comments", () => {
            const original = `
# not unknown
artist: Unknown

`;
            const expected = `
# not unknown
artist: Arcade Fire
`;
            const value = "Arcade Fire";
            assert(updateYamlKey("artist", value, original) === expected);
        });

        it("should not change the format of a value", () => {
            const original = `artist: "Arcade Fire"\n`;
            const value = "Arcade Fire";
            assert(updateYamlKey("artist", value, original) === original);
        });

        it("should add a key with a string value", () => {
            const original = "label: Merge Records\n";
            const expected = `label: Merge Records
artist: Arcade Fire
`;
            const value = "Arcade Fire";
            assert(updateYamlKey("artist", value, original) === expected);
        });

        it("should add a key with a string value respecting empty lines and comments", () => {
            const original = `

label: Merge Records

# who is on this label?

`;
            const expected = `

label: Merge Records

# who is on this label?
artist: Arcade Fire

`;
            const value = "Arcade Fire";
            assert(updateYamlKey("artist", value, original) === expected);
        });

        it("should add a key without a newline with a string value", () => {
            const original = "label: Merge Records";
            const expected = `label: Merge Records
artist: Arcade Fire
`;
            const value = "Arcade Fire";
            assert(updateYamlKey("artist", value, original) === expected);
        });

        it("should delete a key with a string value", () => {
            const original = `label: Merge Records
artist: Arcade Fire
`;
            const expected = "label: Merge Records\n";
            // tslint:disable-next-line:no-null-keyword
            const value = null;
            assert(updateYamlKey("artist", value, original) === expected);
        });

        it("should delete a key with a false value", () => {
            const original = `label: false
artist: Arcade Fire
`;
            const expected = "artist: Arcade Fire\n";
            // tslint:disable-next-line:no-null-keyword
            const value = null;
            assert(updateYamlKey("label", value, original) === expected);
        });

        it("should update a key preserving empty lines and comments", () => {
            const original = "# comment\nartist: Arcade File\n\nlabel: Merge Records\n";
            const expected = "# comment\nartist: Arcade File\n\nlabel: Sonovox\n";
            const value = "Sonovox";
            assert(updateYamlKey("label", value, original) === expected);
        });

        it("should update a key with an array value", () => {
            const original = `albums:
- Funeral
- Neon Bible
- The Suburbs
- Reflektor
`;
            const expected = `albums:
- Funeral
- Neon Bible
- The Suburbs
- Reflektor
- Everything Now
`;
            const value = ["Funeral", "Neon Bible", "The Suburbs", "Reflektor", "Everything Now"];
            assert(updateYamlKey("albums", value, original) === expected);
        });

        it("should add a key with an array value", () => {
            const original = "artist: Arcade Fire\n";
            const expected = `artist: Arcade Fire
albums:
- Funeral
- Neon Bible
- The Suburbs
- Reflektor
`;
            const value = ["Funeral", "Neon Bible", "The Suburbs", "Reflektor"];
            assert(updateYamlKey("albums", value, original) === expected);
        });

        it("should add a key without a newline with an array value", () => {
            const original = "artist: Arcade Fire";
            const expected = `artist: Arcade Fire
albums:
- Funeral
- Neon Bible
- The Suburbs
- Reflektor
`;
            const value = ["Funeral", "Neon Bible", "The Suburbs", "Reflektor"];
            assert(updateYamlKey("albums", value, original) === expected);
        });

        it("should delete a key with an array value", () => {
            const original = `artist: Arcade Fire
albums:
- Funeral
- Neon Bible
- The Suburbs
- Reflektor
`;
            const expected = "artist: Arcade Fire\n";
            // tslint:disable-next-line:no-null-keyword
            const value = null;
            assert(updateYamlKey("albums", value, original) === expected);
        });

        it("should delete a key with an indented array value", () => {
            const original = `artist: Arcade Fire
albums:
  - Funeral
  - Neon Bible
  - The Suburbs
  - Reflektor
`;
            const expected = "artist: Arcade Fire\n";
            // tslint:disable-next-line:no-null-keyword
            const value = null;
            assert(updateYamlKey("albums", value, original) === expected);
        });

        it("should update an object with a string", () => {
            const original = `albums:
  Funeral: 2004
  Neon Bible: 2007
  The Suburbs: 2010
  Reflektor: 2013
`;
            const expected = "albums: 'Funeral, Neon Bible, The Suburbs, Reflektor'\n";
            const value = "Funeral, Neon Bible, The Suburbs, Reflektor";
            assert(updateYamlKey("albums", value, original) === expected);
        });

        it("should add to an object", () => {
            const original = `artist: Arcade Fire
albums:
  Funeral: 2004
  Neon Bible: 2007
  The Suburbs: 2010
  Reflektor: 2013
label: Merge Records
`;
            const expected = `artist: Arcade Fire
albums:
  Funeral: 2004
  Neon Bible: 2007
  The Suburbs: 2010
  Reflektor: 2013
  Everything Now: 2017
label: Merge Records
`;
            const value = { "Everything Now": 2017 };
            assert(updateYamlKey("albums", value, original) === expected);
        });

        it("should update part of an object", () => {
            const original = `artist: Arcade Fire
albums:
  Funeral: 2004
  Neon Bible: 2007
  The Suburbs: 2011
  Reflektor: 2013
  Everything Now: 2017
label: Merge Records
`;
            const expected = `artist: Arcade Fire
albums:
  Funeral: 2004
  Neon Bible: 2007
  The Suburbs: 2010
  Reflektor: 2013
  Everything Now: 2017
label: Merge Records
`;
            const value = { "The Suburbs": 2010 };
            assert(updateYamlKey("albums", value, original) === expected);
        });

        it("should delete an object", () => {
            const original = `artist: Arcade Fire
albums:
  Funeral: 2004
  Neon Bible: 2007
  The Suburbs: 2010
  Reflektor: 2013
  Everything Now: 2017
label: Merge Records
`;
            const expected = `artist: Arcade Fire
label: Merge Records
`;
            // tslint:disable-next-line:no-null-keyword
            const value = null;
            assert(updateYamlKey("albums", value, original) === expected);
        });

        it("should delete a nested object", () => {
            const original = `artist: Arcade Fire
albums:
  Arcade Fire: 2003
  Funeral: 2004
  Neon Bible: 2007
  The Suburbs: 2010
  Reflektor: 2013
  Everything Now: 2017
label: Merge Records
`;
            const expected = `artist: Arcade Fire
albums:
  Funeral: 2004
  Neon Bible: 2007
  The Suburbs: 2010
  Reflektor: 2013
  Everything Now: 2017
label: Merge Records
`;
            // tslint:disable-next-line:no-null-keyword
            const value = { "Arcade Fire": null };
            assert(updateYamlKey("albums", value, original) === expected);
        });

        it("should add to an object respecting comments and empty lines", () => {
            const original = `# first line
artist: Arcade Fire

albums:
  Funeral: 2004
  Neon Bible: 2007
# bad comment
  The Suburbs: 2010
  Reflektor: 2013


label: Merge Records
`;
            const expected = `# first line
artist: Arcade Fire

albums:
  Funeral: 2004
  Neon Bible: 2007
# bad comment
  The Suburbs: 2010
  Reflektor: 2013
  Everything Now: 2017


label: Merge Records
`;
            const value = { "Everything Now": 2017 };
            assert(updateYamlKey("albums", value, original) === expected);
        });

        it("should update part of an object respecting comments and empty lines", () => {
            const original = `# first line
artist: Arcade Fire

albums:
  Funeral: 2004
  Neon Bible: 2007
# bad comment
  The Suburbs: 2011
  Reflektor: 2013
  Everything Now: 2017


label: Merge Records
`;
            const expected = `# first line
artist: Arcade Fire

albums:
  Funeral: 2004
  Neon Bible: 2007
# bad comment
  The Suburbs: 2010
  Reflektor: 2013
  Everything Now: 2017


label: Merge Records
`;
            const value = { "The Suburbs": 2010 };
            assert(updateYamlKey("albums", value, original) === expected);
        });

        it("should delete an object respecting comments and empty lines", () => {
            const original = `# first line
artist: Arcade Fire

albums:
  Funeral: 2004
  Neon Bible: 2007
# bad comment
  The Suburbs: 2010
  Reflektor: 2013
  Everything Now: 2017


label: Merge Records
`;
            const expected = `# first line
artist: Arcade Fire

label: Merge Records
`;
            // tslint:disable-next-line:no-null-keyword
            const value = null;
            assert(updateYamlKey("albums", value, original) === expected);
        });

        it("should delete a nested object respecting comments and empty lines", () => {
            const original = `# first line
artist: Arcade Fire

albums:
  Arcade Fire: 2003
  Funeral: 2004
  Neon Bible: 2007
# bad comment
  The Suburbs: 2010
  Reflektor: 2013
  Everything Now: 2017


label: Merge Records
`;
            const expected = `# first line
artist: Arcade Fire

albums:
  Funeral: 2004
  Neon Bible: 2007
# bad comment
  The Suburbs: 2010
  Reflektor: 2013
  Everything Now: 2017


label: Merge Records
`;
            // tslint:disable-next-line:no-null-keyword
            const value = { "Arcade Fire": null };
            assert(updateYamlKey("albums", value, original) === expected);
        });

        it("should update object with embedded newlines", () => {
            const orig = `notify:

  webhooks:
  - url: https://somedomain.com
`;
            const updates = {
                webhooks: [
                    { url: "https://somedomain.com" },
                    { url: "https://otherdomain.com" },
                ],
            };
            const expected = `notify:

  webhooks:
  - url: 'https://somedomain.com'
  - url: 'https://otherdomain.com'
`;
            assert(updateYamlKey("notify", updates, orig) === expected);
        });

        it("should delete object with embedded newlines", () => {
            const orig = `kanye: west
notify:

  webhooks:
  - url: https://somedomain.com
`;
            const expected = `kanye: west\n`;
            // tslint:disable-next-line:no-null-keyword
            assert(updateYamlKey("notify", null, orig) === expected);
        });

    });

    describe("updateYamlDocument", () => {

        it("should add a key with a string value to an empty document", () => {
            const orig = "";
            const updates = { artist: "Arcade Fire" };
            const expected = "artist: Arcade Fire\n";
            assert(updateYamlDocument(updates, orig) === expected);
            assert(updateYamlDocumentWithString(JSON.stringify(updates), orig) === expected);
        });

        it("should update a false value", () => {
            const orig = `dist: trusty
sudo: false
language: java
`;
            const updates = { sudo: "required" };
            const expected = `dist: trusty
sudo: required
language: java
`;
            assert(updateYamlDocument(updates, orig) === expected);
            assert(updateYamlDocumentWithString(JSON.stringify(updates), orig) === expected);
        });

        it("should update objects with embedded newlines", () => {
            const orig = `notify:

  webhooks:
  - url: https://somedomain.com
`;
            const updates = {
                notify: {
                    webhooks: [
                        { url: "https://somedomain.com" },
                        { url: "https://otherdomain.com" },
                    ],
                },
            };
            const expected = `notify:

  webhooks:
  - url: 'https://somedomain.com'
  - url: 'https://otherdomain.com'
`;
            assert(updateYamlDocument(updates, orig) === expected);
            assert(updateYamlDocumentWithString(JSON.stringify(updates), orig) === expected);
        });

        it("should update the Travis CI config", () => {
            const orig = `dist: trusty
sudo: required
language: java
jdk:
- oraclejdk8
branches:
  except:
  - "/\\\\+travis\\\\d+$/"
env:
  global:
  - MAVEN_BASE_URL=https://atomist.jfrog.io/atomist
  - secure: PW3ljhvSKyiRWnXmOQPjxrgKIXJj2kqfBPealtWc1ed7boXhokthGqLi+kPoNpgKPABT9n
  - secure: QS92lH/Ys5iyF1KmtFWpl2+cTVB7UaAuFfRUKJV71HrasCqFNLqmTa7dhjmUENKXXNYF/N
  - secure: N21/RoBphfj6QXfgG2nBL51rVwnpXDzHpL131i/0JJHOcSGgY93Ky1M+6QnDC7Z+Dgb7p1
install: nvm install 8.0.0
script: bash .atomist/build/travis-build.bash
notifications:
  email: false
  webhooks:
    urls:
    - https://webhook.atomist.com/travis
    on_success: always
    on_failure: always
    on_start: always
cache:
  directories:
  - "$HOME/.atomist"
  - "$HOME/.npm"
deploy:
  provider: releases
  api_key:
    secure: dm4EMOFpssgvUh+VGczJabLlJguNp9Qeo1btv2CMB/cNT5ICzenx/77Qo4bY20V+nL5k3k
  on:
    tags: true
    condition: "$TRAVIS_TAG =~ ^[0-9]+\\\\.[0-9]+\\\\.[0-9]+$"
`;
            const updates = {
                cache: {
                    directories: ["$HOME/.m2"],
                },
                // tslint:disable-next-line:no-null-keyword
                deploy: null,
                install: "nvm install 8.1.2",
                notifications: {
                    webhooks: {
                        on_cancel: "always",
                        on_error: "always",
                    },
                },
                script: "bash src/main/scripts/travis-build.bash",
                sudo: false,
            };
            const expected = `dist: trusty
sudo: false
language: java
jdk:
- oraclejdk8
branches:
  except:
  - "/\\\\+travis\\\\d+$/"
env:
  global:
  - MAVEN_BASE_URL=https://atomist.jfrog.io/atomist
  - secure: PW3ljhvSKyiRWnXmOQPjxrgKIXJj2kqfBPealtWc1ed7boXhokthGqLi+kPoNpgKPABT9n
  - secure: QS92lH/Ys5iyF1KmtFWpl2+cTVB7UaAuFfRUKJV71HrasCqFNLqmTa7dhjmUENKXXNYF/N
  - secure: N21/RoBphfj6QXfgG2nBL51rVwnpXDzHpL131i/0JJHOcSGgY93Ky1M+6QnDC7Z+Dgb7p1
install: nvm install 8.1.2
script: bash src/main/scripts/travis-build.bash
notifications:
  email: false
  webhooks:
    urls:
    - https://webhook.atomist.com/travis
    on_success: always
    on_failure: always
    on_start: always
    on_cancel: always
    on_error: always
cache:
  directories:
  - $HOME/.m2
`;
            const updated = updateYamlDocument(updates, orig);
            assert(updated === expected);
            const updatedFromString = updateYamlDocumentWithString(JSON.stringify(updates), orig);
            assert(updatedFromString === expected);
        });

        it("should update the Travis CI config, respecting spaces and comments", () => {
            const orig = `# this is the Travis CI config
dist: trusty
language: java
jdk:
- oraclejdk8

branches:
  except:
  - "/\\\\+travis\\\\d+$/"
env:
  global:
  - MAVEN_BASE_URL=https://atomist.jfrog.io/atomist
  - secure: PW3ljhvSKyiRWnXmOQPjxrgKIXJj2kqfBPealtWc1ed7boXhokthGqLi+kPoNpgKPABT9n
  - secure: QS92lH/Ys5iyF1KmtFWpl2+cTVB7UaAuFfRUKJV71HrasCqFNLqmTa7dhjmUENKXXNYF/N
  - secure: N21/RoBphfj6QXfgG2nBL51rVwnpXDzHpL131i/0JJHOcSGgY93Ky1M+6QnDC7Z+Dgb7p1

install: nvm install 8.0.0
script: bash .atomist/build/travis-build.bash

notifications:
  email: false
# poorly indented comment
  webhooks:
    urls:
        # Atomist Travis webhook URL
    - https://webhook.atomist.com/travis

    on_success: always
    on_failure: always
    on_start: always
cache:
  directories:
  - "$HOME/.atomist"
  - "$HOME/.npm"
deploy:
  provider: releases
# this is encrypted
  api_key:
    secure: dm4EMOFpssgvUh+VGczJabLlJguNp9Qeo1btv2CMB/cNT5ICzenx/77Qo4bY20V+nL5k3k

  # when should the release happen?
  on:
    tags: true
    condition: "$TRAVIS_TAG =~ ^[0-9]+\\\\.[0-9]+\\\\.[0-9]+$"
`;
            const updates = {
                cache: {
                    directories: ["$HOME/.m2"],
                },
                // tslint:disable-next-line:no-null-keyword
                deploy: null,
                install: "nvm install 8.1.2",
                notifications: {
                    webhooks: {
                        on_cancel: "always",
                        on_error: "always",
                    },
                },
                script: "bash src/main/scripts/travis-build.bash",
                sudo: "required",
            };
            const expected = `# this is the Travis CI config
dist: trusty
language: java
jdk:
- oraclejdk8

branches:
  except:
  - "/\\\\+travis\\\\d+$/"
env:
  global:
  - MAVEN_BASE_URL=https://atomist.jfrog.io/atomist
  - secure: PW3ljhvSKyiRWnXmOQPjxrgKIXJj2kqfBPealtWc1ed7boXhokthGqLi+kPoNpgKPABT9n
  - secure: QS92lH/Ys5iyF1KmtFWpl2+cTVB7UaAuFfRUKJV71HrasCqFNLqmTa7dhjmUENKXXNYF/N
  - secure: N21/RoBphfj6QXfgG2nBL51rVwnpXDzHpL131i/0JJHOcSGgY93Ky1M+6QnDC7Z+Dgb7p1

install: nvm install 8.1.2
script: bash src/main/scripts/travis-build.bash
notifications:
  email: false
# poorly indented comment
  webhooks:
    urls:
        # Atomist Travis webhook URL
    - https://webhook.atomist.com/travis

    on_success: always
    on_failure: always
    on_start: always
    on_cancel: always
    on_error: always
cache:
  directories:
  - $HOME/.m2
sudo: required
`;
            const updated = updateYamlDocument(updates, orig);
            assert(updated === expected);
            const updatedFromString = updateYamlDocumentWithString(JSON.stringify(updates), orig);
            assert(updatedFromString === expected);
        });

        it("should add a value in first document of multi-doc YAML", () => {
            const orig = `artist: Arcade Fire
---
artist: Broken Social Scene
`;
            const updates = {
                albums: [
                    "Funeral",
                    "Neon Bible",
                    "The Suburbs",
                    "Reflektor",
                    "Everything Now",
                ],
            };
            const expected = `artist: Arcade Fire
albums:
- Funeral
- Neon Bible
- The Suburbs
- Reflektor
- Everything Now
---
artist: Broken Social Scene
`;
            const updated = updateYamlDocuments(updates, orig);
            assert(updated === expected);
        });

        it("should update value in second document, not add in first document of multi-doc YAML", () => {
            const orig = `artist: Arcade Fire
---
artist: Broken Social Scene
albums:
- Feel Good Lost
- You Forgot It in People
- Broken Social Scene
- Forgiveness Rock Record
`;
            const updates = {
                albums: [
                    "Feel Good Lost",
                    "You Forgot It in People",
                    "Broken Social Scene",
                    "Forgiveness Rock Record",
                    "Hug of Thunder",
                ],
            };
            const expected = `artist: Arcade Fire
---
artist: Broken Social Scene
albums:
- Feel Good Lost
- You Forgot It in People
- Broken Social Scene
- Forgiveness Rock Record
- Hug of Thunder
`;
            const updated = updateYamlDocuments(updates, orig);
            assert(updated === expected);
        });

        it("should update a value in first document of multi-doc YAML", () => {
            const orig = `artist: Arcade Fire
albums:
- Funeral
- Neon Bible
- The Suburbs
- Reflektor
---
artist: Broken Social Scene
albums:
- Feel Good Lost
- You Forgot It in People
- Broken Social Scene
- Forgiveness Rock Record
- Hug of Thunder
`;
            const updates = {
                albums: [
                    "Funeral",
                    "Neon Bible",
                    "The Suburbs",
                    "Reflektor",
                    "Everything Now",
                ],
            };
            const expected = `artist: Arcade Fire
albums:
- Funeral
- Neon Bible
- The Suburbs
- Reflektor
- Everything Now
---
artist: Broken Social Scene
albums:
- Feel Good Lost
- You Forgot It in People
- Broken Social Scene
- Forgiveness Rock Record
- Hug of Thunder
`;
            const updated = updateYamlDocuments(updates, orig);
            assert(updated === expected);
        });

        it("should remove a value in first document of multi-doc YAML", () => {
            const orig = `artist: Arcade Fire
albums:
- Funeral
- Neon Bible
- The Suburbs
- Reflektor
- Everything Now
---
artist: Broken Social Scene
albums:
- Feel Good Lost
- You Forgot It in People
- Broken Social Scene
- Forgiveness Rock Record
- Hug of Thunder
`;
            // tslint:disable-next-line:no-null-keyword
            const updates = { albums: null };
            const expected = `artist: Arcade Fire
---
artist: Broken Social Scene
albums:
- Feel Good Lost
- You Forgot It in People
- Broken Social Scene
- Forgiveness Rock Record
- Hug of Thunder
`;
            const updated = updateYamlDocuments(updates, orig);
            assert(updated === expected);
        });

        it("should update a value of multi-doc YAML with initial separator", () => {
            const orig = `---
artist: Arcade Fire
label: Merge Records
---
artist: Broken Social Scene
label: "Arts & Crafts"
`;
            const updates = { label: "Sonovox" };
            const expected = `---
artist: Arcade Fire
label: Sonovox
---
artist: Broken Social Scene
label: "Arts & Crafts"
`;
            const updated = updateYamlDocuments(updates, orig);
            assert(updated === expected);
        });

        it("should update values of multi-doc YAML in the right docs", () => {
            const orig = `---
artist: Arcade Fire
label: Merge Records
---
artist: Broken Social Scene
albums:
- Feel Good Lost
- You Forgot It in People
- Broken Social Scene
- Forgiveness Rock Record
label: "Arts & Crafts"
`;
            const updates = {
                albums: [
                    "Feel Good Lost",
                    "You Forgot It in People",
                    "Broken Social Scene",
                    "Forgiveness Rock Record",
                    "Hug of Thunder",
                ],
                label: "Sonovox",
            };
            const expected = `---
artist: Arcade Fire
label: Sonovox
---
artist: Broken Social Scene
albums:
- Feel Good Lost
- You Forgot It in People
- Broken Social Scene
- Forgiveness Rock Record
- Hug of Thunder
label: "Arts & Crafts"
`;
            const updated = updateYamlDocuments(updates, orig);
            assert(updated === expected);
        });

        it("should update values of multi-doc YAML in the right docs respecting empty lines and comments", () => {
            const orig = `---

artist: Arcade Fire

label: Merge Records
---
artist: Broken Social Scene

# too long between
albums:
- Feel Good Lost
- You Forgot It in People
- Broken Social Scene
- Forgiveness Rock Record
label: "Arts & Crafts"
`;
            const updates = {
                albums: [
                    "Feel Good Lost",
                    "You Forgot It in People",
                    "Broken Social Scene",
                    "Forgiveness Rock Record",
                    "Hug of Thunder",
                ],
                label: "Sonovox",
            };
            const expected = `---

artist: Arcade Fire

label: Sonovox
---
artist: Broken Social Scene

# too long between
albums:
- Feel Good Lost
- You Forgot It in People
- Broken Social Scene
- Forgiveness Rock Record
- Hug of Thunder
label: "Arts & Crafts"
`;
            const updated = updateYamlDocuments(updates, orig);
            assert(updated === expected);
        });

        /* tslint:disable:max-line-length */
        it("should parse YAML values with regex characters", () => {
            const orig = `server:
  port: 8090

endpoints:
  restart:
    enabled: true
  shutdown:
    enabled: true

logging:
  level:
    org.springframework.cloud.consul: DEBUG
  pattern:
    console: '%d{yyyy-MM-dd HH:mm:ss.SSS} [trace=%X{X-Trace-Id:-},span=%X{X-Span-Id:-}] [%15.15t] %-40.40logger{39}: %m%n'


spring:
  cloud:
    consul:
      discovery:
        preferIpAddress: true
        instanceId: \${spring.application.name}:\{spring.application.instance_id:\${random.value}}
    stream:
        bindings:
          input:
            destination: messages
  rabbitmq:
    host: rabbit1
    username: rabbitmq
    password: rabbitmq
`;
            const updates = {
                logging: {
                    level: {
                        "com.atomist.spring.agent": "DEBUG",
                    },
                },
                atomist: {
                    enabled: true,
                    debug: true,
                    url: `https://webhook.atomist.com/atomist/application/teams/TK421WAYAYP`,
                    environment: {
                        /* tslint:disable:no-invalid-template-strings */
                        domain: "${DOMAIN:development}",
                        pod: "${HOSTNAME:${random.value}}",
                        /* tslint:enable:no-invalid-template-strings */
                    },
                },
            };
            const expected = `server:
  port: 8090

endpoints:
  restart:
    enabled: true
  shutdown:
    enabled: true

logging:
  level:
    org.springframework.cloud.consul: DEBUG
    com.atomist.spring.agent: DEBUG
  pattern:
    console: '%d{yyyy-MM-dd HH:mm:ss.SSS} [trace=%X{X-Trace-Id:-},span=%X{X-Span-Id:-}] [%15.15t] %-40.40logger{39}: %m%n'


spring:
  cloud:
    consul:
      discovery:
        preferIpAddress: true
        instanceId: \${spring.application.name}:\{spring.application.instance_id:\${random.value}}
    stream:
        bindings:
          input:
            destination: messages
  rabbitmq:
    host: rabbit1
    username: rabbitmq
    password: rabbitmq
atomist:
  enabled: true
  debug: true
  url: 'https://webhook.atomist.com/atomist/application/teams/TK421WAYAYP'
  environment:
    domain: '\${DOMAIN:development}'
    pod: '\${HOSTNAME:\${random.value}}'
`;
            const updated = updateYamlDocuments(updates, orig);
            assert(updated === expected);
        });
        /* tslint:enable:max-line-length */

    });

    it("should support updating all documents at once", () => {
        const orig = `---
artist: Arcade Fire
label: Merge Records
---
artist: Broken Social Scene
albums:
- Feel Good Lost
- You Forgot It in People
- Broken Social Scene
- Forgiveness Rock Record
label: "Arts & Crafts"
`;
        const updates = {
            genre: "humanbeatbox",
            date: {
                year: 2017,
            },
        };
        const expected = `---
artist: Arcade Fire
label: Merge Records
genre: humanbeatbox
date:
  year: 2017
---
artist: Broken Social Scene
albums:
- Feel Good Lost
- You Forgot It in People
- Broken Social Scene
- Forgiveness Rock Record
label: "Arts & Crafts"
genre: humanbeatbox
date:
  year: 2017
`;
        const updated = updateYamlDocuments(updates, orig, { updateAll: true });
        assert(updated === expected);
    });

});
