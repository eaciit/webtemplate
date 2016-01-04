package controller

import (
	"encoding/json"
	"fmt"
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
	helper.HandleError(err)
	defer connection.Close()

	cursor, err := connection.NewQuery().Select("seq", "data").Cursor(nil)
	helper.HandleError(err)
	if cursor == nil {
		fmt.Printf("Cursor not initialized")
	}
	defer cursor.Close()

	dataGrid, err := cursor.Fetch(nil, 0, false)
	helper.HandleError(err)

	return dataGrid.Data
}

func (t *GridController) SaveJsonGrid(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson
	filename := t.AppViewsPath + "data/mapgrid.json"
	f, err := os.Open(filename)
	mapgrid := []m.MapGrid{}
	jsonParser := json.NewDecoder(f)
	if err = jsonParser.Decode(&mapgrid); err != nil {
		fmt.Println(err)
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
	f, err = os.Create(filename)
	n, err := io.WriteString(f, string(b))

	f, err = os.Create(t.AppViewsPath + "data/grid/" + datagrid.Outsider.IdGrid + ".json")
	b, err = json.Marshal(datagrid)
	n, err = io.WriteString(f, "["+string(b)+"]")
	if err != nil {
		fmt.Println(n, err)
	}
	defer f.Close()
	return datagrid
}

func (t *GridController) DeleteGrid(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson
	payload := map[string]string{}
	err := r.GetForms(&payload)

	filename := t.AppViewsPath + "data/mapgrid.json"
	f, err := os.Open(filename)
	mapgrid := []m.MapGrid{}
	jsonParser := json.NewDecoder(f)
	if err = jsonParser.Decode(&mapgrid); err != nil {
		fmt.Println(err)
	}
	newGrid := []m.DataMapGrid{}
	for _, eachRaw := range mapgrid[0].Data {
		if eachRaw.Value != payload["recordid"] {
			newGrid = append(newGrid, eachRaw)
		}
	}
	mapgrid[0].Data = newGrid
	b, err := json.Marshal(mapgrid)
	f, err = os.Create(filename)
	io.WriteString(f, string(b))
	os.Remove(t.AppViewsPath + "data/grid/" + payload["recordid"])
	defer f.Close()
	return payload["recordid"]
}

func (t *GridController) GetDetailGrid(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson
	payload := map[string]string{}
	err := r.GetForms(&payload)

	connection, err := helper.LoadConfig(t.AppViewsPath + "data/grid/" + payload["recordid"])
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
