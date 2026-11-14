export const PUBLIC_EVENTS_PATH = '/eventos'
export const PARTICIPANT_EVENTS_PATH = '/user/eventos'

export const buildEventPath = (routeBase: string, eventId: string | number) =>
  `${routeBase}/${eventId}`

export const buildPresencePath = (
  routeBase: string,
  eventId: string | number
) => `${buildEventPath(routeBase, eventId)}/confirmar-presenca`
