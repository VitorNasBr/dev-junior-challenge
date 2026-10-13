// Hides the first three and the last two digits: "11122233344" -> "***.222.333-**".
export function maskCpf(cpf: string): string {
  return `***.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-**`;
}
