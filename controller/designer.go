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

func (t *DesignerController) GetWidgets(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	helper.HandleError(err)

	if payload["type"] == "chart" {
		bytes, err := ioutil.ReadFile(t.AppViewsPath + "data/chart.json")
		helper.HandleError(err)
		data := []map[string]interface{}{}
		err = json.Unmarshal(bytes, &data)
		helper.HandleError(err)

		return data
	} else if payload["type"] == "grid" {
		bytes, err := ioutil.ReadFile(t.AppViewsPath + "data/mapgrid.json")
		helper.HandleError(err)
		data := []map[string]interface{}{}
		err = json.Unmarshal(bytes, &data)
		helper.HandleError(err)

		return data[0]["data"]
	}

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

func (t *DesignerController) AddWidget(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	helper.HandleError(err)

	_id := payload["_id"]
	config := t.GetConfig(r).(map[string]interface{})
	content := config["content"].([]interface{})
	contentNew := map[string]interface{}{
		"dataSource": payload["dataSource"],
		"title":      payload["title"],
		"type":       payload["type"],
		"widgetID":   payload["widgetID"],
	}

	for i, eachRaw := range content {
		each := eachRaw.(map[string]interface{})
		if each["panelID"] == payload["panelID"] {
			each["content"] = append([]interface{}{contentNew}, each["content"].([]interface{}))
		}

		config["content"].([]interface{})[i] = each
	}

	filename := t.AppViewsPath + "data/page/page-" + _id + ".json"
	bytes, err := json.Marshal(config)
	helper.HandleError(err)
	ioutil.WriteFile(filename, bytes, 0644)

	return true
}

func (t *DesignerController) AddPanel(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]interface{}{}
	err := r.GetForms(&payload)
	helper.HandleError(err)

	_id := payload["_id"].(string)
	title := payload["title"].(string)
	var width int = int(payload["width"].(float64))
	panelID := helper.RandomIDWithPrefix("p")

	config := t.GetConfig(r).(map[string]interface{})
	contentOld := config["content"].([]interface{})
	contentNew := map[string]interface{}{
		"panelID": panelID,
		"title":   title,
		"width":   width,
		"content": []interface{}{},
	}
	config["content"] = append([]interface{}{contentNew}, contentOld...)

	filename := t.AppViewsPath + "data/page/page-" + _id + ".json"
	bytes, err := json.Marshal(config)
	helper.HandleError(err)
	ioutil.WriteFile(filename, bytes, 0644)

	return panelID
}

func (t *DesignerController) RemovePanel(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	helper.HandleError(err)

	_id := payload["_id"]

	config := t.GetConfig(r).(map[string]interface{})
	contentOld := config["content"].([]interface{})
	contentNew := []interface{}{}

	for _, each := range contentOld {
		if each.(map[string]interface{})["panelID"] == _id {
			continue
		}

		contentNew = append(contentNew, each)
	}

	config["content"] = contentNew

	filename := t.AppViewsPath + "data/page/page-" + _id + ".json"
	bytes, err := json.Marshal(config)
	helper.HandleError(err)
	ioutil.WriteFile(filename, bytes, 0644)

	return true
}
