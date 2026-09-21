{
    setup() {
        const columns = [
            { key: 'name', label: 'Name' },
            { key: 'age', label: 'Age' },
            { key: 'location', label: 'Location' }
        ]

        const rows = [
            { id: 1, data: { name: "Hong", age: "20", location: "Ilsan" } },
            { id: 2, data: { name: "Jung", age: "30", location: "Seoul" } },
            { id: 3, data: { name: "Park", age: "10", location: "Dangjin" } }
        ]

        return { columns, rows }
    }
}