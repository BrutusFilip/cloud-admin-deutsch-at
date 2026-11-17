import { createContext, useContext } from 'react'
import { cs, type Messages } from './cs'

export const MessagesContext = createContext<Messages>(cs)

export function useMessages(): Messages {
  return useContext(MessagesContext)
}
