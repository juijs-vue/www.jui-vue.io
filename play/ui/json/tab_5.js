{
    setup() {
        const items = [
            { text: "CSS", value: "css" },
            { text: "Script", value: "script" }
        ]
        const activeIndex = Vue.ref(1)
        const menu = [
            { text: "Dropdown 1", value: "1" },
            { divider: true },
            { text: "Dropdown 2", value: "2" },
            { text: "Dropdown 3", value: "3" },
            { text: "Dropdown 4", value: "4" }
        ]

        function handleChangeMenu(data) {
            alert(data.text)
        }

        return { items, activeIndex, menu, handleChangeMenu }
    }
}
