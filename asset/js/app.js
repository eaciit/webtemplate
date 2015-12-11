$(function() {
    $('body').on('click touchstart', '.notif-list-toggle', function(){
        $(this).closest('.notif').find('.notif-list').toggleClass('toggled');
        $('.notif .status').removeClass('ijo');
    });

    $('body').on('click touchstart', '.notif .header-notif .btn', function(e){
        e.preventDefault();
        // $('.notif .notif-list').removeClass('toggled');
        $(this).closest('.notif').toggleClass('toggled');
        $('.notif .status').removeClass('ijo');
    });

    $(document).on('mouseup touchstart', function (e) {
        var container = $('.notif, .notif .notif-list');
        if (container.has(e.target).length === 0) {
            container.removeClass('toggled');
        }
    });

    $('#menu-left .list-group').css('min-height', $('.content-all').height() - $('.content-header').height() - $('.content-breadcrumb').height());
    $('#menu-right .list-menu-right').css('min-height', $('.content-all').height());

    // $('.collapse-link').click(function () {
    //     var x_panel = $(this).closest('div.panel-container');
    //     var button = $(this).find('i');
    //     var content = x_panel.find('div.panel-content');
    //     content.slideToggle(200);
    //     (x_panel.hasClass('fixed_height_390') ? x_panel.toggleClass('').toggleClass('fixed_height_390') : '');
    //     (x_panel.hasClass('fixed_height_320') ? x_panel.toggleClass('').toggleClass('fixed_height_320') : '');
    //     button.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
    //     if(button.hasClass('fa-chevron-up'))
    //         $(x_panel).animate({height:200},200);
    //     else
    //         $(x_panel).animate({height:55},200);
    //     x_panel.toggle
    //     setTimeout(function () {
    //         x_panel.resize();
    //     }, 50);
    // });

});

function generalfunc (item) {
    $.each( item, function( key, value ) {
        if (key === 'title')
            $('.title-header').html(value);
        if (key === 'breadcrumb'){
            var $o = $('.content-breadcrumb'), $ulbreadcrumb, $libreadcrumb, $linkbreadcrumb, totalItem = item.breadcrumb.menu.length - 1;
            $ulbreadcrumb = jQuery('<ul />');
            $ulbreadcrumb.addClass('breadcrumb');
            $ulbreadcrumb.appendTo($o);

            $libreadcrumb = jQuery('<li />');
            $libreadcrumb.appendTo($ulbreadcrumb);

            $linkbreadcrumb = jQuery('<a />');
            $linkbreadcrumb.attr('href',item.breadcrumb.urlhome);
            $linkbreadcrumb.html('<i class="fa fa-home"></i>  Home');
            $linkbreadcrumb.appendTo($libreadcrumb);
            for(var key in item.breadcrumb.menu){
                $libreadcrumb = jQuery('<li />');
                if(totalItem == key){
                    $libreadcrumb.addClass('active');
                    $libreadcrumb.html(item.breadcrumb.menu[key].title);
                    $libreadcrumb.appendTo($ulbreadcrumb);
                }else{
                    $libreadcrumb.appendTo($ulbreadcrumb);
                    $linkbreadcrumb = jQuery('<a />');
                    $linkbreadcrumb.attr('href',item.breadcrumb.menu[key].href);
                    $linkbreadcrumb.html(item.breadcrumb.menu[key].title);
                    $linkbreadcrumb.appendTo($libreadcrumb);
                }
            }
        }
        if (key === 'panel'){
            // console.log(item.panel);
            var $o = $(item.panel.areaPanel), $divColumn;
            $divColumn = jQuery('<div />');
            $divColumn.addClass('column-eaciit');
            $divColumn.appendTo($o);
            // $(".column-eaciit").shapeshift({
            //     minColumns: 3
            // });

            // Coba Drag
            // $(".column-eaciit").sortable({
            //     cursor: 'move',
            //     connectWith: ".column-eaciit",
            //     helper: 'clone',
            //     appendTo: 'body',
            //     placeholder: 'placeholder',
            //     forcePlaceholderSize: true,
            //     start: function(e,ui){
            //         ui.placeholder.height(ui.item.height());
            //         ui.placeholder.width(ui.item.width());
            //     }
            // });
            // $(".column-eaciit").disableSelection();
            // $(".column-eaciit").addClass("ui-helper-clearfix");
            // $(".column-eaciit").addClass( "ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" );
        }
    });
}

function eaciitGeneral (callback) {
    callback (arguments[1]);
}

