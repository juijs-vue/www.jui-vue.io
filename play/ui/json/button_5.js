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
        const group = Vue.ref(null)

        function runSetValue() {
            group.value?.setValue(["check", "edit"])
        }

        function onChange({ value }) {
            let result = ""
            for (const v of value) {
                const index = items.findIndex((item) => item.value === v)
                result += "index(" + index + "), value(" + v + ")" + "\n"
            }
            alert(result)
        }

        return { items, selected, runSetValue, onChange, group }
    }
}
