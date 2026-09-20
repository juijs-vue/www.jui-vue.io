{
    setup() {
        const items = [
            { title: "Group Item #1", value: "a", text: "First Accordion" },
            { title: "Group Item #2", value: "b", text: "Second Accordion" },
            { title: "Group Item #3", value: "c", text: "Three Accordion" }
        ]

        const open = Vue.ref([0])
        const icons = Vue.reactive(["icon-arrow3", "icon-arrow1", "icon-arrow1"])

        function onOpen(index) {
            icons[index] = "icon-arrow3"
        }

        function onFold(index) {
            icons[index] = "icon-arrow1"
        }

        function onInit() {
            console.log("accordian initialized.")
        }

        return { items, open, icons, onOpen, onFold, onInit }
    }
}
