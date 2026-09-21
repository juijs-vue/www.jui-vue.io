{
    setup() {
        const columns = [
            { key: 'name', label: 'Column. Name' },
            { key: 'age', label: 'Column. Age' }
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

        function findRowByPath(rows, path) {
            const indices = path.split('.').map(p => parseInt(p, 10));
            let current = rows;

            for (let i = 0; i < indices.length; i++) {
                const idx = indices[i];
                if (i === indices.length - 1) {
                    // Last index - return the row or parent for insertion
                    return { parent: current, index: idx };
                }
                // Navigate to children
                if (idx < current.length) {
                    const row = current[idx];
                    if (!row.children) {
                        row.children = [];
                    }
                    current = row.children;
                } else {
                    return null;
                }
            }
            return null;
        }

        function insertAtPath(rows, path, data) {
            const result = findRowByPath(rows, path);
            if (!result) return;

            const newId = Math.max(...rows.flatMap(r => {
                const ids = [r.id];
                const collectIds = (children) => {
                    if (children) children.forEach(c => {
                        ids.push(c.id);
                        collectIds(c.children);
                    });
                };
                collectIds(r.children);
                return ids;
            })) + 1;

            const newRow = { id: `${newId}`, data };
            result.parent.splice(result.index, 0, newRow);
        }

        function appendToPath(rows, path, data) {
            const indices = path.split('.').map(p => parseInt(p, 10));
            let current = rows;

            for (let i = 0; i < indices.length; i++) {
                const idx = indices[i];
                if (i === indices.length - 1) {
                    // Found the parent - append to its children
                    if (idx < current.length) {
                        const row = current[idx];
                        if (!row.children) {
                            row.children = [];
                        }
                        const newId = `${row.id}-${row.children.length + 1}`;
                        row.children.push({ id: newId, data });
                    }
                    return;
                }
                if (idx < current.length) {
                    const row = current[idx];
                    if (!row.children) {
                        row.children = [];
                    }
                    current = row.children;
                }
            }
        }

        function submit() {
            appendToPath(rows, "1", { name: "Kang", age: "21", location: "Seoul" });
            appendToPath(rows, "1", { name: "Jung", age: "33", location: "Seoul" });
            insertAtPath(rows, "1.2", { name: "Park", age: "45", location: "Seoul" });
            insertAtPath(rows, "1.3", { name: "Hwang", age: "12", location: "Seoul" });
            appendToPath(rows, "1.2", { name: "Roo", age: "32", location: "Seoul" });
            appendToPath(rows, "1.2", { name: "Jung", age: "14", location: "Seoul" });
            appendToPath(rows, "3", { name: "Yoon", age: "17", location: "Seoul" });
            appendToPath(rows, "3", { name: "Kim", age: "21", location: "Seoul" });
            appendToPath(rows, "3", { name: "Kim", age: "28", location: "Seoul" });
        }

        function onRowClick(row) {
            alert(`index(${row.id}), name(${row.data.name})`);
        }

        return { columns, rows, submit, onRowClick };
    }
}