{
    setup() {
        const checked = Vue.ref(false)

        function toggle() {
            checked.value = !checked.value
        }

        return { checked, toggle }
    }
}
