import { useState } from 'react'
import { Plus, Edit2, Trash2, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export const GerenciarJogos = ({ jogos, onAdicionarJogo, onAtualizarJogo, onRemoverJogo, loading }) => {
  const [dialogAberto, setDialogAberto] = useState(false)
  const [jogoEditando, setJogoEditando] = useState(null)
  const [formData, setFormData] = useState({
    nome: '',
    data_jogo: new Date().toISOString().split('T')[0],
    inicio: '',
    fim: ''
  })

  const resetForm = () => {
    setFormData({
      nome: '',
      data_jogo: new Date().toISOString().split('T')[0],
      inicio: '',
      fim: ''
    })
    setJogoEditando(null)
  }

  const abrirDialogAdicionar = () => {
    resetForm()
    setDialogAberto(true)
  }

  const abrirDialogEditar = (jogo) => {
    setFormData({
      nome: jogo.nome,
      data_jogo: jogo.data_jogo,
      inicio: jogo.inicio,
      fim: jogo.fim
    })
    setJogoEditando(jogo)
    setDialogAberto(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar se a data não é superior a 1 ano
    const umAnoFuturo = new Date()
    umAnoFuturo.setFullYear(umAnoFuturo.getFullYear() + 1)
    
    if (new Date(formData.data_jogo) > umAnoFuturo) {
      alert('A data do jogo não pode ser superior a 1 ano a partir de hoje')
      return
    }

    // Validar timestamps (início deve ser anterior ao fim)
    if (formData.inicio >= formData.fim) {
      alert('O timestamp de início deve ser anterior ao timestamp de fim')
      return
    }

    try {
      if (jogoEditando) {
        await onAtualizarJogo(jogoEditando.id, formData)
      } else {
        await onAdicionarJogo(formData)
      }
      
      setDialogAberto(false)
      resetForm()
    } catch (error) {
      console.error('Erro ao salvar jogo:', error)
    }
  }

  const formatarData = (data) => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')
  }

  const obterStatusJogo = (jogo) => {
    const agora = new Date()
    const dataAtual = agora.toISOString().split('T')[0]

    if (jogo.data_jogo < dataAtual) {
      return { texto: 'Finalizado', cor: 'bg-gray-500' }
    } else if (jogo.data_jogo === dataAtual) {
      return { texto: 'Hoje', cor: 'bg-green-500' }
    } else {
      return { texto: 'Programado', cor: 'bg-blue-500' }
    }
  }

  // Agrupar jogos por data
  const jogosAgrupados = jogos.reduce((grupos, jogo) => {
    const data = jogo.data_jogo
    if (!grupos[data]) {
      grupos[data] = []
    }
    grupos[data].push(jogo)
    return grupos
  }, {})

  // Ordenar datas
  const datasOrdenadas = Object.keys(jogosAgrupados).sort()

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Jogos</h2>
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button onClick={abrirDialogAdicionar} className="flex items-center gap-2">
              <Plus size={18} />
              Adicionar Jogo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {jogoEditando ? 'Editar Jogo' : 'Adicionar Novo Jogo'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome do Jogo</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Time A vs Time B"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="data_jogo">Data do Jogo</Label>
                <Input
                  id="data_jogo"
                  type="date"
                  value={formData.data_jogo}
                  onChange={(e) => setFormData({ ...formData, data_jogo: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  max={(() => {
                    const maxDate = new Date()
                    maxDate.setFullYear(maxDate.getFullYear() + 1)
                    return maxDate.toISOString().split('T')[0]
                  })()}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inicio">Timestamp Início (VOD)</Label>
                  <Input
                    id="inicio"
                    type="time"
                    step="1"
                    value={formData.inicio}
                    onChange={(e) => setFormData({ ...formData, inicio: e.target.value })}
                    placeholder="00:00:00"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="fim">Timestamp Fim (VOD)</Label>
                  <Input
                    id="fim"
                    type="time"
                    step="1"
                    value={formData.fim}
                    onChange={(e) => setFormData({ ...formData, fim: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogAberto(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {jogoEditando ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Jogos */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Carregando jogos...</p>
        </div>
      ) : datasOrdenadas.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600">Nenhum jogo programado</p>
            <p className="text-sm text-gray-500">Clique em "Adicionar Jogo" para começar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {datasOrdenadas.map(data => (
            <Card key={data}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar size={20} />
                  {formatarData(data)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {jogosAgrupados[data].map(jogo => {
                    const status = obterStatusJogo(jogo)
                    return (
                      <div key={jogo.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-800">{jogo.nome}</h3>
                            <Badge className={`${status.cor} text-white`}>
                              {status.texto}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              VOD: {jogo.inicio} - {jogo.fim}
                            </span>
                            <span className="text-xs text-gray-500">
                              Duração: {(() => {
                                const [h1, m1, s1] = jogo.inicio.split(':').map(Number)
                                const [h2, m2, s2] = jogo.fim.split(':').map(Number)
                                const inicio = h1 * 3600 + m1 * 60 + s1
                                const fim = h2 * 3600 + m2 * 60 + s2
                                const duracao = fim - inicio
                                const horas = Math.floor(duracao / 3600)
                                const minutos = Math.floor((duracao % 3600) / 60)
                                const segundos = duracao % 60
                                return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`
                              })()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => abrirDialogEditar(jogo)}
                          >
                            <Edit2 size={14} />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 size={14} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o jogo "{jogo.nome}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onRemoverJogo(jogo.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

