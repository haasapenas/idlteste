import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { Clock, Settings, Calendar, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LoginForm } from './components/LoginForm'
import { Cronometro } from './components/Cronometro'
import { GerenciarJogos } from './components/GerenciarJogos'
import { Calendario } from './components/Calendario'
import { useJogos } from './hooks/useJogos'
import './App.css'

const AppContent = () => {
  const { user, loading: authLoading, signOut, isSupabaseConfigured } = useAuth()
  const {
    jogos,
    loading: jogosLoading,
    adicionarJogo,
    atualizarJogo,
    removerJogo,
    carregarJogos,
    buscarJogosPorData,
    limparJogosExpirados
  } = useJogos()

  const [abaSelecionada, setAbaSelecionada] = useState('cronometro')

  // Limpar jogos expirados na inicialização
  useEffect(() => {
    limparJogosExpirados()
  }, [limparJogosExpirados])

  const handleSelecionarData = (data) => {
    buscarJogosPorData(data)
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  // Mostrar tela de loading durante autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Mostrar tela de login se não autenticado (apenas se Supabase estiver configurado)
  if (isSupabaseConfigured && !user) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Clock className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Avisos de Jogos
                </h1>
                <p className="text-xs text-gray-600">Sistema de Cronômetro</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Status do sistema */}
              <div className="flex items-center gap-2">
                <Badge variant={isSupabaseConfigured ? 'default' : 'secondary'}>
                  {isSupabaseConfigured ? 'Online' : 'Local'}
                </Badge>
              </div>

              {/* User info e logout */}
              {user && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={16} />
                    <span>{user.email || 'Usuário Local'}</span>
                  </div>
                  {isSupabaseConfigured && (
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      <LogOut size={16} />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada} className="space-y-6">
          {/* Navigation Tabs */}
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="cronometro" className="flex items-center gap-2">
              <Clock size={18} />
              Cronômetro
            </TabsTrigger>
            <TabsTrigger value="gerenciar" className="flex items-center gap-2">
              <Settings size={18} />
              Gerenciar
            </TabsTrigger>
            <TabsTrigger value="calendario" className="flex items-center gap-2">
              <Calendar size={18} />
              Calendário
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="cronometro" className="space-y-6">
            <Cronometro jogos={jogos} />

            {/* Próximos jogos */}
            {jogos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Todos os Jogos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {jogos
                      .sort((a, b) => {
                        // Ordenar por data e depois por timestamp de início
                        if (a.data_jogo !== b.data_jogo) {
                          return new Date(a.data_jogo) - new Date(b.data_jogo)
                        }
                        const [h1, m1, s1] = a.inicio.split(":").map(Number)
                        const [h2, m2, s2] = b.inicio.split(":").map(Number)
                        return (h1 * 3600 + m1 * 60 + s1) - (h2 * 3600 + m2 * 60 + s2)
                      })
                      .map(jogo => (
                        <div key={jogo.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-semibold">{jogo.nome}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(jogo.data_jogo + 'T00:00:00').toLocaleDateString('pt-BR')} • VOD: {jogo.inicio} - {jogo.fim}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {jogo.data_jogo === new Date().toISOString().split('T')[0] ? 'Hoje' : 'Futuro'}
                          </Badge>
                        </div>
                      ))}
                    
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="gerenciar">
            <GerenciarJogos
              jogos={jogos}
              onAdicionarJogo={adicionarJogo}
              onAtualizarJogo={atualizarJogo}
              onRemoverJogo={removerJogo}
              loading={jogosLoading}
            />
          </TabsContent>

          <TabsContent value="calendario">
            <Calendario
              jogos={jogos}
              onSelecionarData={handleSelecionarData}
              loading={jogosLoading}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>© 2024 Sistema de Avisos de Jogos • Desenvolvido com React e Supabase</p>
            <p className="mt-1">
              Status: {isSupabaseConfigured ? 'Conectado ao Supabase' : 'Modo Local (localStorage)'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