function navbarTemplateSub(item,parentsub){
    var $ulnavbar, $linavbar, $linknavbar;
    $ulnavbar = jQuery('<ul />');
    $ulnavbar.addClass('dropdown-menu');
    $ulnavbar.attr('role','menu');
    $ulnavbar.appendTo(parentsub);

    if(item.submenu.length === 0){
        $linavbar = jQuery('<li />');
        if(item.selected)
            $linavbar.addClass('selected');
        $linavbar.appendTo($ulnavbar);

        $linknavbar = jQuery('<a />');
        $linknavbar.attr('href',item.href);
        $linknavbar.html(item.title);
        $linknavbar.appendTo($linavbar);
    } else {
        $linavbar = jQuery('<li />');
        if(item.selected)
            $linavbar.addClass('selected dropdown');
        else
            $linavbar.addClass('dropdown');
        $linavbar.appendTo($ulnavbar);

        $linknavbar = jQuery('<a />');
        $linknavbar.css('cursor','pointer');
        $linknavbar.addClass('dropdown-toggle');
        $linknavbar.attr('data-toggle','dropdown');
        $linknavbar.html(item.title);
        $linknavbar.appendTo($linavbar);

        for(var key in item.submenu){
            navbarTemplateSub(item.submenu[key],$linavbar);
        }
    }
}

function navleftTemplateSub(item,parentsub){
    var $linav, $linknav, $iconav, $spannav;
    $linav = jQuery('<li />');
    $linav.css('text-align','left');
    $linav.appendTo(parentsub);

    $linknav = jQuery('<a />');
    $linknav.addClass('tooltip-tip ajax-load tooltipster-disable');
    $linknav.attr('href',item.href);
    $linknav.appendTo($linav);

    $iconav = jQuery('<i />');
    $iconav.addClass(item.icon);
    $iconav.appendTo($linknav);

    $spannav = jQuery('<span />');
    $spannav.css({'display':'inline-block','float':'none'});
    $spannav.html(item.title);
    $spannav.appendTo($linknav);
}

var methodsMenu = {
    top: function(item){
        var $o = this, $ulnavbar, $linavbar, $linknavbar;
        for (var key in item){
            $ulnavbar = jQuery('<ul />');
            $ulnavbar.addClass('nav navbar-nav');
            $ulnavbar.appendTo($o);

            if(item[key].submenu.length === 0){
                $linavbar = jQuery('<li />');
                if(item[key].selected)
                    $linavbar.addClass('selected');
                $linavbar.appendTo($ulnavbar);

                $linknavbar = jQuery('<a />');
                $linknavbar.attr('href',item[key].href);
                $linknavbar.html(item[key].title);
                $linknavbar.appendTo($linavbar);
            } else {
                $linavbar = jQuery('<li />');
                if(item[key].selected)
                    $linavbar.addClass('selected dropdown');
                else
                    $linavbar.addClass('dropdown');
                $linavbar.appendTo($ulnavbar);

                $linknavbar = jQuery('<a />');
                $linknavbar.css('cursor','pointer');
                $linknavbar.addClass('dropdown-toggle');
                $linknavbar.attr('data-toggle','dropdown');
                $linknavbar.html(item[key].title);
                $linknavbar.appendTo($linavbar);

                for(var key2 in item[key].submenu){
                    navbarTemplateSub(item[key].submenu[key2],$linavbar);
                }
            }
        }
    },
    right: function(){
        console.log('right');
    },
    left: function(item){
        var $o = this, $ulnav, $ligroup, $linkgroup, $spangroup, $linav, $linknav, $spannav, $iconav, $ulnavsub;
        for(var key in item){
            $ulnav = jQuery('<ul />');
            $ulnav.addClass('topnav menu-left-nest');
            $ulnav.css('margin','10px');
            $ulnav.appendTo($o);

            $ligroup = jQuery('<li />');
            $ligroup.css('text-align','left');
            $ligroup.appendTo($ulnav);

            $linkgroup = jQuery('<div />');
            // $linkgroup.attr('href','#');
            $linkgroup.css({'border-left-width':'0px !important', 'border-left-style':'solid !important','display':'inline-block','float':'none'});
            $linkgroup.addClass('title-menu-left');
            $linkgroup.appendTo($ligroup);

            $spangroup = jQuery('<span />');
            $spangroup.css({'display':'inline-block', 'float':'none'});
            $spangroup.html(item[key].titlegroup);
            $spangroup.appendTo($linkgroup);

            for(var key2 in item[key].leftmenu){
                $linav = jQuery('<li />');
                $linav.appendTo($ulnav);

                $linknav = jQuery('<a />');
                $linknav.addClass('tooltip-tip ajax-load tooltipster-disable');
                if(item[key].leftmenu[key2].submenu.length === 0){
                    $linknav.attr('href',item[key].leftmenu[key2].href);
                    $linknav.appendTo($linav);
                } else {
                    $linknav.attr('href','#');
                    $linknav.appendTo($linav);

                    $ulnavsub = jQuery('<ul />');
                    $ulnavsub.appendTo($linav);
                    for(var key3 in item[key].leftmenu[key2].submenu){
                        navleftTemplateSub(item[key].leftmenu[key2].submenu[key3], $ulnavsub);
                    }
                }

                $iconav = jQuery('<i />');
                $iconav.addClass(item[key].leftmenu[key2].icon);
                $iconav.appendTo($linknav);

                $spannav = jQuery('<span />');
                $spannav.css({'display':'inline-block','float':'none'});
                $spannav.html(item[key].leftmenu[key2].title);
                $spannav.appendTo($linknav);
            }
        }
    }
}

