viewModel.panel.optionsWidth = ko.observableArray([
    { value: '', title: 'Select width' },
    { value: '12', title: 'col-12' },
    { value: '11', title: 'col-11' },
    { value: '10', title: 'col-10' },
    { value: '9', title: 'col-9' },
    { value: '8', title: 'col-8' },
    { value: '7', title: 'col-7' },
    { value: '6', title: 'col-6' },
    { value: '5', title: 'col-5' },
    { value: '4', title: 'col-4' },
    { value: '3', title: 'col-3' },
    { value: '2', title: 'col-2' },
    { value: '1', title: 'col-1' },
]);
viewModel.panel.title = ko.observable('').extend({ required: true });
viewModel.panel.width = ko.observable('').extend({ required: true });
viewModel.panel.iterator = ko.observable(1);
viewModel.panel.create = function () {
    var $validator = $(".panel-widget form").kendoValidator().data("kendoValidator");

    if (!$validator.validate()) {
        return;
    }

    var id = "panel-" + this.iterator();
    var $columnEaciit = $(".column-eaciit");
    var $panel = $($("#template-panel").html());
    
    $panel.attr("id", id);
    $panel.attr("data-ss-colspan", this.width());
    $panel.prependTo($columnEaciit);
    
    $panel.find(".panel-title").html(this.title());
    
    this.iterator(this.iterator() + 1);
    this.clearForm();
    this.back();
    
    ko.applyBindings(viewModel, $panel[0]);
    
    $(".column-eaciit").shapeshift();
};
viewModel.panel.close = function (o) {
    $(o).closest(".panel-eaciit").remove();
};
viewModel.panel.collapse = function (o) {
    var $o = $(o).closest(".panel-eaciit"), 
        $a = $o.find("a"),
        $panelContent = $o.find(".panel-content");
    
    if ($(o).hasClass('fa-chevron-down')) {
        $(o).attr("class", "fa fa-chevron-up");
        $panelContent.show();
    } else {
        $(o).attr("class", "fa fa-chevron-down");
        $panelContent.hide();
    }
};
viewModel.panel.clearForm = function () {
    this.title('');
    this.width('');
};
viewModel.panel.back = function () {
    viewModel.mode('');
};