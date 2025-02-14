import { useCallback, useState } from 'react'
import { ResponseBase } from '@/types'
import { SocketError } from '../lib/error/SocketError'
import useIsomorphicLayoutEffect from '@/hooks/useIsomorphicLayoutEffect'
import { subscribers } from '../lib/subscribers'

export const useSubscribe = (
  trCode: number,
  handle?: string,
  onResponse?: () => void
) => {
  const [{ response, error }, setState] = useState<{
    response?: ResponseBase | undefined
    error?: SocketError | undefined
  }>({})

  useIsomorphicLayoutEffect(() => {
    subscribers.set(
      res => {
        if (onResponse) onResponse()

        setState(res)
      },
      [trCode, handle]
    )

    return () => {
      subscribers.delete(setState)
    }
  }, [])

  const onReset = useCallback(() => {
    setState({})
  }, [])

  return {
    response,
    error,
    onReset,
  }
}
