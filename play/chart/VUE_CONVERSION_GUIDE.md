# play/chart example conversion guide (legacy jui.chart.builder -> jui-chart-vue's `<Chart>`)

## 현재 상태

`play/chart/json/<code>.js` 176개 중 **`brush_event.js`(기본으로 뜨는 "Set brush events" 데모)
딱 1개만** 새 아키텍처(`jui-chart-vue`의 `<Chart>` 컴포넌트, `jui-graph-ts` 엔진)로 전환되어
있다. 나머지 175개는 아직 레거시 `chart("#result", {...})` 함수 호출 형태 그대로다.

전환 안 된 데모들이 지금 당장 안 깨지는 이유: `templates/play/header.html`이 여전히
`lib/jui/js/chart.min.js`(진짜 레거시 jQuery 기반 엔진, `chart.builder` 모듈을 스스로 등록함)를
로드하고 있어서, `jui.include("chart.builder")`가 그 레거시 엔진으로 해석되기 때문이다.
`play/chart/chart.js`는 더 이상 `chart.builder`를 새 엔진으로 가로채는 shim을 두지 않는다(예전에
있었지만, `<Chart>` 태그를 직접 쓰는 지금 구조로 오면서 제거됨).

**부작용**: 전환 안 된 데모에서는 `window.currentChart`가 채워지지 않는다(`chart.js`의
`getCurrentBuilder()`가 `Vue.createApp(...).mount(...)`으로 마운트된 `<Chart ref="chartRef">`
인스턴스를 추적하는 방식인데, 레거시 `chart.builder()` 호출은 이 경로를 전혀 타지 않기 때문).
그래서 그 데모들은 **차트 자체는 정상 렌더링되지만 Style 탭이 빈 그리드로만 뜨고, CSV/Theme
export-import도 동작하지 않는다**(`createTableStyle()`의 null 체크로 에러 없이 조용히 무시됨).

## 해야 할 일

**목표**: 나머지 175개 `json/<code>.js`를 전부 `brush_event.js`와 같은 패턴으로 재작성해서, 모든
데모가 Style/CSV/Theme 탭까지 완전히 동작하게 만드는 것. 이게 끝나면 `header.html`에서
`lib/jui/js/chart.min.js` 스크립트 태그도 제거할 수 있다(더 이상 아무도 안 쓰게 되므로) -
`play/chart`가 jQuery/레거시 jui 엔진에서 완전히 독립하는 마지막 단계다.

## 참고 예시 (이미 전환됨 - 이 패턴을 그대로 따라 하면 됨)

`play/chart/json/brush_event.js`:
```js
var showEventMessage = function(obj) {
    alert("[" + obj.dataIndex + "] " +
        obj.dataKey + "=" + obj.data[obj.dataKey]);
}

Vue.createApp({
    data() {
        return {
            axis : [{
                x : { type : "block", domain : "quarter", line : true },
                y : { type : "range", domain : [ -40, 40 ], step : 10, line : true },
                data : [
                    { quarter : "1Q", sales : 50, profit : 35 },
                    { quarter : "2Q", sales : -20, profit : -30 },
                    { quarter : "3Q", sales : 10, profit : -5 },
                    { quarter : "4Q", sales : 30, profit : 25 }
                ]
            }],
            brush : [{ type : "column", target : [ "sales", "profit" ] }],
            event : {
                click : function(obj, e) { showEventMessage(obj); }
            }
        };
    },
    mounted() {
        // Events defined by the method
        this.$refs.chartRef.getBuilder().on("rclick", function(obj, e) {
            showEventMessage(obj);
        });
    },
    template: '<Chart ref="chartRef" :axis="axis" :brush="brush" :event="event" />'
}).mount("#result");
```

원본(레거시)이었던 형태:
```js
var chart = jui.include("chart.builder");
var c = chart("#result", {
    axis : [{ ... }],
    brush : [{ ... }],
    event : { click : function(obj, e) { ... } }
});
c.on("rclick", function(obj, e) { ... });
```

## 변환 규칙

1. **파일명 유지**: `json/<code>.js` 그대로, 내용만 재작성한다. `html/*.html` 같은 별도 파일은
   필요 없다(play/ui와 달리 play/chart는 Code 탭 하나에 Vue 코드 전체가 들어간다).
2. `var chart = jui.include("chart.builder"); chart("#result", {...})` → `Vue.createApp({
   data() { return { ...레거시 option 그대로... }; }, template: '<Chart ref="chartRef"
   :axis="axis" :brush="brush" :widget="widget" ... />' }).mount("#result")`. **axis/brush/widget/
   theme/style 값 자체는 레거시 원본 그대로 재사용**하면 된다 - `jui-graph-ts`가 이미 레거시
   config 형태(리터럴 `domain:[min,max]` 배열 포함)를 그대로 지원하므로 예전 세션에서 썼던
   우회(`domain`을 함수로 바꾸기, `min:0` 패치 등)는 필요 없다.
3. `<Chart>`에 실제로 쓰는 prop만 템플릿에 나열한다(`axis`/`brush`는 대부분 필수, `widget`/
   `theme`/`style`/`width`/`height`/`padding`/`canvas`는 데모가 쓸 때만). 전체 prop 목록은
   `~/juijs-vue/jui-chart-vue/src/Chart.vue`의 `defineProps` 참고.
