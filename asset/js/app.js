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
});

function generalfunc (item) {
    var $o = $('.content-breadcrumb'), $ulbreadcrumb, $libreadcrumb, $linkbreadcrumb, totalItem = item.breadcrumb.menu.length - 1;
    $('.title-header').html(item.title);

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

$.fn.eaciitPopup = function (method) {
}