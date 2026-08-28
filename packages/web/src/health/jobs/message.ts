const ISO = /^\d{4}-\d{2}-\d{2}T[\d:.]+Z?$/;

export const renderValue = (value: unknown): string => {
  if (typeof value === 'string' && ISO.test(value)) {
    return value.endsWith('T00:00:00.000Z')
      ? value.slice(0, 10)
      : value.slice(0, 16).replace('T', ' ');
  }

  if (value instanceof Date) return renderValue(value.toISOString());

  if (typeof value === 'object' && value !== null) {
    return Object.values(value).map(renderValue).join('..');
  }

  return String(value);
};

export interface MessagePart {
  text: string;
  field?: string;
}

/**
 * Split a message template into its words and the values filled into it.
 *
 * The values arrive marked, so the sentence and the numbers in it can be told
 * apart when they are drawn.
 */
export const renderParts = (
  template: string,
  fields: Record<string, unknown>,
): MessagePart[] => {
  const parts: MessagePart[] = [];
  const pattern = /\{([\w.]+)\}/g;
  let index = 0;

  for (
    let match = pattern.exec(template);
    match;
    match = pattern.exec(template)
  ) {
    const path = match[1]!;
    const value = path
      .split('.')
      .reduce<unknown>(
        (item, key) =>
          typeof item === 'object' && item !== null
            ? (item as Record<string, unknown>)[key]
            : undefined,
        fields,
      );

    if (match.index > index) {
      parts.push({ text: template.slice(index, match.index) });
    }

    parts.push(
      value === undefined
        ? { text: match[0] }
        : { text: renderValue(value), field: path },
    );

    index = match.index + match[0].length;
  }

  if (index < template.length) parts.push({ text: template.slice(index) });

  return parts;
};
