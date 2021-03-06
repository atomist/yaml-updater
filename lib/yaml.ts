/*
 * Copyright © 2019 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as deepEqual from "fast-deep-equal";
import * as yaml from "js-yaml";

export interface Options {
    keepArrayIndent?: boolean;
    updateAll?: boolean;
}

/**
 * Parse the provides update string as JSON and use the keys in the
 * provided object to update, insert, or delete keys in the provided
 * YAML.
 *
 * @param updates      string of updates
 * @param currentYaml  YAML document to update
 * @param options      format settings
 * @return updated YAML document as a string
 */
export function updateYamlDocumentWithString(
    updatesString: string,
    currentYaml: string,
    options: Options = { keepArrayIndent: false },
): string {
    let updates = {};
    try {
        updates = JSON.parse(updatesString);
    } catch (e) {
        throw new Error(`failed to parse update JSON '${updatesString}': ${(e as Error).message}`);
    }

    return updateYamlDocument(updates, currentYaml, options);
}

/**
 * Use the keys in the provided object to update, insert, or delete
 * keys in the provided YAML.  The YAML can be multiple documents.
 *
 * The updating follows two possible strategies depending on the ̀updateAll`
 * option. When `false`, the default, if the keys are found in any of the
 * documents, they are updated in the first document the key exists in. If a key
 * is not found in any document, it is added to the first document. When
 * `̀updateAll` is `true`, the updates append on all documents.
 *
 * @param updates      object of updates
 * @param currentYaml  YAML document to update
 * @param options      format settings
 * @return updated YAML document as a string
 */
export function updateYamlDocuments(
    updates: { [key: string]: any },
    yamlDocuments: string,
    options: Options = { keepArrayIndent: false, updateAll: false },
): string {
    const yamlSepRegExp = /^(---(?:[ \t]+.*)?\n)/m;
    const yamlDocs = yamlDocuments.split(yamlSepRegExp);
    const insertIndex = (/\S/.test(yamlDocs[0]) || yamlDocs.length === 1) ? 0 : 2;
    const updateAll = options.updateAll || false;

    for (const k of Object.keys(updates)) {
        const v = updates[k];
        let found = -1;
        for (let i = 0; i < yamlDocs.length; i += 2) {
            let current: any;
            try {
                current = yaml.safeLoad(yamlDocs[i]);
            } catch (e) {
                throw new Error(`failed to parse YAML document '${yamlDocs[i]}': ${(e as Error).message}`);
            }
            if (!current) {
                continue;
            }
            if (updateAll) {
                yamlDocs[i] = updateYamlKey(k, v, yamlDocs[i], options);
            } else {
                if (k in current) {
                    found = i;
                    break;
                }
            }
        }

        if (!updateAll) {
            const index = (found < 0) ? insertIndex : found;
            yamlDocs[index] = updateYamlKey(k, v, yamlDocs[index], options);
        }
    }

    return yamlDocs.join("");
}

/**
 * Use the keys in the provided object to update, insert, or delete
 * keys in the provided YAML document.
 *
 * @param updates      object of updates
 * @param currentYaml  YAML document to update
 * @param options      format settings
 * @return updated YAML document as a string
 */
export function updateYamlDocument(
    updates: { [key: string]: any },
    currentYaml: string,
    options: Options = { keepArrayIndent: false },
): string {

    let updatedYaml = currentYaml;
    for (const k of Object.keys(updates)) {
        const v = updates[k];
        updatedYaml = updateYamlKey(k, v, updatedYaml, options);
    }

    return updatedYaml;
}

/**
 * Update, insert, or delete the value of a key in `currentYml`, a
 * string containing valid YAML.  It does its best to retain the same
 * formatting, but empty lines and trailing whitespace may disappear
 * if adjacent lines are edited and comments that are parsed as part
 * of a value that is deleted will be deleted.
 *
 * @param key  the key whose value should be replaced
 * @param value  the value to set the key to, set to `null` or `undefined` to remove the key
 * @param options settings for the formatting
 * @return updated YAML document as a string
 */
