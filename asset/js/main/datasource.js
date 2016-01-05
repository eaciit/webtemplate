viewModel.dataSource.template = {
	config: {
		_id: "",
		title: "",
		type: "url",
		path: "",
		file: ""
	}
};
viewModel.dataSource.options = {
	types: [
		{ value: "url", title: "URL" },
		{ value: "file", title: "File" }
	]
};
viewModel.dataSource.isSaved = ko.observable(false);
viewModel.dataSource.config = ko.mapping.fromJS(viewModel.dataSource.template.config);
viewModel.dataSource.refresh = function () {
	$(".datasource-grid").data("kendoGrid").dataSource.read();
};
viewModel.dataSource.save = function () {
	var $validator = $(".datasource-form").data("kendoValidator");
	if (!$validator.validate()) {
		if ($validator.errors().length == 1 && $validator.errors().indexOf("File cannot be empty") && viewModel.dataSource.config.type() == "file") {
		} else if ($validator.errors().length == 1 && $validator.errors().indexOf("URL cannot be empty") && viewModel.dataSource.config.type() == "url") {
		} else {
			alert($validator.errors()[0]);
			return;
		}
	}

	var data = ko.mapping.toJS(viewModel.dataSource.config);

	if (viewModel.dataSource.config.type() == "file") {
		data = new FormData();
		data.append("_id", viewModel.dataSource.config._id());
		data.append("title", viewModel.dataSource.config.title());
		data.append("type", viewModel.dataSource.config.type());
		data.append("path", "");
		data.append("file", $('[name="file"]')[0].files[0]);
	}

	viewModel.ajaxPost("/datasource/savedatasource", data, function (res) {
		if (!res.success) {
			alert(res.message);
			return;
		}

		viewModel.mode('');
		viewModel.dataSource.refresh();
		viewModel.dataSource.isSaved(true);
	})
};
viewModel.dataSource.back = function () {
	viewModel.mode('');
};
viewModel.dataSource.resetInputFile = function () {
	$('[name="file"]').replaceWith('<input required data-required-msg="File cannot be empty" name="file" type="file" class="form-control input-sm" />');
};
viewModel.dataSource.add = function () {
	viewModel.mode('editor');
	viewModel.dataSource.isSaved(false);
	viewModel.dataSource.resetInputFile();
	ko.mapping.fromJS(viewModel.dataSource.template.config, viewModel.dataSource.config);
};
viewModel.dataSource.preview = function (_id, type, path, title) {
	if (typeof type == "object") {
		_id = viewModel.dataSource.config._id();
		type = viewModel.dataSource.config.type();
		path = viewModel.dataSource.config.path();
		title = viewModel.dataSource.config.title();
	}

	viewModel.ajaxPost("/datasource/getdatasource", { _id: _id, type: type, path: path }, function (res) {
		if (!res.success) {
			alert(res.message);
			return;
		}

		var holder = [];
		var columns = [];

		res.data.forEach(function (e) {
			for (var p in e) {
				if (e.hasOwnProperty(p) && holder.indexOf(p) == -1) {
					holder.push(p);
					columns.push({
						field: p,
						width: 100
					});
				}
			}
		});

		$(".modal-datasource-preview").modal("show");
		$(".modal-datasource-preview").find(".modal-title").html(title + ' preview');
		$(".datasource-preview").replaceWith('<div class="datasource-preview"></div>');
		$(".datasource-preview").kendoGrid({
			dataSource: {
				data: res.data,
				pageSize: 15
			},
			columns: columns,
			filterable: false,
			sortable: true,
			pageable: true,
			resizable: false
		});
	});
};
viewModel.dataSource.edit = function (_id) {
	viewModel.mode('editor');
	viewModel.dataSource.isSaved(true);

	viewModel.ajaxPost("/datasource/getdatasourcemetadata", { _id: _id }, function (res) {
		if (!res.success) {
			alert(res.message);
			return;
		}

		ko.mapping.fromJS(res.data, viewModel.dataSource.config);
		$(".datasource-form").data("kendoValidator").validate();
	});
};
viewModel.dataSource.remove = function (_id, type, path, title) {
	var y = confirm("Are you sure want to delete data source " + title + " ?");

	if (y == true) {
		viewModel.ajaxPost("/datasource/removedatasource", { _id: _id, type: type, path: path }, function (res) {
			if (!res.success) {
				alert(res.message);
				return;
			}
			
			viewModel.dataSource.refresh();
		});
    }

};
viewModel.dataSource.labelPath = ko.computed(function () {
	if (viewModel.dataSource.config.path() == 'url') {
		return "URL";
	} else if (viewModel.dataSource.config.path() == 'file') {
		return "Filename";
	} else {
		return "URL / Filename";
	}
}, viewModel);
viewModel.dataSource.grid = { 
	sortable: true, 
	resizable: false, 
	filterable: false, 
	pageable: true, 
	columns: [
		{ field: "_id", title: "ID", width: 120 },
		{ field: "title", title: "Title" },
		{ field: "type", title: "Type" },
		{ field: "path", title: "URL / Filename", width: 250, template: function (dataItem) {
			if (dataItem.type == "url") {
				return "<a target='_blank' href='" + dataItem.path + "'>" + dataItem.path + "</a>";
			}
			return dataItem.path;
		} },
		{ title: "", template: '<button class="btn btn-xs btn-success" onclick="viewModel.dataSource.preview(\'#: _id #\', \'#: type #\', \'#: path #\', \'#: title #\')"> <span class="glyphicon glyphicon-eye-open"></span> Preview</button>&nbsp;<button class="btn btn-xs btn-primary" onclick="viewModel.dataSource.edit(\'#: _id #\')"> <span class="glyphicon glyphicon-edit"></span> Edit</button>&nbsp;<button class="btn btn-xs btn-danger" onclick="viewModel.dataSource.remove(\'#: _id #\', \'#: type #\', \'#: path #\', \'#: title #\')"> <span class="glyphicon glyphicon-remove"></span> Remove</button>', width: 240, attributes: { style: "text-align: center;" } },
	],
	data: [],
	dataSource: {
        type: 'json',
        pageSize: 20,
        transport: {
            read: '/datasource/getdatasources'
        },
        schema: {
            parse: function (res) {
            	if (!res.success) {
            		alert(res.message);
            		return [];
            	}

            	return res.data;
            }
        }
    },
};

$(function () {
	$(".datasource-form").kendoValidator();
});