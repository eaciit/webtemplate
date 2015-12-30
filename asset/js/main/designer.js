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
viewModel.designer.hideShow = function(e){
	var x_panel = $(e).closest('div.panel-primary'), button = x_panel.find('i.hideshow'),content = x_panel.find('div.panel-body');
    content.slideToggle(200);
	button.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
	if(button.hasClass('fa-chevron-up')){
        $(x_panel).animate({height:parseInt($(x_panel).attr('heightContent'))},200, function() {
            $(".grid-container").trigger("ss-rearrange");
        });
    } else {
        $(x_panel).animate({height:40},200, function() {
            $(".grid-container").trigger("ss-rearrange");
        });
    }
	x_panel.toggle
    setTimeout(function () {
        x_panel.resize();
    }, 50);
}

$(function () {
	viewModel.designer.prepare();
	viewModel.designer.addPanel("Panel 1", 4);
	viewModel.designer.addPanel("Panel 2", 6);
	viewModel.designer.addPanel("Panel 3", 10);
});