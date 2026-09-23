/// <reference types="vite/client" />

declare module "jui-ui-vue" {
    import type { DefineComponent } from "vue"
    export const Dropdown: DefineComponent<any, any, any>
    export const Tooltip: DefineComponent<any, any, any>
    const _default: Record<string, DefineComponent<any, any, any>>
    export default _default
}
