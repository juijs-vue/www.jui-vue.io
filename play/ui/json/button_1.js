{
    setup() {
        const items = [
            { text: "On", value: "true" },
            { text: "Off", value: "false" }
        ]
        const selected = Vue.ref("false")

        function runGetValue() {
            alert(selected.value)
        }

        return { items, selected, runGetValue }
    }
}
