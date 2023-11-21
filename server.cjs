// server.js
const express = require("express");
const conexao = require("./infra/conexao.cjs");
const lembretesRouter = require("./lembretes/lembretes.js");
const categoriasRouter = require("./categoria/categoria.js");

const app = express();
const PORT = 3000;

// Usar os Routers como middleware
app.use("/lembretes", lembretesRouter);
app.use("/categorias", categoriasRouter);

// Fazendo a conexão
conexao.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Conectado com sucesso");

    // Executando a porta
    app.listen(PORT, () => {
      console.log(`Servidor rodando no endereço http://localhost:${PORT}`);
    });
  }
});

app.get("/", (req, res) => {
  res.send("Testando serviço");
});

module.exports = app;

/*import express from "express";
import conexao from "./infra/conexao.cjs";
import lembretesRouter from "./lembretes/lembretes.js";
import categoriasRouter from "./categoria/categoria.js";

const app = express();
const PORT = 3000;

app.use("/lembretes", lembretesRouter);
app.use("/categorias", categoriasRouter);

// fazendo a conexão
conexao.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Conectado com sucesso");

    // executando a porta
    app.listen(PORT, () => {
      console.log(`Servidor rodando no endereço http://localhost:${PORT}`);
    });
  }
});

app.get("/", (req, res) => {
  res.send("Testando serviço");
});

export default app;
*/
