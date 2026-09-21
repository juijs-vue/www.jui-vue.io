{
    setup() {
        const { ref } = Vue

        const columns = [
            { key: 'name', label: 'Name', sortable: true, resizable: true },
            { key: 'age', label: 'Age', sortable: true, resizable: true },
            { key: 'location', label: 'Location', sortable: true, resizable: true }
        ]

        const rows = ref([])

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
            rows.value = result
        }

        return { columns, rows, onSubmit }
    }
}