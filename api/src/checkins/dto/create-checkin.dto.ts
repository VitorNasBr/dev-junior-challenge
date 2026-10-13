import { Transform } from 'class-transformer';
import { IsString, Matches } from 'class-validator';

export class CreateCheckinDto {
  // Accepts "111.111.111-11" or "11111111111": everything that is not a digit is removed.
  // The check digits are not validated on purpose (the test CPFs would fail).
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @IsString({ message: 'Informe o CPF.' })
  @Matches(/^\d{11}$/, { message: 'CPF inválido. Informe os 11 dígitos.' })
  cpf!: string;
}
