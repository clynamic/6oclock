export const renderMessage = (
  template: string,
  fields: Record<string, unknown>,
): string =>
  template.replace(/\{([\w.]+)\}/g, (whole, path: string) => {
    const value = path
      .split('.')
      .reduce<unknown>(
        (item, key) =>
          typeof item === 'object' && item !== null
            ? (item as Record<string, unknown>)[key]
            : undefined,
        fields,
      );

    return value === undefined ? whole : renderValue(value);
  });

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
