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

        const dropdownStyle = Vue.ref({});
        const selectedRow = Vue.ref(null);

        function showMenu(event, row) {
            selectedRow.value = row;
            dropdownStyle.value = {
                position: 'fixed',
                left: event.clientX + 'px',
                top: event.clientY + 'px'
            };
        }

        function selectMenuItem(text) {
            alert(text);
            dropdownStyle.value = {};
        }

        return { data, dropdownStyle, selectedRow, showMenu, selectMenuItem }
    }
}
