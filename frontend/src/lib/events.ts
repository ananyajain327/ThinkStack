/** Cross-component notification for unread-count changes without a global store. */
export const NOTIFICATIONS_CHANGED = 'thinkstack:notifications-changed'

export function notifyNotificationsChanged() {
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED))
}
