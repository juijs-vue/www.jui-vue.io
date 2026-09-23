import { createApp } from "vue"
import App from "./App.vue"
import { router } from "./router"
import "jui-ui-vue/style.css"
import "./styles/index.css"
import "./styles/responsive.css"

createApp(App).use(router).mount("#app")
