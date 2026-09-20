{
    setup() {
        const daily = Vue.ref(null)
        const yearly = Vue.ref(null)

        function onSelect(formatted, date) {
            alert(formatted)
        }

        return { daily, yearly, onSelect }
    }
}
