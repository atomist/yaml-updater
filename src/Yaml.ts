import * as yaml from "js-yaml";
import * as _ from "lodash";

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
    options = { keepArrayIndent: false },
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
 * keys in the provided YAML.  The YAML can be multiple documents.  If
 * the keys are found in any of the documents, they are updated in the
 * first document the key exists in.  If a key is not found in any
 * document, it is added to the first document.
 *
 * @param updates      object of updates
 * @param currentYaml  YAML document to update
 * @param options      format settings
 * @return updated YAML document as a string
 */
export function updateYamlDocuments(
    updates: {},
    yamlDocuments: string,
    options = { keepArrayIndent: false },
): string {

    const yamlSepRegExp = /^(---(?:[ \t]+.*)?\n)/m;
    const yamlDocs = yamlDocuments.split(yamlSepRegExp);
    const insertIndex = (/\S/.test(yamlDocs[0]) || yamlDocs.length === 1) ? 0 : 2;

    _.forIn(updates, (v, k, o) => {
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
            if (k in current) {
                found = i;
                break;
            }
        }
        const index = (found < 0) ? insertIndex : found;
        yamlDocs[index] = updateYamlKey(k, v, yamlDocs[index], options);
    });

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
    updates: {},
    currentYaml: string,
    options = { keepArrayIndent: false },
): string {

    _.forIn(updates, (v, k, o) => {
        currentYaml = updateYamlKey(k, v, currentYaml, options);
    });

    return currentYaml;
}

/**
 * Update, insert, or delete the value of a key in `currentYml`, a
 * string containing valid YAML.  It does its best to retain the same
 * formatting, but empty lines may disappear if adjacent lines are
 * edited and comments that are parsed as part of a value that is
 * deleted will be deleted.
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
    options = { keepArrayIndent: false },
): string {
    // match index                  01                              2                 3
    const keyValRegExp = new RegExp(`(^|\\n)${key}\\s*:(?:\\s*?\\n)?([\\s\\S]*?)(?:\\n([^\\-\\s#]|$))`);

    let updatedYaml = (/\n$/.test(currentYaml)) ? currentYaml : currentYaml + "\n";
    let current: any;
    try {
        current = yaml.safeLoad(updatedYaml);
    } catch (e) {
        throw new Error(`failed to parse current YAML '${updatedYaml}': ${(e as Error).message}`);
    }
    if (current == null) {
        updatedYaml = (updatedYaml === "\n") ? "" : updatedYaml;
        updatedYaml += formatYamlKey(key, value, options);
        return updatedYaml;
    }

    if (value === null || value === undefined) {
        if (key in current) {
            updatedYaml = updatedYaml.replace(keyValRegExp, "$1$3");
        }
    } else if (knownType(value)) {
        if (key in current) {
            if (_.isEqual(current[key], value)) {
                return currentYaml;
            } else if (simpleType(value) || simpleType(current[key])) {
                const newKeyValue = formatYamlKey(key, value, options);
                updatedYaml = updatedYaml.replace(keyValRegExp, `\$1${newKeyValue}\$3`);
            } else if (typeof current[key] === "object") {
                const keyMatches = keyValRegExp.exec(updatedYaml);
                if (!keyMatches) {
                    throw new Error(`failed to match key ${key} in current YAML: ${updatedYaml}`);
                }
                const keyObject = keyMatches[2];
                // remove indentation
                const indentMatches = /(?:^|\n)(\s+)[^\-#\s]/.exec(keyObject);
                if (!indentMatches) {
                    throw new Error(`failed to match indentation for elements of key ${key}: ${keyObject}`);
                }
                const indentLevel = indentMatches[1];
                const indentRegex = new RegExp(`^${indentLevel}`);
                const lines = keyObject.split("\n");
                const indentation: YamlLine[] = [];
                const undentedLines = lines.map(l => {
                    // should we have a side effect when mapping over an array?
                    indentation.push(new YamlLine(l, indentRegex.test(l)));
                    return l.replace(indentRegex, "");
                });
                let currentValueYaml = undentedLines.join("\n") + "\n";
                _.forIn(value, (v, k, o) => {
                    currentValueYaml = updateYamlKey(k, v, currentValueYaml, options);
                });
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
                updatedYaml = updatedYaml.replace(keyValRegExp, `\$1${key}:\n${indentedYaml}\$3`);
            } else {
                throw new Error(`cannot update current YAML key ${key} of type ${typeof current[key]}`);
            }
        } else {
            updatedYaml = updatedYaml.replace(/\n+$/, "\n") + formatYamlKey(key, value, options);
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
export function formatYamlKey(key: string, value: any, options = { keepArrayIndent: false }): string {
    const obj: any = {};
    obj[key] = value;
    let y: string;
    try {
        y = yaml.safeDump(obj);
    } catch (e) {
        throw new Error(`failed to create YAML for {${key}: ${value}}: ${(e as Error).message}`);
    }

    if (!options.keepArrayIndent) {
        y = y.replace(/  - /g, "- ");
    }

    return y;
}

/**
 * Format object into a YAML string.
 *
 * @param obj     object to serialize
 * @param options settings for the formatting
 */
export function formatYaml(obj: any, options = { keepArrayIndent: false }): string {
    let y: string;
    try {
        y = yaml.safeDump(obj);
    } catch (e) {
        throw new Error(`failed to create YAML for '${JSON.stringify(obj)}': ${(e as Error).message}`);
    }

    if (!options.keepArrayIndent) {
        y = y.replace(/  - /g, "- ");
    }

    return y;
}
