{
    setup() {
        const columns = [
            { key: 'name', label: 'Name' },
            { key: 'age', label: 'Age' }
        ];

        const rows = Vue.reactive([]);

        function handleFileChange(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const csv = event.target.result;
                const lines = csv.split('\n').filter(line => line.trim());

                rows.length = 0; // Clear existing rows
                lines.forEach((line, idx) => {
                    const parts = line.split(',').map(p => p.trim());
                    if (parts.length >= 2) {
                        rows.push({
                            id: idx + 1,
                            data: { name: parts[0], age: parts[1] }
                        });
                    }
                });
            };
            reader.readAsText(file);
        }

        return { columns, rows, handleFileChange };
    }
}