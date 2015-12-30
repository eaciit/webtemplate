viewModel.designer.template = {
	config: {
		_id: "",
		datasources: []
	}
};

viewModel.designer.config = ko.mapping.fromJS(viewModel.designer.template.config);
viewModel.designer.prepare = function () {
	viewModel.ajaxPost('/designer/getconfig', { _id: viewModel.header.PageID }, function (res) {
		ko.mapping.fromJS(res, viewModel.designer.config);
		viewModel.designer.drawContent();
	});
	$('.btn-datasource').popover({
		title: "Choose datasources",
		width: 200,
		placement: "bottom",
		html: true,
		template: $("#template-popover-datasource").html(),
		content: '<span class="loader">Loading data ...</span>'
	});
	$(".btn-datasource").on("shown.bs.popover", function (e) {
		var $popover = $(".popover-datasource");

		if ($popover.hasClass("bindings-applied")) {
			return;
		}

		viewModel.ajaxPost('/datasource/getdatasources', { }, function (res) {
			setTimeout(function () {
				$popover.find(".popover-content").html("<ul></ul>");
				var $container = $popover.find(".popover-content ul");

				res.forEach(function (e) {
					var checked = "";

					Lazy(viewModel.designer.config.datasources()).sort().toArray().forEach(function (f) {
						if (e._id == f) {
							checked = "checked";
						}
					});

					var $each = $('<li> <input onclick="viewModel.designer.changeSelectedDatasource(this)" type="checkbox" name="' + e._id + '" ' + checked + ' /> <span>' + e.title + '</span> </li>');
					$each.appendTo($container);
				});

				$("<div class='pull-right'><button onclick='viewModel.designer.closePopoverDatasource()' class='btn btn-sm btn-danger'><span class='glyphicon glyphicon-remove'></span> Close</button></div>").appendTo($container.parent());
			}, 200);
		});
	});
};
viewModel.designer.addPanel = function () {

};
viewModel.designer.changeSelectedDatasource = function (o) {
	var selectedDatasources = [];

	$(o).closest("ul").find("input[type='checkbox']:checked").each (function (i, e) {
		selectedDatasources.push(e.name);
	});

	var param = { 
		_id: viewModel.designer.config._id(), 
		datasources: selectedDatasources.join(",") 
	};
	viewModel.ajaxPost("designer/setdatasource", param, function (res) {

	});
};
viewModel.designer.addPanel = function (id, title, widthRatio, height) {
	var content = $("#template-panel").html();
	var $panel = $(content);
	$panel.appendTo($(".grid-container"));
	$panel.find(".panel-title").html(title);
	$panel.find(".panel-body").html("Loading content ...");
	$panel.attr("data-panel-id", id);
	$panel.attr("data-ss-colspan", String(widthRatio));
	if (height != undefined)
		$panel.height(height);

	$(".grid-container").shapeshift({
		gutterX: 0
	});

	return $panel;
};
viewModel.designer.drawContent = function () {
	$(".grid-container").empty();
	ko.mapping.toJS(viewModel.designer.config).content.slice(0,2).forEach(function (e) {
		var $panel = viewModel.designer.addPanel(e.panelID, e.title, e.width);
		e.target = $panel[0];
		var $content = $panel.find(".panel-body");

		if (typeof e.content == "string") {
			$content.html(e.content);
			return;
		}

		$content.empty();

		e.content.forEach(function (f) {
			viewModel.ajaxPost("/designer/getwidget", f, function (res) {
				if (f.type == "chart") {
					viewModel.designer.drawChart(f, res, $content);
				}

				viewModel.ajaxPost("/datasource/getdatasource", { _id: f.dataSource }, function (res2) {
					if (f.type == "chart") {
						$("[data-widget-id='" + f.widgetID + "'] .widget-content").data("kendoChart").setDataSource(new kendo.data.DataSource({
							data: res2
						}));
					}
				});
			});
		});
	});
};
viewModel.designer.drawChart = function (f, res, $content) {
	var $wrapper = $("<div />");
	$wrapper.attr("data-widget-id", f.widgetID);
	$wrapper.addClass('widget widget-chart');
	$wrapper.css("width", '100%');
	$wrapper.css("height", '400px');
	$wrapper.appendTo($content);

	var $chart = $("<div />").addClass('widget-content');
	$chart.appendTo($wrapper);

	var config = viewModel.chart.parseConfig(res, true);
	$chart.kendoChart(config);

	$(".grid-container").shapeshift({
		gutterX: 0
	});

	return config;
};
viewModel.designer.closePopoverDatasource = function () {
	$(".btn-datasource").trigger("click");
};
viewModel.designer.showPopoverDataSource = function (vm, o) {
	$(o.currentTarget).popover();
};

$(function () {
	viewModel.designer.prepare();
	// viewModel.designer.addPanel("Panel 1", 4);
	// viewModel.designer.addPanel("Panel 2", 6);
	// viewModel.designer.addPanel("Panel 3", 10);
});