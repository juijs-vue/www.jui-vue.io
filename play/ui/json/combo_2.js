{
    setup() {
        const items = [
            { value: "1", text: "New" },
            { value: "2", text: "Open" },
            { value: "3", text: "Save" },
            { value: "4", text: "Close" },
            { value: "5", text: "Restart" },
            { divider: true },
            { value: "6", text: "Print" },
            { divider: true },
            { value: "7", text: "Exit" }
        ]
        const combo2Ref = Vue.ref(null)
        const combo2Value = Vue.ref(undefined)

        function onCombo2Change(data) {
            alert("text(" + data.text + "), value(" + data.value + ")")
        }

        function combo2Run() {
            combo2Ref.value.setIndex(1)
        }

        return { items, combo2Ref, combo2Value, onCombo2Change, combo2Run }
    }
}
