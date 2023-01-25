const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const priority_values = ["HIGH", "MEDIUM", "LOW", undefined];
const status_values = ["TO DO", "IN PROGRESS", "DONE", undefined];
const category_values = ["WORK", "HOME", "LEARNING", undefined];

const checkValues = (request, response, next) => {
  const { priority, status, category } = request.query;
  if (status_values.includes(status) === false) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (priority_values.includes(priority) === false) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (category_values.includes(category) === false) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else {
    next();
  }
};

const hasPriorityAndStatusProps = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.priority !== undefined
  );
};

const hasOnlyPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasOnlyStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasCategoryAndStatus = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasOnlyCategory = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const hasCategoryAndPriority = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

app.get("/todos/", checkValues, async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status, category } = request.query;

  switch (true) {
    case hasOnlyStatus(request.query):
      getTodosQuery = `
                SELECT 
                    *  
                FROM 
                    todo
                WHERE 
                    todo LIKE '%${search_q}%'
                    AND status = '${status}'`;
      break;
    case hasOnlyPriority(request.query):
      getTodosQuery = `
            SELECT
                *
            FROM 
                todo
            WHERE 
                todo LIKE '%${search_q}%'
                AND priority = '${priority}'`;
      break;

    case hasPriorityAndStatusProps(request.query):
      getTodosQuery = `
            SELECT 
                *
            FROM 
                todo
            WHERE 
                todo LIKE '%${search_q}%'
                AND status = '${status}'
                AND priority = '${priority}';`;
      break;

    case hasCategoryAndStatus(request.query):
      getTodosQuery = `
            SELECT 
                *
            FROM 
                todo
            WHERE 
                todo LIKE '%${search_q}%'
                AND status = '${status}'
                AND category = '${category}';`;
      break;

    case hasOnlyCategory(request.query):
      getTodosQuery = `
            SELECT 
                *
            FROM 
                todo
            WHERE 
                todo LIKE '%${search_q}%'
                AND category = '${category}';`;
      break;

    case hasCategoryAndPriority(request.query):
      getTodosQuery = `
            SELECT 
                *
            FROM 
                todo
            WHERE 
                todo LIKE '%${search_q}%'
                AND category = '${category}'
                AND priority = '${priority}';`;
      break;

    default:
      getTodosQuery = `
            SELECT 
                *
            FROM 
                todo
            WHERE 
                todo LIKE '%${search_q}%'`;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
        SELECT * FROM todo WHERE id = ${todoId};`;
  const data = await db.get(getTodoQuery);
  response.send(data);
});
module.exports = app;
