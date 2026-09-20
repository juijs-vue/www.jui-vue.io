{
    setup() {
        const items = [
            { text: "Home", value: "home" },
            { text: "CSS", value: "css" },
            { text: "Script", value: "script" }
        ]
        const activeIndex = Vue.ref(2)

        function handleChange(data) {
            alert(data.item.text)
        }

        return { items, activeIndex, handleChange }
    }
}
