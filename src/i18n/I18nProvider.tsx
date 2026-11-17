import type { ReactNode } from 'react'
import { cs, type Messages } from './cs'
import { MessagesContext } from './index'

/** Interface language. Only Czech exists today; a German object of type Messages can be added later. */
export function I18nProvider({ messages = cs, children }: { messages?: Messages; children: ReactNode }) {
  return <MessagesContext.Provider value={messages}>{children}</MessagesContext.Provider>
}
