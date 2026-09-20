{
    setup() {
        const LOREM = "The style components provide various options in addition to the basic functionality. In addition, script components can be added, which facilitate the development of more diverse UI components."

        const items = [
            { title: "Group Item #1", value: "a", text: LOREM },
            { title: "Group Item #2", value: "b", text: LOREM },
            { title: "Group Item #3", value: "c", text: LOREM }
        ]

        const open1 = Vue.ref(0)
        const open2 = Vue.ref(0)
        const open3 = Vue.ref(0)
        const open4 = Vue.ref(0)

        const icons1 = Vue.reactive(["icon-arrow3", "icon-arrow1", "icon-arrow1"])
        const icons2 = Vue.reactive(["icon-arrow3", "icon-arrow1", "icon-arrow1"])

        function onOpen1(index) {
            icons1[0] = "icon-arrow1"
            icons1[1] = "icon-arrow1"
            icons1[2] = "icon-arrow1"
            icons1[index] = "icon-arrow3"
        }

        function onOpen2(index) {
            icons2[0] = "icon-arrow1"
            icons2[1] = "icon-arrow1"
            icons2[2] = "icon-arrow1"
            icons2[index] = "icon-arrow3"
        }

        return { items, open1, open2, open3, open4, icons1, icons2, onOpen1, onOpen2 }
    }
}
