{
    setup() {
        const from = Vue.ref(50)
        const to = Vue.ref(70)
        const info = Vue.ref("")
        const showInfo = Vue.ref(false)

        function onSliderChange(data) {
            info.value = data.from + "~" + data.to
            showInfo.value = true
        }

        return { from, to, info, showInfo, onSliderChange }
    }
}
