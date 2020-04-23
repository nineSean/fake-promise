import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import Promise from '../src/index'

chai.use(sinonChai)
const assert = chai.assert

describe('Promise', () => {
  it('1.1 Promise is a class', () => {
    assert.isFunction(Promise)
    assert.isObject(Promise.prototype)
  })
  it('1.2 the first parameter of new Promise() must be a function', () => {
    assert.throw(() => {
      // @ts-ignore
      new Promise()
    })
    assert.throw(() => {
      new Promise(1)
    })
    assert.throw(() => {
      new Promise([123])
    })
  })
  it('1.3 new Promise(fn) will return a thenabale object', () => {
    function fn() {}
    const p = new Promise(fn)
    assert.isObject(p)
    assert.isFunction(p.then)
  })
  it('1.4 fn of new promise(fn) will invoke immediately', () => {
    const fn = sinon.fake()
    new Promise(fn)
    assert(fn.called)
  })
  it('1.5 fn of new Promise(fn) recieve two functions as parameters which are resolve and reject', () => {
    const p = new Promise((resolve, reject) => {
      assert.isFunction(resolve)
      assert.isFunction(reject)
    })
  })
  it('1.6 succeed of thenable.then(succeed) will invoke immediately when resolve is invoked', (done) => {
    const fn = sinon.fake()
    new Promise((resolve, reject) => {
      resolve(1)
    }).then((data) => {
      fn(data)
      assert(fn.called)
      done()
    })
  })
  it('1.7 fail of thenable.then(succeed, fail) will invoke immediately when reject is invoked', (done) => {
    const fn = sinon.fake()
    new Promise((resolve, reject) => {
      reject(1)
    }).then(null, fn)
    setTimeout(() => {
      assert(fn.called)
      done()
    })
  })
  // promise.then(succeed, fail)
  it('2.2.1 both succeed and fail are optional arguments', () => {
    new Promise((resolve, reject) => {
      resolve(1)
    }).then(false, true)
  })
  it('2.2.2 if succeed is a function', (done) => {
    const fn = sinon.fake()
    const p = new Promise((resolve, reject) => {
      resolve(1)
      assert(!fn.called)
    })
    p.then(fn)
    setTimeout(()=>{
      assert(p.state === 'fulfilled')
      assert(fn.calledWith(1))
      assert(fn.callCount === 1)
      done()
    })
  })
  it('2.2.3 if fail is a function', (done) => {
    const fn = sinon.fake()
    const p = new Promise((resolve, reject) => {
      reject('error')
      assert(!fn.called)
    })
    p.then(null,fn)
    setTimeout(()=>{
      assert(p.state === 'rejected')
      assert(fn.calledWith('error'))
      assert(fn.callCount === 1)
      done()
    })
  })
})
