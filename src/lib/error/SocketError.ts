import { ResponseBase } from '@/types'
import { getIsError, logger } from './utils'

export class SocketError {
  constructor(
    public readonly errorCode: number, //
    public readonly response: ResponseBase,
    private readonly onAlert: (errorCode: number) => void
  ) {}

  static getInstance(response: SocketError['response'], onAlert: SocketError['onAlert']): SocketError | undefined {
    const errorCode = typeof response.err_code !== 'undefined' ? Number(response.err_code) : -1
    const isError = getIsError(errorCode)
    logger(response, isError)
    return isError ? new SocketError(errorCode, response, onAlert) : undefined
  }

  isCode(errorCode: number) {
    return this.errorCode === errorCode
  }

  alert() {
    this.onAlert(this.errorCode)
  }
}
