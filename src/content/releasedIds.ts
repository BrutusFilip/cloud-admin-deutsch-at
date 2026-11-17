import type { ItemId } from '../domain/types'

/**
 * Every item ID that has been released. Progress is stored per ID, so a
 * released ID keeps its meaning for good: never rename it and never reuse it.
 * To remove an item, delete it from the content and move its ID to
 * RETIRED_IDS. `npm test` fails when a released ID disappears without being
 * retired, and when a new item is missing here.
 */
export const RELEASED_IDS: readonly ItemId[] = [
  // E1 (2026-11-10): 44 items
  'intro-v-001', 'intro-v-002', 'intro-s-001',
  'identity-v-001', 'identity-v-002', 'identity-v-003', 'identity-s-001',
  'access-v-001', 'access-v-002', 'access-v-003', 'access-s-001',
  'm365-v-001', 'm365-v-002', 'm365-v-003', 'm365-s-001',
  'azure-v-001', 'azure-v-002', 'azure-v-003', 'azure-s-001',
  'windows-v-001', 'windows-v-002', 'windows-s-001',
  'network-v-001', 'network-v-002', 'network-v-003', 'network-s-001',
  'incidents-v-001', 'incidents-v-002', 'incidents-v-003', 'incidents-s-001',
  'powershell-v-001', 'powershell-v-002', 'powershell-s-001',
  'handover-v-001', 'handover-v-002', 'handover-s-001',
  'career-v-001', 'career-v-002', 'career-s-001',
  'austria-v-001', 'austria-v-002', 'austria-v-003', 'austria-v-004', 'austria-v-005',

  // E4 (2026-11-10): 91 items
  'intro-v-003', 'intro-s-002', 'intro-s-003', 'intro-v-004', 'intro-v-005', 'intro-s-004',
  'intro-g-001',
  'communication-s-001', 'communication-s-002', 'communication-s-003', 'communication-s-004',
  'communication-s-005', 'communication-s-006', 'communication-v-001', 'communication-v-002',
  'communication-v-003', 'communication-g-001', 'communication-g-002', 'communication-g-003',
  'communication-g-004', 'communication-v-004',
  'identity-v-004', 'identity-v-005', 'identity-v-006', 'identity-s-002', 'identity-s-003',
  'identity-g-001', 'identity-g-002',
  'access-v-004', 'access-v-005', 'access-v-006', 'access-v-007', 'access-s-002',
  'access-g-001', 'access-g-002', 'access-g-003',
  'm365-v-004', 'm365-s-002', 'm365-s-003', 'm365-g-001', 'm365-g-002', 'm365-g-003',
  'm365-g-004', 'm365-g-005',
  'azure-v-004', 'azure-v-005', 'azure-s-002', 'azure-g-001',
  'windows-v-003', 'windows-v-004', 'windows-s-002', 'windows-g-001', 'windows-g-002',
  'windows-g-003', 'windows-g-004', 'windows-v-005', 'windows-v-006',
  'network-v-004', 'network-v-005', 'network-v-006', 'network-s-002', 'network-g-001',
  'network-g-002',
  'incidents-v-004', 'incidents-v-005', 'incidents-v-006', 'incidents-s-002', 'incidents-s-003',
  'incidents-g-001', 'incidents-g-002', 'incidents-v-007', 'incidents-g-003',
  'powershell-v-003', 'powershell-s-002', 'powershell-g-001',
  'handover-v-003', 'handover-s-002', 'handover-g-001', 'handover-g-002', 'handover-g-003',
  'career-v-003', 'career-s-002', 'career-s-003', 'career-s-004', 'career-s-005', 'career-g-001',
  'austria-v-006', 'austria-v-007', 'austria-v-008', 'austria-v-009', 'austria-s-001',

  // Etapa 8 (2026-11-11): 15 items – clarifying a question, limits of experience, explaining a procedure; thin topics
  'communication-s-007', 'communication-v-005', 'communication-s-008', 'communication-s-009',
  'communication-v-006', 'communication-v-007', 'communication-s-010', 'communication-g-005',
  'communication-g-006',
  'azure-v-006', 'azure-g-002',
  'powershell-v-004', 'powershell-v-005', 'powershell-g-002',
  'handover-v-004',
]

/**
 * Every released interview question ID (`<topic>-i-<NNN>`). Self-assessments
 * are stored per question ID, so the same rules apply as for items.
 */
export const RELEASED_QUESTION_IDS: readonly string[] = [
  // E5 (2026-11-11): 14 questions in 4 interviews
  'intro-i-001', 'intro-i-002', 'intro-i-003',
  'access-i-001', 'access-i-002', 'identity-i-001', 'access-i-003',
  'network-i-001', 'network-i-002', 'incidents-i-001', 'handover-i-001',
  'powershell-i-001', 'powershell-i-002', 'powershell-i-003',
]
