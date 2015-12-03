package main

import (
	"fmt"
	"github.com/eaciit/dbox"
	_ "github.com/eaciit/dbox/dbc/json"
	// "github.com/eaciit/knot"
	// "github.com/eaciit/knot/appcontainer"
	"github.com/eaciit/knot/knot.v1"
	// "github.com/eaciit/toolkit"
	"os"
	// "time"
)

var (
	appViewsPath = func() string {
		d, _ := os.Getwd()
		return d
	}() + "/"
)

func main() {
	// app := knot.NewApp("Webtemplate")
	// app.ViewsPath = appViewsPath
	// app.Register(&TemplateController{})
	// app.Static("static", "/Users/arfianbagus/Documents/go/src/github.com/eaciit/webtemplate/")
	// app.LayoutTemplate = "index.html"
	// knot.RegisterApp(app)

	knot.DefaultOutputType = knot.OutputTemplate
	ks := new(knot.Server)
	ks.Address = "localhost:7878"
	ks.Register(new(TemplateController), "")
	ks.RouteStatic("static", appViewsPath)
	ks.Listen()
}

type TemplateController struct {
}

func prepareConnection(pathJson string) (dbox.IConnection, error) {
	ci := &dbox.ConnectionInfo{pathJson, "", "", "", nil}

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

func (w *TemplateController) GetMenuTop(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson
	c, e := prepareConnection(appViewsPath + "/config/topmenu.json")
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

	//rets := []toolkit.M{}

	ds, e := csr.Fetch(nil, 0, false)
	if e != nil {
		fmt.Printf("Unable to fetch all: %s \n", e.Error())
	} else {
		fmt.Printf("Fetch all OK. Result: %d \n", len(ds.Data))
	}
	return ds.Data
}

func (w *TemplateController) GetMenuLeft(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson
	c, e := prepareConnection(appViewsPath + "/config/leftmenu.json")
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

	//rets := []toolkit.M{}

	ds, e := csr.Fetch(nil, 0, false)
	if e != nil {
		fmt.Printf("Unable to fetch all: %s \n", e.Error())
	} else {
		fmt.Printf("Fetch all OK. Result: %d \n", len(ds.Data))
	}
	return ds.Data
}
