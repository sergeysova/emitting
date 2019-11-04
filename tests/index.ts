import { EventEmitter } from "../src"

type Events = {
  first: number
  second: { foo: number; baz: string }
  third: undefined
}

describe("subscribing", () => {
  test("do not emit immediately after subscription", () => {
    const ee = new EventEmitter<Events>()

    const fn = jest.fn()
    ee.on("first", fn)

    expect(fn).toBeCalledTimes(0)
  })

  test("emit triggers listener", () => {
    const ee = new EventEmitter<Events>()

    const fn = jest.fn()
    ee.on("first", fn)

    ee.emit("first", 100)

    expect(fn).toBeCalledTimes(1)
    expect(fn).toBeCalledWith(100)
  })

  test("double subscription emit once", () => {
    const ee = new EventEmitter<Events>()

    const fn = jest.fn()
    ee.on("first", fn)
    ee.on("first", fn)

    ee.emit("first", 100)

    expect(fn).toBeCalledTimes(1)
    expect(fn).toBeCalledWith(100)
  })

  test("two listeners emit each", () => {
    const ee = new EventEmitter<Events>()

    const a = jest.fn()
    const b = jest.fn()
    ee.on("first", a)
    ee.on("first", b)

    ee.emit("first", 100)

    expect(a).toBeCalledTimes(1)
    expect(a).toBeCalledWith(100)
    expect(b).toBeCalledTimes(1)
    expect(b).toBeCalledWith(100)
  })

  test("emit first don't emit second and third", () => {
    const ee = new EventEmitter<Events>()

    const first = jest.fn()
    const second = jest.fn()
    const third = jest.fn()
    ee.on("first", first)
    ee.on("second", second)
    ee.on("third", third)

    ee.emit("first", 100)

    expect(first).toBeCalledTimes(1)
    expect(first).toBeCalledWith(100)
    expect(second).toBeCalledTimes(0)
    expect(third).toBeCalledTimes(0)
  })

  test("emit different values to each listener", () => {
    const ee = new EventEmitter<Events>()

    const a = jest.fn()
    const b = jest.fn()
    ee.on("first", a)
    ee.on("first", b)

    ee.emit("first", 100)
    ee.emit("first", 200)
    ee.emit("first", 300)

    expect(a).toBeCalledTimes(3)
    expect(a).toBeCalledWith(100)
    expect(a).toBeCalledWith(200)
    expect(a).toBeCalledWith(300)
    expect(b).toBeCalledTimes(3)
    expect(b).toBeCalledWith(100)
    expect(b).toBeCalledWith(200)
    expect(b).toBeCalledWith(300)
  })

  describe("emitCallback", () => {
    test("should return function", () => {
      const ee = new EventEmitter<Events>()

      const callback = ee.emitCallback("first")

      expect(callback).toBeDefined()
      expect(typeof callback).toBe("function")
    })

    test("callback should emit event", () => {
      const ee = new EventEmitter<Events>()
      const listener = jest.fn()
      ee.on("third", listener)
      const callback = ee.emitCallback("third")

      callback(undefined)
      callback(undefined)

      expect(listener).toHaveBeenCalledTimes(2)
    })

    test("callback should emit with passed value as first argument", () => {
      const ee = new EventEmitter<Events>()
      const listener = jest.fn()
      const unsub = ee.on("first", listener)
      const callback = ee.emitCallback("first")

      callback(100)
      callback(200)
      unsub()
      callback(300)

      expect(listener).toHaveBeenCalledTimes(2)
      expect(listener).toHaveBeenCalledWith(100)
      expect(listener).toHaveBeenCalledWith(200)
    })
  })
})

describe("once", () => {
  test("emit listener just one if emit twice", () => {
    const ee = new EventEmitter<Events>()

    const a = jest.fn()
    const b = jest.fn()

    ee.once("first", a)
    ee.on("first", b)

    ee.emit("first", 100)
    ee.emit("first", 200)

    expect(a).toBeCalledTimes(1)
    expect(a).toBeCalledWith(100)

    expect(b).toBeCalledTimes(2)
    expect(b).toBeCalledWith(100)
    expect(b).toBeCalledWith(200)
  })

  test("do not emit listener after manual unsubscribe", () => {
    const ee = new EventEmitter<Events>()
    const a = jest.fn()
    const b = jest.fn()
    const unsubA = ee.once("first", a)
    const unsubB = ee.on("first", b)

    unsubA()
    ee.emit("first", 100)
    ee.emit("first", 200)
    unsubB()
    ee.emit("first", 300)

    expect(a).toBeCalledTimes(0)
    expect(b).toBeCalledTimes(2)
  })
})

