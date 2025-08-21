import { supabase, isSupabaseConfigured } from '../lib/supabase'

// Chave para localStorage
const JOGOS_STORAGE_KEY = 'avisos-jogos-data'

// Serviço de jogos com fallback para localStorage
export const jogosService = {
  // Buscar todos os jogos
  async buscarJogos(dataJogo = null) {
    if (!isSupabaseConfigured()) {
      return this.buscarJogosLocal(dataJogo)
    }

    try {
      let query = supabase
        .from('jogos')
        .select('*')
        .order('data_jogo', { ascending: true })
        .order('inicio', { ascending: true })

      if (dataJogo) {
        query = query.eq('data_jogo', dataJogo)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar jogos:', error)
      return this.buscarJogosLocal(dataJogo)
    }
  },

  // Adicionar novo jogo
  async adicionarJogo(jogo) {
    if (!isSupabaseConfigured()) {
      return this.adicionarJogoLocal(jogo)
    }

    try {
      const { data, error } = await supabase
        .from('jogos')
        .insert([{
          nome: jogo.nome,
          data_jogo: jogo.data_jogo,
          inicio: jogo.inicio,
          fim: jogo.fim,
          user_id: (await supabase.auth.getUser()).data.user.id
        }])
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Erro ao adicionar jogo:', error)
      return this.adicionarJogoLocal(jogo)
    }
  },

  // Atualizar jogo
  async atualizarJogo(id, jogo) {
    if (!isSupabaseConfigured()) {
      return this.atualizarJogoLocal(id, jogo)
    }

    try {
      const { data, error } = await supabase
        .from('jogos')
        .update({
          nome: jogo.nome,
          data_jogo: jogo.data_jogo,
          inicio: jogo.inicio,
          fim: jogo.fim,
          user_id: (await supabase.auth.getUser()).data.user.id
        })
        .eq('id', id)
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Erro ao atualizar jogo:', error)
      return this.atualizarJogoLocal(id, jogo)
    }
  },

  // Remover jogo
  async removerJogo(id) {
    if (!isSupabaseConfigured()) {
      return this.removerJogoLocal(id)
    }

    try {
      const { error } = await supabase
        .from('jogos')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erro ao remover jogo:', error)
      return this.removerJogoLocal(id)
    }
  },

  // Métodos para localStorage (fallback)
  buscarJogosLocal(dataJogo = null) {
    try {
      const jogos = JSON.parse(localStorage.getItem(JOGOS_STORAGE_KEY) || '[]')
      
      // Filtrar por data se especificada
      if (dataJogo) {
        return jogos.filter(jogo => jogo.data_jogo === dataJogo)
      }
      
      // Ordenar por data e horário
      return jogos.sort((a, b) => {
        if (a.data_jogo !== b.data_jogo) {
          return new Date(a.data_jogo) - new Date(b.data_jogo)
        }
        return a.inicio.localeCompare(b.inicio)
      })
    } catch (error) {
      console.error('Erro ao buscar jogos locais:', error)
      return []
    }
  },

  adicionarJogoLocal(jogo) {
    try {
      const jogos = this.buscarJogosLocal()
      const novoJogo = {
        ...jogo,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      }
      
      jogos.push(novoJogo)
      localStorage.setItem(JOGOS_STORAGE_KEY, JSON.stringify(jogos))
      return novoJogo
    } catch (error) {
      console.error('Erro ao adicionar jogo local:', error)
      throw error
    }
  },

  atualizarJogoLocal(id, jogo) {
    try {
      const jogos = this.buscarJogosLocal()
      const index = jogos.findIndex(j => j.id === id)
      
      if (index === -1) {
        throw new Error('Jogo não encontrado')
      }
      
      jogos[index] = { ...jogos[index], ...jogo }
      localStorage.setItem(JOGOS_STORAGE_KEY, JSON.stringify(jogos))
      return jogos[index]
    } catch (error) {
      console.error('Erro ao atualizar jogo local:', error)
      throw error
    }
  },

  removerJogoLocal(id) {
    try {
      const jogos = this.buscarJogosLocal()
      const jogosAtualizados = jogos.filter(j => j.id !== id)
      localStorage.setItem(JOGOS_STORAGE_KEY, JSON.stringify(jogosAtualizados))
      return true
    } catch (error) {
      console.error('Erro ao remover jogo local:', error)
      throw error
    }
  },

  // Limpar jogos expirados (mais de 1 ano)
  async limparJogosExpirados() {
    const umAnoAtras = new Date()
    umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1)
    const dataLimite = umAnoAtras.toISOString().split('T')[0]

    if (!isSupabaseConfigured()) {
      // Limpar localStorage
      const jogos = this.buscarJogosLocal()
      const jogosValidos = jogos.filter(jogo => jogo.data_jogo >= dataLimite)
      localStorage.setItem(JOGOS_STORAGE_KEY, JSON.stringify(jogosValidos))
      return
    }

    try {
      await supabase
        .from('jogos')
        .delete()
        .lt('data_jogo', dataLimite)
    } catch (error) {
      console.error('Erro ao limpar jogos expirados:', error)
    }
  }
}

