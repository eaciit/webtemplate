viewModel.dataSource.title = ko.observable('');
viewModel.dataSource.grid = {
	sortable: true,
	resizable: false,
	filterable: false,
	pageable: true,
	columns: [
		{ field: "id", title: "ID", width: 100, attributes: { style: "text-align: center;" }, headerTemplate: "<center>ID</center>", template: "<a onclick='viewModel.dataSource.viewDetail(\"#: id #\", \"#: type #\", \"#: path #\")'>#: id #</a>" },
		{ field: "type", title: "Source Type", width: 150 },
		{ field: "title", title: "Title" },
	],
	dataSource: {
        type: 'json',
        pageSize: 20,
        transport: {
            read: '/template/getdatasources'
        }
    },
    data: []
};
viewModel.dataSource.viewDetail = function (id, type, path) {
	viewModel.ajaxPost("/template/getdatasource", { id: id, type: type, path: path }, function (res) {
		console.log(res);
    });
};
viewModel.dataSource.gridDetail = {
	sortable: true,
	resizable: false,
	filterable: false,
	pageable: true,
	columns: ko.observableArray([]),
	dataSource: {
        pageSize: 20,
    },
    data: ko.observableArray([])
}