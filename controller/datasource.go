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

func (t *DataSourceController) GetDataSources(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	connection, err := helper.LoadConfig(t.AppViewsPath + "data/datasource.json")
	helper.HandleError(err)
	defer connection.Close()
	cursor, err := connection.NewQuery().Select("*").Cursor(nil)
	helper.HandleError(err)
	if cursor == nil {
		fmt.Printf("Cursor not initialized")
	}
	defer cursor.Close()
	dataSource, err := cursor.Fetch(nil, 0, false)
	helper.HandleError(err)

	return dataSource.Data
}

func (t *DataSourceController) SaveDataSource(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson
	r.Request.ParseMultipartForm(32 << 20)

	payload := map[string]string{}
	err := r.GetForms(&payload)
	helper.HandleError(err)

	_id := payload["_id"]
	if _id == "" {
		_id = helper.RandomIDWithPrefix("ds")
	}

	// upload file
	if payload["type"] == "file" {
		filename := fmt.Sprintf("datasource-%s.json", _id)
		filepath := t.AppViewsPath + "data/datasource/" + filename

		helper.FetchThenSaveFile(r.Request, "file", filepath)
		payload["path"] = filename
	}

	delete(payload, "file")

	if payload["_id"] == "" {
		payload["_id"] = _id

		// insert
		connection, err := helper.LoadConfig(t.AppViewsPath + "/data/datasource.json")
		helper.HandleError(err)
		defer connection.Close()
		err = connection.NewQuery().Insert().Exec(toolkit.M{"data": payload})
		helper.HandleError(err)
	} else {
		// update
		connection, err := helper.LoadConfig(t.AppViewsPath + "/data/datasource.json")
		helper.HandleError(err)
		defer connection.Close()
		err = connection.NewQuery().Update().Where(dbox.Eq("_id", _id)).Exec(toolkit.M{"data": payload})
		helper.HandleError(err)
	}

	return true
}

func (t *DataSourceController) GetDataSourceMetaData(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	helper.HandleError(err)

	connection, err := helper.LoadConfig(t.AppViewsPath + "/data/datasource.json")
	helper.HandleError(err)
	defer connection.Close()
	cursor, err := connection.NewQuery().Where(dbox.Eq("_id", payload["_id"])).Cursor(nil)
	helper.HandleError(err)
	defer cursor.Close()
	dataSource, err := cursor.Fetch(nil, 0, false)

	return dataSource.Data[0]
}

func (t *DataSourceController) GetDataSource(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	helper.HandleError(err)

	_id := payload["_id"]
	dsType := payload["type"]
	path := payload["path"]

	return helper.FetchDataSource(_id, dsType, path)
}

func (t *DataSourceController) RemoveDataSource(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	helper.HandleError(err)

	connection, err := helper.LoadConfig(t.AppViewsPath + "data/datasource.json")
	helper.HandleError(err)
	defer connection.Close()
	err = connection.NewQuery().Delete().Where(dbox.Eq("_id", payload["_id"])).Exec(nil)
	helper.HandleError(err)
	success := err == nil

	if payload["type"] == "file" {
		err = os.Remove(t.AppViewsPath + "data/" + payload["path"])
		helper.HandleError(err)
	}

	return success
}