$.fn.eaciitMenu = function (method) {
    methodsMenu[method].apply(this, Array.prototype.slice.call(arguments, 1));
}

var methodsNotif = {
    data_notiv: [],
    add: function(item){
        var $o = this, $divmedia, $iconnotiv, $divtext;
        $divmedia = jQuery('<div />');
        $divmedia.addClass('media');
        $divmedia.attr('idnotiv',item.id);
        $divmedia.appendTo($o);

        $iconnotiv = jQuery('<i />');
        $iconnotiv.addClass('pull-left glyphicon glyphicon-info-sign');
        $iconnotiv.css({'color':'#D1F026','font-size':'25px'});
        $iconnotiv.appendTo($divmedia);

        $divtext = jQuery('<div />');
        $divtext.addClass('media-body');
        $divtext.html(item.text);
        $divtext.appendTo($divmedia);

        methodsNotif.data_notiv.push(item);
        if (item.notif)
            $('.notif .status').addClass('ijo');
    },
    addMultiple: function(item){
        var $o = this, $divmedia, $iconnotiv, $divtext;
        for(var key in item.data){
            $divmedia = jQuery('<div />');
            $divmedia.addClass('media');
            $divmedia.attr('idnotiv',item.data[key].id);
            $divmedia.appendTo($o);

            $iconnotiv = jQuery('<i />');
            $iconnotiv.addClass('pull-left glyphicon glyphicon-info-sign');
            $iconnotiv.css({'color':'#D1F026','font-size':'25px'});
            $iconnotiv.appendTo($divmedia);

            $divtext = jQuery('<div />');
            $divtext.addClass('media-body');
            $divtext.html(item.data[key].text);
            $divtext.appendTo($divmedia);

            methodsNotif.data_notiv.push(item.data[key]);
        }
        if (item.notif)
            $('.notif .status').addClass('ijo');
    },
    remove: function(item){
        var $o = this;
        if(item.key == 'id'){
            var data = $.grep(methodsNotif.data_notiv, function(e){ 
                return e.id != item.value;
            });
            methodsNotif.data_notiv = data;
            $o.find('div.media[idnotiv='+ item.value +']').remove('');
        } else {
            var data = $.grep(methodsNotif.data_notiv, function(e){ 
                return e.text != item.value;
            });
            methodsNotif.data_notiv = data;
            $o.find('div.media').remove(":contains('"+ item.value +"')");
        }
    },
    clear: function(item){
        var $o = this;
        $o.empty();
        methodsNotif.data_notiv = [];
    },
    get: function(){
        return methodsNotif.data_notiv;
    }
}

$.fn.eaciitNotif = function (method) {
    if (method == 'get')
        return methodsNotif[method].apply(this, Array.prototype.slice.call(arguments, 1));
    else
        methodsNotif[method].apply(this, Array.prototype.slice.call(arguments, 1));
}

function clickHideShowPanel() {
    var x_panel = $(this).closest('div.panel-container');
    var button = $(this).find('i');
    var content = x_panel.find('div.panel-content');
    content.slideToggle(200);
    // (x_panel.hasClass('fixed_height_390') ? x_panel.toggleClass('').toggleClass('fixed_height_390') : '');
    // (x_panel.hasClass('fixed_height_320') ? x_panel.toggleClass('').toggleClass('fixed_height_320') : '');
    button.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
    if(button.hasClass('fa-chevron-up')){
        $(x_panel).animate({height:parseInt($(x_panel).attr('heightContent'))},200, function() {
            $('#menu-right .list-menu-right').css('min-height', $('.content-all').height());
            $('#menu-left .list-group').css('min-height', $('.content-all').height() - $('.content-header').height() - $('.content-breadcrumb').height());
            $(".column-eaciit").trigger("ss-rearrange");
        });
    } else {
        $(x_panel).animate({height:55},200, function() {
            $('#menu-right .list-menu-right').css('min-height', $('.content-all').height());
            $('#menu-left .list-group').css('min-height', $('.content-all').height() - $('.content-header').height() - $('.content-breadcrumb').height());
            $(".column-eaciit").trigger("ss-rearrange");
        });
    }
    x_panel.toggle
    setTimeout(function () {
        x_panel.resize();
    }, 50);

    // $('.panel-content').css('display', 'block');
    // $('.panel-header').find('i').toggleClass('fa-chevron-up').toggleClass('fa-chevron-down'); dan dilanjutkan animasi height
}

