{
    setup() {
        const items = Vue.ref([
            { text: "Tab1", value: "tab1" },
            { text: "Tab2", value: "tab2" },
            { text: "Tab3", value: "tab3" }
        ])
        const activeIndex = Vue.ref(0)
        let count = 3
        const contentText = Vue.ref("Tab1")
        const tabRef = Vue.ref(null)

        function handleChange(data) {
            contentText.value = data.item.text
        }

        function handleAppend() {
            count += 1
            tabRef.value?.append({ text: "Tab" + count, value: "tab" + count })
        }

        function handlePrepend() {
            count += 1
            tabRef.value?.prepend({ text: "Tab" + count, value: "tab" + count })
        }

        function handleInsert() {
            count += 1
            tabRef.value?.insert(2, { text: "Tab" + count, value: "tab" + count })
        }

        function handleRemove() {
            tabRef.value?.remove(0)
        }

        function handleMove() {
            tabRef.value?.move(0, 2)
        }

        return { items, activeIndex, contentText, tabRef, handleChange, handleAppend, handlePrepend, handleInsert, handleRemove, handleMove }
    }
}
