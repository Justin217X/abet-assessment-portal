/**
 * File: rosterConfirmation.ts
 * Purpose: Keeps demo group confirmation in this browser tab.
 * !!! Server confirmation and signed-in ownership are pending. [SD]
 */
export const groupKey = (dataset: string, group: string) => ["abet-group-confirmation", dataset, group].join(":")
export function readGroupConfirmation(dataset: string, group: string, fallback: boolean) {
    try {
        const saved = sessionStorage.getItem(groupKey(dataset, group))
        return saved === "true" ? true : saved === "false" ? false : fallback
    } catch { return fallback }
}
