{
    setup() {
        const rows = Vue.reactive([
            { id: 1, data: { name: "Hong", age: "20", location: "Ilsan" } },
            { id: 2, data: { name: "Jung", age: "30", location: "Seoul" } },
            { id: 3, data: { name: "Park", age: "15", location: "Yeosu" } },
            { id: 4, data: { name: "Kang", age: "32", location: "Seoul" } },
            { id: 5, data: { name: "Song", age: "12", location: "Gwangju" } },
            { id: 6, data: { name: "Yoon", age: "22", location: "Damyang" } },
            { id: 7, data: { name: "Kim", age: "33", location: "Busan" } },
            { id: 8, data: { name: "Hwang", age: "21", location: "Seoul" } }
        ])

        function removeRow() {
            // The legacy code calls table_11.remove(1) which removes the row at index 1
            if (rows.length > 1) {
                rows.splice(1, 1)
            }
        }

        return { rows, removeRow }
    }
}
