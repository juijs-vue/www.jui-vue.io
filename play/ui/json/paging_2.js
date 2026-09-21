{
    setup() {
        const grid = Vue.ref(null)
        const pagingRef = Vue.ref(null)
        const rows = Vue.ref([])

        const columns = [
            { key: 'name', label: 'Name', sortable: true, resizable: true },
            { key: 'age', label: 'Age', sortable: true, resizable: true },
            { key: 'location', label: 'Location', sortable: true, resizable: true }
        ]

        function submit() {
            const result = []
            for (let i = 0; i < 1000000; i++) {
                result.push({
                    id: i,
                    data: {
                        name: "Alvin" + i,
                        age: Math.floor(Math.random() * 100) + 1,
                        location: "LA"
                    }
                })
            }
            rows.value = result
            pagingRef.value?.reload(result.length)
        }

        function onPage(pNo) {
            grid.value?.goToPage(pNo)
        }

        function onSort() {
            pagingRef.value?.first()
        }

        return { grid, pagingRef, rows, columns, submit, onPage, onSort }
    }
}
