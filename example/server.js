const WebSocket = require('ws')

const PORT = 8080
const wss = new WebSocket.Server({ port: PORT })

wss.on('connection', ws => {
  console.log('새로운 클라이언트가 연결되었습니다.')

  // testRealTime용 interval ID를 저장할 변수
  let testRealTimeInterval = null

  ws.on('message', message => {
    console.log('수신된 메시지:', message)
    try {
      // 클라이언트가 보낸 메시지를 JSON으로 파싱
      const request = JSON.parse(message)

      /**
       * request 객체 예시:
       * {
       *   trCode: 1001,       // 숫자형이 올 수 있음
       *   handle: 'testHandle',
       *   data: 'Hello, server!'
       * }
       *
       * Socket 설정에서 자동으로 trCode와 handle이 추가되므로,
       * 클라이언트에서는 추가 정보(예: data)만 보냅니다.
       */

      // 응답 객체 생성 (ResponseBase 형태)
      const response = {
        tr_code: request.tr_code ?? 'unknown',
        account: request.account ? request.account : 'testAccount',
        handle: request.handle ? request.handle : 'defaultHandle',
        data: {
          echoed: request.data || 'no data',
        },
      }

      if (request.handle === 'testRealTimeHandle') {
        // 이미 interval이 실행 중이라면 먼저 해제
        if (testRealTimeInterval) {
          clearInterval(testRealTimeInterval)
        }
        let count = 0
        // 1초마다 응답 전송
        testRealTimeInterval = setInterval(() => {
          ws.send(JSON.stringify({ ...response, count: count++ }))
        }, 1000)
      } else {
        // 그 외의 경우 단 한 번 응답 전송
        ws.send(JSON.stringify(response))
      }
    } catch (err) {
      console.error('파싱 에러:', err)
      const errorResponse = {
        tr_code: request.tr_code ?? 'unknown',
        account: request.account ? request.account : 'testAccount',
        handle: request.handle ? request.handle : 'defaultHandle',
        err_code: -100,
        message: '잘못된 JSON 포맷',
      }
      ws.send(JSON.stringify(errorResponse))
    }
  })

  ws.on('close', () => {
    // 연결 종료 시 testRealTime interval이 있으면 해제
    if (testRealTimeInterval) {
      clearInterval(testRealTimeInterval)
    }
    console.log('클라이언트 연결 종료')
  })

  ws.on('error', error => {
    console.error('웹소켓 에러:', error)
  })
})

console.log(`웹소켓 서버가 ws://localhost:${PORT} 에서 실행 중입니다.`)
