import React from 'react'
import { initSocketConfig } from '@/config'
import useInitSocket from '@/useInitSocket'
import TestAsyncSocket from './TestAsyncSocket'
import TestRealtimeSocket from './TestRealtimeSocket'

initSocketConfig({
  websocketHost: 'ws://localhost:8080',
  parallelTrCodes: [],
  errorCodes: [-100],
  getAccount: () => 'testAccount',
  getAuthToken: () => 'testToken',
  removeSuspendedTrCode: (trCode: number) => {
    console.log('removeSuspendedTrCode', trCode)
  },
  addSuspendedTrCode: (trCode: number) => {
    console.log('addSuspendedTrCode', trCode)
  },
  onError: (error: any) => console.error('Socket error', error),
})

const App = () => {
  useInitSocket()

  return (
    <div>
      <h1>Socket Library Test Frontend</h1>
      <p>
        Socket initialization triggered. Check the browser console for
        connection logs.
      </p>
      <TestAsyncSocket />
      <TestRealtimeSocket />
    </div>
  )
}

export default App
