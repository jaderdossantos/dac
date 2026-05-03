const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect('/login.html');
});

app.get('/usuarios', (req, res) => {
  db.query('SELECT * FROM tbUsuarios', (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

app.post('/usuarios', (req, res) => {
  const { nome, login, senha } = req.body;

   if (!nome || !login || !senha) {
    return res.status(400).send('Campos obrigatórios não preenchidos');
  }

  db.query(
    `INSERT INTO tbUsuarios 
     (nome, login, senha, atualizado_em, atualizado_por) 
     VALUES (?, ?, ?, NOW(), 1)`,
    [nome, login, senha],
    (err) => {
      if (err) return res.status(500).send(err.sqlMessage);
      res.send('Usuário criado');
    }
  );
});


app.put('/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const { nome, login, senha } = req.body;

  db.query(
    `UPDATE tbUsuarios 
     SET nome = ?, login = ?, senha = ?, atualizado_em = NOW()
     WHERE usuario_id = ?`,
    [nome, login, senha, id],
    (err) => {
      if (err) return res.status(500).send(err.sqlMessage);
      res.send('Usuário atualizado');
    }
  );
});

app.delete('/usuarios/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM tbUsuarios WHERE usuario_id = ?', [id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Usuário deletado');
  });
});

app.post('/login', (req, res) => {
  const { login, senha } = req.body;

  db.query(
    'SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?',
    [login, senha],
    (err, result) => {
      if (err) return res.status(500).send(err);

      if (result.length > 0) {
        res.send('Login OK');
      } else {
        res.status(401).send('Login inválido');
      }
    }
  );
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});