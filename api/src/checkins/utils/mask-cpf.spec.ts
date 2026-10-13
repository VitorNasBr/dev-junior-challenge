import { maskCpf } from './mask-cpf';

describe('maskCpf', () => {
  it('hides the first three and the last two digits', () => {
    expect(maskCpf('11122233344')).toBe('***.222.333-**');
  });
});
