{
    setup() {
        const LOREM = "The style components provide various options in addition to the basic functionality. In addition, script components can be added, which facilitate the development of more diverse UI components."

        const items = [
            { title: "Group Item #1", value: "a", text: LOREM },
            { title: "Group Item #2", value: "b", text: LOREM },
            { title: "Group Item #3", value: "c", text: LOREM }
        ]

        const open = Vue.ref(1)
        const icons = Vue.reactive(["icon-arrow1", "icon-arrow3", "icon-arrow1"])

        function onOpen(index) {
            icons[0] = "icon-arrow1"
            icons[1] = "icon-arrow1"
            icons[2] = "icon-arrow1"
            icons[index] = "icon-arrow3"
        }

        return { items, open, icons, onOpen }
    }
}
