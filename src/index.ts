type Unsubscribe = () => void

type Listener<V> = (value: V) => void

export interface PublicEmitter<
  Events,
  Key extends keyof Events = keyof Events
> {
  on<K extends Key = Key>(event: K, listener: Listener<Events[K]>): Unsubscribe

  once<K extends Key>(event: K, listener: Listener<Events[K]>): Unsubscribe

  take<K extends Key>(event: K): Promise<Events[K]>

  takeTimeout<K extends Key>(event: K, timeout: number): Promise<Events[K]>

  takeEither<Success extends Key, Failure extends Key>(
    success: Success,
    failure: Failure,
  ): Promise<Events[Success]>
}

export interface PrivateEmitter<
  Events,
  Key extends keyof Events = keyof Events
> extends PublicEmitter<Events, Key> {
  emit<K extends Key = Key>(event: K, value: Events[K]): void
  off(event: Key): void
}

export class EventEmitter<Events, Key extends keyof Events = keyof Events> {
  private listeners: Map<Key, Set<Listener<Events[Key]>>> = new Map()

  /**
   * Subscribes listener to specified event.
   * @return Function that unsubscribe listener from the specified event
   * @example
   * function() {
   *   const unsubscribe = events.on("connected", () => {
   *     console.log("event connected received")
   *   })
   *   unsubscribe() // listener for connected won't be called anymore
   * }
   */
  public on<K extends Key = Key>(
    event: K,
    listener: Listener<Events[K]>,
  ): Unsubscribe {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    const found = this.listeners.get(event)
    if (found) {
      found.add(listener as Listener<Events[Key]>)
    }

    return () => {
      const exists = this.listeners.get(event)
      if (exists) {
        exists.delete(listener as Listener<Events[Key]>)
      }
    }
  }

  /**
   * Subscribes to event, and when it received immediately unsubscribe.
   * Unsubscribe function can be called at any time.
   * @example
   * const unsubscribe = events.once("newMessage", (message) => {
   *   console.log(message)
   * })
   * setTimeout(() => unsubscribe(), 300) // unsubscribe from event after 300 ms
   */
  public once<K extends Key>(
    event: K,
    listener: Listener<Events[K]>,
  ): Unsubscribe {
    const unsubscribe = this.on(event, (value) => {
      listener(value)
      unsubscribe()
    })
    return unsubscribe
  }

  /**
   * Creates promise that resolves when specified event is received.
   * @returns Promise resolved with payload of the event
   * @example
   * async function() {
   *   const message = await events.take("messageReceived")
   * }
   */
  public take<K extends Key>(event: K): Promise<Events[K]> {
    const { promise, resolve } = createDeferred<Events[K]>()
    this.once(event, resolve)
    return promise
  }

  /**
   * Creates a promise that resolves when specified event is received.
   * Promise is rejected when timeout is reached.
   * @param timeout milliseconds
   * @returns Promise resolves with payload of the received event.
   * @example
   * async function() {
   *   try {
   *     const message = await events.takeTimeout("messageReceived", 300);
   *   } catch () {
   *     console.log("Timeout reached.");
   *   }
   * }
   */
  public takeTimeout<K extends Key>(
    event: K,
    timeout: number,
  ): Promise<Events[K]> {
    const { promise, resolve, reject } = createDeferred<Events[K]>()

    const id = setTimeout(() => {
      unsubscribe()
      reject(undefined)
    }, timeout)

    const unsubscribe = this.once(event, (value) => {
      clearTimeout(id)
      resolve(value)
    })

    return promise
  }

  /**
   * Creates promise that resolves when left event is received with payload of the event.
   * Promise rejects when right event is received with payload of the event.
   * @example
   * async function() {
   *   try {
   *     const auth = await events.takeEither("authSuccess", "authFailure");
   *   } catch (authError) {
   *     console.error(authError);
   *   }
   * }
   */
  public takeEither<Success extends Key, Failure extends Key>(
    success: Success,
    failure: Failure,
  ): Promise<Events[Success]> {
    return new Promise((resolve, reject) => {
      const unsubscribeSuccess = this.once(success, (result) => {
        unsubscribeFailure()
        resolve(result)
      })
      const unsubscribeFailure = this.once(failure, (error) => {
        unsubscribeSuccess()
        reject(error)
      })
    })
  }

  /**
   * Emit all listeners with payload.
   * @value Payload for event that passed to all listeners
   */
  public emit<K extends Key = Key>(event: K, value: Events[K]): void {
    const listeners = this.listeners.get(event)

    if (listeners) {
      listeners.forEach((fn) => fn(value))
    }
  }

  public emitCallback<K extends Key = Key>(
    event: K,
  ): (value: Events[K]) => void {
    return (value) => this.emit(event, value)
  }

  /**
   * Removes all listeners for the given event.
   * @example
   * async function() {
   *   const promise = events.take("notificationReceived")
   *   events.off("notificationReceived")
   *   await promise // promise never resolves
   * }
   */
  public off(event: Key): void {
    this.listeners.delete(event)
  }
}

type Deferred<T, E> = {
  resolve: (value: T) => void
  reject: (error: E) => void
  promise: Promise<T>
}

function createDeferred<T, E = void>(): Deferred<T, E> {
  let resolve = () => {}
  let reject = () => {}
  const promise: Promise<T> = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { resolve, reject, promise }
}
