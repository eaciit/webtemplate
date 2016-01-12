package controller

import (
	"fmt"
	"github.com/eaciit/dbox"
	"github.com/eaciit/knot/knot.v1"
	"github.com/eaciit/toolkit"
	"github.com/eaciit/webtemplate/helper"
	"os"
)

type DataSourceController struct {
	AppViewsPath string
}

func (t *DataSourceController) getDataSourceMetaData(_id string) (map[string]interface{}, error) {
	connection, err := helper.LoadConfig(t.AppViewsPath + "/data/datasource.json")
	if !helper.HandleError(err) {
		return nil, err
	}
	defer connection.Close()

	cursor, err := connection.NewQuery().Where(dbox.Eq("_id", _id)).Cursor(nil)
	if !helper.HandleError(err) {
		return nil, err
	}
	defer cursor.Close()

	dataSource, err := cursor.Fetch(nil, 0, false)
	if !helper.HandleError(err) {
		return nil, err
	}

	return dataSource.Data[0].(map[string]interface{}), nil
}

func (t *DataSourceController) GetDataSources(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	connection, err := helper.LoadConfig(t.AppViewsPath + "data/datasource.json")
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
}

func (t *DataSourceController) SaveDataSource(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson
	r.Request.ParseMultipartForm(32 << 20)

	payload := map[string]string{}
	err := r.GetForms(&payload)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	_id := payload["_id"]
	if _id == "" {
		_id = helper.RandomIDWithPrefix("ds")
	}

	// upload file
	if payload["type"] == "file" {
		filename := fmt.Sprintf("datasource-%s.json", _id)
		filepath := t.AppViewsPath + "data/datasource/" + filename

		_, _, err = helper.FetchThenSaveFile(r.Request, "file", filepath)
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
		payload["path"] = filename
	}

	delete(payload, "file")

	if payload["_id"] == "" {
		payload["_id"] = _id

		// insert
		connection, err := helper.LoadConfig(t.AppViewsPath + "/data/datasource.json")
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
		defer connection.Close()

		err = connection.NewQuery().Insert().Exec(toolkit.M{"data": payload})
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
	} else {
		// update
		connection, err := helper.LoadConfig(t.AppViewsPath + "/data/datasource.json")
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
		defer connection.Close()

		err = connection.NewQuery().Update().Where(dbox.Eq("_id", _id)).Exec(toolkit.M{"data": payload})
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
	}

	return helper.Result(true, nil, "")
}

func (t *DataSourceController) GetDataSourceMetaData(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	data, err := t.getDataSourceMetaData(payload["_id"])
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	return helper.Result(true, data, "")
}
func (t *DataSourceController) GetDataSourceSelector(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson
	payload := map[string]interface{}{}
	err := r.GetPayload(&payload)
	// fmt.Println(payload["item"].([]interface{}))
	// payload := map[string]string{}
	// err := r.GetForms(&payload)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	_id := payload["_id"].(string)
	dsType := ""
	path := ""

	if _, ok := payload["type"]; !ok {
		data, err := t.getDataSourceMetaData(_id)
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}

		dsType = data["type"].(string)
		path = data["path"].(string)
	}

	ds, err := helper.FetchDataSource(_id, dsType, path)
	sds, err := helper.FetchQuerySelector(ds, payload)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	return helper.Result(true, sds, "")
}
func (t *DataSourceController) GetDataSource(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	_id := payload["_id"]
	dsType := payload["type"]
	path := payload["path"]

	if _, ok := payload["type"]; !ok {
		data, err := t.getDataSourceMetaData(_id)
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}

		dsType = data["type"].(string)
		path = data["path"].(string)
	}

	ds, err := helper.FetchDataSource(_id, dsType, path)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	return helper.Result(true, ds, "")
}

func (t *DataSourceController) RemoveDataSource(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	connection, err := helper.LoadConfig(t.AppViewsPath + "data/datasource.json")
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}
	defer connection.Close()

	err = connection.NewQuery().Delete().Where(dbox.Eq("_id", payload["_id"])).Exec(nil)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	if payload["type"] == "file" {
		err = os.Remove(t.AppViewsPath + "data/datasource/" + payload["path"])
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
	}

	return helper.Result(true, nil, "")
}

func (t *DataSourceController) GetDataSourceFields(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}
	_id := payload["_id"]

	meta, err := t.getDataSourceMetaData(_id)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	dsType := meta["type"].(string)
	path := meta["path"].(string)

	data, err := helper.FetchDataSource(_id, dsType, path)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	fields := []string{}
	holder := map[string]bool{}
	for _, each := range data[:len(data)] {
		for key, _ := range each {
			if _, ok := holder[key]; !ok {
				fields = append(fields, key)
				holder[key] = true
			}
		}
	}

	return helper.Result(true, fields, "")
}
