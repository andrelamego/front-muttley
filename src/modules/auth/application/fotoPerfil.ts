import { useEffect, useState } from 'react'
import { getFotoPerfilApi } from '../api/authApi'
import { useAuth } from './useAuth'

// Uma foto por sessão, compartilhada por todos os avatares (cabeçalho, menu, perfil).
let cache: { pessoaId: string; url: string | null } | null = null
const ouvintes = new Set<(url: string | null) => void>()

const publicar = (pessoaId: string, url: string | null) => {
  if (cache?.url && cache.url !== url) URL.revokeObjectURL(cache.url)
  cache = { pessoaId, url }
  ouvintes.forEach((ouvir) => ouvir(url))
}

const carregar = async (pessoaId: string) => {
  try {
    const blob = await getFotoPerfilApi()
    publicar(pessoaId, blob ? URL.createObjectURL(blob) : null)
  } catch {
    // Sem foto o avatar mostra as iniciais; não vale interromper a tela por isso.
    publicar(pessoaId, null)
  }
}

/** Recarrega a foto depois de trocar ou remover. */
export const recarregarFotoPerfil = (pessoaId: string) => carregar(pessoaId)

/** URL da foto da pessoa logada, ou null para mostrar as iniciais. */
export const useFotoPerfil = (): string | null => {
  const { user } = useAuth()
  const [url, setUrl] = useState<string | null>(
    cache && cache.pessoaId === user?.id ? cache.url : null
  )

  useEffect(() => {
    ouvintes.add(setUrl)
    return () => {
      ouvintes.delete(setUrl)
    }
  }, [])

  useEffect(() => {
    if (!user) return
    if (user.temFoto === false) {
      if (cache?.pessoaId !== user.id || cache.url) publicar(user.id, null)
      return
    }
    if (cache?.pessoaId !== user.id) void carregar(user.id)
  }, [user])

  return user ? url : null
}

/**
 * Recorta o centro da imagem num quadrado de 320 px e devolve JPEG em base64 (sem o prefixo data:).
 * Fotos de celular passam de vários MB; assim o envio fica pequeno e o avatar, leve.
 */
export const prepararFotoPerfil = (arquivo: File): Promise<string> =>
  new Promise((resolver, rejeitar) => {
    const url = URL.createObjectURL(arquivo)
    const imagem = new Image()
    imagem.onload = () => {
      const lado = Math.min(imagem.naturalWidth, imagem.naturalHeight)
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 320
      const contexto = canvas.getContext('2d')
      if (!contexto)
        return rejeitar(new Error('Não foi possível ler a imagem.'))
      contexto.drawImage(
        imagem,
        (imagem.naturalWidth - lado) / 2,
        (imagem.naturalHeight - lado) / 2,
        lado,
        lado,
        0,
        0,
        320,
        320
      )
      URL.revokeObjectURL(url)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.86)
      resolver(dataUrl.slice(dataUrl.indexOf(',') + 1))
    }
    imagem.onerror = () => {
      URL.revokeObjectURL(url)
      rejeitar(
        new Error(
          'Esse arquivo não é uma imagem que o navegador consiga abrir.'
        )
      )
    }
    imagem.src = url
  })
