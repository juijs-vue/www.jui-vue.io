{
    setup() {
        const items = [
            { value: "check", icon: "check" },
            { value: "plus", icon: "plus" },
            { value: "edit", icon: "edit" },
            { value: "home", icon: "home" },
            { value: "gear", icon: "gear" }
        ]
        const selected = Vue.ref(["plus", "edit"])

        function runSetValue() {
            selected.value = ["check", "edit"]
        }

        return { items, selected, runSetValue }
    }
}
