{
    setup() {
        const notifyRef = Vue.ref(null)

        function addNotification(color) {
            if (notifyRef.value) {
                notifyRef.value.add({
                    title: "Notification message!!!",
                    message: "Feb 15, 2013-12-24 02:24:19",
                    color: color
                })
            }
        }

        return { notifyRef, addNotification }
    }
}
