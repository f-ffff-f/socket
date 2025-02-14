import { useCallback, useRef, useState } from 'react'
import useIsomorphicLayoutEffect from '@/hooks/useIsomorphicLayoutEffect'
import useRequestWithUserAuth from '@/hooks/useRequestWithUserAuth'
import { SocketError } from '@/lib/error/SocketError'
import { subscribers } from '@/lib/subscribers'
import { RequestBase, ResponseBaseData } from '@/types'
import { getSocketConfig } from '@/config'

type TDeferredPromise<T> = {
  promise: Promise<T>
  resolve: (payload: T | PromiseLike<T>) => void
  reject: (reason?: any) => void
}

const makeDeferredPromise = <T>() => {
  const deferred = {} as TDeferredPromise<T>

  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve
    deferred.reject = reject
  })

  return deferred
}

const useAsyncSocket = <
  TResponse extends ResponseBaseData = ResponseBaseData, //
  TRequest extends RequestBase = RequestBase
>(
  trCode: number,
  handle?: string,
  isUsingSuspense = false
) => {
  const [{ response: cachedResponse, error: cachedError }, setCache] =
    useState<{
      response?: TResponse | undefined
      error?: SocketError | undefined
    }>({})
  const resetCache = useCallback(() => setCache({}), [])

  const [isLoading, setIsLoading] = useState(false)

  const requestFunctionWithUserAuth = useRequestWithUserAuth()

  const deferredRef = useRef<TDeferredPromise<TResponse> | null>(null)

  const apiRequest = useCallback(
    (payload?: TRequest) => {
      requestFunctionWithUserAuth({
        trCode,
        ...(payload ?? {}),
        ...(handle && { handle }),
      })
    },
    [requestFunctionWithUserAuth, handle, trCode]
  )

  const handleAsyncResponse = useCallback(
    (res: TResponse) => {
      if (isUsingSuspense) {
        getSocketConfig().removeSuspendedTrCode(trCode)
      }

      setCache(res)
      setIsLoading(false)

      if (res.response) {
        deferredRef.current?.resolve(res.response)
      }

      if (res.error) {
        deferredRef.current?.reject(res.error)
      }
    },
    [isUsingSuspense, trCode]
  )

  useIsomorphicLayoutEffect(() => {
    subscribers.set(handleAsyncResponse, [trCode, handle])

    return () => {
      subscribers.delete(handleAsyncResponse)
    }
  }, [])

  const asyncFetcher = useCallback(
    async (payload: TRequest) => {
      if (isUsingSuspense) {
        getSocketConfig().addSuspendedTrCode(trCode)
      }

      setIsLoading(true)
      apiRequest(payload)

      const deferred = makeDeferredPromise<TResponse>()
      deferredRef.current = deferred

      return deferred.promise
    },
    [apiRequest, isUsingSuspense, trCode]
  )

  return [
    asyncFetcher,
    cachedResponse,
    cachedError,
    resetCache,
    isLoading,
  ] as const
}

export default useAsyncSocket
