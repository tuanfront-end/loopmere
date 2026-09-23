import type { KeyboardEvent } from 'react';

/**
 * For a text field inside a panel: its keys stay in the field — typing "t" in
 * a note must not reach anything listening on the page — except Escape, which
 * closes the panel wherever focus is. Stopping every key used to swallow
 * Escape too, so a panel with focus in a field could not be closed from the
 * keyboard.
 */
export function keepKeys(event: KeyboardEvent) {
  if (event.key !== 'Escape') event.stopPropagation();
}
