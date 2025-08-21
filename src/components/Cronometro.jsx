import { useState, useEffect, useCallback } from 'react'
import { Play, Pause, RotateCcw, Timer, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Cronometro = ({ jogos }) => {
  const [jogoAtualIndex, setJogoAtualIndex] = useState(0)
  const [tempoRestanteSegundos, setTempoRestanteSegundos] = useState(0)
  const [statusCronometro, setStatusCronometro] = useState('parado') // 'parado', 'rodando', 'pausado'

  // Converter timestamp HH:MM:SS para segundos
  const timestampParaSegundos = (timestamp) => {
    const [horas, minutos, segundos] = timestamp.split(':').map(Number)
    return horas * 3600 + minutos * 60 + segundos
  }

  // Converter segundos para timestamp HH:MM:SS
  const segundosParaTimestamp = (segundos) => {
    const horas = Math.floor(segundos / 3600)
    const minutos = Math.floor((segundos % 3600) / 60)
    const segs = segundos % 60
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`
  }

  // Calcular duração entre dois timestamps
  const calcularDuracao = (inicio, fim) => {
    const inicioSeg = timestampParaSegundos(inicio)
    const fimSeg = timestampParaSegundos(fim)
    return fimSeg - inicioSeg
  }

  // Filtrar e ordenar jogos de hoje
  const jogosDeHoje = useCallback(() => {
    const hoje = new Date().toISOString().split('T')[0]
    return jogos
      .filter(jogo => jogo.data_jogo === hoje)
      .sort((a, b) => timestampParaSegundos(a.inicio) - timestampParaSegundos(b.inicio))
  }, [jogos])

  // Inicializar ou atualizar o cronômetro com base no jogo atual
  useEffect(() => {
    const jogosOrdenados = jogosDeHoje()
    if (jogosOrdenados.length > 0) {
      const jogo = jogosOrdenados[jogoAtualIndex]
      if (jogo) {
        const duracao = calcularDuracao(jogo.inicio, jogo.fim)
        setTempoRestanteSegundos(duracao)
        setStatusCronometro('parado') // Começa parado, esperando o usuário iniciar
      }
    } else {
      setTempoRestanteSegundos(0)
      setStatusCronometro('parado')
    }
  }, [jogoAtualIndex, jogosDeHoje])

  // Lógica do cronômetro regressivo
  useEffect(() => {
    let interval
    if (statusCronometro === 'rodando' && tempoRestanteSegundos > 0) {
      interval = setInterval(() => {
        setTempoRestanteSegundos(prev => {
          if (prev <= 1) {
            // Jogo atual terminou, avança para o próximo
            clearInterval(interval)
            const jogosOrdenados = jogosDeHoje()
            if (jogoAtualIndex < jogosOrdenados.length - 1) {
              setJogoAtualIndex(prevIndex => prevIndex + 1)
              setStatusCronometro('rodando') // Inicia o próximo automaticamente
            } else {
              setStatusCronometro('parado') // Todos os jogos terminaram
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (tempoRestanteSegundos === 0 && statusCronometro === 'rodando') {
      // Garante que o cronômetro pare se o tempo chegar a zero sem um próximo jogo
      setStatusCronometro('parado')
    }

    return () => clearInterval(interval)
  }, [statusCronometro, tempoRestanteSegundos, jogoAtualIndex, jogosDeHoje])

  const iniciarPausar = () => {
    setStatusCronometro(prevStatus => (prevStatus === 'rodando' ? 'pausado' : 'rodando'))
  }

  const reiniciar = () => {
    const jogosOrdenados = jogosDeHoje()
    if (jogosOrdenados.length > 0) {
      const jogo = jogosOrdenados[jogoAtualIndex]
      if (jogo) {
        setTempoRestanteSegundos(calcularDuracao(jogo.inicio, jogo.fim))
        setStatusCronometro('parado')
      }
    }
  }

  const pularJogo = () => {
    const jogosOrdenados = jogosDeHoje()
    if (jogoAtualIndex < jogosOrdenados.length - 1) {
      setJogoAtualIndex(prevIndex => prevIndex + 1)
      setStatusCronometro('rodando') // Inicia o próximo automaticamente
    } else {
      setStatusCronometro('parado')
      setTempoRestanteSegundos(0)
    }
  }

  const jogoAtual = jogosDeHoje()[jogoAtualIndex]

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Timer className="text-blue-600" size={24} />
          <CardTitle className="text-xl">Cronômetro de Jogos VOD</CardTitle>
        </div>
        <Badge variant="secondary" className="bg-indigo-500 text-white">
          {jogoAtual ? `Jogo Atual: ${jogoAtual.nome}` : 'Nenhum jogo ativo'}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Display do Tempo */}
        <div className="text-center">
          <div className="text-6xl font-mono font-bold text-gray-800 mb-2 tracking-wider">
            {segundosParaTimestamp(tempoRestanteSegundos)}
          </div>
          
          {jogoAtual && (
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-700">
                {jogoAtual.nome}
              </h3>
              <div className="flex justify-center gap-4 text-sm text-gray-600">
                <span>📅 {new Date(jogoAtual.data_jogo).toLocaleDateString('pt-BR')}</span>
                <span>🎬 VOD: {jogoAtual.inicio} - {jogoAtual.fim}</span>
                <span>⏱️ Duração: {segundosParaTimestamp(calcularDuracao(jogoAtual.inicio, jogoAtual.fim))}</span>
              </div>
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="flex justify-center gap-3">
          <Button
            variant={statusCronometro === 'rodando' ? 'default' : 'outline'}
            onClick={iniciarPausar}
            className="flex items-center gap-2"
            disabled={!jogoAtual && jogosDeHoje().length === 0}
          >
            {statusCronometro === 'rodando' ? (
              <>
                <Pause size={18} />
                Pausar
              </>
            ) : (
              <>
                <Play size={18} />
                Iniciar
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={pularJogo}
            className="flex items-center gap-2"
            disabled={!jogoAtual || jogoAtualIndex >= jogosDeHoje().length - 1}
          >
            <SkipForward size={18} />
            Pular Jogo
          </Button>

          <Button
            variant="outline"
            onClick={reiniciar}
            className="flex items-center gap-2"
            disabled={!jogoAtual}
          >
            <RotateCcw size={18} />
            Reiniciar
          </Button>
        </div>

        {/* Lista de Jogos de Hoje */}
        {jogosDeHoje().length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Timer size={16} />
              Fila de Jogos de Hoje
            </h4>
            <div className="space-y-2">
              {jogosDeHoje().map((jogo, index) => {
                  const isAtual = index === jogoAtualIndex
                  const jaPassou = index < jogoAtualIndex
                  
                  return (
                    <div 
                      key={jogo.id} 
                      className={`p-3 rounded-lg border ${
                        isAtual ? 'bg-green-50 border-green-300' :
                        jaPassou ? 'bg-gray-100 border-gray-300 text-gray-500' :
                        'bg-blue-50 border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-800">{jogo.nome}</span>
                        <Badge className={`${
                          isAtual ? 'bg-green-500' :
                          jaPassou ? 'bg-gray-500' :
                          'bg-blue-500'
                        } text-white`}>
                          {isAtual ? 'Em Andamento' : (jaPassou ? 'Finalizado' : 'Aguardando')}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        VOD: {jogo.inicio} - {jogo.fim} (Duração: {segundosParaTimestamp(calcularDuracao(jogo.inicio, jogo.fim))})
                      </div>
                      {isAtual && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${((calcularDuracao(jogo.inicio, jogo.fim) - tempoRestanteSegundos) / calcularDuracao(jogo.inicio, jogo.fim)) * 100}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Informações adicionais */}
        {jogosDeHoje().length === 0 && (
          <div className="text-center text-gray-500">
            <p>Nenhum jogo programado para hoje</p>
            <p className="text-sm">Adicione jogos na aba "Gerenciar Jogos"</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

