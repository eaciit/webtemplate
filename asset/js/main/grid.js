// var tempData = [{firstname: 'arfian', lastname: 'bagus', jk: 'L'},{firstname:'bagus', lastname: 'arfian', jk: 'L'}];
viewModel.grid.template = {
	config: {
		outsider: {
			idGrid: '',
			title: '',
			dataSourceKey: '',
		},
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
viewModel.grid.dataGrid = ko.observableArray([]);
viewModel.grid.status = ko.observable("");
viewModel.grid.indexColumn = ko.observable(-1);
viewModel.grid.config = ko.mapping.fromJS(viewModel.grid.template.config);
viewModel.grid.column = ko.mapping.fromJS(viewModel.grid.template.column);
viewModel.grid.showDataGrid = function(){
	viewModel.mode("viewgrid");
	viewModel.ajaxPost("/grid/getgriddata", {}, function (res) {
		viewModel.grid.dataGrid(res);
		$("#grid-data").kendoGrid({
			dataSource : {
				data:viewModel.grid.dataGrid()[0].data
			},
			pageSize:10,
			groupable: false,
			sortable: false,
			filterable: false,
            pageable: {
                refresh: true,
                pageSizes: true,
                buttonCount: 5
            },
            columns: [
            	{field: "name", title: "Name Grid", headerAttributes: { style: 'text-align: center; font-weight: bold;' }, template:"<a style=\"cursor:pointer\" onclick=\"viewModel.grid.selectGrid(this)\" recordid=\"#: value#\">#:name#</a>"},
            	{field: "value", title: "Filename", headerAttributes: {style: 'text-align: center; font-weight: bold;'}},
            	{template:"<button class='btn btn-sm btn-danger' recordid=\"#: value#\" onclick=\"viewModel.grid.deleteGrid(this)\"><span class='glyphicon glyphicon-trash'></span></button> <button class='btn btn-sm btn-success' recordid=\"#: value#\" onclick=\"viewModel.grid.selectGrid(this)\" ><span class='glyphicon glyphicon-pencil'></span></button>"}
            ]
		});
    });
}
viewModel.grid.deleteGrid = function(obj){
	var result = confirm("Want to delete?");
	if (result) {
		viewModel.ajaxPost("/grid/deletegrid", {recordid: $(obj).attr('recordid')}, function (res) {
			viewModel.grid.showDataGrid();
		});
	}
}
viewModel.grid.selectGrid = function(obj){
	$("ul#tabsgrid li").removeClass("active");
	$("ul#tabsgrid li").eq(0).addClass("active");
	viewModel.ajaxPost("/grid/getdetailgrid", {recordid: $(obj).attr('recordid')}, function (res) {
		viewModel.mode("grid");
		viewModel.grid.status("Update");
		ko.mapping.fromJS(res[0], viewModel.grid.config);
		viewModel.grid.config.columns(ko.toJS(viewModel.grid.config.columns));
		setTimeout(function () {
			$("select.data-source-selector").data("kendoDropDownList").trigger("select");
		}, 1000);
	});

}
viewModel.grid.backGridData = function(){
	viewModel.mode("viewgrid");
	viewModel.grid.status("");
}
viewModel.grid.AddNew = function(){
	$("ul#tabsgrid li").removeClass("active");
	$("ul#tabsgrid li").eq(0).addClass("active");
	viewModel.mode("grid");
	viewModel.grid.status("Save");
	ko.mapping.fromJS(viewModel.grid.template.config, viewModel.grid.config);
}
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
	$(".grid-preview").replaceWith("<div class='grid-preview'></div>");
	$(".grid-preview").kendoGrid(ko.mapping.toJS(viewModel.grid.config));
};
viewModel.grid.save = function(){
	$.ajax({
        url: "/grid/savejsongrid",
        type: 'post',
        // dataType: 'json',
        contentType: "application/json; charset=utf-8",
        data : ko.mapping.toJSON(viewModel.grid.config),
        success : function(res) {
			// console.log(res);
			viewModel.grid.showDataGrid();
        },
	});
}
viewModel.grid.preview = function (){
	viewModel.grid.createGrid();
	$(".modal-grid-preview").modal("show");
}
viewModel.grid.addColumn = function(){
	if (viewModel.grid.indexColumn() == -1)
		viewModel.grid.config.columns.push(ko.toJS(viewModel.grid.column));
	else {
		viewModel.grid.config.columns()[viewModel.grid.indexColumn()] = ko.toJS(viewModel.grid.column);
		viewModel.grid.config.columns(viewModel.grid.config.columns());
	}
	
	viewModel.grid.clearColumn();
}
viewModel.grid.removeColumn = function(){
	viewModel.grid.config.columns.remove(this);
}
viewModel.grid.editColumn = function(index){
	viewModel.grid.indexColumn(index);
	ko.mapping.fromJS(viewModel.grid.config.columns()[index], viewModel.grid.column);
}
viewModel.grid.clearColumn = function(){
	viewModel.grid.indexColumn(-1);
	ko.mapping.fromJS(viewModel.grid.template.column, viewModel.grid.column);
}
viewModel.grid.fetchDataSource = function () {
	viewModel.ajaxPost("/datasource/getdatasources", {}, function (res) {
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

	viewModel.ajaxPost("/datasource/getdatasource", row, function (res) {
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
	c.showDataGrid();
});