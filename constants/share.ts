/**
 * The query parameter a shared mix travels in. Send this mix writes it, the
 * receiving panel reads it, and the analytics wrapper strips it before a page
 * view leaves — one name for all three, so a rename cannot quietly start
 * sending a listener's mix to the analytics.
 */
export const SHARE_PARAM = "share";
