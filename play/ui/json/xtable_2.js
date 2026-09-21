{
    setup() {
        const { ref } = Vue

        const grid = ref(null)
        let page = 1

        const columns = [
            { key: 'name', label: 'Name', sortable: true, resizable: true },
            { key: 'age', label: 'Age', sortable: true, resizable: true },
            { key: 'location', label: 'Location', sortable: true, resizable: true }
        ]

        const rows = ref([])

        function onPage(no) {
            page += no
            page = (page < 1) ? 1 : page
            grid.value?.goToPage(page)
        }

        function onSubmit() {
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
            page = 1
            rows.value = result
        }

        return { columns, rows, onSubmit, onPage, grid }
    }
}