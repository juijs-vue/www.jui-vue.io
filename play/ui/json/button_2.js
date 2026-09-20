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

        function runSetIndex() {
            selected.value = items[3].value
        }

        return { items, selected, runSetIndex }
    }
}
