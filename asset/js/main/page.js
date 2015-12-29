viewModel.page.grid = { 
	sortable: true, 
	resizable: false, 
	filterable: false, 
	pageable: true, 
	columns: [
        { field: "title", title: "Title", template: function (dataItem) {
            var allTitle = Lazy(dataItem.title).split("|").map(function (e) { 
                return "<span>" + e + "</span>";
            }).toArray();

            allTitle[allTitle.length - 1] = allTitle[allTitle.length - 1].replace(/span/g, "a");
            allTitle[allTitle.length - 1] = allTitle[allTitle.length - 1].replace(/\<a\>/g, "<a href='" + dataItem.href + "' target='_blank'>");

            return allTitle.join(" / ");
        } },
        { field: "href", title: "URL", width: 100 },
		{ title: "", width: 150, attributes: { style: "text-align: center;" }, template: function (dataItem) {
            return '<button class="btn btn-xs btn-primary" onclick="viewModel.page.edit(\'' + dataItem._id + '\')"> <span class="glyphicon glyphicon-edit"></span> Edit</button>&nbsp;<button class="btn btn-xs btn-danger" onclick="viewModel.page.remove(\'' + dataItem._id + '\', \'' + dataItem.title + '\', ' + dataItem.has_child + ')"> <span class="glyphicon glyphicon-remove"></span> Remove</button>';
        } },
	],
	data: [],
	dataSource: {
        type: 'json',
        pageSize: 20,
        transport: {
            read: '/page/getroutes'
        },
        schema: {
            data: function (data) {
                viewModel.page.dataAsParent(Lazy(data).where(function (e) {
                    return e._id.split("|").length < 3;
                }).map(function (e) { 
                    e = $.extend(true, {}, e);
                    e.title = e.title.replace(/\|/g, " / ");
                    return e;
                }).toArray());
            	return data;
            }
        }
    },
};
viewModel.page.remove = function (_id, title, hasChild) {
    var message = "Are you sure want to delete " + title.replace(/\|/g, " / ") + (hasChild ? " and all it's submenu" : "") + " ?";
    var yes = confirm(message);

    if (yes) {
        viewModel.ajaxPost("/page/deleteroute", { _id: _id }, function (res) {
            viewModel.page.refresh();
        });
    }
};
viewModel.page.refresh = function () {
    $(".page-grid").data("kendoGrid").dataSource.read()
};
viewModel.page.add = function () {
    viewModel.mode('editor');
    $("select.parent-selector").data("kendoDropDownList").enable(true);
    ko.mapping.fromJS(viewModel.page.template.config, viewModel.page.config);
};
viewModel.page.back = function () {
    viewModel.mode('');
};
viewModel.page.edit = function (_id) {
    viewModel.ajaxPost("/page/getroute", { _id: _id }, function (res) {
        viewModel.mode('editor');
        $("select.parent-selector").data("kendoDropDownList").enable(false);
        ko.mapping.fromJS(res, viewModel.page.config);
    });
};
viewModel.page.save = function () {
    var $validator = $(".page-form").data("kendoValidator");

    if (!$validator.validate()) {
        return;
    }

    viewModel.ajaxPost("/page/saveroute", ko.mapping.toJS(viewModel.page.config), function (res) {
        viewModel.page.back();
        viewModel.page.refresh();
    });
};
viewModel.page.template = {
    config: {
        _id: "",
        title: "",
        href: "",
        parentID: ""
    }
};
viewModel.page.config = ko.mapping.fromJS(viewModel.page.template.config);
viewModel.page.dataAsParent = ko.observableArray([]);

$(function () {
    $(".page-form").kendoValidator();
});