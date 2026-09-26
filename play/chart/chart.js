var editor;
var comments;
var notify;
var table_2, colors_win, colors_table, color_pick;
var chart_1, chart_2, chart_3, tab_1;
var realtimeIndex = 0;
var realtimeInterval = null;

// jui-chart-vue 기반 신규 엔진 연동: 데모 코드(json/*.js)는 이제 레거시 `chart.builder(selector,
// options)` 함수 호출이 아니라, 실제 Vue 앱을 만들고 <Chart> 컴포넌트를 템플릿에 쓰는 형태다
// (`Vue.createApp({ data(){...}, template:'<Chart ref="chartRef" :axis="axis" ... />' }).mount("#result")`).
// `Vue.createApp`을 감싸서 (1) "Chart" 컴포넌트를 앱마다 자동 등록해주고(데모 코드에서
// app.component(...)를 반복할 필요 없게), (2) 마지막으로 mount된 앱/루트 인스턴스를 추적해서
// Data/Style 탭과 테마 드롭다운이 접근할 수 있게 한다. 템플릿에 ref="chartRef"를 쓴 데모는
// getCurrentBuilder()로 실제 jui-graph-ts Builder 인스턴스(axis()/render()/theme()/setTheme() 등
// 레거시와 동일한 시그니처)에 접근할 수 있다.
var currentApp = null;
var currentVM = null;

(function() {
    var origCreateApp = Vue.createApp;

    Vue.createApp = function(options) {
        var app = origCreateApp(options);
        app.component("Chart", JuiChartVue.Chart);

        var origMount = app.mount.bind(app);
        app.mount = function(selector) {
            var vm = origMount(selector);
            currentApp = app;
            currentVM = vm;
            return vm;
        };

        return app;
    };
})();

function getCurrentBuilder() {
    var ref = currentVM && currentVM.$refs && currentVM.$refs.chartRef;
    return ref ? ref.getBuilder() : null;
}

function getTodayData() {
    var start = new Date(2014, 10, 7),
        end = time.add(start, time.hours, 23);

    var data = [],
        value = 240;

    for(var i = 0; i < 60 * 23; i++) {
        if(value < 60 * 8) {
            value += 1;
        }

        data.push({ time: time.add(start, time.minutes, i), value: value })
    }

    return {
        start: start,
        end: end,
        data: data
    };
}

function getRealtimeData(min) {
    var start = time.add(new Date(), time.minutes, -5),
        data = [];

    for(var i = 0; i < min * 60; i++) {
        data.push(getRealtimeRowData(time.add(start, time.seconds, i + 1)));

        realtimeIndex++;
    }

    return data;
}

function runRealtimeData(realtime) {
    if(realtimeInterval != null) {
        clearInterval(realtimeInterval);
    }

    realtimeInterval = setInterval(function() {
        realtime.append(getRealtimeRowData(new Date()));

        realtimeIndex++;
    }, 1000);
}

function changeTheme(value) {
	var name = !value ? $("select").find("option:selected").val() : value,
		chart = getCurrentBuilder();

    if(chart == null) return;

    if(name != null) {
        if (typeof(chart.options.theme) != "object") {
            chart.setTheme(name);
        }

        if (table_2 != null) {
            createTableStyle();
        }
    } else {
        notify.add({
            title: getChartKey(),
            message: "The theme does not exist.",
            color: "warning"
        });

        $("select").find("option:first-child")[0].selected = true;
    }
}

