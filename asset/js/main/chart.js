viewModel.chart.template = {
	config: {
		outsider: {
			dataSourceKey: "",
			widthMode: "numeric",
			heightMode: "numeric",
			valueAxisUseMaxMode: false,
			valueAxisUseMinMode: false,
		},
		chartArea: {
			title: "My Chart",
			height: 400,
			width: 700,
		},
		dataSource: {
			data: []
		},
		legend: {
			visible: true,
		},
		seriesDefaults: {
			type: "bar"
		},
		series: [],
		valueAxis: {
			max: 1,
			min: 0,
            line: {
                visible: true
            },
            minorGridLines: {
                visible: false
            },
            labels: {
                rotation: 0
            }
		},
		// valueAxes: [],
		categoryAxis: {
			field: ""
		},
		// categoryAxes: [],
		tooltip: {
			visible: false,
			template: ""
		}
	},
	series: {
		field: "",
		name: "",
		type: ""
	},
};
viewModel.chart.options = {
	seriesTypes: ko.observableArray(Lazy([
		// { value: "area", title: "area" },
		{ value: "bar", title: "bar" },
		// { value: "bubble", title: "bubble" },
		// { value: "bullet", title: "bullet" },
		// { value: "candlestick", title: "candlestick" },
		{ value: "column", title: "column" },
		{ value: "donut", title: "donut" },
		// { value: "funnel", title: "funnel" },
		// { value: "horizontalWaterfall", title: "horizontalWaterfall" },
		{ value: "line", title: "line" },
		// { value: "ohlc", title: "ohlc" },
		{ value: "pie", title: "pie" },
		// { value: "polarArea", title: "polarArea" },
		// { value: "polarLine", title: "polarLine" },
		// { value: "polarScatter", title: "polarScatter" },
		// { value: "radarArea", title: "radarArea" },
		// { value: "radarColumn", title: "radarColumn" },
		// { value: "radarLine", title: "radarLine" },
		// { value: "rangeBar", title: "rangeBar" },
		// { value: "rangeColumn", title: "rangeColumn" },
		// { value: "scatter", title: "scatter" },
		// { value: "scatterLine", title: "scatterLine" },
		// { value: "verticalArea", title: "verticalArea" },
		// { value: "verticalBullet", title: "verticalBullet" },
		// { value: "verticalLine", title: "verticalLine" },
		{ value: "waterfall", title: "waterfall" }
	]).sort(function (e) { 
		return e.title; 
	}).toArray()),
	dataSourceFields: ko.observableArray([])
};
viewModel.chart.config = ko.mapping.fromJS(viewModel.chart.template.config);
viewModel.chart.selectDataSource = function (e) {
	if (e == undefined) {
		viewModel.chart.config.dataSource.data([]);
		return;
	}

	var row = JSON.parse(kendo.stringify(this.dataItem(e.item)));
	console.log("fetching " + row.path);

	viewModel.ajaxPost("/template/getdatasource", row, function (res) {
		viewModel.chart.config.dataSource.data(res);

		var columnsHolder = [];
		var fields = [];

		Lazy(res).slice(0, 10).each(function (e) {
			for (var f in e) {
				if (e.hasOwnProperty(f) && columnsHolder.indexOf(f) == -1) {
					columnsHolder.push(f);
					fields.push({ 
						value: f, 
						title: viewModel.camelToCapitalize(f),
					});
				}
			}
		});

		viewModel.chart.options.dataSourceFields(Lazy(fields).sort(function (e) {
			return e.title
		}).toArray());
    });
};
viewModel.chart.percentageHandler = function (mode) {
	return ko.pureComputed({
	    read: function () {
	        return parseInt(String(viewModel.chart.config.chartArea[mode]()).replace(/%/g, ""), 10);
	    },
	    write: function (value) {
	    	viewModel.chart.config.chartArea[mode](value + "%");
	    },
	    owner: this
	});
};
viewModel.chart.changeAreaSizeMode = function (mode) {
	return function () {
		if (this.value() == 'percentage') {
			viewModel.chart.config.chartArea[mode]('100%');
		} else if (this.value() == 'numeric') {
			viewModel.chart.config.chartArea[mode](mode == 'width' ? 700 : 400);
		} else {
			viewModel.chart.config.chartArea[mode]('auto');
		}
	};
};
viewModel.chart.boolValueOf = function (which) {
	return ko.computed(function () {
		return eval('viewModel.chart.config.' + which + '()');
	}, viewModel);
};
viewModel.chart.fetchDataSource = function () {
	viewModel.ajaxPost("/template/getdatasources", {}, function (res) {
		viewModel.chart.dataSources(res);
    });
};
viewModel.chart.dataSources = ko.observableArray([]);
viewModel.chart.seriesGridColumns = [
	{ title: "Name", field: "name", /** locked: true */ width: 200 },
	{ title: "Field", field: "field", /** locked: true */ width: 200, editor: function (container, option) {
        var input = $("<select data-bind=\"value:" + option.field + "\"></select>");
        input.appendTo(container);
        input.kendoDropDownList({ 
        	dataSource: { data: viewModel.chart.options.dataSourceFields() }, 
        	dataTextField: "title", 
        	dataValueField: "value", 
        });
    } },
	{ title: "Type", field: "type", /** locked: true */ width: 200, editor: function (container, option) {
        var input = $("<select data-bind=\"value:" + option.field + "\"></select>");
        input.appendTo(container);
        input.kendoDropDownList({ 
        	dataSource: { data: viewModel.chart.options.seriesTypes() }, 
        	dataTextField: "title", 
        	dataValueField: "value", 
        });
    } },
	{ title: "", template: '<button class="btn btn-xs btn-danger" onclick="viewModel.chart.removeSeries(this)"> <span class="glyphicon glyphicon-remove"></span> Remove</button>', attributes: { style: "text-align: center;" }, width: 100, editable: false }
];
viewModel.chart.addSeries = function () {
	viewModel.chart.saveSeries();
	
	var data = JSON.parse(kendo.stringify($("#series .k-grid").data("kendoGrid").dataSource.data()));
	var nextIndex = data.length == 0 ? 1 : (Lazy(data).map(function (e) { return parseInt(e.name.split(" ")[1], 10); }).max() + 1);

	var serie = $.extend(true, viewModel.chart.template.series, { 
		name: "Series " + nextIndex,
		type: viewModel.chart.config.seriesDefaults.type()
	});
	viewModel.chart.config.series.push(serie);
};
viewModel.chart.removeSeries = function (o) {
	viewModel.chart.saveSeries();

	var uid = $(o).closest("tr").data("uid");
	var $grid = $(o).closest(".k-grid").data("kendoGrid");
	var dataSource = $grid.dataSource;
	var data = dataSource.data();
	var rowData = dataSource.getByUid(uid);
	var rowIndex = data.indexOf(rowData);

	if (rowIndex > -1) {
		data.splice(rowIndex, 1);
		var validData = JSON.parse(kendo.stringify(data));
		viewModel.chart.config.series(validData);
	}
};
viewModel.chart.saveSeries = function () {
	var data = JSON.parse(kendo.stringify($("#series .k-grid").data("kendoGrid").dataSource.data()));
	viewModel.chart.config.series(data);
};
viewModel.chart.save = function () {
	viewModel.chart.saveSeries();
};
viewModel.chart.registerEvents = function () {
	$('.chart-config-tabs a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		$("#chart-tab-content " + $(e.target).attr("href") + " .k-grid").each(function (i, f) {
			$(f).data("kendoGrid").refresh();
		});
	});
};
viewModel.chart.putNotifyToSelectDataSource = function () {
	$("#chart-tab-content .tab-pane").each(function (i, e)  {
		$($("#template-data-source-not-selected").html()).prependTo($(e));
		ko.applyBindings(viewModel, $(e).find(".panel-danger")[0]);
	});
};
viewModel.chart.parseConfig = function (config) {
	config = $.extend(true, {}, config);
	
	if (config.categoryAxis.template == "")
		delete config.categoryAxis.template;
	
	if (!config.outsider.valueAxisUseMaxMode)
		delete config.valueAxis.max;
	
	if (!config.outsider.valueAxisUseMinMode)
		delete config.valueAxis.min;

	console.log("config", config);

	return config;
}
viewModel.chart.preview = function () {
	viewModel.chart.saveSeries();
	$(".modal-chart-preview").modal("show");

	var chartConfig = viewModel.chart.parseConfig(ko.mapping.toJS(viewModel.chart.config));
	$(".chart-preview").replaceWith("<div class='chart-preview'></div>");
	$(".chart-preview").kendoChart(chartConfig);
};

$(function () {
	var c = viewModel.chart;
	c.fetchDataSource();
	c.addSeries();
	c.registerEvents();
	c.putNotifyToSelectDataSource();
});