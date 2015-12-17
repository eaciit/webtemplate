package main

import (
	"fmt"
	"github.com/eaciit/knot/knot.v1"
	"github.com/eaciit/webtemplate/helper"
	"io/ioutil"
	"os"
)

type (
	TemplateController struct {
		appViewsPath string
		layoutFile   string
		Server       *knot.Server
	}

	EaciitTemplate struct {
		TemplateController
	}
)

func InitTemplateController() *TemplateController {
	yo := new(TemplateController)

	// prepare view path
	v, _ := os.Getwd()
	yo.appViewsPath = v + "/"
	yo.layoutFile = "view/layout.html"

	// set knot output type
	knot.DefaultOutputType = knot.OutputTemplate

	// initiate server
	yo.Server = new(knot.Server)
	yo.Server.Address = "localhost:3000"
	yo.Server.RouteStatic("static", yo.appViewsPath)
	yo.RegisterRoutes()
	yo.Server.Register(yo, "")

	return yo
}

func (t *TemplateController) RegisterRoutes() {
	connection, err := helper.LoadConfig(t.appViewsPath + "/config/top-menu.json")
	helper.HandleError(err)
	defer connection.Close()

	cursor, err := connection.NewQuery().Select("title").Cursor(nil)
	helper.HandleError(err)
	defer cursor.Close()

	dataSource, err := cursor.Fetch(nil, 0, false)
	helper.HandleError(err)

	// dynamically route the url to single file
	for _, eachDS := range dataSource.Data {
		href := eachDS.(map[string]interface{})["href"].(string)

		if href == "" || href == "#" || href == "/index" {
			continue
		}

		t.Server.Route(href, func(r *knot.WebContext) interface{} {
			r.Config.ViewName = t.layoutFile
			return ""
		})
	}

	// route the / and /index
	for _, route := range []string{"/", "/index"} {
		t.Server.Route(route, func(r *knot.WebContext) interface{} {
			r.Config.ViewName = t.layoutFile
			return ""
		})
	}
}

func (t *TemplateController) Listen() {
	t.Server.Listen()
}

func (t *TemplateController) GetMenuTop(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	connection, err := helper.LoadConfig(t.appViewsPath + "/config/top-menu.json")
	helper.HandleError(err)
	defer connection.Close()

	cursor, err := connection.NewQuery().Select("title").Cursor(nil)
	helper.HandleError(err)
	if cursor == nil {
		fmt.Printf("Cursor not initialized")
	}
	defer cursor.Close()

	dataSource, err := cursor.Fetch(nil, 0, false)
	helper.HandleError(err)

	return dataSource.Data
}

func (t *TemplateController) GetMenuLeft(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	connection, err := helper.LoadConfig(t.appViewsPath + "/config/left-menu.json")
	helper.HandleError(err)
	defer connection.Close()

	cursor, err := connection.NewQuery().Select("titlegroup").Cursor(nil)
	helper.HandleError(err)
	if cursor == nil {
		fmt.Printf("Cursor not initialized")
	}
	defer cursor.Close()

	dataSource, err := cursor.Fetch(nil, 0, false)
	helper.HandleError(err)

	return dataSource.Data
}

func (t *TemplateController) GetHtmlWidget(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputByte

	content, err := ioutil.ReadFile(t.appViewsPath + "/config/add-widget.html")
	helper.HandleError(err)

	return string(content)
}

func (t *TemplateController) GetHtmlDataBind(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputByte

	content, err := ioutil.ReadFile(t.appViewsPath + "/config/widget-databind.html")
	helper.HandleError(err)

	return string(content)
}

func main() {
	yo := InitTemplateController()
	yo.Server.Address = "localhost:7878"
	yo.Listen()
}
