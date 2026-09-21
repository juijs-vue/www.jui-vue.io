{
    setup() {
        const grid = Vue.ref(null);

        const columns = [
            { key: 'index', label: 'Index', width: 200 },
            { key: 'name', label: 'Column. Name' },
            { key: 'age', label: 'Column. Age', width: 100 }
        ];

        const rows = Vue.reactive([
            { id: 1, data: { index: 1, name: "Hong", age: "20", location: "Ilsan" } },
            { id: 2, data: { index: 2, name: "Jung", age: "30", location: "Seoul" } },
            { id: 3, data: { index: 3, name: "Park", age: "15", location: "Yeosu" } },
            { id: 4, data: { index: 4, name: "Kang", age: "32", location: "Seoul" } },
            { id: 5, data: { index: 5, name: "Song", age: "12", location: "Gwangju" } },
            { id: 6, data: { index: 6, name: "Yoon", age: "22", location: "Damyang" } },
            { id: 7, data: { index: 7, name: "Kim", age: "33", location: "Busan" } },
            { id: 8, data: { index: 8, name: "Hwang", age: "21", location: "Seoul" } }
        ]);

        function onRowClick(row) {
            alert("index(" + row.id + "), name(" + row.data.name + ")");
        }

        function move(fromId, toId) {
            const fromIndex = rows.findIndex((r) => r.id === fromId);
            const toIndex = rows.findIndex((r) => r.id === toId);
            if (fromIndex === -1 || toIndex === -1) return;

            const [moved] = rows.splice(fromIndex, 1);
            rows.splice(toIndex, 0, moved);
        }

        function remove(id) {
            const index = rows.findIndex((r) => r.id === id);
            if (index !== -1) {
                rows.splice(index, 1);
            }
        }

        function update(id, data) {
            const row = rows.find((r) => r.id === id);
            if (row) {
                Object.assign(row.data, data);
            }
        }

        return { grid, columns, rows, onRowClick, move, remove, update };
    }
}
