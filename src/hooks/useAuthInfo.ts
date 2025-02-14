import { useEffect, useMemo, useRef } from 'react'
import { getSocketConfig } from '@/config'

const useAuthInfo = () => {
  const account = useMemo(() => getSocketConfig().getAccount(), [])
  const authToken = useMemo(() => getSocketConfig().getAuthToken(), [])
  const authInfo = useRef({
    account: '',
    dmlaldjqtdma: '',
  })
  useEffect(() => {
    authInfo.current.account = account
    authInfo.current.dmlaldjqtdma = authToken
  }, [account, authToken])

  return authInfo
}

export default useAuthInfo
