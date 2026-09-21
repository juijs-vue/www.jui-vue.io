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

        function appendRows() {
            const nStart = new Date().getTime()
            let nextId = Math.max(...rows.map(r => r.id)) + 1

            for (let i = 0; i < 1000; i++) {
                rows.push({
                    id: nextId++,
                    data: { name: "Alvin" + i, age: i, location: "LA" }
                })
            }

            const nEnd = new Date().getTime()
            alert("Running time : " + (nEnd - nStart) + "ms")
        }

        return { rows, appendRows }
    }
}
