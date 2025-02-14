import useAuthInfo from './useAuthInfo'
import { useCallback } from 'react'

type RequestFunction = (data: Record<string, any>) => void

let requestFunction: RequestFunction

export const setRequestFunction = (func: RequestFunction) => (requestFunction = func)

type Params = {
  trCode: number
  handle?: string | undefined
}

const useRequestWithUserAuth = () => {
  const authInfo = useAuthInfo()

  return useCallback(
    ({ trCode, handle, ...rest }: Params) => {
      requestFunction({
        ...authInfo.current,
        tr_code: trCode.toString(),
        ...(handle && { handle }),
        ...rest,
      })
    },
    [authInfo]
  )
}

export default useRequestWithUserAuth
