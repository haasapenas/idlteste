import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const Calendario = ({ jogos, onSelecionarData, loading }) => {
  const [dataAtual, setDataAtual] = useState(new Date())
  const [visualizacao, setVisualizacao] = useState('month') // 'day', 'week', 'month', 'year'
  const [dataSelecionada, setDataSelecionada] = useState(new Date())

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  // Navegar entre períodos
  const navegarAnterior = () => {
    const novaData = new Date(dataAtual)
    switch (visualizacao) {
      case 'day':
        novaData.setDate(novaData.getDate() - 1)
        break
      case 'week':
        novaData.setDate(novaData.getDate() - 7)
        break
      case 'month':
        novaData.setMonth(novaData.getMonth() - 1)
        break
      case 'year':
        novaData.setFullYear(novaData.getFullYear() - 1)
        break
    }
    setDataAtual(novaData)
  }

  const navegarProximo = () => {
    const novaData = new Date(dataAtual)
    switch (visualizacao) {
      case 'day':
        novaData.setDate(novaData.getDate() + 1)
        break
      case 'week':
        novaData.setDate(novaData.getDate() + 7)
        break
      case 'month':
        novaData.setMonth(novaData.getMonth() + 1)
        break
      case 'year':
        novaData.setFullYear(novaData.getFullYear() + 1)
        break
    }
    setDataAtual(novaData)
  }

  // Obter jogos para uma data específica
  const obterJogosPorData = (data) => {
    const dataString = data.toISOString().split('T')[0]
    return jogos.filter(jogo => jogo.data_jogo === dataString)
  }

  // Obter título do período atual
  const obterTituloPeriodo = () => {
    switch (visualizacao) {
      case 'day':
        return dataAtual.toLocaleDateString('pt-BR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      case 'week':
        const inicioSemana = new Date(dataAtual)
        inicioSemana.setDate(dataAtual.getDate() - dataAtual.getDay())
        const fimSemana = new Date(inicioSemana)
        fimSemana.setDate(inicioSemana.getDate() + 6)
        return `${inicioSemana.toLocaleDateString('pt-BR')} - ${fimSemana.toLocaleDateString('pt-BR')}`
      case 'month':
        return `${meses[dataAtual.getMonth()]} ${dataAtual.getFullYear()}`
      case 'year':
        return dataAtual.getFullYear().toString()
      default:
        return ''
    }
  }

  // Renderizar visualização diária
  const renderizarVisualizacaoDiaria = () => {
    const jogosHoje = obterJogosPorData(dataAtual)
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Jogos do Dia</h3>
        {jogosHoje.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum jogo programado para este dia</p>
        ) : (
          <div className="space-y-3">
            {jogosHoje.map(jogo => (
              <Card key={jogo.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{jogo.nome}</h4>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock size={14} />
                      {jogo.inicio} - {jogo.fim}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Renderizar visualização mensal
  const renderizarVisualizacaoMensal = () => {
    const primeiroDia = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1)
    const ultimoDia = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0)
    const diasNoMes = ultimoDia.getDate()
    const diaSemanaInicio = primeiroDia.getDay()

    const dias = []
    
    // Dias vazios no início
    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push(null)
    }
    
    // Dias do mês
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const data = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dia)
      const jogosNoDia = obterJogosPorData(data)
      dias.push({ dia, data, jogos: jogosNoDia })
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Cabeçalho dos dias da semana */}
        {diasSemana.map(dia => (
          <div key={dia} className="p-2 text-center font-semibold text-gray-600 bg-gray-100 rounded">
            {dia}
          </div>
        ))}
        
        {/* Dias do calendário */}
        {dias.map((item, index) => (
          <div
            key={index}
            className={`p-2 min-h-[80px] border rounded cursor-pointer transition-colors ${
              item ? 'hover:bg-gray-50' : 'bg-gray-50'
            } ${
              item && item.data.toDateString() === dataSelecionada.toDateString()
                ? 'bg-blue-100 border-blue-300'
                : 'border-gray-200'
            }`}
            onClick={() => {
              if (item) {
                setDataSelecionada(item.data)
                onSelecionarData(item.data.toISOString().split('T')[0])
              }
            }}
          >
            {item && (
              <>
                <div className="font-semibold text-sm mb-1">{item.dia}</div>
                {item.jogos.length > 0 && (
                  <div className="space-y-1">
                    {item.jogos.slice(0, 2).map(jogo => (
                      <div
                        key={jogo.id}
                        className="text-xs bg-blue-500 text-white px-1 py-0.5 rounded truncate"
                        title={jogo.nome}
                      >
                        {jogo.nome}
                      </div>
                    ))}
                    {item.jogos.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{item.jogos.length - 2} mais
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    )
  }

  // Renderizar visualização anual
  const renderizarVisualizacaoAnual = () => {
    const mesesDoAno = []
    for (let mes = 0; mes < 12; mes++) {
      const primeiroDia = new Date(dataAtual.getFullYear(), mes, 1)
      const ultimoDia = new Date(dataAtual.getFullYear(), mes + 1, 0)
      
      let totalJogos = 0
      for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
        const data = new Date(dataAtual.getFullYear(), mes, dia)
        totalJogos += obterJogosPorData(data).length
      }
      
      mesesDoAno.push({
        mes,
        nome: meses[mes],
        totalJogos
      })
    }

    return (
      <div className="grid grid-cols-3 gap-4">
        {mesesDoAno.map(({ mes, nome, totalJogos }) => (
          <Card
            key={mes}
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => {
              setDataAtual(new Date(dataAtual.getFullYear(), mes, 1))
              setVisualizacao('month')
            }}
          >
            <h3 className="font-semibold text-center">{nome}</h3>
            <div className="text-center mt-2">
              <Badge variant={totalJogos > 0 ? 'default' : 'secondary'}>
                {totalJogos} jogo{totalJogos !== 1 ? 's' : ''}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controles de navegação */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CalendarIcon size={24} />
            Calendário
          </h2>
          
          <Select value={visualizacao} onValueChange={setVisualizacao}>
            <SelectTrigger className="w-32">
              <Filter size={16} />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Dia</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mês</SelectItem>
              <SelectItem value="year">Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={navegarAnterior}>
            <ChevronLeft size={16} />
          </Button>
          
          <div className="min-w-[200px] text-center font-semibold">
            {obterTituloPeriodo()}
          </div>
          
          <Button variant="outline" size="sm" onClick={navegarProximo}>
            <ChevronRight size={16} />
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={() => {
            setDataAtual(new Date())
            setDataSelecionada(new Date())
          }}
        >
          Hoje
        </Button>
      </div>

      {/* Conteúdo do calendário */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600">Carregando calendário...</p>
            </div>
          ) : (
            <>
              {visualizacao === 'day' && renderizarVisualizacaoDiaria()}
              {visualizacao === 'month' && renderizarVisualizacaoMensal()}
              {visualizacao === 'year' && renderizarVisualizacaoAnual()}
              {visualizacao === 'week' && (
                <div className="text-center py-8 text-gray-500">
                  Visualização semanal em desenvolvimento
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Resumo de jogos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{jogos.length}</div>
              <div className="text-sm text-gray-600">Total de Jogos</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {jogos.filter(jogo => {
                  const hoje = new Date().toISOString().split('T')[0]
                  return jogo.data_jogo === hoje
                }).length}
              </div>
              <div className="text-sm text-gray-600">Jogos Hoje</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {jogos.filter(jogo => {
                  const hoje = new Date().toISOString().split('T')[0]
                  return jogo.data_jogo > hoje
                }).length}
              </div>
              <div className="text-sm text-gray-600">Jogos Futuros</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {jogos.filter(jogo => {
                  const hoje = new Date().toISOString().split('T')[0]
                  return jogo.data_jogo < hoje
                }).length}
              </div>
              <div className="text-sm text-gray-600">Jogos Passados</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

