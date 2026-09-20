{
    setup() {
        const selected = Vue.ref(null)
        const minDate = new Date(new Date().setDate(new Date().getDate() - 5))
        const maxDate = new Date(new Date().setDate(new Date().getDate() + 5))

        function onSelect(formatted, date) {
            alert(formatted)
        }

        return { selected, minDate, maxDate, onSelect }
    }
}
