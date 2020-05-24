package user

import (
	"database/sql"
	"fmt"
	"github.com/go-chi/chi"
	"github.com/go-chi/render"
	"net/http"
)
const (
	host     = "nuolh.belstu.by"
	port     = 5432
	username     = "postgres"
	password = "Alexei98"
	dbname   = "postgres"
)
var connStr = fmt.Sprintf("host=%s port=%d user=%s "+
	"password=%s dbname=%s sslmode=disable",
	host, port, username, password, dbname)

type Test struct {
	Login string `json:"login"`
	Password string `json:"password"`
}
type user struct{
	id int
	FirstName string
	LastName string
	email string
	Type int
}

func (p *Test) Bind(r *http.Request) error {
	// At this point, Decode is already done by `chi`
	p.Login = p.Login + " after decode"
	return nil
}

func getUser(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		panic(err)
	}
	defer db.Close()
	users := []user{}
	oneUser := user{}
	row := db.QueryRow("select * from Users where id = $1", 2)
	err = row.Scan(&oneUser.id, &oneUser.FirstName, &oneUser.LastName, &oneUser.email, &oneUser.Type)
	if err != nil{
		panic(err)
	}
	fmt.Println(&oneUser.id, &oneUser.FirstName, &oneUser.LastName, &oneUser.email, &oneUser.Type)
	rows, err := db.Query("select * from Users")
	if err != nil {
		panic(err)
	}
	defer rows.Close()
	for rows.Next(){
		p := user{}
		err := rows.Scan(&p.id, &p.FirstName, &p.LastName, &p.email, &p.Type)
		if err != nil{
			fmt.Println(err)
			continue
		}
		users = append(users, p)
	}
	for _, p := range users{
		fmt.Println(p.id, p.FirstName, p.LastName, p.email)
	}
}

func autentificateUser(w http.ResponseWriter, r *http.Request) {
	var p Test
	err := render.DecodeJSON(r.Body, &p)
	if err!=nil {
		panic(err)
	}
	fmt.Println(p.Login)

	//name := chi.URLParam(r, "loh")
	//name := r.Context().Value("user")
	//fmt.Println(name)
	fmt.Println("post have been sended!")
}
func addUser(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		panic(err)
	}
	defer db.Close()
	var p Test
	error := render.DecodeJSON(r.Body, &p)
	if error!=nil {
		panic(error)
	}
	fmt.Println(p.Login)
	result, err := db.Exec("INSERT INTO Users (FirstName, LastName, Email, Type) VALUES ($1, $2, $3, $4)",
		p.Login, p.Password, "default", 0)
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
	r.Post("/", autentificateUser)
	r.Post("/add", addUser)
	r.Get("/get", getUser)

	return r
}
