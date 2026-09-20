{
    setup() {
        const items = Vue.ref([
            { text: "Home", value: "home" },
            { text: "CSS", value: "css" },
            { text: "Script", value: "script" }
        ])
        const activeIndex = Vue.ref(0)

        function handleUpdateItems(newItems) {
            items.value = newItems
        }

        return { items, activeIndex, handleUpdateItems }
    }
}
