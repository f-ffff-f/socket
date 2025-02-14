import useIsomorphicLayoutEffect from '@/hooks/useIsomorphicLayoutEffect'
import { SocketError } from './lib/error/SocketError'
import { SocketClient } from './lib/SocketClient'
import { subscribers } from './lib/subscribers'
import { setRequestFunction } from './hooks/useRequestWithUserAuth'
import { useCallback } from 'react'
import { ResponseBase, ResponseBaseHandler } from '@/types'
import { getSocketConfig } from '@/config'

const useInitSocket = () => {
  const makeErrorAlert = useCallback((errorCode: number) => {
    getSocketConfig().onError(errorCode)
  }, [])

  useIsomorphicLayoutEffect(() => {
    const handleMessage: ResponseBaseHandler = res => {
      const response = res as ResponseBase
      const { tr_code, handle } = response
      const trCode = Number(tr_code)
      const error = SocketError.getInstance(response, makeErrorAlert)
      const payload = error ? { error } : { response }

      for (const [_setResponse, [storedTrCode, storedHandle]] of subscribers) {
        const setResponse = () => _setResponse(payload)
        if (trCode !== storedTrCode) {
          continue
        }
        if (typeof storedHandle !== 'undefined' && handle !== storedHandle) {
          continue
        }
        setResponse()
      }
    }

    const socket = new SocketClient({
      onMessage: handleMessage,
    })

    setRequestFunction(socket.enqueueMessage.bind(socket))

    return () => {
      subscribers.clear()
    }
  }, [])
}

export default useInitSocket