function removePanel(){
    // console.log($(this).closest('.panel-eaciit').attr('id'));
    var idpanel = $(this).closest('.panel-eaciit').attr('id');
    // if(window[idpanel+'_dispose'])
    //     window[idpanel+'_dispose']();
    if (window[idpanel]['dispose'])
        window[idpanel]['dispose']();
    delete window[idpanel];
    $(this).closest('.panel-eaciit').remove();
    $(".column-eaciit").trigger("ss-rearrange");
}

function addPanelNew(item, elem, content){
    var $o = elem, $column = elem.find('.column-eaciit'), $divpanel, $divcontainer, $panelheader, $headertitle, $ulnavbar, $linavbar, $hideshow, $removepanel, $divClear, $panelContent;
    $divpanel = jQuery('<div />');
    $divpanel.addClass('panel-eaciit');
    var widthpanel = '12';
    if(item.width === 'col-1')
        widthpanel = '1';
    else if(item.width === 'col-2')
        widthpanel = '2';
    else if(item.width === 'col-3')
        widthpanel = '3';
    else if(item.width === 'col-4')
        widthpanel = '4';
    else if(item.width === 'col-5')
        widthpanel = '5';
    else if(item.width === 'col-6')
        widthpanel = '6';
    else if(item.width === 'col-7')
        widthpanel = '7';
    else if(item.width === 'col-8')
        widthpanel = '8';
    else if(item.width === 'col-9')
        widthpanel = '9';
    else if(item.width === 'col-10')
        widthpanel = '10';
    else if(item.width === 'col-11')
        widthpanel = '11';

    // $divpanel.css('width', item.width);
    $divpanel.attr({'id':item.idpanel, 'data-ss-colspan':widthpanel});
    $divpanel.appendTo($column);

    $divcontainer = jQuery('<div />');
    $divcontainer.addClass('panel-container');
    if(item.height != "0px" && item.height != "0")
        $divcontainer.css('height',item.height);
    $divcontainer.appendTo($divpanel);

    $panelheader = jQuery('<div />');
    $panelheader.addClass('panel-header');
    $panelheader.appendTo($divcontainer);

    $headertitle = jQuery('<span />');
    $headertitle.addClass('panel-title');
    $headertitle.html(item.title);
    $headertitle.appendTo($panelheader);

    $ulnavbar = jQuery('<ul />');
    $ulnavbar.addClass('nav navbar-right panel-toolbox');
    $ulnavbar.appendTo($panelheader);

    $linavbar = jQuery('<li />');
    // $linavbar.html('<a class="collapse-link"><i class="fa fa-chevron-up"></i></a>');
    $linavbar.appendTo($ulnavbar);

    $hideshow = jQuery('<a />');
    $hideshow.addClass('collapse-link"');
    // $hideshow.attr(id, 'collapse-link');
    $hideshow.html('<i class="fa fa-chevron-up"></i>');
    $hideshow.click(clickHideShowPanel);
    $hideshow.appendTo($linavbar);

    $linavbar = jQuery('<li />');
    // $linavbar.html('<a class="close-link"><i class="fa fa-close"></i></a>');
    $linavbar.appendTo($ulnavbar);

    $removepanel = jQuery('<a />');
    $removepanel.addClass('close-link"');
    $removepanel.html('<i class="fa fa-close"></i>');
    $removepanel.click(removePanel);
    $removepanel.appendTo($linavbar);

    $divClear = jQuery('<div />');
    $divClear.css('clear', 'both');
    $divClear.appendTo($panelheader);

    $panelContent = jQuery('<div />');
    $panelContent.addClass('panel-content');
    $panelContent.html(content);
    $panelContent.appendTo($divcontainer);

    if(window['init']){
    //     window[item.idpanel+'_init']();
        window[item.idpanel] = {};
        window[item.idpanel]['init'] = window['init'],
        window['init'] = undefined;
        window[item.idpanel]['init']();
    }

    if (window['dispose']){
        window[item.idpanel]['dispose'] = window['dispose'];
        window['dispose'] = undefined;
    }
    // $(".column-eaciit").shapeshift({minColumns: 4});
    $(".column-eaciit").shapeshift();
    
    $($divpanel).find('div.panel-container').attr('heightContent', $($divpanel).find('div.panel-container').height() + 22);
    $('#menu-right .list-menu-right').css('min-height', $('.content-all').height());
    $('#menu-left .list-group').css('min-height', $('.content-all').height() - $('.content-header').height() - $('.content-breadcrumb').height());
}