export function updateYamlKey(
    key: string,
    value: any,
    currentYaml: string,
    options: Options = { keepArrayIndent: false },
): string {
    // match index                  01                                          2
    const keyValRegExp = new RegExp(`(^|\\n)${key}[^\\S\\n]*:(?:[^\\S\\n]*?\\n)?([\\s\\S]*?(?:\\n(?![\\n\\- #])|$))`);

    let updatedYaml = (/\n$/.test(currentYaml)) ? currentYaml : currentYaml + "\n";
    let current: any;
    try {
        current = yaml.safeLoad(updatedYaml);
    } catch (e) {
        throw new Error(`failed to parse current YAML '${updatedYaml}': ${(e as Error).message}`);
    }
    if (!current) {
        updatedYaml = (updatedYaml === "\n") ? "" : updatedYaml;
        updatedYaml += formatYamlKey(key, value, options);
        return updatedYaml;
    }

    if (value === null || value === undefined) {
        if (key in current) {
            updatedYaml = updatedYaml.replace(keyValRegExp, "$1");
        }
    } else if (knownType(value)) {
        if (key in current) {
            if (deepEqual(current[key], value)) {
                return currentYaml;
            } else if (simpleType(value) || simpleType(current[key])) {
                const newKeyValue = formatYamlKey(key, value, options);
                updatedYaml = updatedYaml.replace(keyValRegExp, `\$1${newKeyValue}`);
            } else if (typeof current[key] === "object") {
                const keyMatches = keyValRegExp.exec(updatedYaml);
                if (!keyMatches) {
                    throw new Error(`failed to match key ${key} in current YAML: ${updatedYaml}`);
                }
                const keyObject = keyMatches[2];
                // find first properly indented line
                const indentationRegExp = /^( +)[^\-# ]/m;
                const indentMatches = indentationRegExp.exec(keyObject);
                if (!indentMatches) {
                    throw new Error(`failed to match indentation for elements of key ${key}: ${keyObject}`);
                }
                const indentLevel = indentMatches[1];
                const indentRegex = new RegExp(`^${indentLevel}`);
                const lines = keyObject.split("\n");
                const indentation: YamlLine[] = [];
                const undentedLines = lines.map(l => {
                    indentation.push(new YamlLine(l, indentRegex.test(l)));
                    return l.replace(indentRegex, "");
                });
                let currentValueYaml = undentedLines.join("\n");
                for (const k of Object.keys(value)) {
                    const v = value[k];
                    currentValueYaml = updateYamlKey(k, v, currentValueYaml, options);
                }
                const currentLines = currentValueYaml.split("\n");
                let nextToMatch = 0;
                const indentedLines = currentLines.map(l => {
                    for (let j = nextToMatch; j < indentation.length; j++) {
                        if (l.trim() === indentation[j].content.trim()) {
                            nextToMatch = j + 1;
                            if (indentation[j].indented) {
                                return indentLevel + l;
                            } else {
                                return l;
                            }
                        }
                    }
                    return (/\S/.test(l)) ? indentLevel + l : l;
                });
                const indentedYaml = indentedLines.join("\n");
                // last line must be empty but indentation matching may erroneously indent the last
                // empty line if there were indented empty lines after a deleted key
                const trailerYaml = (/\n$/.test(indentedYaml)) ? indentedYaml : indentedYaml + "\n";
                updatedYaml = updatedYaml.replace(keyValRegExp, `\$1${key}:\n${trailerYaml}`);
            } else {
                throw new Error(`cannot update current YAML key ${key} of type ${typeof current[key]}`);
            }
        } else {
            const tailMatches = /\n(\n*)$/.exec(updatedYaml);
            const tail = (tailMatches && tailMatches[1]) ? tailMatches[1] : "";
            updatedYaml = updatedYaml.replace(/\n+$/, "\n") + formatYamlKey(key, value, options) + tail;
        }
    } else {
        throw new Error(`cannot update YAML with value (${value}) of type ${typeof value}`);
    }

    return updatedYaml;
}

function simpleType(a: any): boolean {
    const typ = typeof a;
    return typ === "string" || typ === "boolean" || typ === "number" || Array.isArray(a);
}

function knownType(a: any): boolean {
    return simpleType(a) || typeof a === "object";
}

class YamlLine {
    constructor(public content: string, public indented: boolean) { }
}

/**
 * Format a key and value into a YAML string.
 *
 * @param key    key to serialize
 * @param value  value to serialize
 * @param options settings for the formatting
 */
export function formatYamlKey(key: string, value: any, options: Options = { keepArrayIndent: false }): string {
    const obj: any = {};
    obj[key] = value;
    let y: string;
    try {
        y = yaml.safeDump(obj);
    } catch (e) {
        throw new Error(`failed to create YAML for {${key}: ${value}}: ${(e as Error).message}`);
    }

    y = arrayIndent(y, options.keepArrayIndent);

    return y;
}

/**
 * Format object into a YAML string.
 *
 * @param obj     object to serialize
 * @param options settings for the formatting
 */
export function formatYaml(obj: any, options: Options = { keepArrayIndent: false }): string {
    let y: string;
    try {
        y = yaml.safeDump(obj);
    } catch (e) {
        throw new Error(`failed to create YAML for '${JSON.stringify(obj)}': ${(e as Error).message}`);
    }

    y = arrayIndent(y, options.keepArrayIndent);

    return y;
}

/**
 * Remove superfluous indentation from array if `indentArray` is `false`.
 *
 * @param y  YAML document as string
 * @param indentArray retain indented arrays if `true`
 * @return YAML document as string with arrays indented as desired.
 */
function arrayIndent(y: string, indentArray: boolean | undefined): string {
    return (indentArray) ? y : y.replace(/^( *)  - /gm, "$1- ");
}
