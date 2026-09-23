import merge from 'deepmerge';

/**
 * The merge every persisted store hydrates with: what was stored lands over
 * the defaults, and a stored array *replaces* the default rather than being
 * appended to it.
 *
 * deepmerge concatenates arrays unless told otherwise, which is harmless
 * exactly once — hydrating onto an empty default. A second `rehydrate()`
 * appended every stored list to itself. Strict Mode runs the effect that calls
 * it twice in development, so each load doubled the presets and the
 * checklist in memory, React saw two children with one key, and the next
 * write saved the double.
 */
export function mergePersisted<T>(persisted: unknown, current: T): T {
  return merge(current as Partial<T>, (persisted ?? {}) as Partial<T>, {
    arrayMerge: (_, stored) => stored,
  }) as T;
}

/**
 * The first of each id, in order. The repair for a list that doubling wrote
 * back: every action on those lists matches on the id, so the copies are
 * identical and keeping the first loses nothing.
 */
export function uniqueById<T extends { id: string }>(items: Array<T>): Array<T> {
  const seen = new Set<string>();

  return items.filter(item => {
    if (seen.has(item.id)) return false;

    seen.add(item.id);

    return true;
  });
}
