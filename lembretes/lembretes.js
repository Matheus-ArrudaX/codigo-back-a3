// lembretes.js
const express = require("express");
const conexao = require("../infra/conexao.cjs");
const bodyParser = require("body-parser");
const lembretes = [];
const router = express.Router();
const mysql = require("mysql2/promise");
const { v4: uuidv4 } = require("uuid");
const PORT = 3002;
const app = express();

router.use(bodyParser.json());

const db = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "root",
  database: "NoteNest",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.listen(PORT, () => {
  console.log(`O serviço de lembretes rodando na porta ${PORT}`);
});

router.post("/lembretes", async (req, res) => {
  const { nome_lembrete, data_lembrete } = req.body;
  const id_lembrete = uuidv4();

  await db.execute(
    "INSERT INTO lembretes (id_lembrete, nome_lembrete, data_lembrete) VALUES (?, ?, ?)",
    [id_lembrete, nome_lembrete, data_lembrete]
  );

  res.status(201).json({ id_lembrete, nome_lembrete, data_lembrete });
});

router.get("/lembretes", async (req, res) => {
  const [lembretes] = await db.execute("SELECT * FROM lembretes");
  res.json(lembretes);
});

router.get("/lembretes/:id", async (req, res) => {
  const [lembrete] = await db.execute(
    "SELECT * FROM lembretes WHERE id_lembrete = ?",
    [req.params.id]
  );

  if (lembrete.length > 0) {
    res.json(lembrete[0]);
  } else {
    res.status(404).json({ error: "Lembrete não encontrado." });
  }
});

router.get("/lembretes/data/:data_lembrete", async (req, res) => {
  const dataLembrete = req.params.data_lembrete;
  const [lembretesPorData] = await db.execute(
    "SELECT * FROM lembretes WHERE data_lembrete = ?",
    [dataLembrete]
  );

  if (lembretesPorData.length > 0) {
    res.json(lembretesPorData);
  } else {
    res.status(404).json({
      error: "Nenhum lembrete encontrado para a data especificada.",
    });
  }
});

router.get("/lembretes/buscar-data/:parte_data", async (req, res) => {
  const parteData = req.params.parte_data.toLowerCase();

  const [lembretesEncontrados] = await db.execute(
    "SELECT * FROM lembretes WHERE LOWER(data_lembrete) LIKE ?",
    [`%${parteData}%`]
  );

  if (lembretesEncontrados.length > 0) {
    res.json(lembretesEncontrados);
  } else {
    res.status(404).json({
      error: "Nenhum lembrete encontrado para a parte da data especificada.",
    });
  }
});

router.get("/lembretes/pesquisar/:palavra_chave", async (req, res) => {
  const palavraChave = req.params.palavra_chave.toLowerCase();

  const [lembretesEncontrados] = await db.execute(
    "SELECT * FROM lembretes WHERE LOWER(nome_lembrete) LIKE ? OR LOWER(conteudo_lembrete) LIKE ?",
    [`%${palavraChave}%`, `%${palavraChave}%`]
  );

  if (lembretesEncontrados.length > 0) {
    res.json(lembretesEncontrados);
  } else {
    res.status(404).json({
      error: "Nenhum lembrete encontrado para a palavra-chave especificada.",
    });
  }
});

router.put("/lembretes/:id", async (req, res) => {
  const [lembrete] = await db.execute(
    "SELECT * FROM lembretes WHERE id_lembrete = ?",
    [req.params.id]
  );

  if (lembrete.length > 0) {
    const { nome_lembrete, data_lembrete } = req.body;
    await db.execute(
      "UPDATE lembretes SET nome_lembrete = ?, data_lembrete = ? WHERE id_lembrete = ?",
      [nome_lembrete, data_lembrete, req.params.id]
    );

    res.json({ id_lembrete: req.params.id, nome_lembrete, data_lembrete });
  } else {
    res.status(404).json({ error: "Lembrete não encontrado." });
  }
});

router.put("/lembretes/concluir/:id_lembrete", async (req, res) => {
  const [lembrete] = await db.execute(
    "SELECT * FROM lembretes WHERE id_lembrete = ?",
    [req.params.id_lembrete]
  );

  if (lembrete.length > 0) {
    await db.execute(
      "UPDATE lembretes SET concluido = true WHERE id_lembrete = ?",
      [req.params.id_lembrete]
    );

    res.json({ message: "Lembrete marcado como concluído." });
  } else {
    res.status(404).json({ error: "Lembrete não encontrado." });
  }
});

