const mysql = require("mysql");
//import mysql from "mysql";

const conexao = mysql.createConnection({
  host: "127.0.0.1",
  port: "3306",
  user: "root",
  password: "root",
  database: "db-notenest-a3",
});

const pool = mysql.createPool(conexao);

module.exports = conexao;
