/// <reference types="vite/client" />

// jui-ui-vue/jui-grid-vue ship no .d.ts (their dist/ only has the UMD/ES JS +
// CSS) - loose ambient declarations so imports type-check. Component types
// are `any`-shaped on purpose (matches how loosely play/ui's demos use them).
declare module "jui-ui-vue" {
    import type { Plugin } from "vue"
    export const Dropdown: any
    export const Tooltip: any
    export const Tab: any
    const plugin: Plugin
    export default plugin
}

declare module "jui-grid-vue" {
    import type { Plugin } from "vue"
    export const DataGrid: any
    export const VirtualGrid: any
    export const ColumnMenu: any
    export function rowsToCsv(...args: any[]): string
    export function downloadCsv(...args: any[]): void
    const plugin: Plugin
    export default plugin
}
