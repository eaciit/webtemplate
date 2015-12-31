package controller

import (
	"encoding/json"
	"github.com/eaciit/knot/knot.v1"
	"github.com/eaciit/webtemplate/helper"
	"io/ioutil"
	"strings"
)

type DesignerController struct {
	AppViewsPath string
}

func (t *DesignerController) GetConfig(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	helper.HandleError(err)
	_id := payload["_id"]

	bytes, err := ioutil.ReadFile(t.AppViewsPath + "data/page/page-" + _id + ".json")
	helper.HandleError(err)
	data := map[string]interface{}{}
	err = json.Unmarshal(bytes, &data)
	helper.HandleError(err)

	return data
}

func (t *DesignerController) SetDataSource(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	helper.HandleError(err)
	_id := payload["_id"]

	config := t.GetConfig(r).(map[string]interface{})
	config["datasources"] = strings.Split(payload["datasources"], ",")

	filename := t.AppViewsPath + "data/page/page-" + _id + ".json"
	bytes, err := json.Marshal(config)
	helper.HandleError(err)
	ioutil.WriteFile(filename, bytes, 0644)

	return true
}

func (t *DesignerController) GetWidget(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	helper.HandleError(err)

	if payload["type"] == "chart" {
		bytes, err := ioutil.ReadFile(t.AppViewsPath + "data/chart/chart-" + payload["widgetID"] + ".json")
		helper.HandleError(err)
		data := map[string]interface{}{}
		err = json.Unmarshal(bytes, &data)
		helper.HandleError(err)

		return data
	} else if payload["type"] == "grid" {
		connection, err := helper.LoadConfig(t.AppViewsPath + "data/grid/" + payload["widgetID"] + ".json")
		helper.HandleError(err)
		defer connection.Close()

		cursor, err := connection.NewQuery().Select("*").Cursor(nil)
		helper.HandleError(err)
		defer cursor.Close()

		dataSource, err := cursor.Fetch(nil, 0, false)
		helper.HandleError(err)

		return dataSource.Data
	}

	return map[string]interface{}{}
}
