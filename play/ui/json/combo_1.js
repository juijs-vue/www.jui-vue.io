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
        const combo1Ref = Vue.ref(null)
        const combo1Value = Vue.ref("3")

        function onCombo1Change(data) {
            alert("text(" + data.text + "), value(" + data.value + ")")
        }

        function combo1Run() {
            alert(combo1Ref.value.getText())
        }

        return { items, combo1Ref, combo1Value, onCombo1Change, combo1Run }
    }
}
