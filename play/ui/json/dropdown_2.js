{
    setup() {
        const dd2 = Vue.ref(false)

        function onDd2Change(data) {
            alert(data.value + ", " + data.text)
        }

        return { dd2, onDd2Change }
    }
}
