//observações
const conexao = require("../infra/conexao.cjs");
const bodyParser = require("body-parser");
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const app = express();
const PORT = 3003;
app.use(express.json());

const observacoesPorLembreteId = {};

app.use(bodyParser.json());

app.listen(PORT, () => {
  console.log(`O serviço de Observações esta rodando na porta ${PORT}`);
});

//lista observações por lembrete
app.get("/lembretes/:id/observacoes", (req, res) => {
  res.send(observacoesPorLembreteId[req.params.id] || []);
});

//cria observações associadas a um lembrete
app.post("/lembretes/:id/observacoes", async (req, res) => {
  const idObs = uuidv4();
  const { texto } = req.body;
  //req.params dá acesso à lista de parâmetros da URL
  const observacoesDoLembrete = observacoesPorLembreteId[req.params.id] || [];
  observacoesDoLembrete.push({ id: idObs, texto });
  observacoesPorLembreteId[req.params.id] = observacoesDoLembrete;
  res.status(201).send(observacoesDoLembrete);
});

//altera observação sem alterar relacionamento com lembrete
app.put("/lembretes/:id/observacoes/:id_obs", (req, res) => {
  const lembreteId = req.params.id;
  const idObservacao = req.params.id_obs;
  const observacoesDoLembrete = observacoesPorLembreteId[lembreteId];

  if (observacoesDoLembrete) {
    const observacao = observacoesDoLembrete.find(
      (obs) => obs.id === idObservacao
    );

    if (observacao) {
      const { texto } = req.body;
      observacao.texto = texto;
      res.json(observacao);
    } else {
      res.status(404).json({ error: "Observação não encontrada." });
    }
  } else {
    res.status(404).json({ error: "Lembrete não encontrado." });
  }
});

//deleta observação sem alterar relacionamento com lembrete
app.delete("/lembretes/:id/observacoes/:id_obs", (req, res) => {
  const lembreteId = req.params.id;
  const idObservacao = req.params.id_obs;
  const observacoesDoLembrete = observacoesPorLembreteId[lembreteId];

  if (observacoesDoLembrete) {
    const observacaoIndex = observacoesDoLembrete.findIndex(
      (obs) => obs.id === idObservacao
    );

    if (observacaoIndex !== -1) {
      observacoesDoLembrete.splice(observacaoIndex, 1);
      res.json({ message: "Observação deletada com sucesso." });
    } else {
      res.status(404).json({ error: "Observação não encontrada." });
    }
  } else {
    res.status(404).json({ error: "Lembrete não encontrado." });
  }
});

//testando a porta
app.get("/", (req, res) => {
  res.send("Testando serviço");
});
