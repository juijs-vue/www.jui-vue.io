{
    setup() {
        const grid = Vue.ref(null);

        const columns = [
            { key: 'name', label: 'Name' },
            { key: 'age', label: 'Age' },
            { key: 'location', label: 'Location' }
        ];

        const rows = Vue.reactive([
            { id: 1, data: { name: "Hong", age: "20", location: "Ilsan" } },
            { id: 2, data: { name: "Jung", age: "30", location: "Seoul" } },
            { id: 3, data: { name: "Park", age: "15", location: "Yeosu" } },
            { id: 4, data: { name: "Kang", age: "32", location: "Seoul" } },
            { id: 5, data: { name: "Song", age: "12", location: "Gwangju" } },
            { id: 6, data: { name: "Yoon", age: "22", location: "Damyang" } },
            { id: 7, data: { name: "Kim", age: "33", location: "Busan" } },
            { id: 8, data: { name: "Hwang", age: "21", location: "Seoul" } }
        ]);

        function onRowMove(fromId, toId) {
            if (!confirm("Do you want to change the row position?")) {
                return;
            }

            const fromIndex = rows.findIndex((r) => r.id === fromId);
            const toIndex = rows.findIndex((r) => r.id === toId);
            if (fromIndex === -1 || toIndex === -1) return;

            const [moved] = rows.splice(fromIndex, 1);
            rows.splice(toIndex, 0, moved);

            console.log("Completed.");
        }

        return { grid, columns, rows, onRowMove };
    }
}
