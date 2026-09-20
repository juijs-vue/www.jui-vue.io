{
    setup() {
        const page = Vue.ref(1)

        function onPage(pNo) {
            alert(pNo)
        }

        return { page, onPage }
    }
}
