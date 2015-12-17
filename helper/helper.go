package helper

import (
	"fmt"
	"github.com/eaciit/dbox"
	_ "github.com/eaciit/dbox/dbc/json"
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
	defer connection.Close()

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
