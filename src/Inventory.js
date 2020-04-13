module.exports = class Inventory {
  constructor(props) {
    Object.keys(props)
          .map(prop => this[`${prop}`] = props[prop])
    this.message = ''
  }

  get qty() { return this.qty_; }
  get store() { return this.store_; }
  get jan() { return this.jan_; }
  get errors() { return {message: this.message}; }

  set qty(v) { this.qty_ = v; }
  set store(v) { this.store_ = v; }
  set jan(v) { this.jan_ = v; }

  isValid() {
    const qty = parseInt(this.qty)
    if (isNaN(qty)) {
      this.message = 'The given QTY was NaN.'
      return false
    }
    const store = this.store
    if (!store || store.length < 3) {
      this.message = 'The given STORE was not found.'
      return false
    }
    const jan = this.jan
    if (!jan) {
      this.message = 'The given JAN was not found.'
      return false
    }
    return true
  }
}