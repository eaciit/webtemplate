viewModel.designer.prepare = function () {
	viewModel.ajaxPost('/getconfig', { _id: viewModel.header.PageID }, function () {

	});
};
viewModel.designer.addPanel = function (title, widthRatio, height) {
	var content = $("#template-panel").html();
	var $panel = $(content);
	$panel.appendTo($(".grid-container"));
	$panel.find(".panel-title").html(title);
	$panel.attr("data-ss-colspan", String(widthRatio));
	if (height != undefined)
		$panel.height(height);

	$(".grid-container").shapeshift({
		gutterX: 0
	});
};
viewModel.designer.config = function (o) {

};

$(function () {
	viewModel.designer.prepare();
	viewModel.designer.addPanel("Panel 1", 4);
	viewModel.designer.addPanel("Panel 2", 6);
	viewModel.designer.addPanel("Panel 3", 10);
});