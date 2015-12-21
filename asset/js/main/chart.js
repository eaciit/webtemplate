viewModel.chart.template = {
	config: {
		chartArea: this.chartArea,
		dataSource: this.dataSource,
		legend: this.legend,
		seriesDefaults: this.seriesDefaults,
		series: [],
		valueAxis: this.valueAxis,
		valueAxes: [],
		categoryAxis: this.categoryAxis,
		categoryAxes: [],
		tooltip: this.tooltip
	},
	chartArea: {
		title: "",
		height: 400,
		width: 600
	},
	dataSource: {
		data: []
	},
	seriesDefaults: {
		type: "bar"
	},
	series: {
		field: ""
	},
	valueAxis: {
		max: 140000,
		line: {
			visible: false
		},
		minorGridLines: {
			visible: true
		},
		labels: {
			rotation: "auto"
		}
	},
	categoryAxis: {
		field: ""
	},
	tooltip: {
		visible: false
	}
};