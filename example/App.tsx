import React from 'react'
import { initSocketConfig, useInitSocket } from 'socket'
import TestAsyncSocket from './TestAsyncSocket'
import TestRealtimeSocket from './TestRealTimeSocket'

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
