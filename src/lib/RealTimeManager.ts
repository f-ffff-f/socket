import { ResponseBase, ResponseBaseHandler } from '@/types'

type RealTimeCodeRange = {
  START: number
  END: number
}

export class RealTimeManager {
  private isPending = false
  private pool: Array<ResponseBase> = []

  private realTimeCodeRangeList: RealTimeCodeRange[] = [
    {
      START: 800,
      END: 900,
    },
  ]

  private readonly action: ResponseBaseHandler

  private throttleType: 'animationFrame' | 'timeout' = 'animationFrame'

  private timeoutId = 0

  private frameId = 0

  constructor(action: ResponseBaseHandler) {
    this.action = action
    this.setup()
  }

  public isRealTime(code: number | string): boolean {
    if (typeof code === 'string') {
      code = Number(code)
    }

    for (const { START, END } of this.realTimeCodeRangeList) {
      if (code >= START && code < END) {
        return true
      }
    }

    return false
  }

  public actionWithThrottle(response: ResponseBase): void {
    // TODO separate actions into common interface

    if (this.throttleType === 'timeout') {
      this.actionWithTimeout(response)
    } else {
      this.actionWithAnimationFrame(response)
    }
  }

  private setup() {
    window.addEventListener('visibilitychange', () => {
      this.throttleType =
        document.visibilityState === 'hidden' ? 'timeout' : 'animationFrame'
      this.cleanupThrottling()
    })
  }

  private actionWithTimeout(response: ResponseBase) {
    this.storeResponseInPool(response)

    if (this.isPending) {
      return
    }

    this.isPending = true
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId)
    }

    this.timeoutId = window.setTimeout(() => {
      this.cleanupThrottling()
    }, 100)
  }

  private actionWithAnimationFrame(response: ResponseBase): void {
    this.storeResponseInPool(response)

    if (this.isPending) {
      return
    }

    this.isPending = true
    if (this.frameId) {
      cancelAnimationFrame(this.frameId)
    }

    this.frameId = requestAnimationFrame(() => {
      this.cleanupThrottling()
    })
  }

  private cleanupThrottling() {
    this.flushPool()
    this.isPending = false
  }

  private flushPool(): void {
    this.pool.forEach(val => this.action(val))
    this.pool = []
  }

  private storeResponseInPool(response: ResponseBase): void {
    /**
     * @todo pool의 length 제한에 대해 고민이 필요할 것 같아요. 버려진 data에 의해서 기능의 무결성에 영향이 있을 것 같습니다 !
     */
    if (this.pool.length > 50) this.pool.shift()

    this.pool.push(response)
  }
}
