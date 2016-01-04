package models

type Grid struct {
	DataSource DataSource `json:"dataSource"`
	Outsider   Outsider   `json:"outsider"`
	PageSize   int        `json:"pageSize"`
	Groupable  bool       `json:"groupable"`
	Sortable   bool       `json:"sortable"`
	Filterable bool       `json:"filterable"`
	Pageable   Pageable   `json:"pageable"`
	Columns    []Column   `json:"columns"`
	ColumnMenu bool       `json:"columnMenu"`
	Toolbar    []string   `json:"toolbar"`
	Pdf        ExportGrid `json:"pdf"`
	Excel      ExportGrid `json:"excel"`
}

type Outsider struct {
	IdGrid        string `json:"idGrid"`
	Title         string `json:"title"`
	DataSourceKey string `json:"dataSourceKey"`
	VisiblePDF    bool   `json:"visiblePDF"`
	VisibleExcel  bool   `json:"visibleExcel"`
}

type ExportGrid struct {
	AllPages string `json:"allPages"`
	FileName string `json:"fileName"`
}

type DataSource struct {
	// Data map[string]interface{} `json:"data"`
	Aggregate []AggregateColumn `json:"aggregate"`
}

type AggregateColumn struct {
	Field     string `json:"field"`
	Aggregate string `json:"aggregate"`
}

type Pageable struct {
	Refresh     bool `json:"refresh"`
	PageSize    bool `json:"pageSize"`
	ButtonCount int  `json:"buttonCount"`
}

type Column struct {
	Template         string           `json:"template"`
	Field            string           `json:"field"`
	Title            string           `json:"title"`
	Format           string           `json:"format"`
	Width            string           `json:"width"`
	Menu             bool             `json:"menu"`
	HeaderTemplate   string           `json:"headerTemplate"`
	HeaderAttributes HeaderAttributes `json:"headerAttributes"`
	FooterTemplate   string           `json:"footerTemplate"`
}

type HeaderAttributes struct {
	Class string `json:"class"`
	Style string `json:"style"`
}

type MapGrid struct {
	Seq  int           `json:"seq"`
	Data []DataMapGrid `json:"data"`
}

type DataMapGrid struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Value string `json:"value"`
}
