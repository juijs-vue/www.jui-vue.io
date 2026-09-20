{
    setup() {
        const dd1 = Vue.ref(false)

        function onDd1Change(data) {
            alert(data.value + ", " + data.text)
        }

        return { dd1, onDd1Change }
    }
}
