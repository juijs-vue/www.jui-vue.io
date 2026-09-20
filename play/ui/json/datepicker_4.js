{
    setup() {
        const selected = Vue.ref(null)

        function onSelect(formatted, date) {
            alert(formatted)
        }

        return { selected, onSelect }
    }
}
