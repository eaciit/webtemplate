package controller

import (
	// "encoding/json"
	// "fmt"
	"github.com/eaciit/dbox"
	"github.com/eaciit/knot/knot.v1"
	"github.com/eaciit/toolkit"
	"github.com/eaciit/webtemplate/helper"
	// "io/ioutil"
	"os"
)

type SelectorController struct {
	AppViewsPath string
}

func (t *SelectorController) RemoveSelectorConfig(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	connection, err := helper.LoadConfig(t.AppViewsPath + "data/selector.json")
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}
	defer connection.Close()

	err = connection.NewQuery().Delete().Where(dbox.Eq("ID", payload["ID"])).Exec(nil)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	return helper.Result(true, nil, "")
}

func (t *SelectorController) GetSelectorConfigs(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson
	configFilepath := t.AppViewsPath + "data/selector.json"

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

	return helper.Result(true, []interface{}{}, "")
}

func (t *SelectorController) SaveSelector(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson
	payload := map[string]string{}
	err := r.GetForms(&payload)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	_id := payload["ID"]
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	if _id == "" {
		_id = helper.RandomIDWithPrefix("c")
		connection, err := helper.LoadConfig(t.AppViewsPath + "/data/selector.json")
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
		defer connection.Close()

		newData := toolkit.M{"ID": _id, "title": payload["title"], "fields": payload["fields"], "masterDataSource": payload["masterDataSource"]}
		err = connection.NewQuery().Insert().Exec(toolkit.M{"data": newData})
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
	} else {
		connection, err := helper.LoadConfig(t.AppViewsPath + "/data/selector.json")
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
		defer connection.Close()

		newData := toolkit.M{"ID": _id, "title": payload["title"], "fields": payload["fields"], "masterDataSource": payload["masterDataSource"]}
		err = connection.NewQuery().Update().Where(dbox.Eq("ID", _id)).Exec(toolkit.M{"data": newData})
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
	}

	return helper.Result(true, _id, "")
}
