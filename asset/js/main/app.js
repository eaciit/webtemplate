viewModel.methodsMenu = {
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

                var navbarTemplateSub = function (item,parentsub){
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

                    var navleftTemplateSub = function (item,parentsub){
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
                    };


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
};

viewModel.ajaxPost = function (url, data, callbackSuccess, callbackError) {
    $.ajax({
        url: url,
        type: 'post',
        dataType: 'json',
        data: data,
        success: callbackSuccess,
        error: function (a, b, c) {
            if (callbackError !== undefined) {
                callbackError();
            }
        }
    });
};

viewModel.fixSideMenuHeight = function () {
    $('#menu-left .list-group').css('min-height', $('.content-all').height() - $('.content-header').height() - $('.content-breadcrumb').height());
    $('#menu-right .list-menu-right').css('min-height', $('.content-all').height());
};

$.fn.eaciitMenu = function (method) {
    viewModel.methodsMenu[method].apply(this, Array.prototype.slice.call(arguments, 1));
};


$(function () {
    viewModel.fixSideMenuHeight();

    viewModel.ajaxPost("/template/getmenutop", {}, function (res) {
        $('#navbar').eaciitMenu('top', res);
    });

    viewModel.ajaxPost("/template/getmenuleft", {}, function (res) {
        $('#listmenuleft').eaciitMenu('left', res);
    });

    viewModel.ajaxPost("/template/getbreadcrumb", viewModel.header, function (res) {
        var $breadcrumbs = $("ul.breadcrumb");
        $breadcrumbs.empty();

        res.forEach(function (e, i) {
            if (i + 1 < res.length) {
                $('<li><a href="' + e.href + '""><i class="fa fa-home"></i> ' + e.title + '</a></li>').appendTo($breadcrumbs);
            } else {
                $('<li class="active">' + (i == 0 ? '<i class="fa fa-home"></i> ' : '') + e.title + '</li>').appendTo($breadcrumbs);
            }
        });

        $('.navbar-nav li').removeClass('selected');
        var $target = $('.navbar-nav a[href="' + res.reverse()[0].href + '"]');
        $target.parents('li').last().addClass('selected');
    });
})