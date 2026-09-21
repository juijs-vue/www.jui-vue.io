{
    setup() {
        const items = [
            { text: "Home", value: "home" },
            { text: "CSS", value: "css" },
            { text: "Script", value: "script" }
        ]
        const activeIndex = Vue.ref(2)

        function handleChange(data) {
            alert(data.item.text)
        }

        // 프로덕션(uiplay.jui.io/?p=tab_1)에는 chart.css의 "#tab_1 a { padding: 10px 25px; }"라는
        // 이 페이지 전용 데모 오버라이드가 있다(다른 tab_N 페이지엔 없음 - Tab 컴포넌트 자체의
        // 일반 규칙은 10px 15px 7px 15px 그대로다). 공유 컴포넌트를 건드리면 다른 모든 tab_N
        // 페이지가 깨지므로, 이 페이지에서만 <style> 엘리먼트를 직접 만들어 붙인다 - 템플릿
        // 문자열에 <style> 태그를 직접 넣으면 Vue 런타임 컴파일러가 그 노드를 통째로 버린다.
        Vue.onMounted(() => {
            const style = document.createElement("style")
            style.textContent = "#app .tab li > a { padding: 10px 25px; }"
            document.head.appendChild(style)
        })

        return { items, activeIndex, handleChange }
    }
}
