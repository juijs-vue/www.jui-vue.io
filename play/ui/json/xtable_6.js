{
    setup() {
        const { ref } = Vue

        const columns = [
            { key: 'name', label: 'Name' },
            { key: 'age', label: 'Age' },
            { key: 'location', label: 'Location' }
        ]

        const rows = ref([])

        function onRun() {
            const result = []
            for(let i = 0; i < 1000000; i++) {
                result.push({ id: i, data: { name: "Alvin" + i, age: Math.floor(Math.random() * 100) + 1, location: "LA" } })
            }
            rows.value = result
        }

        return { columns, rows, onRun }
    }
}
