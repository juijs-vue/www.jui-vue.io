{
    setup() {
        const data = [
            { name: "Hong", age: "20", location: "Ilsan" },
            { name: "Jung", age: "30", location: "Seoul" },
            { name: "Park", age: "15", location: "Yeosu" },
            { name: "Kang", age: "32", location: "Seoul" },
            { name: "Song", age: "12", location: "Gwangju" },
            { name: "Yoon", age: "22", location: "Damyang" },
            { name: "Kim", age: "33", location: "Busan" },
            { name: "Hwang", age: "21", location: "Seoul" }
        ]

        const checkedRows = Vue.ref([]);

        function toggleRow(name) {
            const index = checkedRows.value.indexOf(name);
            if (index > -1) {
                checkedRows.value.splice(index, 1);
            } else {
                checkedRows.value.push(name);
            }
        }

        function showCheckedCount() {
            alert(checkedRows.value.length);
        }

        return { data, checkedRows, toggleRow, showCheckedCount }
    }
}
