package eaciittemplate

import (
	// "github.com/eaciit/knot"
	"github.com/eaciit/knot/appcontainer"
	// "github.com/eaciit/toolkit"
	"os"
	// "time"
)

var (
	appViewsPath = func() string {
		d, _ := os.Getwd()
		return d
	}() + "/../webtemplate/view/"
)

func init() {
	app := appcontainer.NewApp("Webtemplate")
	app.ViewsPath = appViewsPath
	app.Register(&TemplateController{})
	app.Static("static", "/Users/arfianbagus/Documents/go/src/github.com/eaciit/webtemplate/")
	app.LayoutTemplate = "index.html"
	appcontainer.RegisterApp(app)
}

type TemplateController struct {
}
