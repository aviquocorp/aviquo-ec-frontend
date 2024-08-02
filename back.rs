#[macro_use] extern crate rocket;
mod database;
mod models;
mod responses;

use database::DbConn;
use models::{Task, NewTask};
use responses::{Response, ResponseBody};
use rocket::serde::json::Json;
use rocket::State;
use sqlx::{Pool, Sqlite};

#[post("/tasks", format = "json", data = "<task>")]
async fn create_task(task: Json<NewTask>, db: &State<DbConn>) -> Response {
    let task = task.into_inner();
    let db_pool = db.inner().clone();
    let mut conn = db_pool.acquire().await.unwrap();
    let task_id = sqlx::query_as!(
        Task,
        r#"INSERT INTO tasks (name, description) VALUES (?, ?) RETURNING *"#,
        task.name, task.description
    )
    .fetch_one(&mut conn)
    .await
    .unwrap()
    .id;
    Response::ok(ResponseBody::Task(Task {
        id: task_id,
        name: task.name,
        description: task.description,
    }))
}

#[get("/tasks")]
async fn get_tasks(db: &State<DbConn>) -> Response {
    let db_pool = db.inner().clone();
    let mut conn = db_pool.acquire().await.unwrap();
    let tasks = sqlx::query_as!(Task, "SELECT * FROM tasks")
        .fetch_all(&mut conn)
        .await
        .unwrap();
    Response::ok(ResponseBody::Tasks(tasks))
}

#[get("/tasks/<id>")]
async fn get_task(id: i64, db: &State<DbConn>) -> Response {
    let db_pool = db.inner().clone();
    let mut conn = db_pool.acquire().await.unwrap();
    let task = sqlx::query_as!(Task, "SELECT * FROM tasks WHERE id = ?")
        .bind(id)
        .fetch_one(&mut conn)
        .await
        .unwrap();
    Response::ok(ResponseBody::Task(task))
}

#[delete("/tasks/<id>")]
async fn delete_task(id: i64, db: &State<DbConn>) -> Response {
    let db_pool = db.inner().clone();
    let mut conn = db_pool.acquire().await.unwrap();
    sqlx::query!("DELETE FROM tasks WHERE id = ?", id)
        .execute(&mut conn)
        .await
        .unwrap();
    Response::ok(ResponseBody::Message("Task deleted successfully".to_string()))
}

#[rocket::main]
async fn main() -> Result<(), rocket::Error> {
    let db_pool = DbConn::new("sqlite://db.sqlite3").await.unwrap();
    let _rocket = rocket::build()
        .mount("/", routes![create_task, get_tasks, get_task, delete_task])
        .manage(db_pool)
        .launch()
        .await?;
    Ok(())
}

struct DbConn {
    inner: Pool<Sqlite>,
}

impl DbConn {
    async fn new(url: &str) -> Result<Self, sqlx::Error> {
        let pool = Pool::<Sqlite>::connect(url).await?;
        Ok(DbConn { inner: pool })
    }
}

mod models {
    use serde::{Serialize, Deserialize};

    #[derive(Serialize, Deserialize)]
    pub struct Task {
        pub id: i64,
        pub name: String,
        pub description: String,
    }

    #[derive(Serialize, Deserialize)]
    pub struct NewTask {
        pub name: String,
        pub description: String,
    }
}

mod responses {
    use serde::{Serialize, Deserialize};

    #[derive(Serialize, Deserialize)]
    pub struct Response {
        pub body: ResponseBody,
    }

    #[derive(Serialize, Deserialize)]
    pub enum ResponseBody {
        Task(Task),
        Tasks(Vec<Task>),
        Message(String),
    }
}