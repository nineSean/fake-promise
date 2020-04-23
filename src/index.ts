class FakePromise {
  state = 'pending'
  private queue = []
  private resolve(data) {
    if (this.state !== 'pending') return
    this.state = 'fulfilled'
    nextTick(() => {
      this.queue.forEach(([handler])=>{
        typeof handler === 'function' && handler(data)
      })
    })
  }
  private reject(reason) {
    if (this.state !== 'pending') return
    this.state = 'rejected'
    nextTick(() => {
      this.queue.forEach(([,handler])=>{
        typeof handler === 'function' && handler(reason)
      })
    })
  }
  then(success?, failure?) {
    const fns = []
    fns.push(typeof success === 'function' ? success : null)
    fns.push(typeof failure === 'function' ? failure : null)
    this.queue.push(fns)
    return this
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
  const div = document.createElement('div')
  div.innerText = '1'
  const observer = new MutationObserver(cb)
  observer.observe(div)
  div.innerText = '2'
}
