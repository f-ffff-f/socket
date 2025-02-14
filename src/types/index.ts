export type ResponseBaseData = Record<string, any>

export type ResponseBase = {
  tr_code: string
  account: string
  err_code?: string
  handle: string
} & ResponseBaseData

export type RequestBase = Record<
  string,
  number | string | string[] | string[][] | number[][]
>

export type ResponseBaseHandler = (arg: ResponseBase) => void
