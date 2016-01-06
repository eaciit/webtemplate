viewModel.selector.template = {
	config: {
		_id: "",
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
	viewModel.selector.prepareDataSources();
};
viewModel.selector.changeFieldDataSource = function (_id) {
	return function () {
		var dsID = this.value();

		viewModel.ajaxPost("/datasource/getdatasourcefields", { _id: dsID }, function (res) {
			if (!res.success) {
				alert(res.message);
				return;
			}

			var ds = new kendo.data.DataSource({ data: res.data });
			$("[data-field-id='" + _id + "'] select.field").data("kendoDropDownList").setDataSource(ds);
		});
	};
};
viewModel.selector.back = function () {
	viewModel.mode('');
};
viewModel.selector.refresh = function () {

};
viewModel.selector.save = function () {
	var $validator = $(".selector-form").kendoValidator().data("kendoValidator");
	if (!$validator.validate()) {
		return;
	}

	var config = ko.mapping.toJS(viewModel.selector.config);
	config.selectorID = config._id;
	config.fields = JSON.stringify(config.fields);
	var param = $.extend(true, { _id: viewModel.selector.PageID }, config);

	viewModel.ajaxPost("/selector/saveselector", param, function (res) {
		if (!res.success) {
			alert(res.message);
			return;
		}
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