/**
 * AWS Lambda Helper Functions
 * Contributor: Chirag Rathod (Srce Cde)
 */

import { randomUUID } from "crypto";

// Function to extract text based on block type (default: "WORD")
export const extractText = (response, extractBy = "WORD") => {
    const lineText = [];
    response.Blocks.forEach((block) => {
        if (block.BlockType === extractBy) {
            lineText.push(block.Text);
        }
    });
    return lineText;
};

// Function to map word IDs to their text or selection status
export const mapWordId = (response) => {
    const wordMap = {};
    response.Blocks.forEach((block) => {
        if (block.BlockType === "WORD") {
            wordMap[block.Id] = block.Text;
        }
        if (block.BlockType === "SELECTION_ELEMENT") {
            wordMap[block.Id] = block.SelectionStatus;
        }
    });
    return wordMap;
};

// Function to extract table information
export const extractTableInfo = (response, wordMap) => {
    const table = {};
    let currentRow = [];
    let currentTableKey = null;
    let currentRowIndex = 0;

    response.Blocks.forEach((block) => {
        if (block.BlockType === "TABLE") {
            currentTableKey = `table_${randomUUID()}`; // Use randomUUID to generate a unique table key
            table[currentTableKey] = [];
        }

        if (block.BlockType === "CELL") {
            if (block.RowIndex !== currentRowIndex) {
                if (currentRow.length > 0) {
                    table[currentTableKey].push(currentRow);
                }
                currentRow = [];
                currentRowIndex = block.RowIndex;
            }

            if (block.Relationships) {
                block.Relationships.forEach((relation) => {
                    if (relation.Type === "CHILD") {
                        const cellText = relation.Ids.map((id) => wordMap[id] || "").join(" ");
                        currentRow.push(cellText);
                    }
                });
            } else {
                currentRow.push(" ");
            }
        }
    });

    if (currentRow.length > 0 && currentTableKey) {
        table[currentTableKey].push(currentRow);
    }

    return table;
};

// Function to get the key map
export const getKeyMap = (response, wordMap) => {
    const keyMap = {};
    response.Blocks.forEach((block) => {
        if (block.BlockType === "KEY_VALUE_SET" && block.EntityTypes.includes("KEY")) {
            let valueIds = [];
            let keyText = "";

            if (block.Relationships) {
                block.Relationships.forEach((relation) => {
                    if (relation.Type === "VALUE") {
                        valueIds = relation.Ids;
                    }
                    if (relation.Type === "CHILD") {
                        keyText = relation.Ids.map((id) => wordMap[id] || "").join(" ");
                    }
                });
            }
            keyMap[keyText] = valueIds;
        }
    });
    console.log("got keyMay", keyMap)
    return keyMap;
};

// Function to get the value map
export const getValueMap = (response, wordMap) => {
    const valueMap = {};
    response.Blocks.forEach((block) => {
        if (block.BlockType === "KEY_VALUE_SET" && block.EntityTypes.includes("VALUE")) {
            if (block.Relationships) {
                block.Relationships.forEach((relation) => {
                    if (relation.Type === "CHILD") {
                        const valueText = relation.Ids.map((id) => wordMap[id] || "").join(" ");
                        valueMap[block.Id] = valueText;
                    }
                });
            } else {
                valueMap[block.Id] = "VALUE_NOT_FOUND";
            }
        }
    });
    return valueMap;
};

// Function to map keys to their corresponding values
export const getKvMap = (keyMap, valueMap) => {
    const finalMap = {};
    Object.keys(keyMap).forEach((key) => {
        const valueIds = keyMap[key];
        finalMap[key] = valueIds.map((id) => valueMap[id] || "").join("");
    });
    return finalMap;
};
