export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function maskEmail(address: string) {
  const [name, domain] = address.split("@");
  const shown = name.length <= 2 ? name : `${name.slice(0, 2)}***`;

  return `${shown}@${domain}`;
}
