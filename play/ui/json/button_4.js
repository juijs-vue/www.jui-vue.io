{
    setup() {
        const items = [
            { value: "check", icon: "check" },
            { value: "plus", icon: "plus" },
            { value: "edit", icon: "edit" },
            { value: "home", icon: "home" },
            { value: "gear", icon: "gear" }
        ]
        const selected = Vue.ref([])

        function runSetIndex() {
            selected.value = [items[3].value, items[4].value]
        }

        return { items, selected, runSetIndex }
    }
}