4. **이벤트가 있는 데모**: 레거시 `event: {click: fn}` 옵션은 `<Chart :event="event">`로 그대로
   전달 가능(`Chart.vue`가 `Builder`의 `options.event`로 그대로 forward함). `c.on("rclick", fn)`
   같은 인스턴스 메서드 호출은 `mounted() { this.$refs.chartRef.getBuilder().on("rclick", fn); }`
   로 옮긴다(`ref="chartRef"` 필수).
5. **실시간(realtime) 데모**: 레거시는 `chart.axis(0).update(data)`, `chart.render()`,
   `chart.updateBrush(i, {...})`, `chart.updateWidget(i, {...})` 같은 인스턴스 메서드를
   `setInterval` 안에서 호출했다. 새 패턴에서는 **reactive 데이터를 직접 수정**하는 쪽이 Vue
   idiomatic하다 - `<Chart>`가 `axis`/`brush`/`widget` prop이 바뀌면 자동으로 다시 그리므로:
   ```js
   Vue.createApp({
       data() { return { axis: [...], brush: [...] }; },
       mounted() {
           this.timer = setInterval(() => {
               this.axis[0].data = getNewData(); // 배열/객체 교체 또는 in-place 수정 둘 다 reactive
           }, 1000);
       },
       beforeUnmount() { clearInterval(this.timer); },
       template: '<Chart :axis="axis" :brush="brush" />'
   }).mount("#result");
   ```
   데모 코드가 Code 탭 편집으로 재실행(`resetChart()` → 새 `Vue.createApp`)될 때 `chart.js`가
   이전 앱을 `unmount()`하므로, `setInterval`을 확실히 정리하려면 `beforeUnmount`에 `clearInterval`
   을 꼭 넣는다(안 넣으면 에디터에서 코드를 고칠 때마다 타이머가 쌓인다 - 레거시도 이 문제가
   있었는지는 별개로, 새 구조에서는 쉽게 막을 수 있으니 막는다).
   `chart.render()`(옵션 `render:false`로 만든 뒤 수동 렌더하는 패턴)는 새 구조에 대응 개념이
   없다 - `<Chart>`는 prop이 바뀌면 항상 다시 그리므로, `render:false` 옵션 자체를 넘기지 않아도
   된다.
6. **다중 축/브러시 대시보드 데모** (여러 `axis`/`brush`/`widget`이 배열로 들어있고 각 항목이
   `axis: N`으로 서로 참조하는 형태): 별도 처리 필요 없음 - `<Chart :axis :brush :widget>`에 그
   배열들을 그대로 넘기면 `Builder`가 레거시와 동일하게 퍼센트 기반 `area`/`padding` 배치,
   `extend` 상속을 전부 처리한다.
7. **여러 개의 `<Chart>`가 필요한 데모**(예: 좌우 비교 레이아웃, `#chart-left`/`#chart-right`
   같은 구조): `template`에 `<div class="row"><div class="col"><Chart :axis="axisLeft" .../></div>
   <div class="col"><Chart :axis="axisRight" .../></div></div>` 처럼 여러 `<Chart>`를 나란히
   쓰면 된다. 각 `<Chart>`에 별도 `ref`를 주면(`ref="leftRef"`/`ref="rightRef"`) `getCurrentBuilder()`
   가 마지막에 마운트된 하나만 추적한다는 점에 주의 - Style/CSV/Theme 탭은 어차피 데모 하나당
   "대표 차트" 하나만 대상으로 하므로, 이런 데모는 `ref="chartRef"`를 대표로 삼을 축에만 붙이면
   된다.

## 검증

1. `http://localhost:8090/play/chart/?p=<code>`로 열어서 콘솔 에러 없이 렌더링되는지 확인
   (Playwright, Node.js용 - `npm install playwright@1.63.0` 후 `require('playwright')`).
2. Style 탭을 열어서 테마 그리드가 뜨고, 값 편집이 실제로 차트에 반영되는지 확인.
3. 애매한 부분(정확한 픽셀 위치, 색상 등)은 실제 레거시 사이트 `http://chartplay.jui.io/?p=<code>`
   와 비교해서 판단.
4. 이벤트/실시간 데모는 실제로 클릭/일정 시간 대기해서 이벤트·업데이트가 동작하는지까지 확인.

## 전환 후 정리(마지막 데모까지 끝났을 때)

- `templates/play/header.html`에서 `<script src="../../lib/jui/js/chart.min.js">` 제거(다른
  play 페이지가 이 스크립트를 쓰지 않는지 먼저 확인 - header.html은 여러 play 섹션이 공유하는
  파일이다).
- `play/chart/chart.js`의 `createTableStyle()`에 있는 "아직 이관 안 된 데모는 빈 그리드로 방어"
  주석/분기(`if (chart == null) { ... return; }` 직전 부분)는 더 이상 필요 없어지지만, 굳이 지금
  당장 지울 필요는 없다 - null 체크 자체는 유효한 방어 코드로 남겨둬도 무해하다.
