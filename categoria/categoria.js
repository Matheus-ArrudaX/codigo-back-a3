//categorias
const conexao = require("../infra/conexao.cjs");
const bodyParser = require("body-parser");
const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const app = express();
const PORT = 3001;

app.use(express.json());

const categoriasPorLembreteId = {};
const categorias = [];
let proximoIdCategoria = 1; // Variável para rastrear o próximo ID de categoria

app.use(bodyParser.json());

app.listen(PORT, () => {
  console.log(`O serviço de Categorias rodando na porta ${PORT}`);
});

// Rota para listar todos os lembretes associados a uma categoria
app.get("/lembretes/:id/categorias", (req, res) => {
  res.send(categoriasPorLembreteId[req.params.id] || []);
});

// Rota para associar uma categoria a um lembrete
app.post("/lembretes/:id/categorias", async (req, res) => {
  const idObs = uuidv4();
  const { nome_categoria } = req.body;
  //req.params dá acesso à lista de parâmetros da URL
  const categoriasDoLembrete = categoriasPorLembreteId[req.params.id] || [];
  categoriasDoLembrete.push({ id: idObs, nome_categoria });
  categoriasPorLembreteId[req.params.id] = categoriasDoLembrete;

  res.status(201).send(categoriasDoLembrete);
});

//altera categoria sem alterar relacionamento com lembrete
app.put("/lembretes/:id/categorias/:id_cat", (req, res) => {
  const lembreteId = req.params.id;
  const idCategorias = req.params.id_cat;
  const categoriasDoLembrete = categoriasPorLembreteId[lembreteId];

  if (categoriasDoLembrete) {
    const categoria = categoriasDoLembrete.find(
      (cat) => cat.id === idCategorias
    );

    if (categoria) {
      const { nome_categoria } = req.body;
      categoria.nome_categoria = nome_categoria;
      res.json(categoria);
    } else {
      res.status(404).json({ error: "Categoria não encontrada." });
    }
  } else {
    res.status(404).json({ error: "Lembrete não encontrado." });
  }
});

//deleta categoria sem alterar relacionamento com lembrete
app.delete("/lembretes/:id/categorias/:id_cat", (req, res) => {
  const lembreteId = req.params.id;
  const idCategorias = req.params.id_cat;
  const categoriasDoLembrete = categoriasPorLembreteId[lembreteId];

  if (categoriasDoLembrete) {
    const categoriaIndex = categoriasDoLembrete.findIndex(
      (cat) => cat.id === idCategorias
    );

    if (categoriaIndex !== -1) {
      categoriasDoLembrete.splice(categoriaIndex, 1);
      res.json({ message: "Categoria deletada com sucesso." });
    } else {
      res.status(404).json({ error: "Categoria não encontrada." });
    }
  } else {
    res.status(404).json({ error: "Lembrete não encontrado." });
  }
});

//testando a porta
app.get("/", (req, res) => {
  res.send("Testando serviço");
});

module.exports = app;
