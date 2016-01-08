viewModel.selector.template = {
	config: {
		ID: "",
		title: "",
		fields: [],
		masterDataSource: ""
	},
	field: {
		_id: "",
		dataSource: "",
		field: ""
	}
};
viewModel.selector.dataSources = ko.observableArray([]);
viewModel.selector.config = ko.mapping.fromJS(viewModel.selector.template.config);
viewModel.selector.dataSelector = ko.observableArray([]);
viewModel.selector.grid = { 
	sortable: true, 
	resizable: false, 
	filterable: false, 
	pageable: true, 
	columns: [
		{ field: "title", title: "Name" },
		{ title: "", template: '<button class="btn btn-xs btn-primary" onclick="viewModel.selector.editSelector(\'#: ID #\')"> <span class="glyphicon glyphicon-edit"></span> Edit</button>&nbsp;<button class="btn btn-xs btn-danger" onclick="viewModel.selector.removeSelector(\'#: ID #\', \'#: title #\')"> <span class="glyphicon glyphicon-remove"></span> Remove</button>', width: 240, attributes: { style: "text-align: center;" } },
	],
	data: [],
	dataSource: {
        type: 'json',
        pageSize: 20,
        transport: {
            read: '/selector/getselectorconfigs'
        },
        schema: {
	        parse: function (res) {
	        	if (!res.success) {
	        		alert(res.success);
	        		return [];
	        	}
	        	viewModel.selector.dataSelector(res.data);
	        	return res.data;
	        }
        }
    },
};
viewModel.selector.prepareDataSources = function () {
	viewModel.selector.dataSources([]);
	viewModel.ajaxPost("/datasource/getdatasources", {}, function (res) {
		if (!res.success) {
			alert(res.message);
			return;
		}

		viewModel.selector.dataSources(Lazy(res.data).map(function (e) {
			return { 
				value: e._id, 
				title: e.title + ' (' + e._id + ')' 
			};
		}).toArray());
	})
};
viewModel.selector.addSelector = function () {
	viewModel.mode('editor');
	ko.mapping.fromJS(viewModel.selector.template.config, viewModel.selector.config);
	viewModel.selector.addField()();
	// viewModel.selector.prepareDataSources();
};
viewModel.selector.changeFieldDataSource = function (_id, index) {
	return function () {
		var dsID = this.value();

		viewModel.ajaxPost("/datasource/getdatasourcefields", { _id: dsID }, function (res) {
			if (!res.success) {
				alert(res.message);
				return;
			}

			var ds = new kendo.data.DataSource({ data: res.data });
			// $("[data-field-id='" + _id + "'] select.field").data("kendoDropDownList").setDataSource(ds);
			$("select.field").eq(index).data("kendoDropDownList").setDataSource(ds);
			$("select.field").eq(index).data("kendoDropDownList").value(viewModel.selector.config.fields()[index].field());
		});
	};
};
viewModel.selector.back = function () {
	viewModel.mode('');
};
viewModel.selector.refresh = function () {
	$(".selector-grid").data("kendoGrid").dataSource.read();
};
viewModel.selector.editSelector = function (_id) {
	viewModel.mode('editor');
	// viewModel.mode('editor');
	var searchElem = ko.utils.arrayFilter(viewModel.selector.dataSelector(),function (item) {
        return item.ID === _id;
    });
    searchElem[0].fields = JSON.parse(searchElem[0].fields);
	ko.mapping.fromJS(searchElem[0], viewModel.selector.config);
	// viewModel.selector.config.fields());

	viewModel.selector.selectDataSourceCallback = function () {
		ko.mapping.fromJS(viewModel.selector.template.config, viewModel.selector.config);
		ko.mapping.fromJS(searchElem[0], viewModel.selector.config);
		viewModel.selector.selectDataSourceCallback = function () {};
	};

	setTimeout(function () {
		for (var key in viewModel.selector.config.fields()){
			$("select.datasource-selectorfield").eq(key).data("kendoDropDownList").trigger("change");
		}
	}, 1000);
};
viewModel.selector.removeSelector = function(_id, title){
	var y = confirm("Are you sure want to delete selector " + title + " ?");
	if (y == true) {
		viewModel.ajaxPost("/selector/removeselectorconfig", { ID: _id }, function (res) {
			if (!res.success) {
				alert(res.message);
				return;
			}
			
			viewModel.selector.refresh();
	    });
    }
}
viewModel.selector.save = function () {
	var $validator = $(".selector-form").kendoValidator().data("kendoValidator");
	if (!$validator.validate()) {
		return;
	}

	var config = ko.mapping.toJS(viewModel.selector.config);
	config.selectorID = config.ID;
	config.fields = JSON.stringify(config.fields);
	var param = $.extend(true, { ID: viewModel.selector.PageID }, config);
	viewModel.ajaxPost("/selector/saveselector", param, function (res) {
		if (!res.success) {
			alert(res.message);
			return;
		}
		viewModel.selector.refresh();
		viewModel.mode("");
	});
};
viewModel.selector.preview = function () {

};
viewModel.selector.addField = function (fieldID) {
	return function () {
		var item = $.extend(true, {}, viewModel.selector.template.field);
		item._id = (fieldID == undefined) ? String(Date.now()) : fieldID;

		viewModel.selector.config.fields.push(ko.mapping.fromJS(item));
	};
};
viewModel.selector.removeField = function (index) {
	return function () {
		var currentItem = viewModel.selector.config.fields()[index];
		viewModel.selector.config.fields.remove(currentItem);
	};
}

$(function () {
	viewModel.selector.prepareDataSources();
});