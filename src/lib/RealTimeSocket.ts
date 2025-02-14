import { ResponseBaseData } from '@/types'

export abstract class RealTimeSocket<Response extends ResponseBaseData = ResponseBaseData> {
  //region 컴포넌트 렌더링 관련
  private renderFlag = false

  protected render() {
    this.renderFlag = !this.renderFlag
  }
  //endregion

  //region 콜백 실행 관련
  private subscribers = new Set<(res: Response) => void>()

  public subscribe(func: (res: Response) => void): void {
    this.subscribers.add(func)
  }

  public unsubscribe(func: (res: Response) => void): void {
    if (this.subscribers.has(func)) {
      this.subscribers.delete(func)
    }
  }

  protected notifyToSubscribers(res: Response): void {
    for (const subscriber of this.subscribers) {
      subscriber(res)
    }
  }
  //endregion

  abstract onResponse(res: Response): void
}
