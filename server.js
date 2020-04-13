const moment = require("moment");
const {FmClient, InventoryAsBatch} = require('fmww-library');
const express = require('express');
const app = express();
const {promisify} = require('util');
const fs = require('fs');
const writeFileAsync = promisify(fs.writeFile);
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

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Simple REST API');
});

app.put('/api/v1/inventories/:store/:jan', (req, res, next) => {
  (async () => {
    if(isBusy) return res.status(503).send('Service Temporarily Unavailable')
    isBusy = true
    // パラメータチェック
    const qty = parseInt(req.body.qty)
    if (isNaN(qty)) {
      return res.status(404).send('The given QTY was NaN.');
    }

    const store = req.params.store
    if (!store || store.length < 3) return res.status(404).send('The given STORE was not found.');

    const jan = req.params.jan
    if (!jan) return res.status(404).send('The given JAN was not found.');

    // 在庫更新の更新用CSVデータ生成
    const now = moment()
    const recode = [
      `${store}${now.format("YYMMDD")}`,
      jan,
      Math.abs(qty),
      now.format("YYYY-MM-DD"),
      9900,
      store,
      qty < 0 ? 3 : 4
    ]
    const filename = 'tmp.csv'
    await writeFileAsync(filename, recode.join(','))

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
  })().catch(next);
});

app.get('/jsonp/v1/inventories', (req, res, next) => {
  const {store, jan, qty, callback} = req.query
  res.send(req.query);
})

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));