class FakePromise {
  state = 'pending'
  private callbacks = []
  private resolveOrReject(state, index, data) {
    if (this.state !== 'pending') return
    this.state = state
    nextTick(() => {
      this.callbacks.forEach((handlers) => {
        try {
          typeof handlers[index] === 'function' &&
            (data = handlers[index].call(undefined, data))
        } catch (e) {
          handlers[2].reject(e)
        }
        if (typeof handlers[1] !== 'function' && state === 'rejected')
          return handlers[2].reject(data)
        handlers[2].resolveWith(data)
      })
    })
  }
  resolveWithSelf() {
    this.reject(new TypeError())
  }
  resolveWithPromise(x) {
    x.then(
      (value) => {
        this.resolve(value)
      },
      (reason) => {
        this.reject(reason)
      }
    )
  }
  resolveWithObject(x){
      try {
        let then = x.then
        if (typeof then === 'function') {
          try {
            then.call(
              x,
              (y) => {
                this.resolve(y)
              },
              (r) => {
                this.reject(r)
              }
            )
          } catch (e) {
            this.reject(e)
          }
        } else {
          this.resolve(x)
        }
      } catch (e) {
        this.reject(e)
      }
  }
  resolveWith(x) {
    if (x === this) {
      this.resolveWithSelf()
    } else if (x instanceof FakePromise) {
      this.resolveWithPromise(x)
    } else if (x instanceof Object) {
      this.resolveWithObject(x)
    } else {
      this.resolve(x)
    }
  }
  private resolve(data) {
    this.resolveOrReject('fulfilled', 0, data)
  }
  reject(reason) {
    this.resolveOrReject('rejected', 1, reason)
  }
  then(success?, failure?) {
    const fns = []
    fns.push(typeof success === 'function' ? success : null)
    fns.push(typeof failure === 'function' ? failure : null)
    fns[2] = new FakePromise(() => {})
    this.callbacks.push(fns)
    return fns[2]
  }
  constructor(fn) {
    if (fn instanceof Function === false) {
      throw Error('the first parameter must be function!')
    }
    fn(this.resolve.bind(this), this.reject.bind(this))
  }
}

export default FakePromise

function nextTick(cb) {
  //@ts-ignore
  if (process && typeof process.nextTick === 'function') {
    //@ts-ignore
    return process.nextTick(cb)
  }

  let counter = 1
  const textNode = document.createTextNode(String(counter))
  const observer = new MutationObserver(cb)
  observer.observe(textNode, {
    characterData: true,
  })
  textNode.data = String(++counter)
}