router.delete("/lembretes/:id", async (req, res) => {
  const [lembrete] = await db.execute(
    "SELECT * FROM lembretes WHERE id_lembrete = ?",
    [req.params.id]
  );

  if (lembrete.length > 0) {
    await db.execute("DELETE FROM lembretes WHERE id_lembrete = ?", [
      req.params.id,
    ]);

    res.json({ message: "Lembrete excluído com sucesso." });
  } else {
    res.status(404).json({ error: "Lembrete não encontrado." });
  }
});

module.exports = router;

/*

app.listen(PORT, () => {
  console.log(`O serviço de lembretes rodando na porta ${PORT}`);
});

// Rota para criar um lembrete
app.post("/lembretes", (req, res) => {
  const { nome_lembrete, data_lembrete } = req.body;
  const lembrete = {
    id_lembrete: lembretes.length + 1,
    nome_lembrete,
    data_lembrete,
  };
  lembretes.push(lembrete);
  res.json(lembrete);
});

// Rota para listar todos os lembretes
app.get("/lembretes", (req, res) => {
  res.json(lembretes);
});

// Rota para listar um lembrete por ID
app.get("/lembretes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const lembrete = lembretes.find((l) => l.id_lembrete === id);
  if (lembrete) {
    res.json(lembrete);
  } else {
    res.status(404).json({ error: "Lembrete não encontrado." });
  }
});

// Rota para listar lembretes por data
app.get("/lembretes/data/:data_lembrete", (req, res) => {
  const dataLembrete = req.params.data_lembrete;
  const lembretesPorData = lembretes.filter(
    (l) => l.data_lembrete === dataLembrete
  );

  if (lembretesPorData.length > 0) {
    res.json(lembretesPorData);
  } else {
    res
      .status(404)
      .json({ error: "Nenhum lembrete encontrado para a data especificada." });
  }
});

// Rota para listar lembretes por parte de uma data
app.get("/lembretes/buscar-data/:parte_data", (req, res) => {
  const parteData = req.params.parte_data.toLowerCase(); // Converte para minúsculas

  const lembretesEncontrados = lembretes.filter((lembrete) => {
    if (lembrete.data_lembrete) {
      // Verifica se a data do lembrete contém a parte especificada
      return lembrete.data_lembrete.includes(parteData);
    }
    return false;
  });

  if (lembretesEncontrados.length > 0) {
    res.json(lembretesEncontrados);
  } else {
    res.status(404).json({
      error: "Nenhum lembrete encontrado para a parte da data especificada.",
    });
  }
});

// Rota para listar por palavra-chave
app.get("/lembretes/pesquisar/:palavra_chave", (req, res) => {
  const palavraChave = req.params.palavra_chave.toLowerCase();
  const lembretesEncontrados = lembretes.filter(
    (l) =>
      l.nome_lembrete.toLowerCase().includes(palavraChave) ||
      (l.conteudo_lembrete &&
        l.conteudo_lembrete.toLowerCase().includes(palavraChave))
  );

  if (lembretesEncontrados.length > 0) {
    res.json(lembretesEncontrados);
  } else {
    res.status(404).json({
      error: "Nenhum lembrete encontrado para a palavra-chave especificada.",
    });
  }
});

// Rota para listar um lembrete pelo nome
app.get("/lembretes/nome/:nome_lembrete", (req, res) => {
  const nome_lembrete = req.params.nome_lembrete;
  const lembrete = lembretes.find((l) => l.nome_lembrete === nomeLembrete);

  if (lembrete) {
    res.json(lembrete);
  } else {
    res.status(404).json({ error: "Lembrete não encontrado." });
  }
});

// Rota para atualizar um lembrete por ID
app.put("/lembretes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const lembrete = lembretes.find((l) => l.id_lembrete === id);
  if (lembrete) {
    lembrete.nome_lembrete = req.body.nome_lembrete || lembrete.nome_lembrete;
    lembrete.data_lembrete = req.body.data_lembrete || lembrete.data_lembrete;
    res.json(lembrete);
  } else {
    res.status(404).json({ error: "Lembrete não encontrado." });
  }
});

// Rota para marcar um lembrete como concluído
app.put("/lembretes/concluir/:id_lembrete", (req, res) => {
  const idLembrete = parseInt(req.params.id_lembrete);
  const lembrete = lembretes.find((l) => l.id_lembrete === idLembrete);

  if (!lembrete) {
    return res.status(404).json({ error: "Lembrete não encontrado." });
  }

  lembrete.concluido = true;
  res.json(lembrete);
});

// Rota para excluir um lembrete por ID
app.delete("/lembretes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = lembretes.findIndex((l) => l.id_lembrete === id);
  if (index !== -1) {
    lembretes.splice(index, 1);
    res.json({ message: "Lembrete excluído com sucesso." });
  } else {
    res.status(404).json({ error: "Lembrete não encontrado." });
  }
});

//testando a porta
app.get("/", (req, res) => {
  res.send("Testando serviço");
});
*/
