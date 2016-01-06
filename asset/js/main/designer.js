viewModel.designer.template = {
	config: {
		_id: "",
		datasources: [],
		content: [],
	},
	panelConfig: {
		_id: "",
		title: "",
		width: 12,
		offset: 0,
		hide:false,
	},
	widgetConfig: {
		panelWidgetID: "",
		panelID: "",
		title: "",
		type: "chart",
		widgetID: "",
		width: 100,
		height: 400,
		dataSource: ""
	}
};
viewModel.designer.packery = {};
viewModel.designer.href = ko.observable('/');
viewModel.designer.config = ko.mapping.fromJS(viewModel.designer.template.config);
viewModel.designer.panelConfig = ko.mapping.fromJS(viewModel.designer.template.panelConfig);
viewModel.designer.widgetConfig = ko.mapping.fromJS(viewModel.designer.template.widgetConfig);
viewModel.designer.optionPanelWidth = ko.observableArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].reverse());
viewModel.designer.optionWidgetType = ko.observableArray([
	{ title: "Chart", value: "chart"},
	{ title: "Grid", value: "grid"},
]);
viewModel.designer.optionWidgetID = ko.observableArray([]);
viewModel.designer.optionDataSources = ko.observableArray([]);
viewModel.designer.optionPanelID = ko.computed(function () {
	return Lazy(ko.mapping.toJS(viewModel.designer.config).content.slice()).map(function (e) {
		return {
			title: e.title + " (" + e.panelID + ")",
			value: e.panelID
		};
	}).toArray();
});
viewModel.designer.emptyContainer = function () {
	$(".grid-container").empty();
	// $(".grid-container .grid-item").each(function (i, e) {
	//     viewModel.designer.packery.remove(e);
	// });
};
viewModel.designer.fillContainer = function () {
	viewModel.ajaxPost('/designer/getconfig', { _id: viewModel.header.PageID }, function (res) {
		if (!res.success) {
			alert(res.message);
			return;
		}

		viewModel.designer.href(res.data.href);
		delete res.data.href;

		ko.mapping.fromJS(res.data, viewModel.designer.config);
		viewModel.designer.drawContent();
		viewModel.designer.production();
		viewModel.designer.gridHideShow();
	});
};
viewModel.designer.gridHideShow = function() {
	var $popoverTemplate = $($("#template-popover").html());
	$('.btn-hideshow-panel').popover({
		title: "Choose Hide Show",
		width: 200,
		placement: "bottom",
		html: true,
		template: $popoverTemplate.clone().addClass("popover-hideshow")[0].outerHTML,
		content: '<span class="loader">Loading data ...</span>'
	});
	$(".btn-hideshow-panel").on("shown.bs.popover", function (e) {
		var $popover = $(".popover-hideshow");

		$popover.find(".popover-content").html("<ul></ul>");
		var $container = $popover.find(".popover-content ul");

		viewModel.designer.config.content().forEach(function (e) {
			var checked = "";
			if (e.hide() == true)
				checked = "checked";

			var $each = $('<li> <input onclick="viewModel.designer.changeSelectedHideShow(this)" type="checkbox" name="' + e.panelID() + '" ' + checked + ' /> <span>' + e.title() + '</span> <br /> <input type="checkbox" style="visibility: hidden;" /> <span>(' + e.panelID() + ')</span> </li>');
			$each.appendTo($container);
		});
	});
}
viewModel.designer.changeSelectedHideShow = function(e){
	var selecteHideshow = [];

	$(e).closest("ul").find("input[type='checkbox']:checked").each (function (i, e) {
		selecteHideshow.push(e.name);
	});

	var param = { 
		_id: viewModel.header.PageID, 
		panelid: selecteHideshow.join(",") 
	};
	viewModel.ajaxPost("designer/sethideshow", param, function (res) {
		if (!res.success) {
			alert(res.message);
			return;
		}
		viewModel.designer.fillContainer();
	});
}
viewModel.designer.prepare = function () {
	viewModel.designer.packery = new Packery($(".grid-container")[0], {
		itemSelector: '.grid-item',
		gutter: 0
	});

	viewModel.designer.fillContainer();
	var $popoverTemplate = $($("#template-popover").html());

	// $('.btn-add-panel').popover({
	// 	title: "Add new panel",
	// 	width: 200,
	// 	placement: "bottom",
	// 	html: true,
	// 	template: $popoverTemplate.clone().addClass("popover-panel")[0].outerHTML,
	// 	content: $($("#template-content-popover-panel").html())[0].outerHTML
	// });
	// $(".btn-add-panel").on("shown.bs.popover", function (e) {
	// 	var $popover = $(".popover-panel");

	// 	ko.applyBindings(viewModel, $popover.find("form")[0]);
	// 	ko.mapping.toJS(viewModel.designer.template.panelConfig, viewModel.designer.panelConfig);

	// 	$popover.find("[name=title]").focus();
	// });

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
			if (!res.success) {
				alert(res.message);
				return;
			}

			setTimeout(function () {
				$popover.find(".popover-content").html("<ul></ul>");
				var $container = $popover.find(".popover-content ul");

				res.data.forEach(function (e) {
					var checked = "";

					Lazy(viewModel.designer.config.datasources()).sort().toArray().forEach(function (f) {
						if (e._id == f) {
							checked = "checked";
						}
					});

					var $each = $('<li> <input onclick="viewModel.designer.changeSelectedDatasource(this)" type="checkbox" name="' + e._id + '" ' + checked + ' /> <span>' + e.title + '</span> <br /> <input type="checkbox" style="visibility: hidden;" /> <span>(' + e._id + ')</span> </li>');
					$each.appendTo($container);
				});
			}, 200);
		});
	});

	$("body").on("show.bs.popover", ".btn-popover", function (e) {
		$("body .popover-overlay").remove();
		$("<div class='popover-overlay'></div>").appendTo($("body"));
	});
	$("body").on("click", ".popover-overlay", function () {
		viewModel.designer.closePopover();
	});
};
viewModel.designer.getDataSources = function (callback) {
	viewModel.designer.optionDataSources([]);
	viewModel.ajaxPost('/datasource/getdatasources', { }, function (res) {
		if (!res.success) {
			alert(res.message);
			return;
		}

		setTimeout(function () {
			Lazy(res.data).where(function (e) {
				return viewModel.designer.config.datasources().indexOf(e._id) > -1;
			}).toArray().forEach(function (e) {
				viewModel.designer.optionDataSources.push({
					value: e._id,
					title: e.title + " (" + e._id + ")"
				});
			});

			if (callback != undefined) {
				callback();
			}
		}, 200);
	});
}
viewModel.designer.showAddWidgetModal = function (id) {
	ko.mapping.fromJS(viewModel.designer.template.widgetConfig, viewModel.designer.widgetConfig);
	viewModel.designer.widgetConfig.panelID(id);
	viewModel.designer.closePopover();
	$(".modal-add-widget").modal("show");

	var $modal = $(".modal-add-widget");

	viewModel.designer.getDataSources();

	ko.mapping.toJS(viewModel.designer.template.widgetConfig, viewModel.designer.widgetConfig);

	$modal.find('[name=widget]').data("kendoDropDownList").trigger("change");
	$modal.find("[name=title]").focus();
};
viewModel.designer.createPanel = function () {
	var $validator = $(".modal-add-panel").find("form").kendoValidator().data("kendoValidator");
	if (!$validator.validate()) {
		return;
	}

	var config = ko.mapping.toJS(viewModel.designer.panelConfig);
	var param = $.extend(true, {}, config);
	param.panelID = config._id;
	param._id = viewModel.header.PageID;
	param.hide = config.hide;

	viewModel.ajaxPost("/designer/savepanel", param, function (res) {
		if (!res.success) {
			alert(res.message);
			return;
		}

		$(".modal-add-panel").modal("hide");

		if (param.panelID != "") {
			var $panel = $(".grid-item[data-panel-id='" + config._id + "']");
			$panel.attr("class", "grid-item col-md-" + config.width);
			if (parseInt(config.offset, 10) > 0) {
				$panel.addClass("col-md-offset-" + config.offset);
			}
			$panel.find("h3").html(config.title + " - <span>" + config._id + "</span>");
			return;
		}

		var panelID = res.data;
		var $panel = viewModel.designer.putPanel(panelID, config.title, config.width, config.offset, "prepend");
		$panel.height($panel.find(".panel").height());
		$panel.find(".panel-body").html('');
		viewModel.designer.fillContainer();
		// viewModel.designer.packery.layout();
	});

	ko.mapping.fromJS(viewModel.designer.template.panelConfig, viewModel.designer.panelConfig);
	viewModel.designer.closePopover();
};
viewModel.designer.createWidget = function () {
	var $validator = $(".modal-add-widget").find("form").kendoValidator().data("kendoValidator");
	if (!$validator.validate()) {
		return;
	}

	var config = ko.mapping.toJS(viewModel.designer.widgetConfig);
	config._id = viewModel.header.PageID;

	viewModel.ajaxPost("/designer/savewidget", config, function (res) {
		if (!res.success) {
			alert(res.message);
			return;
		}

		$(".modal-add-widget").modal("hide");
		viewModel.designer.emptyContainer();
		viewModel.designer.fillContainer();
	});
};
viewModel.designer.changePopupWidgetSelectedTypeValueCallback = function () {};
viewModel.designer.changePopupWidgetSelectedTypeValue = function (o) {
	var type = this.value();
	viewModel.designer.optionWidgetID([]);
	viewModel.ajaxPost("/designer/getwidgets", { type: type }, function (res) {
		if (!res.success) {
			alert(res.message);
			return;
		}

		res.data.forEach(function (e) {
			if (type == "chart") {
				viewModel.designer.optionWidgetID.push({
					value: e._id,
					title: e.title + " (" + e._id + ")"
				});
			} else if (type == "grid") {
				viewModel.designer.optionWidgetID.push({
					value: e.id,
					title: e.name + " (" + e.id + ")"
				});
			}
		});

		viewModel.designer.changePopupWidgetSelectedTypeValue();
		viewModel.designer.changePopupWidgetSelectedTypeValue = function () {};
	});
};
viewModel.designer.changeSelectedDatasource = function (o) {
	var selectedDatasources = [];

	$(o).closest("ul").find("input[type='checkbox']:checked").each (function (i, e) {
		selectedDatasources.push(e.name);
	});

	var param = { 
		_id: viewModel.header.PageID, 
		datasources: selectedDatasources.join(",") 
	};
	viewModel.ajaxPost("designer/setdatasource", param, function (res) {
		if (!res.success) {
			alert(res.message);
			return;
		}
	});
};
viewModel.designer.putPanel = function (id, title, width, offset, mode) {
	mode = (mode == undefined ? "append" : mode);

	var content = $("#template-panel").html();
	var $panel = $(content);
	$panel.find(".panel-title").html(title + " - <span>" + id + "</span>");
	$panel.find(".panel-body").html("Loading content ...");
	$panel.attr("data-panel-id", id);
	// $panel.attr("data-ss-colspan", String(width));
	$panel.addClass("col-md-" + width);
	if (offset > 0) {
		$panel.addClass("col-md-offset-" + offset);
	}

	if (mode == "append") {
		$panel.appendTo($(".grid-container"));
		// viewModel.designer.packery.appended($panel.attr("style", "")[0]);
	} else {
		$panel.prependTo($(".grid-container"));
		// viewModel.designer.packery.prepended($panel.attr("style", "")[0]);
	}

	$panel.find('.fa-gear').popover({
		title: "Configure panel",
		width: 200,
		placement: "bottom",
		html: true,
		template: $($("#template-popover").html()).clone().addClass("popover-configure-panel")[0].outerHTML,
		content: [
			'<button style="width: 100%; margin-bottom: 10px;" class="btn btn-sm btn-primary btn-edit-panel" onclick="viewModel.designer.editPanel(\'' + id + '\')">Edit Panel</button>',
			'<button style="width: 100%;" class="btn btn-sm btn-primary" onclick="viewModel.designer.showAddWidgetModal(\'' + id + '\')">Add Widget</button>'
		].join('')
	});
	// viewModel.designer.packery.bindDraggabillyEvents($panel);
	// viewModel.designer.packery.bindUIDraggableEvents($panel.draggable());
	// $(".grid-container").shapeshift({
	// 	gutterX: 0
	// });
	// $panel.on('dragstop', function(){
	// 	viewModel.designer.packery.layout();
	// });

	// viewModel.designer.packery.bindDraggabillyEvents($panel.draggable()); // buggy!
	// viewModel.designer.packery.layout();

	return $panel;
};
viewModel.designer.editPanel = function (_id) {
	var param = { _id: viewModel.header.PageID, panelID: _id };
	viewModel.ajaxPost("/designer/getpanel", param, function (res) {
		if (!res.success) {
			alert(res.message);
			return;
		}

		ko.mapping.fromJS(res.data, viewModel.designer.panelConfig);
	});

	viewModel.designer.closePopover();
	$(".modal-add-panel").modal("show");
	$(".modal-add-panel").find("[name=title]").focus();
};
viewModel.designer.showAddPanelModal = function () {
	ko.mapping.toJS(viewModel.designer.template.panelConfig, viewModel.designer.panelConfig);

	$(".modal-add-panel").modal("show");
	$(".modal-add-panel").find("[name=title]").focus();
};
viewModel.designer.editWidget = function (panelID, widgetID) {
	var param = { 
		_id: viewModel.header.PageID,
		panelID: panelID,
		widgetID: widgetID
	};
	viewModel.ajaxPost("/designer/getwidgetmetadata", param, function (res) {
		if (!res.success) {
			alert(res.message);
			return;
		}

		var data = res.data;
		data.panelID = panelID;
		ko.mapping.fromJS(data, viewModel.designer.widgetConfig);

		setTimeout(function () {
			$(".modal-add-widget").find("[name='widget']").data("kendoDropDownList").trigger("change");
			viewModel.designer.changePopupWidgetSelectedTypeValue = function () {
				ko.mapping.fromJS(viewModel.designer.template.widgetConfig, viewModel.designer.widgetConfig);
				ko.mapping.fromJS(data, viewModel.designer.widgetConfig);

				viewModel.designer.getDataSources(function () {
					ko.mapping.fromJS(viewModel.designer.template.widgetConfig, viewModel.designer.widgetConfig);
					ko.mapping.fromJS(data, viewModel.designer.widgetConfig);
				});
			};
		}, 500);
	});

	$(".modal-add-widget").modal("show");
	$(".modal-add-widget").find("[name=title]").focus();
};
viewModel.designer.drawContent = function () {
	$(".grid-container").empty();

	ko.mapping.toJS(viewModel.designer.config).content.forEach(function (e) {
		var $panel = viewModel.designer.putPanel(e.panelID, e.title, e.width, e.offset);
		e.target = $panel[0];
		var $content = $panel.find(".panel-body");

		if (typeof e.content == "string") {
			$content.html(e.content);
			return;
		}
		if (e.hide == true) {
			$panel.css("display", "none");
		}

		$content.empty();

		e.content.forEach(function (f) {
			viewModel.ajaxPost("/designer/getwidget", f, function (res) {
				if (!res.success) {
					alert(res.message);
					return;
				}

				var $wrapper = null;

				if (f.type == "chart") {
					$wrapper = viewModel.designer.drawChart(f, res.data, $content);
				} else {
					$wrapper = viewModel.designer.drawGrid(f, res.data, $content);
				}

				$wrapper.prepend("<button class='btn btn-sm btn-primary btn-edit-widget' data-widget-id='" + f.widgetID + "' onclick='viewModel.designer.editWidget(\"" + e.panelID + "\", \"" + f.widgetID + "\")'><span class='glyphicon glyphicon-edit'></span> Edit</button>");

				viewModel.ajaxPost("/datasource/getdatasource", { _id: f.dataSource }, function (res2) {
					if (!res2.success) {
						alert(res2.message);
						return;
					}

					var $contentWidget = $("[data-widget-id='" + f.widgetID + "'] .widget-content");

					if (f.type == "chart") {
						$contentWidget.data("kendoChart").setDataSource(new kendo.data.DataSource({
							data: res2.data
						}));
					} else {
						res.data[0].dataSource.data = res2.data;
						$contentWidget.data("kendoGrid").setDataSource(new kendo.data.DataSource(res.data[0].dataSource));
					}
					$panel.height($panel.find(".panel").height());
					// $(viewModel.designer.packery.element).css('height',$(viewModel.designer.packery.element).height() + 20 + 'px');
					// viewModel.designer.packery.layout();
				});
			});
		});
	});
};
viewModel.designer.drawChart = function (f, res, $content) {
	var config = viewModel.chart.parseConfig(res, true);
	config.title = f.title;

	var $wrapper = $("<div />");
	$wrapper.attr("data-widget-id", f.widgetID);
	$wrapper.addClass('widget widget-chart');
	$wrapper.appendTo($content);

	if (f.hasOwnProperty('width')) {
		$wrapper.css("width", f.width + '%');
	} else {
		$wrapper.css("width", '100%');
	}

	if (f.hasOwnProperty('height')) {
		$wrapper.css("height", f.height + 'px');
		config.chartArea.height = parseInt(f.height - 5, 10);
	} else {
		config.chartArea.height = viewModel.designer.template.widgetConfig.height - 5;
	}

	var $chart = $("<div />").addClass('widget-content');
	$chart.appendTo($wrapper);
	$chart.kendoChart(config);

	$content.find(".clearfix").remove();
	$("<div class='clearfix'></div>").appendTo($content);

	return $wrapper;
};
viewModel.designer.closePopover = function () {
	$("[id^=popover]").prev().trigger("click");
	$(".popover-overlay").remove();
};
viewModel.designer.drawGrid = function(f, res, $content) {
	console.log("chart", f);
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

	return $wrapper;
}
viewModel.designer.removePanel = function (o) {
	var $panel = $(o).closest(".grid-item");
	var title = $panel.find(".panel-title").text();
	var yes = confirm("Are you sure want to delete panel " + title);
	if (yes) {
		var _id = $panel.data("panel-id");
		var param = { _id: viewModel.header.PageID, panelID: _id };

		viewModel.ajaxPost("designer/removepanel", param, function (res) {
			if (!res.success) {
				alert(res.message);
				return;
			}

			// viewModel.designer.packery.remove($panel[0]);
			$panel.remove();
			viewModel.designer.fillContainer();
			// viewModel.designer.packery.layout();
		});
	}
};
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
    x_panel.resize();
    // viewModel.designer.packery.layout();
};
viewModel.designer.production = function () {
	if (!viewModel.header.production) {
		$(".page-title").html("Page Designer");
		$(".grid-container").addClass("dev-mode");
		return;
	}

	$(".fa-gear").parent().remove();
	$(".fa-close").parent().remove();
	$(".content-header .btn-nav-container").empty();
	$(".panel-title").each(function (i, e) {
		$(e).html($(e).text().split(" - ")[0]);
	});
	$(".page-title").html(viewModel.header.title);
	$(".btn-edit-widget").remove();
};

$(function () {
	viewModel.designer.prepare();
	viewModel.designer.production();
});