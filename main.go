package main

import (
	"fmt"
	"html/template"
	"net/http"
	"os"
	// "path"
)

func main() {
	// fs := http.FileServer(http.Dir("./"))
	// http.Handle("/static/", fs)
	// http.HandleFunc("/", serveTemplate)
	// err := http.ListenAndServe(fmt.Sprintf(":%d", 8004), nil)
	// if err != nil {
	// 	os.Exit(0)
	// }
	// tpl := template.Must(template.New("main").ParseGlob("*.html"))
	// tplVars := map[string]string{}
	// tpl.ExecuteTemplate(os.Stdout, "index.html", tplVars)
	var err error
	http.Handle("/res/", http.StripPrefix("/res/", http.FileServer(http.Dir("./"))))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		handleIndex(w, r, err)
	})
	// http.HandleFunc("/", temp)
	err = http.ListenAndServe(fmt.Sprintf(":%d", 8004), nil)
	if err != nil {
		os.Exit(0)
	}
}

// func temp(w http.ResponseWriter, r *http.Request) {
// 	// w.Header().Set("Content-type", "application/json")
// 	// PrintJSON(w, true, make([]interface{}, 0), "")
// 	http.ServeFile(w, r, "view/index.html")
// }

func handleIndex(w http.ResponseWriter, r *http.Request, err error) {
	// var Layout *template.Template
	// tplVars := map[string]string{}
	// files := []string{"view/index.html"}
	// Layout.ParseFiles(files...)
	// Layout.ExecuteTemplate(w, "index.html", tplVars)
	tpl := template.Must(template.New("main").ParseGlob("view/*"))
	tplVars := map[string]string{}
	tpl.ExecuteTemplate(w, "index.html", tplVars)
}
