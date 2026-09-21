{
    setup() {
        const rows = Vue.reactive([
            { id: 1, data: { name: "Hong", age: "20", location: "Ilsan" } },
            { id: 2, data: { name: "Jung", age: "30", location: "Seoul" } },
            { id: 3, data: { name: "Park", age: "10", location: "Dangjin" } }
        ]);

        const expandedRows = Vue.ref([]);

        function toggleRow(id) {
            const index = expandedRows.value.indexOf(id);
            if (index > -1) {
                expandedRows.value.splice(index, 1);
            } else {
                expandedRows.value.push(id);
            }
        }

        function collapseRow(id) {
            const index = expandedRows.value.indexOf(id);
            if (index > -1) {
                expandedRows.value.splice(index, 1);
            }
        }

        function onSubmit(row) {
            collapseRow(row.id);
        }

        function onDelete(row) {
            const index = rows.findIndex(r => r.id === row.id);
            if (index !== -1) {
                rows.splice(index, 1);
            }
            collapseRow(row.id);
        }

        return { rows, expandedRows, toggleRow, collapseRow, onSubmit, onDelete }
    }
}
