{
    setup() {
        const grid = Vue.ref(null);

        const columns = [
            { key: 'index', label: 'Index', width: 200 },
            { key: 'name', label: 'Column. Name' },
            { key: 'age', label: 'Column. Age', width: 100 }
        ];

        const rows = Vue.reactive([]);

        function buildTreeRow(depth, currentDepth = 0) {
            if (currentDepth >= depth) return null;

            const id = Array(currentDepth + 1).fill(0).join('.');
            const row = {
                id: id,
                data: {
                    index: id,
                    name: "Hong" + currentDepth,
                    age: Math.floor(Math.random() * 100)
                },
                children: []
            };

            if (currentDepth < depth - 1) {
                const child = buildTreeRow(depth, currentDepth + 1);
                if (child) {
                    row.children.push(child);
                }
            }

            return row;
        }

        function submit(depth) {
            rows.length = 0;
            const rootRow = buildTreeRow(depth, 0);
            if (rootRow) {
                rows.push(rootRow);
            }
        }

        return { grid, columns, rows, submit };
    }
}