import React, { useState } from 'react'
import useAsyncSocket from '@/useAsyncSocket'

const TestAsyncSocket = () => {
  // trCode와 handle은 여기서 지정 (useAsyncSocket 내부에서 config로 자동 추가됨)
  const [fetchAsync, response, error, resetCache, isLoading] = useAsyncSocket(
    1001,
    'testHandle'
  )

  // 추가로 보낼 요청 페이로드 (예: 추가 데이터)
  const [payload, setPayload] = useState({ data: 'Hello, server!' })

  const handleSendRequest = async () => {
    try {
      // fetchAsync가 반환하는 Promise를 await하여 응답을 확인합니다.
      const res = await fetchAsync(payload)
      console.log('응답 수신:', res)
    } catch (err) {
      console.error('요청 에러:', err)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>useAsyncSocket 테스트</h1>
      <button onClick={handleSendRequest} disabled={isLoading}>
        {isLoading ? '요청 중...' : '요청 보내기'}
      </button>
      <div style={{ marginTop: 20 }}>
        <h2>응답</h2>
        <pre>{JSON.stringify(response, null, 2)}</pre>
      </div>
      <div style={{ marginTop: 20 }}>
        <h2>에러</h2>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    </div>
  )
}

export default TestAsyncSocket
