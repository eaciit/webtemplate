package main

import (
	"fmt"
	"github.com/eaciit/dbox"
	_ "github.com/eaciit/dbox/dbc/json"
	"github.com/eaciit/knot/knot.v1"
	"io/ioutil"
	"os"
)

type TemplateController struct {
	appViewsPath string
	Server       *knot.Server
}

type EaciitTemplate struct {
	TemplateController
}

func InitTemplateController() *TemplateController {
	e := new(TemplateController)

	// prepare view path
	v, _ := os.Getwd()
	e.appViewsPath = v + "/"

	// set knot output type
	knot.DefaultOutputType = knot.OutputTemplate

	// initiate server
	e.Server = new(knot.Server)
	e.Server.Address = "localhost:3000"
	e.Server.RouteStatic("static", e.appViewsPath)
	e.Server.Register(e, "")

	return e
}

func (t *TemplateController) Listen() {
	s := *t.Server
	s.Listen()
}

func (t *TemplateController) prepareConnection(pathJson string) (dbox.IConnection, error) {
	ci := &dbox.ConnectionInfo{t.appViewsPath + pathJson, "", "", "", nil}
	c, e := dbox.NewConnection("json", ci)

	if e != nil {
		fmt.Printf("Yo to connect %s \n", e.Error())
		return nil, e
	}

	e = c.Connect()
	if e != nil {
		fmt.Printf("Yoi to connect %s \n", e.Error())
		return nil, e
	}

	return c, nil
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

	c, e := t.prepareConnection("/config/top-menu.json")
	if e != nil {
		fmt.Printf("Unable to connect %s \n", e.Error())
	}
	defer c.Close()

	csr, e := c.NewQuery().Select("title").Cursor(nil)
	if e != nil {
		fmt.Printf("Cursor pre error: %s \n", e.Error())
	}
	if csr == nil {
		fmt.Printf("Cursor not initialized")
	}
	defer csr.Close()

	ds, e := csr.Fetch(nil, 0, false)
	if e != nil {
		fmt.Printf("Unable to fetch all: %s \n", e.Error())
	} else {
		fmt.Printf("Fetch all OK. Result: %d \n", len(ds.Data))
	}

	return ds.Data
}

func (t *TemplateController) GetMenuLeft(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	c, e := t.prepareConnection("/config/left-menu.json")
	if e != nil {
		fmt.Printf("Unable to connect %s \n", e.Error())
	}
	defer c.Close()

	csr, e := c.NewQuery().Select("titlegroup").Cursor(nil)
	if e != nil {
		fmt.Printf("Cursor pre error: %s \n", e.Error())
	}
	if csr == nil {
		fmt.Printf("Cursor not initialized")
	}
	defer csr.Close()

	ds, e := csr.Fetch(nil, 0, false)
	if e != nil {
		fmt.Printf("Unable to fetch all: %s \n", e.Error())
	} else {
		fmt.Printf("Fetch all OK. Result: %d \n", len(ds.Data))
	}

	return ds.Data
}

func (t *TemplateController) GetHtmlWidget(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputByte
	type Widget struct {
		Path string
	}
	datawidget := Widget{}
	r.GetPayload(&datawidget)

	fmt.Println(datawidget)
	fmt.Println(r.Query("path"))
	fmt.Println(r.Request.FormValue("path"))
	fmt.Println(r.Request.Body)

	widgetFile, err := ioutil.ReadFile(t.appViewsPath + "/config/add-widget.html")
	if err != nil {
		fmt.Println(err)
	}

	return string(widgetFile)
}

func (t *TemplateController) GetHtmlDataBind(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputByte

	widgetFile, err := ioutil.ReadFile(t.appViewsPath + "/config/widget-databind.html")
	if err != nil {
		fmt.Println(err)
	}

	return string(widgetFile)
}

func main() {
	e := InitTemplateController()
	e.Server.Address = "localhost:7878"
	e.Listen()
}
