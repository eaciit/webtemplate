viewModel.designer.template = {
	config: {
		_id: "",
		datasources: []
	},
	panelConfig: {
		_id: "",
		title: "",
		width: 4
	}
};

viewModel.designer.packery = {};
viewModel.designer.config = ko.mapping.fromJS(viewModel.designer.template.config);
viewModel.designer.panelConfig = ko.mapping.fromJS(viewModel.designer.template.panelConfig);
viewModel.designer.prepare = function () {
	viewModel.designer.packery = new Packery($(".grid-container")[0], {
		itemSelector: '.grid-item',
		gutter: 0
	});
	viewModel.ajaxPost('/designer/getconfig', { _id: viewModel.header.PageID }, function (res) {
		ko.mapping.fromJS(res, viewModel.designer.config);
		viewModel.designer.drawContent();
	});

	var $popoverTemplate = $($("#template-popover").html());

	$('.btn-add-panel').popover({
		title: "Add new panel",
		width: 200,
		placement: "bottom",
		html: true,
		template: $popoverTemplate.clone().addClass("popover-panel")[0].outerHTML,
		content: $($("#template-content-popover-panel").html())[0].outerHTML
	});
	$(".btn-add-panel").on("shown.bs.popover", function (e) {
		var $popover = $(".popover-panel");

		ko.applyBindings(viewModel, $popover.find("form")[0]);
		ko.mapping.toJS(viewModel.designer.template.panelConfig, viewModel.designer.panelConfig);

		$popover.find("[name=title]").focus();
	});

	$('.btn-set-datasource').popover({
		title: "Choose datasources",
		width: 200,
		placement: "bottom",
		html: true,
		template: $popoverTemplate.clone().addClass("popover-datasource")[0].outerHTML,
		content: '<span class="loader">Loading data ...</span>'
	});
	$(".btn-set-datasource").on("shown.bs.popover", function (e) {
		var $popover = $(".popover-datasource");

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
			}, 200);
		});
	});
	$(".btn-add-panel,.btn-set-datasource").on("show.bs.popover", function (e) {
		$("body .popover-overlay").remove();
		$("<div class='popover-overlay'></div>").appendTo($("body"));
	});
	$("body").on("click", ".popover-overlay", function () {
		viewModel.designer.closePopover();
	});
};
viewModel.designer.createPanel = function () {
	var config = ko.mapping.toJS(viewModel.designer.panelConfig);
	var param = $.extend(true, {}, config);
	param._id = viewModel.header.PageID;

	viewModel.ajaxPost("/designer/addpanel", param, function (res) {
		var panelID = res;
		var $panel = viewModel.designer.putPanel(panelID, config.title, config.width, "prepend");
		$panel.height($panel.find(".panel").height());
		$panel.find(".panel-body").html('');
		viewModel.designer.packery.layout();
	});

	ko.mapping.fromJS(viewModel.designer.template.panelConfig, viewModel.designer.panelConfig);
	viewModel.designer.closePopover();
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
viewModel.designer.putPanel = function (id, title, widthRatio, mode) {
	mode = (mode == undefined ? "append" : mode);

	var content = $("#template-panel").html();
	var $panel = $(content);
	$panel.find(".panel-title").html(title);
	$panel.find(".panel-body").html("Loading content ...");
	$panel.attr("data-panel-id", id);
	$panel.attr("data-ss-colspan", String(widthRatio));

	if (mode == "append") {
		$panel.appendTo($(".grid-container"));
		viewModel.designer.packery.appended($panel.attr("style", "")[0]);
	} else {
		$panel.prependTo($(".grid-container"));
		viewModel.designer.packery.prepended($panel.attr("style", "")[0]);
	}

	// viewModel.designer.packery.bindDraggabillyEvents($panel.draggable()); // buggy!
	viewModel.designer.packery.layout();

	return $panel;
};
viewModel.designer.drawContent = function () {
	$(".grid-container").empty();

	ko.mapping.toJS(viewModel.designer.config).content.forEach(function (e) {
		var $panel = viewModel.designer.putPanel(e.panelID, e.title, e.width);
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
				} else {
					viewModel.designer.drawGrid(f, res, $content);
				}

				$panel.height($panel.find(".panel").height());
				viewModel.designer.packery.layout();

				viewModel.ajaxPost("/datasource/getdatasource", { _id: f.dataSource }, function (res2) {
					var $contentWidget = $("[data-widget-id='" + f.widgetID + "'] .widget-content");
					if (f.type == "chart") {
						$contentWidget.data("kendoChart").setDataSource(new kendo.data.DataSource({
							data: res2
						}));
					} else {
						res[0].dataSource.data = res2;
						$contentWidget.data("kendoGrid").setDataSource(new kendo.data.DataSource(res[0].dataSource));
					}
					$(viewModel.designer.packery.element).css('height',$(viewModel.designer.packery.element).height() + 20 + 'px');
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
	$wrapper.appendTo($content);

	var $chart = $("<div />").addClass('widget-content');
	$chart.appendTo($wrapper);

	var config = viewModel.chart.parseConfig(res, true);
	$chart.kendoChart(config);

	return config;
};
viewModel.designer.closePopover = function () {
	$("[id^=popover]").prev().trigger("click");
	$(".popover-overlay").remove();
};
viewModel.designer.drawGrid = function(f, res, $content) {
	var $wrapper = $("<div />");
	$wrapper.attr("data-widget-id", f.widgetID);
	$wrapper.addClass('widget widget-chart');
	$wrapper.css("width", '100%');
	$wrapper.appendTo($content);

	var $grid = $("<div />").addClass('widget-content');
	$grid.appendTo($wrapper);

	var confRun = res[0], columns = confRun.columns, newColumns = new Array();
	for (var key in columns){
		var column = {};
		$.each( columns[key], function( key, value ) {
			if(value !== '')
				column[key] = value;
		});
		newColumns.push(column);
	}
	confRun.columns = newColumns;
	console.log(confRun);
	$grid.kendoGrid(confRun);

	return confRun;
}
viewModel.designer.hideShow = function(e){
	var x_panel = $(e).closest('div.grid-item'), button = x_panel.find('i.hideshow'),content = x_panel.find('div.panel-body');
    content.slideToggle(200);
	button.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
	if(button.hasClass('fa-chevron-up')){
		$(x_panel).css('height',$(x_panel).attr('heightContent') + 'px');
    } else {
		$(x_panel).attr('heightContent',$(x_panel).height() + 20);
		$(x_panel).css('height','50px');
    }
	x_panel.toggle
    setTimeout(function () {
        x_panel.resize();
        viewModel.designer.packery.layout();
        $(viewModel.designer.packery.element).css('height',$(viewModel.designer.packery.element).height() + 100 + 'px');
    }, 50);
}

$(function () {
	viewModel.designer.prepare();
});