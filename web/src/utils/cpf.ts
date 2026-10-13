export const CPF_LENGTH = 11

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, CPF_LENGTH)
}

// Formats while the user types: "11122233344" -> "111.222.333-44"
export function formatCpf(value: string): string {
  return onlyDigits(value)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}
