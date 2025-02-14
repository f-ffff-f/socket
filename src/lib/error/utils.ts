import { ResponseBase } from '@/types'
import { getSocketConfig } from '@/config'

export const getIsError = (errorCode: number) => {
  // 일부 TR의 경우 err code가 존재 하지 않아, -1도 정상 응답 case에 추가
  const successCodeList = [0, 1, 10, 30, 32, 10010, -1]

  const isSuccess = successCodeList.includes(errorCode)

  if (isSuccess) {
    return false
  }

  return getSocketConfig().errorCodes.includes(errorCode as any)
}

export const logger = (response: ResponseBase, isError: boolean) => {
  const formattedHandle = response.handle ? `"${response.handle}"` : ''

  if (isError) {
    console.groupCollapsed(
      `%c failure ${response.tr_code} | ${formattedHandle}`,
      'background-color: red; padding: 2.5px 10px 2.5px 5px; color: #efefef; border-radius: 5px; text-transform: uppercase;'
    )
    console.table(response)
    console.groupEnd()
  } else {
    console.groupCollapsed(
      `%c success ${response.tr_code} | ${formattedHandle}`,
      'background-color: green; padding: 2.5px 10px 2.5px 5px; color: #efefef; border-radius: 5px; text-transform: uppercase;'
    )
    console.table(response)
    console.groupEnd()
  }
}