describe("unsubscribing", () => {
  test("emit after unsubscribing do not emit", () => {
    const ee = new EventEmitter<Events>()

    const fn = jest.fn()
    const unsub = ee.on("first", fn)

    ee.emit("first", 100)
    unsub()
    ee.emit("first", 200)

    expect(fn).toBeCalledTimes(1)
    expect(fn).toBeCalledWith(100)
  })

  test("unsubscribing works personally for each listener", () => {
    const ee = new EventEmitter<Events>()

    const a = jest.fn()
    const unsubA = ee.on("first", a)
    const b = jest.fn()
    const unsubB = ee.on("first", b)

    ee.emit("first", 100)
    unsubA()
    ee.emit("first", 200)
    unsubB()
    ee.emit("first", 300)

    expect(a).toBeCalledTimes(1)
    expect(a).toBeCalledWith(100)
    expect(b).toBeCalledTimes(2)
    expect(b).toBeCalledWith(100)
    expect(b).toBeCalledWith(200)
  })

  test("unsubscribe all with one listener do not emit", () => {
    const ee = new EventEmitter<Events>()

    const a = jest.fn()
    ee.on("second", a)

    ee.emit("second", { foo: 1, baz: "a" })
    ee.off("second")
    ee.emit("second", { foo: 2, baz: "b" })

    expect(a).toBeCalledTimes(1)
    expect(a).toBeCalledWith({ foo: 1, baz: "a" })
  })

  test("unsubscribe after unsubscribe all do not fail", () => {
    const ee = new EventEmitter<Events>()

    const a = jest.fn()
    const unsub = ee.on("second", a)

    ee.off("second")
    ee.emit("second", { foo: 1, baz: "a" })
    unsub()
    ee.emit("second", { foo: 2, baz: "b" })

    expect(a).toBeCalledTimes(0)
  })

  test("unsubscribe all really remove all listeners", () => {
    const ee = new EventEmitter<Events>()

    const a = jest.fn()
    const b = jest.fn()
    const c = jest.fn()
    const d = jest.fn()
    ee.on("second", a)
    ee.on("second", b)
    ee.on("second", c)
    ee.on("second", d)

    ee.emit("second", { foo: 1, baz: "a" })
    ee.off("second")
    ee.emit("second", { foo: 2, baz: "b" })
    ee.emit("second", { foo: 3, baz: "c" })

    expect(a).toBeCalledTimes(1)
    expect(b).toBeCalledTimes(1)
    expect(c).toBeCalledTimes(1)
    expect(d).toBeCalledTimes(1)
  })
})

describe("promises", () => {
  describe("take", () => {
    test("should resolve on event", async () => {
      const ee = new EventEmitter<Events>()

      const promise = ee.take("first")
      ee.emit("first", 100)
      await promise
    })

    test("should resolve with payload of event", async () => {
      const ee = new EventEmitter<Events>()

      const promise1 = ee.take("first")
      ee.emit("first", 100)
      const result1 = await promise1

      const promise2 = ee.take("second")
      ee.emit("second", { foo: 1, baz: "a" })
      const result2 = await promise2

      expect(result1).toBe(100)
      expect(result2).toEqual({ foo: 1, baz: "a" })
    })
  })

  describe("takeTimeout", () => {
    test("should resolve on event", async () => {
      const ee = new EventEmitter<Events>()

      const promise = ee.takeTimeout("first", 200)
      ee.emit("first", 100)
      await promise
    })

    test("should resolve with payload of event", async () => {
      const ee = new EventEmitter<Events>()

      const promise1 = ee.takeTimeout("first", 200)
      ee.emit("first", 100)
      const result1 = await promise1

      const promise2 = ee.takeTimeout("second", 200)
      ee.emit("second", { foo: 1, baz: "a" })
      const result2 = await promise2

      expect(result1).toBe(100)
      expect(result2).toEqual({ foo: 1, baz: "a" })
    })

    test("should reject on on timeout with void", async () => {
      const ee = new EventEmitter<Events>()

      try {
        await ee.takeTimeout("first", 200)
      } catch (e) {
        expect(e).toBeUndefined()
      }
    })
  })

  describe("takeEither", () => {
    test("should resolve on success event with payload of success", async () => {
      const ee = new EventEmitter<Events>()

      const promise = ee.takeEither("first", "second")
      ee.emit("first", 100)
      const result = await promise

      expect(result).toBe(100)
    })

    test("should reject on failure event with payload", async () => {
      const ee = new EventEmitter<Events>()

      const promise = ee.takeEither("first", "second")
      ee.emit("second", { foo: 1, baz: "a" })

      try {
        await promise
      } catch (error) {
        expect(error).toEqual({ foo: 1, baz: "a" })
      }
    })
  })
})
