{
    setup() {
        const value = Vue.ref(400)

        function runValue() {
            value.value = 650
        }

        return { value, runValue }
    }
}
