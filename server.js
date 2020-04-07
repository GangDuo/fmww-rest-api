const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Simple REST API');
});

app.put('/api/v1/inventories/:store/:jan', (req, res) => {
  const jan = req.params.jan
  if (!jan) return res.status(404).send('The given JAN was not found.');

  res.send({
    store: req.params.store,
    jan: req.params.jan,
    qty: req.body.qty
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));