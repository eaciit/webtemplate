package main

import (
	"encoding/json"
	"fmt"
	"github.com/eaciit/knot/knot.v1"
	"github.com/eaciit/toolkit"
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
	connection, err := helper.LoadConfig(t.appViewsPath + "/config/routes.json")
	helper.HandleError(err)
	defer connection.Close()

	cursor, err := connection.NewQuery().Select("title").Cursor(nil)
	helper.HandleError(err)
	defer cursor.Close()

	dataSource, err := cursor.Fetch(nil, 0, false)
	helper.HandleError(err)

	helper.Recursiver(dataSource.Data, func(each interface{}) []interface{} {
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
}

func (t *TemplateController) Listen() {
	t.Server.Listen()
}

func (t *TemplateController) GetRoutes(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	connection, err := helper.LoadConfig(t.appViewsPath + "/config/routes.json")
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

func (t *TemplateController) GetHeader(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	connection, err := helper.LoadConfig(t.appViewsPath + "/config/header-app.json")
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

func (t *TemplateController) GetBreadcrumb(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	helper.HandleError(err)

	connection, err := helper.LoadConfig(t.appViewsPath + "/config/routes.json")
	helper.HandleError(err)
	defer connection.Close()

	cursor, err := connection.NewQuery().Select("title").Cursor(nil)
	helper.HandleError(err)
	defer cursor.Close()

	dataSource, err := cursor.Fetch(nil, 0, false)
	helper.HandleError(err)

	breadcrumbs := []map[string]interface{}{}

	if payload["href"] == "/" || payload["href"] == "/index" {
		return []map[string]interface{}{{"title": "Dashboard", "href": "/index"}}
	}

	for _, level1 := range dataSource.Data {
		var level1Each = level1.(map[string]interface{})
		var level1Title = level1Each["title"].(string)
		var level1Href = level1Each["href"].(string)
		var level1Submenu = level1Each["submenu"].([]interface{})

		if level1Title == payload["title"] && level1Href == payload["href"] {
			breadcrumbs = append(breadcrumbs, level1Each)
			return breadcrumbs
		}

		if len(level1Submenu) > 0 {
			for _, level2 := range level1Submenu {
				var level2Each = level2.(map[string]interface{})
				var level2Title = level2Each["title"].(string)
				var level2Href = level2Each["href"].(string)
				// var level2Submenu = level2Each["submenu"].([]interface{})

				if level2Title == payload["title"] && level2Href == payload["href"] {
					breadcrumbs = append(breadcrumbs, level1Each)
					breadcrumbs = append(breadcrumbs, level2Each)
					return breadcrumbs
				}
			}
		}
	}

	return breadcrumbs
}

func (t *TemplateController) GetDataSources(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputByte

	files, err := ioutil.ReadDir(t.appViewsPath + "/data")
	helper.HandleError(err)

	filenames := []string{}
	for _, f := range files {
		filenames = append(filenames, f.Name())
	}

	bytes, err := json.Marshal(filenames)
	helper.HandleError(err)

	return string(bytes)
}

func (t *TemplateController) GetDataSource(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputByte

	payload := map[string]string{}
	err := r.GetForms(&payload)
	helper.HandleError(err)

	content, err := ioutil.ReadFile(t.appViewsPath + "/data/" + payload["id"])
	helper.HandleError(err)

	return string(content)
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
