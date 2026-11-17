import { collectGermanWords } from '../lib/quotedGerman'
import { CHALLENGES, INTERVIEWS, ITEMS } from './index'

/** Every word of the app's German content (lower case), used to recognise German quoted in Czech notes. */
export const GERMAN_WORDS: ReadonlySet<string> = collectGermanWords([ITEMS, INTERVIEWS, CHALLENGES])
