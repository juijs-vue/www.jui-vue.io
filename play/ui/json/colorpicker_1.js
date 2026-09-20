{
    setup() {
        const color = Vue.ref("#DCDCDC")
        const visible = Vue.ref(false)

        function onColorChange(newColor) {
            // Optional: handle change event if needed
        }

        function show() {
            visible.value = true
        }

        function hide() {
            visible.value = false
        }

        return { color, visible, onColorChange, show, hide }
    }
}
