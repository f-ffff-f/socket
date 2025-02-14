import { Dispatch } from 'react'

export const subscribers: Map<Dispatch<any>, [number, string | undefined]> = new Map()
