import { useCallback, useState } from 'react'

const useUpdate = () => {
  const [, setFlag] = useState(false)
  return useCallback(() => setFlag((flag) => !flag), [])
}

export default useUpdate
