{
    setup() {
        const items = [
            { text: "A", value: "a" },
            { text: "B", value: "b" },
            { text: "C", value: "c" },
            { value: "home", icon: "home", iconExtra: "icon-white" },
            { value: "gear", icon: "gear", iconExtra: "icon-white" },
            { value: "help", icon: "help", iconExtra: "icon-white" }
        ]
        const selected = Vue.ref("a")

        function runSetValue() {
            selected.value = "gear"
        }

        return { items, selected, runSetValue }
    }
}
