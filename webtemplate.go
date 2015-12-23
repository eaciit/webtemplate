package main

import (
	"encoding/json"
	"fmt"
	"github.com/eaciit/knot/knot.v1"
	"github.com/eaciit/toolkit"
	"github.com/eaciit/webtemplate/helper"
	m "github.com/eaciit/webtemplate/models"
	"io"
	"io/ioutil"
	"os"
	"os/exec"
	"strconv"
	"time"
)

type (
	TemplateController struct {
		appViewsPath string
		layoutFile   string
		Server       *knot.Server
	}

	EaciitTemplate struct {
		TemplateController
	}
)

func InitTemplateController() *TemplateController {
	yo := new(TemplateController)

	// prepare view path
	v, _ := os.Getwd()
	yo.appViewsPath = v + "/"
	yo.layoutFile = "view/layout.html"

	// set knot output type
	knot.DefaultOutputType = knot.OutputTemplate

	// initiate server
	yo.Server = new(knot.Server)
	yo.Server.Address = "localhost:3000"
	yo.Server.RouteStatic("static", yo.appViewsPath)
	yo.RegisterRoutes()
	yo.Server.Register(yo, "")

	return yo
}

func (t *TemplateController) RegisterRoutes() {
	routes := t.GetRoutes(helper.FakeWebContext()).([]interface{})

	helper.Recursiver(routes, func(each interface{}) []interface{} {
		return each.(map[string]interface{})["submenu"].([]interface{})
	}, func(each interface{}) {
		eachMap := each.(map[string]interface{})
		title := eachMap["title"].(string)
		href := eachMap["href"].(string)

		if href != "" && href != "#" && href != "/index" {
			t.Server.Route(href, func(r *knot.WebContext) interface{} {
				r.Config.ViewName = t.layoutFile
				return toolkit.M{"title": title, "href": href}
			})
		}
	})

	// route the / and /index
	for _, route := range []string{"/", "/index"} {
		t.Server.Route(route, func(r *knot.WebContext) interface{} {
			r.Config.ViewName = t.layoutFile
			return toolkit.M{"title": "Dashboard", "href": route}
		})
	}

	t.Server.Route("/chart", func(r *knot.WebContext) interface{} {
		r.Config.ViewName = "view/chart.html"
		return toolkit.M{"title": "Chart Builder", "href": "/chartbuilder"}
	})
	t.Server.Route("/grid", func(r *knot.WebContext) interface{} {
		r.Config.ViewName = "view/grid.html"
		return toolkit.M{"title": "Grid", "href": "/grid"}
	})
}

func (t *TemplateController) Listen() {
	t.Server.Listen()
}

