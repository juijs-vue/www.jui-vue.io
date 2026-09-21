{
    setup() {
        const items = [
            { text: "A", value: "a" },
            { text: "B", value: "b" },
            { text: "C", value: "c" },
            { text: "Home", value: "home", icon: "home" },
            { value: "gear", icon: "gear" },
            { value: "help", icon: "help" }
        ]
        const selected = Vue.ref("a")
        const group = Vue.ref(null)

        function runSetIndex() {
            group.value?.setIndex(3)
        }

        function onChange({ value }) {
            const index = items.findIndex((item) => item.value === value)
            alert("index(" + index + "), value(" + value + ")")
        }

        return { items, selected, runSetIndex, onChange, group }
    }
}
