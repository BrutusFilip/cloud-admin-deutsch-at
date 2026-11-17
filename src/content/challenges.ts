import type { ChallengeCase } from '../domain/types'

/**
 * "Incident za 5 kroků": short fictitious cases, five auto-checked steps each,
 * from clarifying the problem to the handover. Steps refer to existing items,
 * so they are also practised in normal lessons.
 */
export const CHALLENGES: ChallengeCase[] = [
  {
    id: 'vpn-homeoffice',
    level: 'B2',
    titleCz: 'VPN na home office',
    titleDe: 'VPN im Homeoffice',
    situationDe:
      'Montag, 8:15 Uhr. Eine Mitarbeiterin aus dem Vertrieb meldet: „Das VPN geht nicht.“ Sie arbeitet heute im Homeoffice und hat um 9 Uhr einen Kundentermin.',
    situationCz:
      'Pondělí, 8:15. Zaměstnankyně z obchodního oddělení hlásí: „VPN nejde.“ Dnes pracuje z domova a v 9 hodin má schůzku se zákazníkem.',
    steps: [
      { item: 'communication-g-001', stageCz: 'Upřesnění problému' },
      { item: 'incidents-g-001', stageCz: 'Rozsah dopadu' },
      { item: 'network-g-001', stageCz: 'Příčina' },
      { item: 'network-g-002', stageCz: 'Komunikace s uživatelkou' },
      { item: 'handover-g-001', stageCz: 'Předání' },
    ],
  },
  {
    id: 'mfa-new-phone',
    level: 'B2',
    titleCz: 'Nový telefon a MFA',
    titleDe: 'Neues Diensthandy und MFA',
    situationDe:
      'Ein Kollege aus der Buchhaltung ruft an: Er hat ein neues Diensthandy und kann sich nicht mehr anmelden. Die Authenticator-App ist noch auf dem alten Gerät eingerichtet.',
    situationCz:
      'Volá kolega z účetního oddělení: má nový služební telefon a nemůže se přihlásit. Aplikace Authenticator je stále nastavená na starém zařízení.',
    steps: [
      { item: 'identity-g-001', stageCz: 'Upřesnění problému' },
      { item: 'identity-g-002', stageCz: 'Ověření totožnosti' },
      { item: 'access-g-001', stageCz: 'Diagnostika' },
      { item: 'access-g-002', stageCz: 'Řešení' },
      { item: 'handover-g-002', stageCz: 'Záznam do ticketu' },
    ],
  },
  {
    id: 'mailbox-external',
    level: 'B2',
    titleCz: 'Schránka bez externích e-mailů',
    titleDe: 'Postfach ohne externe E-Mails',
    situationDe:
      'Das freigegebene Postfach des Kundenservice erhält seit gestern Abend keine E-Mails von externen Absendern. Interne E-Mails kommen an.',
    situationCz:
      'Sdílená schránka zákaznického servisu od včerejšího večera nedostává e-maily od externích odesílatelů. Interní e-maily přicházejí.',
    steps: [
      { item: 'm365-g-001', stageCz: 'Upřesnění problému' },
      { item: 'm365-g-002', stageCz: 'Rozsah dopadu' },
      { item: 'm365-g-003', stageCz: 'Diagnostika' },
      { item: 'communication-g-002', stageCz: 'Komunikace s týmem' },
      { item: 'm365-g-004', stageCz: 'Předání' },
    ],
  },
]
