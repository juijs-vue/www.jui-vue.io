{
    setup() {
        const dd3 = Vue.ref(false)

        function onDd3Change(data) {
            alert(data.value + ", " + data.text)
        }

        return { dd3, onDd3Change }
    }
}
