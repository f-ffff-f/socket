import { useCallback, useState } from 'react'
import { RequestBase, ResponseBaseData } from '@/types'
import useRequestWithUserAuth from './hooks/useRequestWithUserAuth'
import { subscribers } from './lib/subscribers'
import useIsomorphicLayoutEffect from '@/hooks/useIsomorphicLayoutEffect'
import useUpdate from '@/hooks/useUpdate'
import { RealTimeSocket } from './lib/RealTimeSocket'

type ResponseFromSocket<Response> = {
  response: Response
}
const getUpdatingProxy = <Target extends object>(
  target: Target,
  update: () => void
): Target =>
  new Proxy(target, {
    get(target: Target, p: string | symbol, receiver: any): any {
      return Reflect.get(target, p, receiver)
    },
    set(
      target: Target,
      p: string | symbol,
      value: any,
      receiver: any
    ): boolean {
      const res = Reflect.set(target, p, value, receiver)
      if (p === 'renderFlag') {
        update()
      }
      return res
    },
  })

export default function useRealTimeSocket<
  Response extends ResponseBaseData = ResponseBaseData, //
  Request extends RequestBase = RequestBase,
  Controller extends RealTimeSocket<Response> = RealTimeSocket<Response>
>(trCode: number, controller: Controller, handle?: string) {
  const update = useUpdate()
  const [controllerProxy] = useState<Controller>(() =>
    getUpdatingProxy(controller, update)
  )

  const injectResponse = useCallback(
    ({ response }: ResponseFromSocket<Response>) => {
      controllerProxy.onResponse(response)
    },
    [controllerProxy]
  )

  const requestFunctionWithUserAuth = useRequestWithUserAuth()

  const apiRequest = useCallback(
    (payload?: Request) => {
      requestFunctionWithUserAuth({
        trCode,
        ...(payload ?? {}),
        ...(handle && { handle }),
      })
    },
    [handle, requestFunctionWithUserAuth, trCode]
  )

  useIsomorphicLayoutEffect(() => {
    subscribers.set(injectResponse, [trCode, handle])

    return () => {
      subscribers.delete(injectResponse)
    }
  }, [injectResponse, trCode])

  return [controllerProxy, apiRequest] as const
}
