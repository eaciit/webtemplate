package main

import (
	"github.com/eaciit/knot/knot.v1"
	"github.com/eaciit/toolkit"
	"github.com/eaciit/webtemplate/controller"
	"github.com/eaciit/webtemplate/helper"
	"os"
	"os/exec"
	"time"
)

type (
	WebTemplate struct {
		appViewsPath string
		layoutFile   string
		includeFiles []string
		Server       *knot.Server

		templateController   *controller.TemplateController
		chartController      *controller.ChartController
		dataSourceController *controller.DataSourceController
		gridController       *controller.GridController
	}
)

func InitWebTemplate() *WebTemplate {
	yo := new(WebTemplate)

	// prepare view path
	v, _ := os.Getwd()
	yo.appViewsPath = v + "/"
	yo.layoutFile = "view/layout.html"
	yo.includeFiles = []string{"view/_head.html"}

	knot.DefaultOutputType = knot.OutputTemplate

	// initiate controller
	yo.templateController = &controller.TemplateController{yo.appViewsPath}
	yo.chartController = &controller.ChartController{yo.appViewsPath}
	yo.dataSourceController = &controller.DataSourceController{yo.appViewsPath}
	yo.gridController = &controller.GridController{yo.appViewsPath}

	// initiate server
	yo.Server = new(knot.Server)
	yo.Server.Address = "localhost:3000"
	yo.Server.RouteStatic("static", yo.appViewsPath)
	yo.RegisterRoutes()
	yo.Server.Register(yo.templateController, "")
	yo.Server.Register(yo.chartController, "")
	yo.Server.Register(yo.dataSourceController, "")
	yo.Server.Register(yo.gridController, "")

	return yo
}

func (t *WebTemplate) RegisterRoutes() {
	routes := t.templateController.GetRoutes(helper.FakeWebContext()).([]interface{})

	helper.Recursiver(routes, func(each interface{}) []interface{} {
		return each.(map[string]interface{})["submenu"].([]interface{})
	}, func(each interface{}) {
		eachMap := each.(map[string]interface{})
		title := eachMap["title"].(string)
		href := eachMap["href"].(string)

		if href != "" && href != "#" && href != "/index" {
			t.Server.Route(href, func(r *knot.WebContext) interface{} {
				r.Config.ViewName = t.layoutFile
				return toolkit.M{"title": title, "href": href}
			})
		}
	})

	// route the / and /index
	for _, route := range []string{"/", "/index"} {
		t.Server.Route(route, func(r *knot.WebContext) interface{} {
			r.Config.ViewName = t.layoutFile
			return toolkit.M{"title": "Dashboard", "href": route}
		})
	}

	t.Server.Route("/chart", func(r *knot.WebContext) interface{} {
		r.Config.LayoutTemplate = t.layoutFile
		r.Config.IncludeFiles = t.includeFiles
		r.Config.ViewName = "view/chart.html"
		return toolkit.M{"title": "Chart Builder", "href": "/chartbuilder"}
	})
	t.Server.Route("/grid", func(r *knot.WebContext) interface{} {
		r.Config.LayoutTemplate = t.layoutFile
		r.Config.IncludeFiles = t.includeFiles
		r.Config.ViewName = "view/grid.html"
		return toolkit.M{"title": "Grid", "href": "/grid"}
	})
	t.Server.Route("/datasource", func(r *knot.WebContext) interface{} {
		r.Config.LayoutTemplate = t.layoutFile
		r.Config.IncludeFiles = t.includeFiles
		r.Config.ViewName = "view/datasource.html"
		return toolkit.M{"title": "Grid", "href": "/datasource"}
	})
	t.Server.Route("/page", func(r *knot.WebContext) interface{} {
		r.Config.LayoutTemplate = t.layoutFile
		r.Config.IncludeFiles = t.includeFiles
		r.Config.ViewName = "view/page.html"
		return toolkit.M{"title": "Grid", "href": "/page"}
	})
}

func (t *WebTemplate) Listen() {
	t.Server.Listen()
}

func (t *WebTemplate) Open() {
	time.AfterFunc(time.Second, func() {
		exec.Command("open", "http://"+t.Server.Address).Run()
	})
}

func main() {
	yo := InitWebTemplate()
	yo.Server.Address = "localhost:7878"
	// yo.Open()
	yo.Listen()
}
