var tempData = [{firstname: 'arfian', lastname: 'bagus', jk: 'L'},{firstname:'bagus', lastname: 'arfian', jk: 'L'}];
viewModel.grid.template = {
	general: {
		dataSource:{data:tempData},
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
		// template:'',
		field:'',
		title:'',
		// format:'',
		// width:'',
		// headerTemplate:'',
		// headerAttributes:{
		// 	class:'',
		// 	style:'',
		// },
		// footerTemplate:'',
	}
}

viewModel.grid.config = ko.mapping.fromJS(viewModel.grid.template);
viewModel.grid.save = function () {
	$("#gridResult").kendoGrid(ko.toJS(viewModel.grid.config.general));
};
viewModel.grid.addColumn = function(){
	var griddata = viewModel.grid.config;
	griddata.general.columns.push(ko.toJS(griddata.column));
	ko.mapping.fromJS(viewModel.grid.template.column, viewModel.grid.config.column);
}
viewModel.grid.removeColumn = function(){
	viewModel.grid.config.general.columns.remove(this);
}