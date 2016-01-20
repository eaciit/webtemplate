package controller

import (
	"encoding/json"
	"github.com/eaciit/dbox"
	"github.com/eaciit/knot/knot.v1"
	"github.com/eaciit/webtemplate/helper"
	"io/ioutil"
	"strconv"
	"strings"
)

type DesignerController struct {
	AppViewsPath string
}

func (t *DesignerController) getConfig(_id string) (map[string]interface{}, error) {
	bytes, err := ioutil.ReadFile(t.AppViewsPath + "data/page/page-" + _id + ".json")
	if !helper.HandleError(err) {
		return nil, err
	}

	data := map[string]interface{}{}
	err = json.Unmarshal(bytes, &data)
	if !helper.HandleError(err) {
		return nil, err
	}

	return data, nil
}
func (t *DesignerController) setConfig(_id string, config map[string]interface{}) error {
	filename := t.AppViewsPath + "data/page/page-" + _id + ".json"
	bytes, err := json.Marshal(config)
	if !helper.HandleError(err) {
		return err
	}

	err = ioutil.WriteFile(filename, bytes, 0644)
	if !helper.HandleError(err) {
		return err
	}

	return nil
}

func (t *DesignerController) GetConfig(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}
	_id := payload["_id"]

	data, err := t.getConfig(_id)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	connection, err := helper.LoadConfig(t.AppViewsPath + "/data/routes.json")
	if !helper.HandleError(err) {
		helper.Result(false, nil, err.Error())
	}
	defer connection.Close()

	cursor, err := connection.NewQuery().Where(dbox.Eq("_id", _id)).Cursor(nil)
	if !helper.HandleError(err) {
		helper.Result(false, nil, err.Error())
	}
	defer cursor.Close()

	dataSource, err := cursor.Fetch(nil, 0, false)
	if !helper.HandleError(err) {
		helper.Result(false, nil, err.Error())
	}
	data["href"] = dataSource.Data[0].(map[string]interface{})["href"]

	return helper.Result(true, data, "")
}

func (t *DesignerController) SetDataSource(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}
	_id := payload["_id"]

	config, err := t.getConfig(_id)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}
	config["datasources"] = strings.Split(payload["datasources"], ",")

	err = t.setConfig(_id, config)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	return helper.Result(true, nil, "")
}

func (t *DesignerController) GetWidgets(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	if payload["type"] == "chart" {
		bytes, err := ioutil.ReadFile(t.AppViewsPath + "data/chart.json")
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}

		data := []map[string]interface{}{}
		err = json.Unmarshal(bytes, &data)
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}

		return helper.Result(true, data, "")
	} else if payload["type"] == "grid" {
		bytes, err := ioutil.ReadFile(t.AppViewsPath + "data/mapgrid.json")
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}

		data := []map[string]interface{}{}
		err = json.Unmarshal(bytes, &data)
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}

		return helper.Result(true, data[0]["data"], "")
	} else if payload["type"] == "selector" {
		bytes, err := ioutil.ReadFile(t.AppViewsPath + "data/selector.json")
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}

		data := []map[string]interface{}{}
		err = json.Unmarshal(bytes, &data)
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}

		return helper.Result(true, data, "")
	}

	return helper.Result(true, []map[string]interface{}{}, "")
}

func (t *DesignerController) GetWidget(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]interface{}{}
	err := r.GetForms(&payload)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	if payload["type"].(string) == "chart" {
		bytes, err := ioutil.ReadFile(t.AppViewsPath + "data/chart/chart-" + payload["widgetID"].(string) + ".json")
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}

		data := map[string]interface{}{}
		err = json.Unmarshal(bytes, &data)
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}

		return helper.Result(true, data, "")
	} else if payload["type"].(string) == "grid" {
		connection, err := helper.LoadConfig(t.AppViewsPath + "data/grid/" + payload["widgetID"].(string) + ".json")
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
		defer connection.Close()

		cursor, err := connection.NewQuery().Select("*").Cursor(nil)
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
		defer cursor.Close()

		dataSource, err := cursor.Fetch(nil, 0, false)
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}

		return helper.Result(true, dataSource.Data, "")
	} else if payload["type"] == "selector" {
		connection, err := helper.LoadConfig(t.AppViewsPath + "data/selector.json")
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
		defer connection.Close()

		cursor, err := connection.NewQuery().Where(dbox.Eq("_id", payload["widgetID"].(string))).Cursor(nil)
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
		defer cursor.Close()

		dataSource, err := cursor.Fetch(nil, 0, false)
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}

		return helper.Result(true, dataSource.Data, "")
	}

	return helper.Result(true, map[string]interface{}{}, "")
}

func (t *DesignerController) GetWidgetMetaData(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}
	_id := payload["_id"]

	config, err := t.getConfig(_id)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	for _, eachRaw := range config["content"].([]interface{}) {
		each := eachRaw.(map[string]interface{})

		if each["panelID"] == payload["panelID"] {
			for _, subRaw := range each["content"].([]interface{}) {
				sub := subRaw.(map[string]interface{})

				if sub["widgetID"] == payload["widgetID"] {
					return helper.Result(true, sub, "")
				}
			}
		}
	}

	return helper.Result(false, nil, "")
}

