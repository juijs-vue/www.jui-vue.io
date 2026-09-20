{
    setup() {
        const items1 = [
            { text: "Home", value: "home", disabled: false },
            { text: "CSS", value: "css" },
            { text: "Script", value: "script" },
            { text: "Menu", value: "menu" }
        ]
        const items2 = [
            { text: "Home", value: "home", disabled: false },
            { text: "CSS", value: "css" },
            { text: "Script", value: "script" },
            { text: "Menu", value: "menu" }
        ]
        const items3 = [
            { text: "Home", value: "home", disabled: false },
            { text: "CSS", value: "css" },
            { text: "Script", value: "script" },
            { text: "Menu", value: "menu" }
        ]
        const items4 = [
            { text: "Home", value: "home", disabled: false },
            { text: "CSS", value: "css" },
            { text: "Script", value: "script" },
            { text: "Menu", value: "menu" }
        ]
        const items5 = [
            { text: "Home", value: "home", disabled: false },
            { text: "CSS", value: "css" },
            { text: "Script", value: "script" },
            { text: "Menu", value: "menu" }
        ]

        const active1 = Vue.ref(0)
        const active2 = Vue.ref(0)
        const active3 = Vue.ref(0)
        const active4 = Vue.ref(0)
        const active5 = Vue.ref(0)

        return { items1, items2, items3, items4, items5, active1, active2, active3, active4, active5 }
    }
}
