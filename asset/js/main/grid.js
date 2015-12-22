// var tempData = [{firstname: 'arfian', lastname: 'bagus', jk: 'L'},{firstname:'bagus', lastname: 'arfian', jk: 'L'}];
viewModel.grid.template = {
	config: {
		dataSourceKey: '',
		dataSource:{data:[]},
		pageSize:10,
		groupable: true,
		sortable: true,
		filterable: true,
		pageable: {
			refresh: true,
			pageSizes: true,
			buttonCount: 5
		},
		columns:[],
	},
	column: {
		template:'',
		field:'',
		title:'',
		format:'',
		// width:'',
		// headerTemplate:'',
		// headerAttributes:{
		// 	class:'',
		// 	style:'',
		// },
		// footerTemplate:'',
	},
	dataSourceFields: ko.observableArray([]),
}
viewModel.grid.dataSources = ko.observableArray([]);
viewModel.grid.config = ko.mapping.fromJS(viewModel.grid.template.config);
viewModel.grid.column = ko.mapping.fromJS(viewModel.grid.template.column);
viewModel.grid.createGrid = function () {
	var columns = viewModel.grid.config.columns(), newColumns = ko.observableArray([]);
	for (var key in columns){
		var column = {};
		$.each( columns[key], function( key, value ) {
			if(value !== '')
				column[key] = value;
		});
		newColumns.push(column);
	}
	viewModel.grid.config.columns(newColumns());
	$(".grid-preview").kendoGrid(ko.mapping.toJS(viewModel.grid.config));
};
viewModel.grid.save = function(){
	$.ajax({
        url: "/template/savejsongrid",
        type: 'post',
        // dataType: 'json',
        contentType: "application/json; charset=utf-8",
        data : ko.mapping.toJSON(viewModel.grid.config),
        success : function(res) {
			console.log(res);
        },
	});
}
viewModel.grid.preview = function (){
	viewModel.grid.createGrid();
	$(".modal-grid-preview").modal("show");
}
viewModel.grid.addColumn = function(){
	var griddata = viewModel.grid.config, column = {};
	griddata.columns.push(ko.toJS(viewModel.grid.column));
	ko.mapping.fromJS(viewModel.grid.template.column, viewModel.grid.column);
}
viewModel.grid.removeColumn = function(){
	viewModel.grid.config.columns.remove(this);
}
viewModel.grid.fetchDataSource = function () {
	viewModel.ajaxPost("/template/getdatasources", {}, function (res) {
		viewModel.grid.dataSources(res);
    });
};
viewModel.grid.selectDataSource = function(e){
	if (e == undefined) {
		viewModel.grid.config.general.dataSource.data([]);
		return;
	}

	var row = JSON.parse(kendo.stringify(this.dataItem(e.item)));
	console.log("fetching " + row.path);
	console.log(row);

	viewModel.ajaxPost("/template/getdatasource", row, function (res) {
		viewModel.grid.config.dataSource.data(res);

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

		viewModel.grid.template.dataSourceFields(fields);
    });
}

ko.bindingHandlers.booleanValue = {
    init: function(element, valueAccessor, allBindingsAccessor) {
        var observable = valueAccessor(),
            interceptor = ko.computed({
                read: function() {
                    return observable().toString();
                },
                write: function(newValue) {
                    observable(newValue === "true");
                }                   
            });
        
        ko.applyBindingsToNode(element, { value: interceptor });
    }
};

$(function () {
	var c = viewModel.grid;
	c.fetchDataSource();
});