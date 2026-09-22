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

        // 원본(sort: ["name", 1, 2])은 Name/Age/Location 전부 정렬 가능하고, 처음 클릭은 desc부터
        // 시작해서 다시 클릭할 때마다 asc/desc를 토글한다(정렬 안 된 상태로는 안 돌아간다).
        const sortField = Vue.ref(null)
        const sortOrder = Vue.ref(null) // 'asc' | 'desc'

        function compare(a, b) {
            const na = Number(a)
            const nb = Number(b)
            if (a !== "" && b !== "" && !isNaN(na) && !isNaN(nb)) return na - nb
            return String(a).localeCompare(String(b))
        }

        function sortBy(field) {
            sortOrder.value = sortField.value === field && sortOrder.value === "desc" ? "asc" : "desc"
            sortField.value = field

            rows.sort((a, b) => {
                const cmp = compare(a.data[field], b.data[field])
                return sortOrder.value === "asc" ? cmp : -cmp
            })
        }

        return { rows, sortField, sortOrder, sortBy }
    }
}
