package points

import (
	"database/sql"
	"fmt"
	"encoding/json"
	"github.com/go-chi/chi"
	"net/http"
    "github.com/davecgh/go-spew/spew"
)
const (
	host     = "172.16.193.234"
	port     = 5432
	username     = "postgres"
	password = "postgres"
	dbname   = "postgres"
)
var connStr = fmt.Sprintf("host=%s port=%d user=%s "+
	"password=%s dbname=%s sslmode=disable",
	host, port, username, password, dbname)

type newPoint struct {
	Xcenter float32 `json:"xcenter"`
	Ycenter float32 `json:"ycenter"`
	Area_type int `json:"area_type"`
	Photo string `json:"photo"`
}

type point struct{
	id int
	geom string
	xCenter float32
	yCenter float32
	area_type int
	photo string
}

func getPoints(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		panic(err)
	}
	defer db.Close()
	points := []point{}
	rows, err := db.Query("select * from areas")
	if err != nil {
		panic(err)
	}
	defer rows.Close()
	for rows.Next(){
		p := point{}
		err := rows.Scan(&p.id, &p.geom, &p.xCenter, &p.yCenter, &p.area_type, &p.photo)
		if err != nil{
			fmt.Println(err)
			continue
		}
		points = append(points, p)
	}
	for _, p := range points{
		fmt.Println(p.id, p.xCenter, p.yCenter, p.geom)
	}
}

func addPoint(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		panic(err)
	}

	defer db.Close()
	var p newPoint
	error := json.NewDecoder(r.Body).Decode(&p)
	spew.Dump(p)
	if error!=nil {
		panic(error)
	}
	result, err := db.Exec("INSERT INTO areas (xcenter, ycenter, area_type, photo) VALUES ($1, $2, $3, $4)",
		p.Xcenter, p.Ycenter, p.Area_type, p.Photo)
	if err != nil{
		panic(err)
	}
	//fmt.Println(result.LastInsertId())  // не поддерживается
	fmt.Println(result.RowsAffected())  // количество добавленных строк
}

func NewRouter() http.Handler {
	r := chi.NewRouter()

	//r.Use(RequireAuthentication)

	// Register the API routes
	r.Post("/add", addPoint)
	r.Get("/get", getPoints)

	return r
}