function createTableStyle() {
    if(jui.include("util.base").browser.msie) return;

    var themes = window.currentChart.theme();

    table_2 = jui.create("grid.table", "#table_2", {
        fields: [ "key", "value" ],
        editRow: [ 1 ],
        resize: true,
        event: {
            editstart: function(row, e) {
                if(row.data.key == "colors") {
                    colors_win.show();

                    var list = row.data.value.split("|"),
                        data = [];

                    for(var i = 0; i < list.length; i++) {
                        data.push({ color: list[i] });
                    }

                    colors_table.update(data);

                    // 윈도우 닫기 버튼에 저장 이벤트 설정
                    $(colors_win.root).find(".close").off("click").on("click", function(e2) {
                        var newList = colors_table.listData(),
                            newData = [];

                        for(var i = 0; i < newList.length; i++) {
                            newData.push(newList[i].color);
                        }

                        // 데이터 갱신 및 포커스
                        $(e.target).find(".edit").val(newData.join("|")).focus();

                        colors_win.hide();
                        colors_table.reset();

                        return false;
                    });
                } else if(row.data.key.indexOf("Color") != -1) {
                    showTableColorPick(row, e);
                }
            },
            editend: function(row, e) {
                var chart = window.currentChart,
                    theme = chart.theme(),
                    data = row.data;

                if(data.key == "colors") {
                    theme[data.key] = data.value.split("|");
                } else {
                    theme[data.key] = data.value;
                }

                chart.setTheme(theme);

                // 로컬 스토리지에 저장
                localStorage.setItem("jui.chartplay.theme." + getChartKey(), getDataToObject());

                // 컬러 픽커 숨기기
                $(color_pick.root).hide();
            }
        },
        tpl: {
            row: $("#tpl_table_2").html()
        }
    });

    // 테이블 초기화
    table_2.reset();

    for(var key in themes) {
        if(key == "colors") {
            table_2.append({ key: key, value: themes[key].join("|") });
        } else {
            table_2.append({ key: key, value: themes[key] });
        }
    }
}

function createTab() {
    if(jui.include("util.base").browser.msie) return;

    tab_1 = jui.create("ui.tab", "#tab_1", {
        event: {
            change: function(data) {
                if(data.index == 0) {
                    $("#save_btn").show();
                    $(".tools").find(".theme").hide();
                } else if(data.index == 1) {
                    createTableStyle();

                    $("#save_btn").hide();
                    $(".tools").find(".theme").css("display", "inline-block");
                }
            }
        },
        target: "#tab_contents_1",
        index: 0
    });
}

function resetChart() {
    if (currentApp) {
        currentApp.unmount();
    }

    currentApp = null;
    currentVM = null;
}

function viewCodeEditor(code) {
    if (!editor) {
        editor = CodeMirror.fromTextArea($("#chart-code-text")[0], {
            mode: "javascript",
            lineNumbers: true,
            styleActiveLine: true,
            matchBrackets: true,
            theme : "neo"
        });

        editor.setOption("extraKeys", {
            "Ctrl-S": function(cm) {
                $("#save_btn").trigger("click");
            }
        });

        editor.on("change", function(cm) {
            try {
                resetChart();
                $("#result").empty();

                $.globalEval(cm.getValue());

                window.currentChart = getCurrentBuilder();

				// 현재 테마 적용
				changeTheme();
            } catch(e) {
                console.log(e);
            }
        });

		if(code != null) {
			var cache = localStorage.getItem("jui.chartplay.code." + getChartKey());
			editor.setValue(cache || code);
		}
    }

    // 현재 샘플의 테마가 저장되어 있는지 체크
    var theme = localStorage.getItem("jui.chartplay.theme." + getChartKey());

    if(theme == null) {
        jui.redefine("chart.theme.custom", [], function () { return null; });
    } else {
        eval(theme);
        $("select").find("option:last-child")[0].selected = true;
    }

	changeTheme();
}

function setFunctions() {
    var $el = $(".btn-fullscreen");

    $el.on('click', function() {
        var $el = $(".chart_view");

        if ($el.hasClass("fullscreen")) {
            $el.removeClass("fullscreen").animate({ left : "45%" }, viewCodeEditor);
        } else {
            $el.addClass("fullscreen").animate({ left : "0%" }, viewCodeEditor);
        }
    });

    $(".btn-style").on("click", function() {
        if(table_2 != null) {
            var rows = table_2.list(),
                data = [];

            for(var i = 0; i < rows.length; i++) {
                var val = rows[i].data.value;

                if(typeof(val) == "string") {
                    data.push(rows[i].data.key + " : \"" + val + "\"");
                } else {
                    data.push(rows[i].data.key + " : " + val);
                }
            }

            table_2.downloadCsv("jui_style");
        } else {
            alert("Style data is not loaded.");
        }
    });

    $(".btn-image").on("click", function() {
        var chart = window.currentChart;
        chart.svg.download("jui_image");
    });
}

function exportTextFile(name, text) {
    var $form = $("<form action='export.php' method='POST' target='_blank'></form>"),
        $name = $("<input type='hidden' name='filename'/>"),
        $text = $("<input type='hidden' name='filetext'/>");

    $name.val(name);
    $text.val(text);
    $form.append($name);
    $form.append($text);
    $("body").append($form);

    $form.submit();
    $form.remove();
}

