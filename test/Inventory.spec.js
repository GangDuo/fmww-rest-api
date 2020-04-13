const { expect } = require('chai');
const Inventory = require('../src/Inventory')

describe('Inventory', function () {
  const source = {
    qty: 9,
    store: '001',
    jan: '1234567890123',
  }

  it('should work', function () {
    const instance = new Inventory(source)
    expect(instance.isValid()).to.be.true;
  });

  it('Letters should not be specified for quantity', function () {
    const instance = new Inventory(Object.assign({}, source, {qty: 'one'}))
    expect(instance.isValid()).to.be.false;
    expect(instance.errors.message).to.equal('The given QTY was NaN.')
  });

  it('Quantity should not be undefined', function () {
    const instance = new Inventory(Object.assign({}, source, {qty: undefined}))
    expect(instance.isValid()).to.be.false;
    expect(instance.errors.message).to.equal('The given QTY was NaN.')
  });

  it('Store should not be undefined', function () {
    const instance = new Inventory(Object.assign({}, source, {store: undefined}))
    expect(instance.isValid()).to.be.false;
    expect(instance.errors.message).to.equal('The given STORE was not found.')
  });

  it('JAN should not be undefined', function () {
    const instance = new Inventory(Object.assign({}, source, {jan: undefined}))
    expect(instance.isValid()).to.be.false;
    expect(instance.errors.message).to.equal('The given JAN was not found.')
  });
});