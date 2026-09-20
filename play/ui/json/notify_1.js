{
    setup() {
        const notify1 = Vue.ref(null)
        const notify2 = Vue.ref(null)
        const notify3 = Vue.ref(null)

        function notifyTopSubmit(type, color) {
            const data = {
                title: "Caution message Send!!!",
                message: "Feb 15, 2013-12-24 02:24:19",
                color: color
            }

            const refs = { 1: notify1, 2: notify2, 3: notify3 }
            if (refs[type]?.value) {
                refs[type].value.add(data)
            }
        }

        return { notify1, notify2, notify3, notifyTopSubmit }
    }
}