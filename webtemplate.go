package main

import (
	"github.com/eaciit/knot/knot.v1"
	"github.com/eaciit/webtemplate/controller"
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
		selectorController   *controller.SelectorController
		pageController       *controller.PageController
		designerController   *controller.DesignerController
	}
)

func InitWebTemplate() *WebTemplate {
	yo := new(WebTemplate)

	// prepare view path
	v, _ := os.Getwd()
	yo.appViewsPath = v + "/"
	yo.layoutFile = "view/layout.html"
	yo.includeFiles = []string{"view/_head.html"}
	yo.Server = new(knot.Server)

	knot.DefaultOutputType = knot.OutputTemplate

	// initiate controller
	yo.templateController = &controller.TemplateController{yo.appViewsPath, yo.Server, yo.layoutFile, yo.includeFiles}
	yo.chartController = &controller.ChartController{yo.appViewsPath}
	yo.dataSourceController = &controller.DataSourceController{yo.appViewsPath}
	yo.gridController = &controller.GridController{yo.appViewsPath}
	yo.selectorController = &controller.SelectorController{yo.appViewsPath}
	yo.pageController = &controller.PageController{yo.appViewsPath}
	yo.designerController = &controller.DesignerController{yo.appViewsPath}

	// initiate server
	yo.Server.Address = "localhost:3000"
	yo.Server.RouteStatic("static", yo.appViewsPath)
	yo.templateController.RegisterRoutes()
	yo.Server.Register(yo.templateController, "")
	yo.Server.Register(yo.chartController, "")
	yo.Server.Register(yo.dataSourceController, "")
	yo.Server.Register(yo.selectorController, "")
	yo.Server.Register(yo.gridController, "")
	yo.Server.Register(yo.pageController, "")
	yo.Server.Register(yo.designerController, "")

	return yo
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
	yo.Server.Listen()
}
