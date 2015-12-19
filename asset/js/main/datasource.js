viewModel.dataSource.title = ko.observable('');
viewModel.dataSource.grid = {
	sortable: true,
	resizable: false,
	filterable: false,
	pageable: true,
	columns: [
		{ field: "id", title: "ID", width: 100, attributes: { style: "text-align: center;" }, headerTemplate: "<center>ID</center>", template: "<a onclick='viewModel.dataSource.detail.show(this)'>#: id #</a>" },
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
viewModel.dataSource.detail = {
	title: ko.observable(''),
	show: function (o) {
		var uid = $(o).closest("tr").data("uid");
		var dataSource = $(o).closest(".k-grid").data("kendoGrid").dataSource;
		var rowData = JSON.parse(kendo.stringify(dataSource.getByUid(uid)));

		this.title(rowData.title);

		var $modal = $(".modal-data-source-detail");
		$modal.find(".modal-body").empty();
		$modal.find(".modal-body").append("<div class='grid'></div>");

		viewModel.ajaxPost("/template/getdatasource", rowData, function (res) {
			var columnsHolder = [];
			var columns = [];

			Lazy(res).slice(0, 10).each(function (e) {
				for (var f in e) {
					if (e.hasOwnProperty(f) && columnsHolder.indexOf(f) == -1) {
						columnsHolder.push(f);
						columns.push({ 
							field: f, 
							title: f.replace(/_/g, ' ').replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1"), 
							width: 100
						});
					}
				}
			});

			$modal.modal("show");
			
			if (res.length == 0) {
				return;
			}

			$modal.find(".grid").kendoGrid({
				sortable: true,
				resizable: false,
				filterable: false,
				pageable: true,
				columns: columns,
				dataSource: { 
					pageSize: 20,
					data: res
				}
			});
	    });
	}
};