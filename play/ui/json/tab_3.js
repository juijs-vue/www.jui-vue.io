{
    setup() {
        // 이 컴포넌트로 붙는 탭은 자기만의 로컬 상태(count)를 갖는다 - 다른 탭 인스턴스와
        // 절대 공유되지 않는다(컴포넌트 인스턴스 자체가 탭마다 따로 생성되므로).
        const CounterPanel = {
            props: ["text"],
            setup(props) {
                const count = Vue.ref(0)
                function increment() {
                    count.value++
                }
                return { count, increment }
            },
            template: `
                <div>
                    <h3>{{ text }}</h3>
                    <p>이 탭은 자기만의 로컬 상태(count)를 가진 별도 컴포넌트다.</p>
                    <button class="btn small" @click="increment">Count: {{ count }}</button>
                </div>
            `
        }

        // 이 컴포넌트는 자기만의 v-model(note)을 갖는다 - 마찬가지로 탭마다 독립적이다.
        const NotePanel = {
            props: ["text"],
            setup() {
                const note = Vue.ref("")
                return { note }
            },
            template: `
                <div>
                    <h3>{{ text }}</h3>
                    <p>이 탭은 자기만의 v-model(note)을 가진 별도 컴포넌트다.</p>
                    <input class="input small" v-model="note" placeholder="메모 입력" />
                    <p>입력한 값: {{ note || "(없음)" }}</p>
                </div>
            `
        }

        // tab_1/tab_2처럼 미리 아는 정적 탭은 slot(#panel-{value})으로 붙인다 - content를
        // 안 주면 Tab.vue가 자동으로 슬롯 쪽으로 폴백한다.
        function makeSlotItem(text, value) {
            return { text, value }
        }

        // Append/Prepend/Insert로 "런타임에" 추가되는 탭은 매번 다른 컴포넌트를 붙일 수
        // 있다는 걸 보여준다 - 슬롯 하나를 재사용하는 게 아니라 진짜 서로 다른(그리고 각자
        // 독립된 로컬 상태를 갖는) 컴포넌트가 매번 새로 꽂힌다.
        function makeDynamicItem(text, value, component) {
            return { text, value, content: component, contentProps: { text } }
        }

        const items = Vue.ref([
            makeSlotItem("Tab1", "tab1"),
            makeSlotItem("Tab2", "tab2"),
            makeSlotItem("Tab3", "tab3")
        ])
        const activeIndex = Vue.ref(0)
        let count = 3
        const tabRef = Vue.ref(null)

        function handleAppend() {
            count += 1
            tabRef.value?.append(makeDynamicItem("Tab" + count, "tab" + count, CounterPanel))
        }

        function handlePrepend() {
            count += 1
            tabRef.value?.prepend(makeDynamicItem("Tab" + count, "tab" + count, NotePanel))
        }

        function handleInsert() {
            count += 1
            const component = count % 2 === 0 ? CounterPanel : NotePanel
            tabRef.value?.insert(2, makeDynamicItem("Tab" + count, "tab" + count, component))
        }

        function handleRemove() {
            tabRef.value?.remove(0)
        }

        function handleMove() {
            tabRef.value?.move(0, 2)
        }

        return { items, activeIndex, tabRef, handleAppend, handlePrepend, handleInsert, handleRemove, handleMove }
    }
}
