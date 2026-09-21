{
    setup() {
        const columns = [
            { key: 'name', label: 'Name' },
            { key: 'age', label: 'Age' },
            { key: 'location', label: 'Location' }
        ];

        const rows = Vue.reactive([
            { id: 1, data: { name: "Hong", age: "20", location: "Ilsan" } },
            { id: 2, data: { name: "Jung", age: "30", location: "Seoul" } },
            { id: 3, data: { name: "Park", age: "15", location: "Yeosu" } }
        ]);

        function submit() {
            const newRows = [];
            const nStart = new Date().getTime();

            for (let i = 0; i < 100; i++) {
                newRows.push({
                    id: rows.length + i + 1,
                    data: { name: `Alvin${i}`, age: i, location: "LA" }
                });
            }

            rows.splice(1, 0, ...newRows);
            const nEnd = new Date().getTime();

            alert(`Running time : ${nEnd - nStart}ms`);
        }

        return { columns, rows, submit };
    }
}