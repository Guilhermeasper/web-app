export function capitalizeFirstCharacter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function stripTimeFromIsoDateTimeString(isoDateTime: string) {
  return isoDateTime.slice(0, 10);
}

export function formatArrayAsCommaSeparatedString(array: string[]) {
  const formatter = new Intl.ListFormat('pt-br', {
    style: 'long',
    type: 'conjunction',
  });

  return formatter.format(array);
}
