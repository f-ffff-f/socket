import React, { useEffect, useState } from 'react'
import useRealTimeSocket from '@/useRealTimeSocket'
import { ResponseBaseData } from '@/types'
import { RealTimeSocket } from '@/lib/RealTimeSocket'

class Controller extends RealTimeSocket<ResponseBaseData> {
  onResponse(response: ResponseBaseData) {
    this.notifyToSubscribers(response)
    console.log('응답 수신:', response)
  }
}

const TestRealtimeSocket = () => {
  // trCode와 handle은 여기서 지정 (useAsyncSocket 내부에서 config로 자동 추가됨)
  const [controller, request] = useRealTimeSocket(
    801,
    new Controller(),
    'testRealTimeHandle'
  )

  // 추가로 보낼 요청 페이로드 (예: 추가 데이터)
  const [payload, setPayload] = useState({ data: 'Hello, server!' })
  const [response, setResponse] = useState<ResponseBaseData | null>(null)

  const handleSendRequest = async () => {
    try {
      request(payload)
    } catch (err) {
      console.error('요청 에러:', err)
    }
  }

  useEffect(() => {
    controller.subscribe(response => {
      setResponse(response)
    })

    return () => {
      controller.unsubscribe(response => {
        setResponse(null)
      })
    }
  }, [controller])

  return (
    <div style={{ padding: 20 }}>
      <h1>useRealTimeSocket 테스트</h1>
      <button onClick={handleSendRequest}>요청 보내기</button>
      <div style={{ marginTop: 20 }}>
        <h2>응답</h2>
        {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
      </div>
    </div>
  )
}

export default TestRealtimeSocket
