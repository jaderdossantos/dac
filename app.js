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


app.get('/pessoas', (req, res) => {
  db.query(`
    SELECT 
      p.pessoa_id,
      p.nome,
      p.cpf,
      p.nascimento,
      p.telefone,
      t.descricao AS tipo
    FROM tbPessoas p
    JOIN tbPessoaTipo t 
      ON p.pessoa_tipo_id = t.pessoa_tipo_id
  `, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});


app.post('/pessoas', (req, res) => {
  const { nome, cpf, nascimento, telefone } = req.body;

  if (!nome || !cpf || !nascimento || !telefone) {
    return res.status(400).send('Preencha todos os campos');
  }

  db.query(`
    INSERT INTO tbPessoas
    (nome, cpf, nascimento, telefone, pessoa_tipo_id, atualizado_por, atualizado_em)
    VALUES (?, ?, ?, ?, 1, 1, NOW())
  `,
  [nome, cpf, nascimento, telefone],
  (err) => {
    if (err) return res.status(500).send(err.sqlMessage);

    res.send('Pessoa cadastrada');
  });
});



app.put('/pessoas/:id', (req, res) => {
  const { id } = req.params;
  const { nome, cpf, nascimento, telefone } = req.body;

  db.query(`
    UPDATE tbPessoas
    SET nome = ?,
        cpf = ?,
        nascimento = ?,
        telefone = ?,
        atualizado_em = NOW()
    WHERE pessoa_id = ?
  `,
  [nome, cpf, nascimento, telefone, id],
  (err) => {
    if (err) return res.status(500).send(err.sqlMessage);

    res.send('Pessoa atualizada');
  });
});


app.delete('/pessoas/:id', (req, res) => {
  const { id } = req.params;

  db.query(
    'DELETE FROM tbPessoas WHERE pessoa_id = ?',
    [id],
    (err) => {
      if (err) return res.status(500).send(err.sqlMessage);

      res.send('Pessoa deletada');
    }
  );
});

app.get('/capacitacao-tipos', (req, res) => {

  db.query(
    'SELECT * FROM tbCapacitacaoTipo',
    (err, result) => {

      if (err) return res.status(500).send(err);

      res.json(result);
    }
  );

});

app.get('/capacitacoes', (req, res) => {

  db.query(`
    SELECT
      c.capacitacao_id,
      c.datahora,
      p.nome AS funcionario,
      t.descricao AS tipo

    FROM tbCapacitacao c

    JOIN tbPessoas p
      ON c.funcionario_id = p.pessoa_id

    JOIN tbCapacitacaoTipo t
      ON c.capacitacao_tipo_id = t.capacitacao_tipo_id
  `,
  (err, result) => {

    if (err) return res.status(500).send(err);

    res.json(result);
  });

});

app.post('/capacitacoes', (req, res) => {

  const {
    funcionario_id,
    capacitacao_tipo_id
  } = req.body;

  if (!funcionario_id || !capacitacao_tipo_id) {
    return res.status(400).send('Preencha todos os campos');
  }

  db.query(`
    INSERT INTO tbCapacitacao
    (
      datahora,
      funcionario_id,
      capacitacao_tipo_id,
      atualizado_em,
      atualizado_por
    )
    VALUES
    (
      NOW(),
      ?,
      ?,
      NOW(),
      1
    )
  `,
  [funcionario_id, capacitacao_tipo_id],
  (err) => {

    if (err) return res.status(500).send(err.sqlMessage);

    res.send('Capacitação cadastrada');
  });

});

app.delete('/capacitacoes/:id', (req, res) => {

  const { id } = req.params;

  db.query(
    'DELETE FROM tbCapacitacao WHERE capacitacao_id = ?',
    [id],
    (err) => {

      if (err) return res.status(500).send(err.sqlMessage);

      res.send('Capacitação deletada');
    }
  );

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});