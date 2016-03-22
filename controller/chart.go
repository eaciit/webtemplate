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
			return helper.Result(false, nil, err.Error())
		}
	}

	connection, err := helper.LoadConfig(configFilepath)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}
	defer connection.Close()

	cursor, err := connection.NewQuery().Select("*").Cursor(nil)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}
	defer cursor.Close()

	res := []toolkit.M{}
	err = cursor.Fetch(&res, 0, false)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	if len(res) > 0 {
		return helper.Result(true, res, "")
	}

	return helper.Result(true, res, "")
}

func (t *ChartController) SaveChartConfig(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	_id := payload["_id"]
	v, err := os.Getwd()
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	if _id == "" {
		_id = helper.RandomIDWithPrefix("c")
		filename := fmt.Sprintf("chart-%s.json", _id)

		// save chart configuration
		path := fmt.Sprintf("%s/data/chart/%s", v, filename)
		err = os.Remove(path)
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
		ioutil.WriteFile(path, []byte(payload["config"]), 0644)

		// save chart meta data
		connection, err := helper.LoadConfig(t.AppViewsPath + "/data/chart.json")
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
		defer connection.Close()

		newData := toolkit.M{"_id": _id, "title": payload["title"], "file": filename}
		err = connection.NewQuery().Insert().Exec(toolkit.M{"data": newData})
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
	} else {
		filename := fmt.Sprintf("chart-%s.json", _id)

		// update chart configuration
		path := fmt.Sprintf("%s/data/chart/%s", v, filename)
		err = os.Remove(path)
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
		ioutil.WriteFile(path, []byte(payload["config"]), 0644)

		// update chart meta data
		connection, err := helper.LoadConfig(t.AppViewsPath + "/data/chart.json")
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
		defer connection.Close()

		newData := toolkit.M{"_id": _id, "title": payload["title"], "file": filename}
		err = connection.NewQuery().Update().Where(dbox.Eq("_id", _id)).Exec(toolkit.M{"data": newData})
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
	}

	return helper.Result(true, _id, "")
}

func (t *ChartController) GetChartConfig(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	filename := fmt.Sprintf("chart-%s.json", payload["_id"])
	isWithDataSource, err := strconv.ParseBool(payload["isWithDataSource"])
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	fileContent, err := ioutil.ReadFile(t.AppViewsPath + "data/chart/" + filename)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	data := map[string]interface{}{}
	err = json.Unmarshal(fileContent, &data)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	if isWithDataSource {
		dataSourceID := data["outsider"].(map[string]interface{})["dataSourceKey"].(string)

		connection, err := helper.LoadConfig(t.AppViewsPath + "data/datasource.json")
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
		defer connection.Close()

		cursor, err := connection.NewQuery().Where(dbox.Eq("_id", dataSourceID)).Cursor(nil)
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
		defer cursor.Close()

		res := []toolkit.M{}
		err = cursor.Fetch(&res, 0, false)
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
		if len(res) == 0 {
			return helper.Result(false, nil, "No data found")
		}

		dsID := res[0].GetString("_id")
		dsType := res[0].GetString("type")
		dsPath := res[0].GetString("path")
		dataSource, _ := helper.FetchDataSource(dsID, dsType, dsPath)
		data["dataSource"] = map[string]interface{}{"data": dataSource}
	}

	return helper.Result(true, data, "")
}

func (t *ChartController) RemoveChartConfig(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	// remove chart
	filename := fmt.Sprintf("chart-%s.json", payload["_id"])
	err = os.Remove(t.AppViewsPath + "data/chart/" + filename)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	// remove chart meta data
	connection, err := helper.LoadConfig(t.AppViewsPath + "data/chart.json")
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}
	defer connection.Close()

	err = connection.NewQuery().Delete().Where(dbox.Eq("_id", payload["_id"])).Exec(nil)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	return helper.Result(true, nil, "")
}
