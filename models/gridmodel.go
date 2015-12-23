package models

type Grid struct {
	DataSourceKey string `json:"dataSourceKey"`
	// DataSource    DataSource `json:"dataSource"`
	PageSize   int      `json:"pageSize"`
	Groupable  bool     `json:"groupable"`
	Sortable   bool     `json:"sortable"`
	Filterable bool     `json:"filterable"`
	Pageable   Pageable `json:"pageable"`
	Columns    []Column `json:"columns"`
}

type DataSource struct {
	Data map[string]interface{} `json:"data"`
}

type Pageable struct {
	Refresh     bool `json:"refresh"`
	PageSize    bool `json:"pageSize"`
	ButtonCount int  `json:"buttonCount"`
}

type Column struct {
	Template string `json:"template"`
	Field    string `json:"field"`
	Title    string `json:"title"`
	Format   string `json:"format"`
}

type MapGrid struct {
	Seq  int           `json:"seq"`
	Data []DataMapGrid `json:"data"`
}

type DataMapGrid struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}
