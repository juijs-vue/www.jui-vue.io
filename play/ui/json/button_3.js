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
        const group = Vue.ref(null)

        function runSetValue() {
            group.value?.setValue("gear")
        }

        function onChange({ value }) {
            const index = items.findIndex((item) => item.value === value)
            alert("index(" + index + "), value(" + value + ")")
        }

        return { items, selected, runSetValue, onChange, group }
    }
}
