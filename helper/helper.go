package helper

import (
	"encoding/json"
	"fmt"
	"github.com/eaciit/dbox"
	_ "github.com/eaciit/dbox/dbc/json"
	_ "github.com/eaciit/dbox/dbc/mongo"
	"github.com/eaciit/knot/knot.v1"
	"net/http"
)

func HandleError(err error, optionalArgs ...interface{}) bool {
	if err != nil {
		fmt.Printf("error occured: %s", err.Error())

		if len(optionalArgs) > 0 {
			optionalArgs[0].(func(bool))(false)
		}

		return false
	}

	if len(optionalArgs) > 0 {
		optionalArgs[0].(func(bool))(true)
	}

	return true
}

func LoadConfig(pathJson string) (dbox.IConnection, error) {
	connectionInfo := &dbox.ConnectionInfo{pathJson, "", "", "", nil}
	connection, e := dbox.NewConnection("json", connectionInfo)
	if !HandleError(e) {
		return nil, e
	}

	e = connection.Connect()
	if !HandleError(e) {
		return nil, e
	}

	return connection, nil
}

func Connect() (dbox.IConnection, error) {
	connectionInfo := &dbox.ConnectionInfo{"localhost", "ecwebtemplate", "", "", nil}
	connection, e := dbox.NewConnection("mongo", connectionInfo)
	if !HandleError(e) {
		return nil, e
	}

	e = connection.Connect()
	if !HandleError(e) {
		return nil, e
	}

	return connection, nil
}

func Recursiver(data []interface{}, sub func(interface{}) []interface{}, callback func(interface{})) {
	for _, each := range data {
		recursiveContent := sub(each)

		if len(recursiveContent) > 0 {
			Recursiver(recursiveContent, sub, callback)
		}

		callback(each)
	}
}

func FetchJSON(url string) ([]map[string]interface{}, error) {
	response, err := http.Get(url)
	if !HandleError(err) {
		return nil, err
	}
	defer response.Body.Close()

	decoder := json.NewDecoder(response.Body)
	data := []map[string]interface{}{}
	err = decoder.Decode(&data)
	if !HandleError(err) {
		return nil, err
	}

	return data, nil
}

func FakeWebContext() *knot.WebContext {
	return &knot.WebContext{Config: &knot.ResponseConfig{}}
}
