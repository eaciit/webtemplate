package controller

import (
	"encoding/json"
	"fmt"
	"github.com/eaciit/dbox"
	"github.com/eaciit/knot/knot.v1"
	"github.com/eaciit/toolkit"
	"github.com/eaciit/webtemplate/helper"
	"io/ioutil"
	"os"
	"strconv"
)

type ChartController struct {
	AppViewsPath string
}

func (t *ChartController) GetChartConfigs(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	configFilepath := t.AppViewsPath + "data/chart.json"

	if _, err := os.Stat(configFilepath); err != nil {
		if os.IsNotExist(err) {
			os.Create(configFilepath)
		} else {
			helper.HandleError(err)
		}
	}

	connection, err := helper.LoadConfig(configFilepath)
	helper.HandleError(err)
	defer connection.Close()
	cursor, err := connection.NewQuery().Select("*").Cursor(nil)
	if !helper.HandleError(err) {
		return []interface{}{}
	}
	defer cursor.Close()
	dataSource, err := cursor.Fetch(nil, 0, false)
	helper.HandleError(err)
	if len(dataSource.Data) > 0 {
		return dataSource.Data
	}

	return []interface{}{}
}

func (t *ChartController) SaveChartConfig(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	helper.HandleError(err)

	_id := payload["_id"]
	v, _ := os.Getwd()

	if _id == "" {
		_id = helper.RandomIDWithPrefix("c")
		filename := fmt.Sprintf("chart-%s.json", _id)

		// save chart configuration
		path := fmt.Sprintf("%s/data/chart/%s", v, filename)
		os.Remove(path)
		ioutil.WriteFile(path, []byte(payload["config"]), 0644)

		// save chart meta data
		connection, err := helper.LoadConfig(t.AppViewsPath + "/data/chart.json")
		helper.HandleError(err)
		defer connection.Close()
		newData := toolkit.M{"_id": _id, "title": payload["title"], "file": filename}
		err = connection.NewQuery().Insert().Exec(toolkit.M{"data": newData})
		helper.HandleError(err)
	} else {
		filename := fmt.Sprintf("chart-%s.json", _id)

		// update chart configuration
		path := fmt.Sprintf("%s/data/chart/%s", v, filename)
		os.Remove(path)
		ioutil.WriteFile(path, []byte(payload["config"]), 0644)

		// update chart meta data
		connection, err := helper.LoadConfig(t.AppViewsPath + "/data/chart.json")
		helper.HandleError(err)
		defer connection.Close()
		newData := toolkit.M{"_id": _id, "title": payload["title"], "file": filename}
		err = connection.NewQuery().Update().Where(dbox.Eq("_id", _id)).Exec(toolkit.M{"data": newData})
		helper.HandleError(err)
	}

	return _id
}

func (t *ChartController) GetChartConfig(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	helper.HandleError(err)

	filename := fmt.Sprintf("chart-%s.json", payload["_id"])
	isWithDataSource, err := strconv.ParseBool(payload["isWithDataSource"])
	helper.HandleError(err)

	fileContent, err := ioutil.ReadFile(t.AppViewsPath + "data/chart/" + filename)
	helper.HandleError(err)
	data := map[string]interface{}{}
	err = json.Unmarshal(fileContent, &data)
	helper.HandleError(err)

	if isWithDataSource {
		dataSourceID := data["outsider"].(map[string]interface{})["dataSourceKey"].(string)

		connection, err := helper.LoadConfig(t.AppViewsPath + "data/datasource.json")
		helper.HandleError(err)
		defer connection.Close()
		cursor, err := connection.NewQuery().Where(dbox.Eq("_id", dataSourceID)).Cursor(nil)
		helper.HandleError(err)
		defer cursor.Close()
		dataSources, err := cursor.Fetch(nil, 0, false)
		helper.HandleError(err)
		dataSourceRelev := dataSources.Data[0].(map[string]interface{})
		dsID := dataSourceRelev["_id"].(string)
		dsType := dataSourceRelev["type"].(string)
		dsPath := dataSourceRelev["path"].(string)
		dataSource, _ := helper.FetchDataSource(dsID, dsType, dsPath)
		data["dataSource"] = map[string]interface{}{"data": dataSource}
	}

	return data
}

func (t *ChartController) RemoveChartConfig(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	helper.HandleError(err)

	// remove chart
	filename := fmt.Sprintf("chart-%s.json", payload["_id"])
	os.Remove(t.AppViewsPath + "data/chart/" + filename)

	// remove chart meta data
	connection, err := helper.LoadConfig(t.AppViewsPath + "data/chart.json")
	helper.HandleError(err)
	defer connection.Close()
	err = connection.NewQuery().Delete().Where(dbox.Eq("_id", payload["_id"])).Exec(nil)
	helper.HandleError(err)

	return true
}
