package main

import (
	"fmt"
	"github.com/eaciit/dbox"
	_ "github.com/eaciit/dbox/dbc/json"
	"github.com/eaciit/knot/knot.v1"
	"io/ioutil"
	"os"
)

type (
	TemplateController struct {
		appViewsPath string
		Server       *knot.Server
	}

	EaciitTemplate struct {
		TemplateController
	}
)

func handleError(err error, optionalArgs ...interface{}) bool {
	if err != nil {
		fmt.Printf("error occured: %s", err.Error())

		if len(optionalArgs) > 0 {
			optionalArgs[0].(func(bool))(false)
		}

		return false
	}

	if len(optionalArgs) > 0 {
		optionalArgs[0].(func(bool))(true)
	}

	return true
}

func InitTemplateController() *TemplateController {
	e := new(TemplateController)

	// prepare view path
	v, _ := os.Getwd()
	e.appViewsPath = v + "/"

	// set knot output type
	knot.DefaultOutputType = knot.OutputHtml

	// initiate server
	e.Server = new(knot.Server)
	e.Server.Address = "localhost:3000"
	e.Server.RouteStatic("static", e.appViewsPath)
	e.RegisterRoutes()
	e.Server.Register(e, "")

	return e
}

func (t *TemplateController) RegisterRoutes() {
	connection, err := t.prepareConnection("/config/top-menu.json")
	handleError(err)
	defer connection.Close()

	cursor, err := connection.NewQuery().Select("title").Cursor(nil)
	handleError(err)
	defer cursor.Close()

	dataSource, err := cursor.Fetch(nil, 0, false)
	handleError(err)
	content, err := ioutil.ReadFile(t.appViewsPath + "/view/layout.html")
	handleError(err)

	// dynamically route the url to single file
	for _, eachDS := range dataSource.Data {
		href := eachDS.(map[string]interface{})["href"].(string)

		if href == "" || href == "#" || href == "/index" {
			continue
		}

		t.Server.Route(href, func(wc *knot.WebContext) interface{} {
			return string(content)
		})
	}

	// route the / and /index
	for _, route := range []string{"/", "/index"} {
		t.Server.Route(route, func(wc *knot.WebContext) interface{} {
			return string(content)
		})
	}
}

func (t *TemplateController) Listen() {
	server := *t.Server
	server.Listen()
}

func (t *TemplateController) prepareConnection(pathJson string) (dbox.IConnection, error) {
	connectionInfo := &dbox.ConnectionInfo{t.appViewsPath + pathJson, "", "", "", nil}
	connection, e := dbox.NewConnection("json", connectionInfo)
	if !handleError(e) {
		return nil, e
	}
	defer connection.Close()

	e = connection.Connect()
	if !handleError(e) {
		return nil, e
	}

	return connection, nil
}

func (t *TemplateController) Index(r *knot.WebContext) interface{} {
	r.Config.ViewName = "view/index.html"
	return ""
}

func (t *TemplateController) Widget(r *knot.WebContext) interface{} {
	r.Config.ViewName = "view/widget.html"
	return ""
}

func (t *TemplateController) GetMenuTop(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	connection, err := t.prepareConnection("/config/top-menu.json")
	handleError(err)
	defer connection.Close()

	cursor, err := connection.NewQuery().Select("title").Cursor(nil)
	handleError(err)
	if cursor == nil {
		fmt.Printf("Cursor not initialized")
	}
	defer cursor.Close()

	dataSource, err := cursor.Fetch(nil, 0, false)
	handleError(err)

	return dataSource.Data
}

func (t *TemplateController) GetMenuLeft(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	connection, err := t.prepareConnection("/config/left-menu.json")
	handleError(err)
	defer connection.Close()

	cursor, err := connection.NewQuery().Select("titlegroup").Cursor(nil)
	handleError(err)
	if cursor == nil {
		fmt.Printf("Cursor not initialized")
	}
	defer cursor.Close()

	dataSource, err := cursor.Fetch(nil, 0, false)
	handleError(err)

	return dataSource.Data
}

func (t *TemplateController) GetHtmlWidget(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputByte

	content, err := ioutil.ReadFile(t.appViewsPath + "/config/add-widget.html")
	handleError(err)

	return string(content)
}

func (t *TemplateController) GetHtmlDataBind(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputByte

	content, err := ioutil.ReadFile(t.appViewsPath + "/config/widget-databind.html")
	handleError(err)

	return string(content)
}

func main() {
	yo := InitTemplateController()
	yo.Server.Address = "localhost:7878"
	yo.Listen()
}
