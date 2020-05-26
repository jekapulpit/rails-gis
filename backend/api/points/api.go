package points

import (
	"database/sql"
	"fmt"
	"encoding/json"
	"github.com/go-chi/chi"
	"net/http"
	"strings"
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

type newTree struct {
    Xcenter float32 `json:"xcenter"`
	Ycenter float32 `json:"ycenter"`
}

type newPolygonPoint struct {
    Xcenter float32 `json:"x"`
	Ycenter float32 `json:"y"`
}

type newPoint struct {
	Xcenter float32 `json:"xcenter"`
	Ycenter float32 `json:"ycenter"`
	Area_type int `json:"area_type"`
	Photo string `json:"photo"`
	A_db_porod string `json:"_db_porod"`
	Trees []newTree `json:"trees"`
	Points []newPolygonPoint `json:"points"`
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
	points := []string{}
	for i := 0; i < len(p.Points); i++ {
	        points = append(points, fmt.Sprintf("%f %f", p.Points[i].Ycenter, p.Points[i].Xcenter))
        }
    res := strings.Join(points, ",")
    fmt.Println(res)
	result, err := db.Exec("INSERT INTO areas (xcenter, ycenter, area_type, photo, _db_porod, coords) VALUES ($1, $2, $3, $4, $5, $6)",
		p.Xcenter, p.Ycenter, p.Area_type, p.Photo, p.A_db_porod, res)
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