function addMethods(fn, method){
    panel[fn] = method.panel;
}

var panel = {}

var methodsPanel = {
    add: function (item){
        var $elem = this;
        if (item.type === 'inline'){
            addPanelNew(item, $elem, item.content);
        } else {
            var url = item.url;
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'html',
                // contentType: "application/json",
                // data : JSON.stringify({path: item.reference}),
                data : {path: item.reference},
                success : function(res) {
                    addPanelNew(item, $elem, res);
                },
            });
        }
        var idpanel = item.idpanel;
        addMethods(idpanel + '_hide', {'panel': function(){methodsPanel['hide']({id:idpanel})} });
        addMethods(idpanel + '_show', {'panel': function(){methodsPanel['show']({id:idpanel})} });
        addMethods(idpanel + '_close', {'panel': function(){methodsPanel['close']({id:idpanel})} });
        // console.log($($divpanel).find('div.panel-container').height() + 22);
    },
    hide: function(item){
        $('#'+item.id).find('.panel-content').css('display', 'none');
        // $('#'+item.id).find('.panel-header').find('i').toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
        var $iconHideShow = $('#'+item.id).find('.panel-header li').eq(0).find('i');
        $iconHideShow.removeClass('fa-chevron-up');
        $iconHideShow.addClass('fa-chevron-down');

        var x_panel = $('#'+item.id).find('div.panel-container');
        if($iconHideShow.hasClass('fa-chevron-up')){
            $(x_panel).animate({height:parseInt($(x_panel).attr('heightContent'))},200, function() {
                $('#menu-right .list-menu-right').css('min-height', $('.content-all').height());
                $('#menu-left .list-group').css('min-height', $('.content-all').height() - $('.content-header').height() - $('.content-breadcrumb').height());
                $(".column-eaciit").trigger("ss-rearrange");
            });
        } else {
            $(x_panel).animate({height:55},200, function() {
                $('#menu-right .list-menu-right').css('min-height', $('.content-all').height());
                $('#menu-left .list-group').css('min-height', $('.content-all').height() - $('.content-header').height() - $('.content-breadcrumb').height());
                $(".column-eaciit").trigger("ss-rearrange");
            });
        }
        x_panel.toggle
        setTimeout(function () {
            x_panel.resize();
        }, 50);
        // $(".column-eaciit").trigger("ss-event-arrange");
    },
    show: function(item){
        $('#'+item.id).find('.panel-content').css('display', 'block');
        var $iconHideShow = $('#'+item.id).find('.panel-header li').eq(0).find('i');
        $iconHideShow.removeClass('fa-chevron-down');
        $iconHideShow.addClass('fa-chevron-up');

        var x_panel = $('#'+item.id).find('div.panel-container');
        if($iconHideShow.hasClass('fa-chevron-up')){
            $(x_panel).animate({height:parseInt($(x_panel).attr('heightContent'))},200, function() {
                $('#menu-right .list-menu-right').css('min-height', $('.content-all').height());
                $('#menu-left .list-group').css('min-height', $('.content-all').height() - $('.content-header').height() - $('.content-breadcrumb').height());
                $(".column-eaciit").trigger("ss-rearrange");
            });
        } else {
            $(x_panel).animate({height:55},200, function() {
                $('#menu-right .list-menu-right').css('min-height', $('.content-all').height());
                $('#menu-left .list-group').css('min-height', $('.content-all').height() - $('.content-header').height() - $('.content-breadcrumb').height());
                $(".column-eaciit").trigger("ss-rearrange");
            });
        }
        x_panel.toggle
        setTimeout(function () {
            x_panel.resize();
        }, 50);
        // $(".column-eaciit").trigger("ss-event-arrange");
    },
    close: function(item){
        if (window[item.id]['dispose'])
            window[item.id]['dispose']();
        delete window[item.id];

        $('#'+item.id).remove();
        $(".column-eaciit").trigger("ss-rearrange");
    }
}

$.fn.eaciitPanel = function (method) {
    // console.log(method);
    methodsPanel[method].apply(this, Array.prototype.slice.call(arguments, 1));
}