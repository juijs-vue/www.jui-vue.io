{
    setup() {
        // 원본은 콘텐츠 <div>가 실제로 1개뿐이라(accordion.js가 클릭한 title 뒤로 그 하나를
        // insertAfter로 옮기는 구조), 어떤 title을 열어도 같은 Property 패널이 그 자리로
        // 옮겨와서 보인다 - 세 패널 다 같은 내용을 보여주는 게 legacy 데모의 실제 동작이다.
        const accordionItems = Vue.reactive([
            { title: "Default Settings", contentClass: "has-property" },
            { title: "View Settings", contentClass: "has-property" },
            { title: "Data Server Settings", contentClass: "has-property" }
        ])

        const propertyItems = Vue.reactive([
            { type: "group", title: "Inner Property", description: "it can be nested property view " },
            { type: "checkbox", title: "Controls", key: "controls", value: true, description: "Display controls in the bottom right corner" },
            { type: "checkbox", title: "Progress", key: "progress", value: true, description: "Display a presentation progress bar" },
            { type: "checkbox", title: "Slide Number", key: "slideNumber", value: false, description: "Display the page number of the current slide" },
            { type: "checkbox", title: "History", key: "history", value: false, description: "Push each slide change to the browser history" },
            { type: "checkbox", title: "Keyboard", key: "keyboard", value: true, description: "Enable keyboard shortcuts for navigation" }
        ])

        const accordionOpen = Vue.ref(0)

        function onChange(item, newValue, oldValue) {
            console.log("item : ", item)
            console.log("all items", newValue)
        }

        return { accordionItems, propertyItems, accordionOpen, onChange }
    }
}
