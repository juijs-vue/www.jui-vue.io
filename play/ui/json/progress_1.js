{
    setup() {
        const value = Vue.ref(400)

        function runValue() {
            value.value = 700
        }

        return { value, runValue }
    }
}
