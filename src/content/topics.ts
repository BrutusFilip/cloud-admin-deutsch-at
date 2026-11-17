import type { Topic } from '../domain/types'

/**
 * Order = study path. New cards are offered topic by topic in this order.
 * Topic IDs are stable; the order may change without affecting progress.
 */
export const TOPICS: Topic[] = [
  { id: 'intro', order: 1, titleCz: 'Představení a přechod do cloudu', titleDe: 'Vorstellung & Wechsel in die Cloud' },
  { id: 'communication', order: 2, titleCz: 'Komunikace a reakce v rozhovoru', titleDe: 'Kommunikation & Gesprächsführung' },
  { id: 'identity', order: 3, titleCz: 'Identity v AD a Entra ID', titleDe: 'Identitäten: AD & Entra ID' },
  { id: 'access', order: 4, titleCz: 'MFA a přístupová práva', titleDe: 'MFA & Zugriffsrechte' },
  { id: 'm365', order: 5, titleCz: 'Správa Microsoft 365', titleDe: 'Microsoft-365-Administration' },
  { id: 'azure', order: 6, titleCz: 'Správa Azure', titleDe: 'Azure-Administration' },
  { id: 'windows', order: 7, titleCz: 'Windows a koncová zařízení', titleDe: 'Windows & Endgeräte' },
  { id: 'network', order: 8, titleCz: 'Sítě a VPN', titleDe: 'Netzwerk & VPN' },
  { id: 'incidents', order: 9, titleCz: 'Incidenty a eskalace', titleDe: 'Incident-Management & Eskalation' },
  { id: 'powershell', order: 10, titleCz: 'Automatizace v PowerShellu', titleDe: 'PowerShell & Automatisierung' },
  { id: 'handover', order: 11, titleCz: 'Dokumentace a předání', titleDe: 'Dokumentation & Übergabe' },
  { id: 'career', order: 12, titleCz: 'Náplň, motivace, dostupnost, plat', titleDe: 'Aufgaben, Motivation, Verfügbarkeit, Gehalt' },
  { id: 'austria', order: 13, titleCz: 'Rakouský pracovní kontext', titleDe: 'Arbeitswelt Österreich' },
]
