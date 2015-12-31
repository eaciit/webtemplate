viewModel.designer.template = {
	config: {
		_id: "",
		datasources: []
	}
};

viewModel.designer.packery = {};
viewModel.designer.config = ko.mapping.fromJS(viewModel.designer.template.config);
viewModel.designer.prepare = function () {
	viewModel.designer.packery = new Packery($(".grid-container")[0], {
		itemSelector: '.grid-item',
		gutter: 0
	});
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
	$panel.find(".panel-title").html(title);
	$panel.find(".panel-body").html("Loading content ...");
	$panel.attr("data-panel-id", id);
	$panel.attr("data-ss-colspan", String(widthRatio));
	if (height != undefined) {
		$panel.height(height);
	}
	$panel.appendTo($(".grid-container"));

	viewModel.designer.packery.appended($panel.attr("style", "")[0]);
	// viewModel.designer.packery.bindDraggabillyEvents($panel.draggable()); // buggy!
	viewModel.designer.packery.layout();

	return $panel;
};
viewModel.designer.drawContent = function () {
	$(".grid-container").empty();

	ko.mapping.toJS(viewModel.designer.config).content.forEach(function (e) {
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

				$panel.height($panel.find(".panel").height());
				viewModel.designer.packery.layout();

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
	$wrapper.appendTo($content);

	var $chart = $("<div />").addClass('widget-content');
	$chart.appendTo($wrapper);

	var config = viewModel.chart.parseConfig(res, true);
	$chart.kendoChart(config);

	return config;
};
viewModel.designer.closePopoverDatasource = function () {
	$(".btn-datasource").trigger("click");
};
viewModel.designer.showPopoverDataSource = function (vm, o) {
	$(o.currentTarget).popover();
};
viewModel.designer.hideShow = function(e){
	var x_panel = $(e).closest('div.panel-custom'), button = x_panel.find('i.hideshow'),content = x_panel.find('div.panel-body');
    content.slideToggle(200);
	button.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
	if(button.hasClass('fa-chevron-up')){
        $(x_panel).animate({height:parseInt($(x_panel).attr('heightContent'))},200, function() {
            $(".grid-container").trigger("ss-rearrange");
        });
    } else {
        $(x_panel).animate({height:40},200, function() {
            $(".grid-container").trigger("ss-rearrange");
        });
    }
	x_panel.toggle
    setTimeout(function () {
        x_panel.resize();
    }, 50);
}

$(function () {
	viewModel.designer.prepare();
});