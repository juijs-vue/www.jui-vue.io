{
    setup() {
        const from = Vue.ref(0.5)

        function format(d) {
            return d.toFixed(1)
        }

        return { from, format }
    }
}
