import { useState, useEffect, useCallback } from 'react'
import { jogosService } from '../services/jogosService'
import { toast } from 'react-hot-toast'

export const useJogos = () => {
  const [jogos, setJogos] = useState([])
  const [loading, setLoading] = useState(true)

  // Carregar jogos
  const carregarJogos = useCallback(async (dataJogo = null) => {
    try {
      setLoading(true)
      const jogosCarregados = await jogosService.buscarJogos(dataJogo)
      setJogos(jogosCarregados)
    } catch (error) {
      console.error('Erro ao carregar jogos:', error)
      toast.error('Erro ao carregar jogos')
    } finally {
      setLoading(false)
    }
  }, [])

  // Adicionar jogo
  const adicionarJogo = useCallback(async (dadosJogo) => {
    try {
      const novoJogo = await jogosService.adicionarJogo(dadosJogo)
      await carregarJogos()
      toast.success('Jogo adicionado com sucesso!')
      return novoJogo
    } catch (error) {
      console.error('Erro ao adicionar jogo:', error)
      toast.error('Erro ao adicionar jogo')
      throw error
    }
  }, [carregarJogos])

  // Atualizar jogo
  const atualizarJogo = useCallback(async (id, dadosJogo) => {
    try {
      const jogoAtualizado = await jogosService.atualizarJogo(id, dadosJogo)
      await carregarJogos()
      toast.success('Jogo atualizado com sucesso!')
      return jogoAtualizado
    } catch (error) {
      console.error('Erro ao atualizar jogo:', error)
      toast.error('Erro ao atualizar jogo')
      throw error
    }
  }, [carregarJogos])

  // Remover jogo
  const removerJogo = useCallback(async (id) => {
    try {
      await jogosService.removerJogo(id)
      await carregarJogos()
      toast.success('Jogo removido com sucesso!')
    } catch (error) {
      console.error('Erro ao remover jogo:', error)
      toast.error('Erro ao remover jogo')
      throw error
    }
  }, [carregarJogos])

  // Buscar jogos por data
  const buscarJogosPorData = useCallback(async (data) => {
    await carregarJogos(data)
  }, [carregarJogos])

  // Limpar jogos expirados
  const limparJogosExpirados = useCallback(async () => {
    try {
      await jogosService.limparJogosExpirados()
      await carregarJogos()
      toast.success('Jogos expirados removidos')
    } catch (error) {
      console.error('Erro ao limpar jogos expirados:', error)
      toast.error('Erro ao limpar jogos expirados')
    }
  }, [carregarJogos])

  // Carregar jogos na inicialização
  useEffect(() => {
    carregarJogos()
  }, [carregarJogos])

  return {
    jogos,
    loading,
    adicionarJogo,
    atualizarJogo,
    removerJogo,
    carregarJogos,
    buscarJogosPorData,
    limparJogosExpirados
  }
}