function getDataToObject() {
    var data = table_2.listData();

    var head = [
            "jui.redefine('chart.theme.custom', [], function() {",
            "\treturn {\n",
        ],
        foot = [
            "\n\t};",
            "});"
        ],
        body = [];

    for(var i = 0; i < data.length; i++) {
        var d = data[i],
            r = '\t\t' + d.key + ' : ';

        if(d.key == "colors") {
            var colors = d.value.split("|");

            for(var j = 0; j < colors.length; j++) {
                colors[j] = '"' + colors[j] + '"';
            }

            r += '[' + colors.join(",") + ']';
        } else {
            if(typeof(d.value) == "string") {
                r += '"' + d.value + '"';
            } else {
                r += d.value;
            }
        }

        body.push(r);
    }

    return head.join("\n") + body.join(",\n") + foot.join("\n");
}

function showTableColorPick(row, e) {
    var $edit = $(e.target).find(".edit"),
        offset = $edit.offset();

    $(color_pick.root).css({
        left: offset.left,
        top: offset.top + 22
    }).show();

    color_pick.setColor($edit.val());
    color_pick.off("change");
    color_pick.on("change", function(color) {
        $edit.val(color);
    });
}

jui.ready([ "util.base", "ui.window", "ui.notify", "grid.table", "ui.colorpicker" ],
    function(_, uiWin, uiNotify, gridTable, uiColor) {
    setFunctions();
    createTab();

    notify = uiNotify("body", {
        position: "top-right",
        timeout: 3000,
        tpl: {
            item: $("#tpl_alarm").html()
        }
    });

    // 댓글 모달 윈도우
    comments = uiWin("#comments", {
        width: "90%",
        height: "90%",
        modal: true
    });

    // 컬러 변경 윈도우
    colors_win = uiWin("#colors_win", {
        width: 400,
        height: 400,
        modal: true
    });

    colors_table = gridTable("#colors_table", {
        fields: [ "color" ],
        editRow: [ 0 ],
        tpl: {
            row: "<tr><td style='background: <!= color !>'><!= color !></td></tr>"
        },
        event: {
            editstart: showTableColorPick,
            editend: function(row, e) {
                $(color_pick.root).hide();
            }
        }
    });

    color_pick = uiColor("#color_pick");
    $(color_pick.root).hide();

    // IE일 경우, 탭 제거
    if(_.browser.msie) {
        $("#tab_1").hide();
        $("#table_2").hide();
    }

    // 모바일 버전 이벤트
    $("#sidemenu").on("mousedown", function(e) {
        if($("body").hasClass("menu-open")) {
            $("body").removeClass("menu-open");
        } else {
            $("body").addClass("menu-open");
        }
    });

    // Theme 내보내기
    $("#export_theme_btn").on("click", function (e) {
        var code = getChartKey(),
            js = getDataToObject();

        exportTextFile(code.split(".").join("_") + ".js", js);

        // 로컬 스토리지에 저장
        localStorage.setItem("jui.chartplay.theme." + code, js);
    });

    // THEME 가져오기
    $("#import_theme_input").on("change", function (e) {
        var reader = new FileReader();

        reader.onload = function(readerEvt) {
            var result = readerEvt.target.result;

            localStorage.setItem("jui.chartplay.theme." + getChartKey(), result);
            eval(result);

            window.currentChart.setTheme(jui.include("chart.theme.custom"));
            createTableStyle();

            $("#import_theme_input").val("");
        };

        reader.readAsText(e.target.files[0]);
    });

    // CODE 저장하기
    $("#save_btn").on("click", function (e) {
		var code = getChartKey();

        localStorage.setItem("jui.chartplay.code." + code, editor.getValue());

        notify.add({
            title: code,
            message: "The source code has been saved.",
            color: "danger"
        });
    });

    $("#clear_btn").on("click", function (e) {
        if(confirm("Clear the code and data cache?")) {
            var code = getChartKey();

            localStorage.removeItem("jui.chartplay.code." + code);
            location.reload();
        }
    });

    $("#clear_all_btn").on("click", function (e) {
        if(confirm("Clear all code and data cache?")) {
            localStorage.clear();
            location.reload();
        }
    });
});
