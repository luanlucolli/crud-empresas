const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "empresas.json");

app.use(cors());
app.use(express.json());

// Carrega empresas do arquivo JSON
const loadEmpresasFromFile = () => {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  }
  return [];
};

// Salva empresas no arquivo JSON
const saveEmpresasToFile = () => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(empresas, null, 2));
};

// Inicializa empresas
let empresas = loadEmpresasFromFile();
let nextId = empresas.length > 0 ? Math.max(...empresas.map((e) => e.id)) + 1 : 1;

// Log de requisições
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Rota para listar empresas
app.get("/empresas", (req, res) => {
  res.json(empresas);
});

app.post("/empresas", (req, res) => {
  const { nome, cnpj, telefone, endereco } = req.body;

  if (!nome || !cnpj || !telefone || !endereco) {
    return res.status(400).json({ error: "Dados incompletos para cadastro" });
  }

  // Verifica duplicidade de CNPJ
  const empresaExistente = empresas.find((emp) => emp.cnpj === cnpj);
  if (empresaExistente) {
    return res.status(409).json({ error: "Empresa com este CNPJ já existe!" });
  }

  const novaEmpresa = {
    id: nextId++,
    nome,
    cnpj,
    telefone,
    endereco,
  };

  empresas.push(novaEmpresa);
  saveEmpresasToFile(); // Salva alterações
  res.status(201).json(novaEmpresa);
});


// Rota para atualizar empresa
app.put("/empresas/:id", (req, res) => {
  const { id } = req.params;
  const { nome, cnpj, telefone, endereco } = req.body;

  const empresa = empresas.find((emp) => emp.id === parseInt(id));

  if (!empresa) {
    return res.status(404).json({ error: "Empresa não encontrada!" });
  }

  empresa.nome = nome;
  empresa.cnpj = cnpj;
  empresa.telefone = telefone;
  empresa.endereco = endereco;

  saveEmpresasToFile(); // Salva alterações
  res.json(empresa);
});

// Rota para deletar empresa
app.delete("/empresas/:id", (req, res) => {
  const { id } = req.params;

  const index = empresas.findIndex((emp) => emp.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ error: "Empresa não encontrada!" });
  }

  empresas.splice(index, 1);
  saveEmpresasToFile(); // Salva alterações
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