func (t *TemplateController) GetRoutes(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	connection, err := helper.LoadConfig(t.appViewsPath + "config/routes.json")
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

func (t *TemplateController) GetMenuLeft(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	connection, err := helper.LoadConfig(t.appViewsPath + "config/left-menu.json")
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

func (t *TemplateController) GetHeader(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	connection, err := helper.LoadConfig(t.appViewsPath + "config/header-app.json")
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

func (t *TemplateController) GetBreadcrumb(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	helper.HandleError(err)

	if payload["href"] == "/" || payload["href"] == "/index" {
		return []map[string]interface{}{{"title": "Dashboard", "href": "/index"}}
	}

	routes := t.GetRoutes(helper.FakeWebContext()).([]interface{})
	breadcrumbs := []map[string]interface{}{}

	for _, level1 := range routes {
		var level1Each = level1.(map[string]interface{})
		var level1Title = level1Each["title"].(string)
		var level1Href = level1Each["href"].(string)
		var level1Submenu = level1Each["submenu"].([]interface{})

		if level1Title == payload["title"] && level1Href == payload["href"] {
			breadcrumbs = append(breadcrumbs, level1Each)
			return breadcrumbs
		}

		if len(level1Submenu) > 0 {
			for _, level2 := range level1Submenu {
				var level2Each = level2.(map[string]interface{})
				var level2Title = level2Each["title"].(string)
				var level2Href = level2Each["href"].(string)
				// var level2Submenu = level2Each["submenu"].([]interface{})

				if level2Title == payload["title"] && level2Href == payload["href"] {
					breadcrumbs = append(breadcrumbs, level1Each)
					breadcrumbs = append(breadcrumbs, level2Each)
					return breadcrumbs
				}
			}
		}
	}

	return breadcrumbs
}

func (t *TemplateController) GetDataSources(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	connection, err := helper.LoadConfig(t.appViewsPath + "data/datasources.json")
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

func (t *TemplateController) GetDataSource(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	helper.HandleError(err)

	_id := payload["_id"]
	dsType := payload["type"]
	path := payload["path"]

	return helper.FetchDataSource(_id, dsType, path)
}

func (t *TemplateController) RemoveDataSource(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	helper.HandleError(err)

	connection, err := helper.LoadConfig(t.appViewsPath + "config/datasources.json")
	helper.HandleError(err)
	defer connection.Close()

	err = connection.NewQuery().Delete().Exec(toolkit.M{"data": payload})
	helper.HandleError(err)
	success := err == nil

	if payload["type"] == "file" {
		err = os.Remove(t.appViewsPath + "data/" + payload["path"])
		helper.HandleError(err)
	}

	return success
}

func (t *TemplateController) GetChartConfigs(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	configFilepath := t.appViewsPath + "data/chart.json"

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

	if cursor == nil {
		fmt.Printf("Cursor not initialized")
	}
	defer cursor.Close()

	dataSource, err := cursor.Fetch(nil, 0, false)
	helper.HandleError(err)

	if len(dataSource.Data) > 0 {
		return dataSource.Data
	}

	return []interface{}{}
}

func (t *TemplateController) SaveChartConfig(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	helper.HandleError(err)

	_id := payload["_id"]
	v, _ := os.Getwd()

	data := t.GetChartConfigs(helper.FakeWebContext()).([]interface{})
	if _id == "" {
		_id = helper.RandomIDWithPrefix("c")
		filename := fmt.Sprintf("chart-%s.json", _id)

		// save chart configuration
		path := fmt.Sprintf("%s/data/chart/%s", v, filename)
		os.Remove(path)
		ioutil.WriteFile(path, []byte(payload["config"]), 0644)

		// save chart meta data
		data = append(data, map[string]interface{}{
			"_id":   _id,
			"title": payload["title"],
			"file":  filename,
		})
		dataAsBytes, err := json.Marshal(data)
		helper.HandleError(err)

		pathConfig := fmt.Sprintf("%s/data/chart.json", v)
		os.Remove(pathConfig)
		ioutil.WriteFile(pathConfig, dataAsBytes, 0644)
	} else {
		filename := fmt.Sprintf("chart-%s.json", _id)

		// save chart configuration
		path := fmt.Sprintf("%s/data/chart/%s", v, filename)
		os.Remove(path)
		ioutil.WriteFile(path, []byte(payload["config"]), 0644)

		// save chart meta data
		pathConfig := fmt.Sprintf("%s/data/chart.json", v)
		fileContent, err := ioutil.ReadFile(pathConfig)

		metaData := []interface{}{}
		err = json.Unmarshal(fileContent, &metaData)
		helper.HandleError(err)

		for i, eachRaw := range metaData {
			each := eachRaw.(map[string]interface{})
			if each["_id"].(string) == _id {
				each["title"] = payload["title"]
				metaData[i] = each
			}
		}

		dataAsBytes, err := json.Marshal(metaData)
		helper.HandleError(err)

		os.Remove(pathConfig)
		ioutil.WriteFile(pathConfig, dataAsBytes, 0644)
	}

	return _id
}

func (t *TemplateController) GetChartConfig(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	helper.HandleError(err)

	filename := fmt.Sprintf("chart-%s.json", payload["_id"])
	isWithDataSource, err := strconv.ParseBool(payload["isWithDataSource"])
	helper.HandleError(err)

	v, _ := os.Getwd()
	path := fmt.Sprintf("%s/data/chart/%s", v, filename)

	fileContent, err := ioutil.ReadFile(path)
	helper.HandleError(err)

	data := map[string]interface{}{}
	err = json.Unmarshal(fileContent, &data)
	helper.HandleError(err)

	if isWithDataSource {
		dataSourceID := data["outsider"].(map[string]interface{})["dataSourceKey"].(string)
		dsPath := fmt.Sprintf("%s/data/datasources.json", v)

		dsFileContent, err := ioutil.ReadFile(dsPath)
		helper.HandleError(err)

		dataSources := []map[string]interface{}{}
		err = json.Unmarshal(dsFileContent, &dataSources)
		helper.HandleError(err)

		for _, each := range dataSources {
			if each["_id"] == dataSourceID {
				dsID := each["_id"].(string)
				dsType := each["type"].(string)
				dsPath := each["path"].(string)
				dataSource := helper.FetchDataSource(dsID, dsType, dsPath)
				data["dataSource"] = map[string]interface{}{"data": dataSource}
				break
			}
		}
	}

	return data
}

func (t *TemplateController) RemoveChartConfig(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	payload := map[string]string{}
	err := r.GetForms(&payload)
	helper.HandleError(err)

	_id := payload["_id"]
	v, _ := os.Getwd()

	// remove chart
	path := fmt.Sprintf("%s/data/chart/chart-%s.json", v, _id)
	os.Remove(path)

	// remove chart meta data
	pathConfig := fmt.Sprintf("%s/data/chart.json", v)
	fileContent, err := ioutil.ReadFile(pathConfig)

	metaData := []interface{}{}
	newMetaData := []interface{}{}
	err = json.Unmarshal(fileContent, &metaData)
	helper.HandleError(err)

	for _, eachRaw := range metaData {
		each := eachRaw.(map[string]interface{})
		if each["_id"].(string) != _id {
			newMetaData = append(newMetaData, each)
		}
	}

	dataAsBytes, err := json.Marshal(newMetaData)
	helper.HandleError(err)

	os.Remove(pathConfig)
	ioutil.WriteFile(pathConfig, dataAsBytes, 0644)

	return true
}

func (t *TemplateController) Open() {
	time.AfterFunc(time.Second, func() {
		exec.Command("open", "http://"+t.Server.Address).Run()
	})
}

func (t *TemplateController) GetGridData(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson

	connection, err := helper.LoadConfig(t.appViewsPath + "data/mapgrid.json")
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

func (t *TemplateController) SaveJsonGrid(r *knot.WebContext) interface{} {
	r.Config.OutputType = knot.OutputJson
	filename := t.appViewsPath + "data/mapgrid.json"
	f, err := os.Open(filename)
	mapgrid := []m.MapGrid{}
	jsonParser := json.NewDecoder(f)
	if err = jsonParser.Decode(&mapgrid); err != nil {
		fmt.Println(err)
	}
	mapgrid[0].Seq = mapgrid[0].Seq + 1
	datamapgrid := m.DataMapGrid{}
	datamapgrid.Name = "grid example"
	datamapgrid.Value = "grid" + strconv.Itoa(mapgrid[0].Seq) + ".json"
	mapgrid[0].Data = append(mapgrid[0].Data, datamapgrid)
	b, err := json.Marshal(mapgrid)
	f, err = os.Create(filename)
	n, err := io.WriteString(f, string(b))

	datagrid := m.Grid{}
	r.GetPayload(&datagrid)
	f, err = os.Create(t.appViewsPath + "data/grid/grid1.json")
	b, err = json.Marshal(datagrid)
	n, err = io.WriteString(f, string(b))
	if err != nil {
		fmt.Println(n, err)
	}
	defer f.Close()
	return datagrid
}

func main() {
	yo := InitTemplateController()
	yo.Server.Address = "localhost:7878"
	// yo.Open()
	yo.Listen()
}
