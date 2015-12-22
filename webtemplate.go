package main

import (
	"encoding/json"
	"fmt"
	"github.com/eaciit/knot/knot.v1"
	"github.com/eaciit/toolkit"
	"github.com/eaciit/webtemplate/helper"
	m "github.com/eaciit/webtemplate/models"
	"gopkg.in/mgo.v2/bson"
	"io"
	"os"
	"os/exec"
	"time"
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
	routes := t.GetRoutes(helper.FakeWebContext()).([]interface{})

	helper.Recursiver(routes, func(each interface{}) []interface{} {
		return each.(bson.M)["submenu"].([]interface{})
	}, func(each interface{}) {
		eachMap := each.(bson.M)
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
	t.Server.Route("/grid", func(r *knot.WebContext) interface{} {
		r.Config.ViewName = "view/grid.html"
		return toolkit.M{"title": "Grid", "href": "/grid"}
	})
}

func (t *TemplateController) Listen() {
	t.Server.Listen()
}

func (t *TemplateController) GetRoutes(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	connection, err := helper.Connect()
	helper.HandleError(err)
	defer connection.Close()

	cursor, err := connection.NewQuery().From("routes").Cursor(nil)
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

	connection, err := helper.Connect()
	helper.HandleError(err)
	defer connection.Close()

	cursor, err := connection.NewQuery().From("leftmenus").Cursor(nil)
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

	connection, err := helper.LoadConfig(t.appViewsPath + "config/header-app.json")
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

	if payload["href"] == "/" || payload["href"] == "/index" {
		return []bson.M{{"title": "Dashboard", "href": "/index"}}
	}

	routes := t.GetRoutes(helper.FakeWebContext()).([]interface{})
	breadcrumbs := []bson.M{}

	for _, level1 := range routes {
		var level1Each = level1.(bson.M)
		var level1Title = level1Each["title"].(string)
		var level1Href = level1Each["href"].(string)
		var level1Submenu = level1Each["submenu"].([]interface{})

		if level1Title == payload["title"] && level1Href == payload["href"] {
			breadcrumbs = append(breadcrumbs, level1Each)
			return breadcrumbs
		}

		if len(level1Submenu) > 0 {
			for _, level2 := range level1Submenu {
				var level2Each = level2.(bson.M)
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
	r.Config.OutputType = knot.OutputJson

	connection, err := helper.Connect()
	helper.HandleError(err)
	defer connection.Close()

	cursor, err := connection.NewQuery().From("datasources").Cursor(nil)
	helper.HandleError(err)
	if cursor == nil {
		fmt.Printf("Cursor not initialized")
	}
	defer cursor.Close()

	dataSource, err := cursor.Fetch(nil, 0, false)
	helper.HandleError(err)

	return dataSource.Data
}

func (t *TemplateController) GetDataSource(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	helper.HandleError(err)

	if payload["type"] == "file" {
		connection, err := helper.LoadConfig(t.appViewsPath + "data/" + payload["path"])
		helper.HandleError(err)
		defer connection.Close()

		cursor, err := connection.NewQuery().Select("").Cursor(nil)
		helper.HandleError(err)
		if cursor == nil {
			fmt.Printf("Cursor not initialized")
		}
		defer cursor.Close()

		dataSource, err := cursor.Fetch(nil, 0, false)
		helper.HandleError(err)

		return dataSource.Data
	} else if payload["type"] == "url" {
		data, err := helper.FetchJSON(payload["path"])
		helper.HandleError(err)

		return data
	}

	return []interface{}{}
}

func (t *TemplateController) RemoveDataSource(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	helper.HandleError(err)

	connection, err := helper.Connect()
	helper.HandleError(err)
	defer connection.Close()

	err = connection.NewQuery().From("datasources").Delete().Exec(toolkit.M{"data": payload})
	helper.HandleError(err)
	success := err == nil

	if payload["type"] == "file" {
		err = os.Remove(t.appViewsPath + "data/" + payload["path"])
		helper.HandleError(err)
	}

	return success
}

func (t *TemplateController) ChartBuilder(r *knot.WebContext) interface{} {
	r.Config.ViewName = "view/chart.html"
	return toolkit.M{"title": "Chart Builder", "href": "/chartbuilder"}
}

func (t *TemplateController) Open() {
	time.AfterFunc(time.Second, func() {
		exec.Command("open", "http://"+t.Server.Address).Run()
	})
}

func (t *TemplateController) SaveJsonGrid(r *knot.WebContext) interface{} {
	datagrid := m.Grid{}
	err := r.GetPayload(&datagrid)

	f, err := os.Create(t.appViewsPath + "data/grid/grid1.json")
	b, err := json.Marshal(datagrid)
	n, err := io.WriteString(f, string(b))
	if err != nil {
		fmt.Println(n, err)
	}
	return datagrid
}

func main() {
	yo := InitTemplateController()
	yo.Server.Address = "localhost:7878"
	yo.Open()
	yo.Listen()
}
