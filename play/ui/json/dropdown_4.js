{
    setup() {
        const dd4 = Vue.ref(false)
        const dd4Items = Vue.ref([
            { value: 1, text: "text1" },
            { value: 2, text: "text2" },
            { value: 3, text: "text3" }
        ])

        function onDd4Change(data) {
            alert(data.value + ", " + data.text)
        }

        function dd4Update() {
            dd4Items.value = [
                { value: 4, text: "text4" },
                { value: 5, text: "text5" },
                { value: 6, text: "text6" }
            ]
        }

        return { dd4, dd4Items, onDd4Change, dd4Update }
    }
}
