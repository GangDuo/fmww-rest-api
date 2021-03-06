const {FmClient, InventoryAsBatch} = require('fmww-library');
const Inventory = require('./src/Inventory')
const express = require('express');
const app = express();
const {promisify} = require('util');
const fs = require('fs');
const axios = require('axios');

const unlinkAsync = promisify(fs.unlink);
let isBusy = false

const c = new FmClient()
// 20分間隔で再ログイン
setInterval(async _ => {
  await transaction(updateSession, c)
}, 1200000);

setImmediate(async (arg) => {
  await transaction(updateSession, arg)
}, c)

async function transaction(callbackAsync, arg) {
  if(isBusy) return
  isBusy = true
  await callbackAsync(arg)
  isBusy = false
}

async function updateSession(client) {
  const user = {
    FMWW_ACCESS_KEY_ID     : process.env.FMWW_ACCESS_KEY_ID,
    FMWW_USER_NAME         : process.env.FMWW_USER_NAME,
    FMWW_SECRET_ACCESS_KEY : process.env.FMWW_SECRET_ACCESS_KEY,
    FMWW_PASSWORD          : process.env.FMWW_PASSWORD
  }
  await client
        .open(process.env.FMWW_SIGN_IN_URL)
        .signIn(user)
        .createAbility(InventoryAsBatch)
}

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Simple REST API');
});

app.put('/api/v1/inventories/:store/:jan', (req, res, next) => {
  if(isBusy) return res.status(503).send('Service Temporarily Unavailable')
  const inventory = new Inventory(Object.assign({}, req.body, req.params))
  if(!inventory.isValid()) return res.status(404).send(inventory.errors.message);

  (async () => {
    const {qty, store, jan} = inventory

    isBusy = true

    // 在庫更新の更新用CSVデータ生成
    const filename = 'tmp.csv'
    await inventory.generateDefaultFormatCSV(filename)

    // CSVアップロード
    const response = await c.create({
      filePath: filename
    })
    //await c.quit()
    //await unlinkAsync(filename);

    isBusy = false

    res.send({
      ... response,
      store: store,
      jan: jan,
      qty: qty
    });
  })().catch(_ => {
    isBusy = false
    next()
  });
});

app.get('/jsonp/v1/inventories', (req, res, next) => {
  const {store, jan, qty} = req.query
  const payload = JSON.stringify({
    qty: qty
  })
  
  axios.put(`http://localhost:3000/api/v1/inventories/${store}/${jan}`, payload, {
    headers: {'content-type': 'application/json'},
  })
    .then(response => {
      res.jsonp(response.data)
    })
    .catch(error => {
      console.log(error);
      res.jsonp({...req.query, ...error})
    });
  
})

app.get('/static/js/stock-editor-pane-extension.js', (req, res, next) => {
  const {store} = req.query

  fs.readFile("templates/stock-editor-pane-extension.min.js", 'utf-8', (err, data) => {
    if (err) return res.status(503).send('Service Temporarily Unavailable')
    res.set('Content-Type', 'text/javascript')
    res.send(data.replace(/<%\s*VAR_STORE_CODE\s*%>/g, store)
      .replace(/<%\s*VAR_HOST\s*%>/g, req.get('host')))
  });
})

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));