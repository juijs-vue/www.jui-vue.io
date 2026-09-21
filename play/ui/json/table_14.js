{
    setup() {
        const columns = [
            { key: 'name', label: 'Name', visible: true },
            { key: 'age', label: 'Age', visible: true },
            { key: 'location', label: 'Location', visible: false }
        ];

        const rows = Vue.reactive([
            { id: 1, data: { name: "Hong", age: "20", location: "Ilsan" } },
            { id: 2, data: { name: "Jung", age: "30", location: "Seoul" } },
            { id: 3, data: { name: "Park", age: "15", location: "Yeosu" } }
        ]);

        return { columns, rows };
    }
}
