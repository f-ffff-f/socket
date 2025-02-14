const WebSocket = require('ws')

const PORT = 8080
const wss = new WebSocket.Server({ port: PORT })

wss.on('connection', ws => {
  console.log('새로운 클라이언트가 연결되었습니다.')

  ws.on('message', message => {
    console.log('수신된 메시지:', message)
    try {
      // 클라이언트가 보낸 메시지를 JSON으로 파싱합니다.
      const request = JSON.parse(message)

      console.log(request)
      /**
       * request 객체 예시:
       * {
       *   trCode: 1001,       // 숫자형이 올 수 있음
       *   handle: 'testHandle',
       *   data: 'Hello, server!'
       * }
       *
       * Socket 설정에서 자동으로 trCode와 handle이 추가되므로,
       * 클라이언트에서 추가 정보(예: data)만 보낼 수 있습니다.
       */

      // 타입 정의에 맞춘 응답 생성 (ResponseBase)
      const response = {
        tr_code: request.tr_code ?? 'unknown',
        account: request.account ? request.account : 'testAccount',
        handle: request.handle ? request.handle : 'defaultHandle',
        // 추가 데이터 (여기서는 클라이언트가 보낸 data를 에코합니다)
        data: {
          echoed: request.data || 'no data',
        },
      }
      console.log(response)
      ws.send(JSON.stringify(response))
    } catch (err) {
      console.error('파싱 에러:', err)
      const errorResponse = {
        tr_code: 'error',
        account: '',
        handle: '',
        err_code: 'PARSE_ERROR',
        message: '잘못된 JSON 포맷',
      }
      ws.send(JSON.stringify(errorResponse))
    }
  })

  ws.on('close', () => {
    console.log('클라이언트 연결 종료')
  })

  ws.on('error', error => {
    console.error('웹소켓 에러:', error)
  })
})

console.log(`웹소켓 서버가 ws://localhost:${PORT} 에서 실행 중입니다.`)
