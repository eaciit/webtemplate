package model

type TopMenu struct {
	Title    string
	Href     string
	SubMenu  []TopMenu
	Selected bool
}