func (t *DesignerController) SaveWidget(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]interface{}{}
	err := r.GetForms(&payload)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}
	_id := payload["_id"].(string)
	panelWidgetID := payload["panelWidgetID"].(string)

	width := int(100)
	if _, ok := payload["width"]; ok {
		width = int(payload["width"].(float64))
	}

	height := int(400)
	if _, ok := payload["height"]; ok {
		height = int(payload["height"].(float64))
	}

	config, err := t.getConfig(_id)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}
	content := config["content"].([]interface{})
	contentNew := map[string]interface{}{
		"panelWidgetID": panelWidgetID,
		"dataSource":    payload["dataSource"].(string),
		"title":         payload["title"].(string),
		"type":          payload["type"].(string),
		"widgetID":      payload["widgetID"].(string),
		"width":         width,
		"height":        height,
	}

	if panelWidgetID == "" {
		panelWidgetID = helper.RandomIDWithPrefix("pw")
		contentNew["panelWidgetID"] = panelWidgetID

		for i, eachRaw := range content {
			each := eachRaw.(map[string]interface{})
			if each["panelID"] == payload["panelID"] {
				each["content"] = append([]interface{}{contentNew}, each["content"].([]interface{})...)
			}

			config["content"].([]interface{})[i] = each
		}

		err = t.setConfig(_id, config)
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
	} else {
	outer:
		for i, eachRaw := range content {
			each := eachRaw.(map[string]interface{})
			if each["panelID"] == payload["panelID"] {
				for j, subRaw := range each["content"].([]interface{}) {
					sub := subRaw.(map[string]interface{})
					if sub["panelWidgetID"] == panelWidgetID {
						content[i].(map[string]interface{})["content"].([]interface{})[j] = contentNew
						break outer
					}
				}
			}
		}

		config["content"] = content
		err = t.setConfig(_id, config)
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
	}

	return helper.Result(true, nil, "")
}

func (t *DesignerController) GetPanel(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	data, err := t.getConfig(payload["_id"])

	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	for _, eachRaw := range data["content"].([]interface{}) {
		each := eachRaw.(map[string]interface{})
		if each["panelID"] == payload["panelID"] {
			offset := 0
			if _, ok := each["offset"]; ok {
				offset = int(each["offset"].(float64))
			}

			data := map[string]interface{}{
				"_id":    each["panelID"],
				"title":  each["title"],
				"width":  int(each["width"].(float64)),
				"offset": offset,
				"hideContainerPanel": each["hideContainerPanel"],
			}
			return helper.Result(true, data, "")
		}
	}

	return helper.Result(true, map[string]interface{}{}, "")
}

func (t *DesignerController) SavePanel(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]interface{}{}
	err := r.GetForms(&payload)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	_id := payload["_id"].(string)
	title := payload["title"].(string)
	hide, _ := strconv.ParseBool(payload["hide"].(string))
	var width int = int(payload["width"].(float64))
	var offset int = int(payload["offset"].(float64))
	hideContainerPanel, _ := strconv.ParseBool(payload["hideContainerPanel"].(string))

	panelID := payload["panelID"].(string)

	config, err := t.getConfig(_id)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}
	contentOld := config["content"].([]interface{})

	if panelID == "" {
		panelID = helper.RandomIDWithPrefix("p")
		contentNew := map[string]interface{}{
			"panelID": panelID,
			"title":   title,
			"width":   width,
			"offset":  offset,
			"hide":    hide,
			"hideContainerPanel":    hideContainerPanel,
			"content": []interface{}{},
		}
		config["content"] = append([]interface{}{contentNew}, contentOld...)
	} else {
		for i, eachRaw := range contentOld {
			each := eachRaw.(map[string]interface{})
			if each["panelID"] == payload["panelID"] {
				contentOld[i].(map[string]interface{})["title"] = title
				contentOld[i].(map[string]interface{})["width"] = width
				contentOld[i].(map[string]interface{})["offset"] = offset
				contentOld[i].(map[string]interface{})["hideContainerPanel"] = hideContainerPanel
			}
		}

		config["content"] = contentOld
	}

	err = t.setConfig(_id, config)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	return helper.Result(true, panelID, "")
	//~ return helper.Result(true, config, config)
	//~ return fmt.printf("%v",config)
}

func (t *DesignerController) RemovePanel(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	_id := payload["_id"]
	panelID := payload["panelID"]

	config, err := t.getConfig(_id)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}
	contentOld := config["content"].([]interface{})
	contentNew := []interface{}{}

	for _, each := range contentOld {
		if each.(map[string]interface{})["panelID"] == panelID {
			continue
		}

		contentNew = append(contentNew, each)
	}

	config["content"] = contentNew

	err = t.setConfig(_id, config)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	return helper.Result(true, nil, "")
}

func (t *DesignerController) SetHideShow(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}
	_id := payload["_id"]

	config, err := t.getConfig(_id)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}
	panelsid := strings.Split(payload["panelid"], ",")
	content := config["content"].([]interface{})

	for i, each := range content {
		content[i].(map[string]interface{})["hide"] = false

		for _, panelid := range panelsid {
			if panelid == each.(map[string]interface{})["panelID"] {
				content[i].(map[string]interface{})["hide"] = true
			}
		}
	}
	config["content"] = content

	err = t.setConfig(_id, config)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	return helper.Result(true, nil, "")
}

func (t *DesignerController) ReoderPanel(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]interface{}{}
	err := r.GetForms(&payload)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}
	_id := payload["_id"].(string)
	order := strings.Split(payload["order"].(string), ",")

	config, err := t.getConfig(_id)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}
	content := map[string]interface{}{}
	newContent := []interface{}{}

	for _, each := range config["content"].([]interface{}) {
		panel := each.(map[string]interface{})
		content[panel["panelID"].(string)] = panel
	}

	for _, panelID := range order {
		newContent = append(newContent, content[panelID])
	}

	config["content"] = newContent
	err = t.setConfig(_id, config)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	return helper.Result(true, nil, "")
}

func (t *DesignerController) SaveOtherConfig(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}
	_id := payload["_id"]
	configString := payload["config"]

	config := map[string]interface{}{}
	json.Unmarshal([]byte(configString), &config)

	err = t.setConfig(_id, config)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	return helper.Result(true, nil, "")
}
