{
    setup() {
        const notify4 = Vue.ref(null)
        const notify5 = Vue.ref(null)
        const notify6 = Vue.ref(null)

        function notifyBottomSubmit(type, color) {
            const data = {
                title: "Caution message Send!!!",
                message: "Feb 15, 2013-12-24 02:24:19",
                color: color
            }

            const refs = { 4: notify4, 5: notify5, 6: notify6 }
            if (refs[type]?.value) {
                refs[type].value.add(data)
            }
        }

        return { notify4, notify5, notify6, notifyBottomSubmit }
    }
}