import { toast } from './toastService'

/** Copia o texto e avisa por toast; sem permissão de área de transferência, explica o que fazer. */
export const copiarTexto = async (
  texto: string,
  mensagemSucesso: string
): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(texto)
    toast.success(mensagemSucesso)
    return true
  } catch {
    toast.error(
      'Não foi possível copiar. Selecione o texto e copie manualmente.'
    )
    return false
  }
}
