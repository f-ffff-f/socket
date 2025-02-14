import { ResponseBase } from '@/types'

export const preprocessingResponseCode = (payload: MessageEvent<any>) => {
  const res = JSON.parse(payload.data) as ResponseBase

  //서버에서 type을 잘못 내려주는 경우가 있어서 아래와 같이 전처리
  if (typeof res.err_code !== 'undefined') {
    res.err_code = String(res.err_code)
  }

  res.tr_code = String(res.tr_code)

  return res
}

export const isSocketReady = (socket: WebSocket | null): boolean => {
  if (!socket) {
    return false
  }

  if (socket.readyState !== socket.OPEN) {
    return false
  }

  return true
}
