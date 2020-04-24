import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import Promise from '../src/index'

chai.use(sinonChai)
const assert = chai.assert

describe('Promise.', () => {
  it('1.1 Promise is a class.', () => {
    assert.isFunction(Promise)
    assert.isObject(Promise.prototype)
  })
  it('1.2 the first parameter of new Promise() must be a function.', () => {
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
  it('1.3 new Promise(fn) will return a thenabale object.', () => {
    function fn() {}
    const p = new Promise(fn)
    assert.isObject(p)
    assert.isFunction(p.then)
  })
  it('1.4 fn of new promise(fn) will invoke immediately.', () => {
    const fn = sinon.fake()
    new Promise(fn)
    assert(fn.called)
  })
  it('1.5 fn of new Promise(fn) recieve two functions as parameters which are resolve and reject.', () => {
    const p = new Promise((resolve, reject) => {
      assert.isFunction(resolve)
      assert.isFunction(reject)
    })
  })
  it('1.6 succeed of thenable.then(succeed) will invoke immediately when resolve is invoked.', (done) => {
    const fn = sinon.fake()
    new Promise((resolve, reject) => {
      resolve(1)
    }).then((data) => {
      fn(data)
      assert(fn.called)
      done()
    })
  })
  it('1.7 fail of thenable.then(succeed, fail) will invoke immediately when reject is invoked.', (done) => {
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
  it('2.2.1 both succeed and fail are optional arguments.', () => {
    new Promise((resolve, reject) => {
      resolve(1)
    }).then(false, true)
  })
  it('2.2.2 if succeed is a function.', (done) => {
    const fn = sinon.fake()
    const p = new Promise((resolve, reject) => {
      resolve(1)
      assert(!fn.called)
    })
    p.then(fn)
    setTimeout(() => {
      assert(p.state === 'fulfilled')
      assert(fn.calledWith(1))
      assert(fn.callCount === 1)
      done()
    })
  })
  it('2.2.3 if fail is a function.', (done) => {
    const fn = sinon.fake()
    const p = new Promise((resolve, reject) => {
      reject('error')
      assert(!fn.called)
    })
    p.then(null, fn)
    setTimeout(() => {
      assert(p.state === 'rejected')
      assert(fn.calledWith('error'))
      assert(fn.callCount === 1)
      done()
    })
  })
  it('2.2.4 succeed or fail must not be called until the execution context stack contains only platform code.', () => {
    const succeed = sinon.fake()
    const fail = sinon.fake()
    new Promise((resolve, reject) => {
      resolve()
    }).then(succeed)
    new Promise((resolve, reject) => {
      reject()
    }).then(null, fail)
    assert(!succeed.called)
    assert(!fail.called)
    setTimeout(() => {
      assert(succeed.called)
      assert(fail.called)
    })
  })
  it('2.2.5 succeed and fail must be called as functions (i.e. with no this value).', (done) => {
    new Promise((resolve, reject) => {
      resolve()
    }).then(function () {
      'use strict'
      assert(this === undefined)
      done()
    })
  })
  it('2.2.6.1 if/when promise is fulfilled, all respective onFulfilled callbacks must execute in the order of their originating calls to then.', () => {
    const fns = [sinon.fake(), sinon.fake(), sinon.fake()]
    const p = new Promise((resolve, reject) => resolve(2))
    p.then(fns[0])
    p.then(fns[1])
    p.then(fns[2])
    setTimeout(() => {
      assert(fns[0].calledBefore(fns[1]))
      assert(fns[1].calledBefore(fns[2]))
    })
  })
  it('2.2.6.2 if/when promise is rejected, all respective onRejected callbacks must execute in the order of their originating calls to then.', () => {
    const fns = [sinon.fake(), sinon.fake(), sinon.fake()]
    const p = new Promise((resolve, reject) => reject('error'))
    p.then(null, fns[0])
    p.then(null, fns[1])
    p.then(null, fns[2])
    setTimeout(() => {
      assert(fns[0].calledBefore(fns[1]))
      assert(fns[1].calledBefore(fns[2]))
    })
  })
  // promise2 = promise1.then(onFulfilled, onRejected);
  it('2.2.7 then must return a promise.', () => {
    const p = new Promise((resolve, reject) => resolve('hi')).then()
    assert(p instanceof Promise)
  })
  it('2.2.7.1 If either onFulfilled or onRejected returns a value x, run the Promise Resolution Procedure [[Resolve]](promise2, x).', (done) => {
    const succeed = sinon.fake()
    const p = new Promise((resolve, reject) => resolve('hi')).then(() => 's1')
    p.then(succeed)
    const succeed2 = sinon.fake()
    const p1 = new Promise((resolve, reject) => reject('hi')).then(
      null,
      () => 'f1'
    )
    p1.then(succeed2)
    setTimeout(() => {
      assert(succeed.calledWith('s1'))
      assert(succeed2.calledWith('f1'))
      done()
    })
  })
  it('2.2.7.2 If either onFulfilled or onRejected throws an exception e, promise2 must be rejected with e as the reason.', (done) => {
    const fail = sinon.fake()
    const error = new Error()
    const p = new Promise((resolve, reject) => resolve('hi')).then(() => {
      throw error
    })
    p.then(null, fail)
    const fail2 = sinon.fake()
    const p1 = new Promise((resolve, reject) => reject('hi')).then(null, () => {
      throw error
    })
    p1.then(null, fail2)
    setTimeout(() => {
      assert(fail.calledWith(error))
      assert(fail2.calledWith(error))
      done()
    })
  })
  it('2.2.7.3 If onFulfilled is not a function and promise1 is fulfilled, promise2 must be fulfilled with the same value as promise1.', (done) => {
    const fn = sinon.fake()
    const p = new Promise((resolve, reject) => resolve('hi')).then()
    p.then(fn)
    setTimeout(() => {
      assert(fn.calledWith('hi'))
      done()
    })
  })
  it('2.2.7.4 If onRejected is not a function and promise1 is rejected, promise2 must be rejected with the same reason as promise1.', (done) => {
    const fn = sinon.fake()
    const p = new Promise((resolve, reject) => reject('error')).then()
    p.then(null, fn)
    setTimeout(() => {
      assert(fn.calledWith('error'))
      done()
    })
  })
  it('2.3.1 If promise and x refer to the same object, reject promise with a TypeError as the reason.', () => {
    //   const p = new Promise((resolve, reject) => {
    //     setTimeout(() => {
    //       resolve(p)
    //     })
    //   }).then((r) => {
    //     console.log('result------', r)
    //     return r
    //   })
    //   const fn = sinon.fake()
  })
  it('2.3.2 if x is a promise.', (done) => {
    const fail = sinon.fake()
    const rejectedP = new Promise((resolve, reject) => reject('error'))
    const p1 = new Promise((resolve, reject) => resolve(rejectedP)).then(
      null,
      function (e){
        assert(e === 'error')
        this.state = 'rejected'
      }
    )
    const succeed = sinon.fake()
    const resolvedP = new Promise((resolve, reject) => resolve('value'))
    const p2 = new Promise((resolve, reject) => resolve(resolvedP)).then(
      function(v){
        assert(v === 'value')
        this.state = 'fulfilled'
      }
    )
    setTimeout(()=>{done()})
  })
  it('2.3.3 Otherwise, if x is an object or function.', (done)=>{

  })
})
