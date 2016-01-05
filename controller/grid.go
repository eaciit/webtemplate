package controller

import (
	"encoding/json"
	"github.com/eaciit/knot/knot.v1"
	"github.com/eaciit/webtemplate/helper"
	m "github.com/eaciit/webtemplate/models"
	"io"
	"os"
	"strconv"
)

type GridController struct {
	AppViewsPath string
}

func (t *GridController) GetGridData(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	connection, err := helper.LoadConfig(t.AppViewsPath + "data/mapgrid.json")
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}
	defer connection.Close()

	cursor, err := connection.NewQuery().Select("seq", "data").Cursor(nil)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}
	defer cursor.Close()

	dataGrid, err := cursor.Fetch(nil, 0, false)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	return helper.Result(true, dataGrid.Data, "")
}

func (t *GridController) SaveJsonGrid(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson
	filename := t.AppViewsPath + "data/mapgrid.json"
	f, err := os.Open(filename)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	mapgrid := []m.MapGrid{}
	jsonParser := json.NewDecoder(f)
	if err = jsonParser.Decode(&mapgrid); err != nil {
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
	}
	datagrid := m.Grid{}
	r.GetPayload(&datagrid)

	datamapgrid := m.DataMapGrid{}
	datamapgrid.Name = datagrid.Outsider.Title
	if datagrid.Outsider.IdGrid == "" {
		mapgrid[0].Seq = mapgrid[0].Seq + 1
		datagrid.Outsider.IdGrid = "grid" + strconv.Itoa(mapgrid[0].Seq)
		datamapgrid.Value = "grid" + strconv.Itoa(mapgrid[0].Seq) + ".json"
		datamapgrid.ID = "grid" + strconv.Itoa(mapgrid[0].Seq)
		mapgrid[0].Data = append(mapgrid[0].Data, datamapgrid)
	} else {
		newGrid := []m.DataMapGrid{}
		for _, eachRaw := range mapgrid[0].Data {
			if eachRaw.Value == datagrid.Outsider.IdGrid+".json" {
				eachRaw.Name = datamapgrid.Name
			}
			newGrid = append(newGrid, eachRaw)
		}
		mapgrid[0].Data = newGrid
	}

	b, err := json.Marshal(mapgrid)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	f, err = os.Create(filename)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	_, err = io.WriteString(f, string(b))
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	f, err = os.Create(t.AppViewsPath + "data/grid/" + datagrid.Outsider.IdGrid + ".json")
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	b, err = json.Marshal(datagrid)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	_, err = io.WriteString(f, "["+string(b)+"]")
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	defer f.Close()

	return helper.Result(true, datagrid, "")
}

func (t *GridController) DeleteGrid(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson
	payload := map[string]string{}
	err := r.GetForms(&payload)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	filename := t.AppViewsPath + "data/mapgrid.json"
	f, err := os.Open(filename)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	mapgrid := []m.MapGrid{}
	jsonParser := json.NewDecoder(f)
	if err = jsonParser.Decode(&mapgrid); err != nil {
		if !helper.HandleError(err) {
			return helper.Result(false, nil, err.Error())
		}
	}

	newGrid := []m.DataMapGrid{}
	for _, eachRaw := range mapgrid[0].Data {
		if eachRaw.Value != payload["recordid"] {
			newGrid = append(newGrid, eachRaw)
		}
	}
	mapgrid[0].Data = newGrid
	b, err := json.Marshal(mapgrid)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	f, err = os.Create(filename)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	io.WriteString(f, string(b))
	err = os.Remove(t.AppViewsPath + "data/grid/" + payload["recordid"])
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	defer f.Close()

	return helper.Result(true, payload["recordid"], "")
}

func (t *GridController) GetDetailGrid(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson
	payload := map[string]string{}
	err := r.GetForms(&payload)
	if !helper.HandleError(err) {
		return helper.Result(false, nil, err.Error())
	}

	connection, err := helper.LoadConfig(t.AppViewsPath + "data/grid/" + payload["recordid"])
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
