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

        // .dropdown은 CSS 기본값이 display:none이라(원본 ui.dropdown의 dd.show()/hide()가 이걸
        // 토글한다), position만 잡아주는 것만으로는 아예 안 보인다 - display도 같이 켜줘야 한다.
        function showMenu(event, row) {
            selectedRow.value = row;
            dropdownStyle.value = {
                display: 'block',
                position: 'fixed',
                left: event.clientX + 'px',
                top: event.clientY + 'px'
            };
        }

        function hideMenu() {
            dropdownStyle.value = {};
        }

        function selectMenuItem(text) {
            alert(text);
            hideMenu();
        }

        function onDocClick(e) {
            if (!e.target.closest('#table_6_dd')) hideMenu();
        }
        Vue.onMounted(() => document.addEventListener('click', onDocClick));
        Vue.onBeforeUnmount(() => document.removeEventListener('click', onDocClick));

        return { data, dropdownStyle, selectedRow, showMenu, selectMenuItem }
    }
}
