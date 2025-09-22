import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import LeafletMap, { pontosInteresse as defaultPontos } from "@/components/LeafletMap";

const Sobre = () => {
  const [pontoSelecionado, setPontoSelecionado] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-bold text-race-primary font-teko mb-3">Sobre o Evento</h1>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              Corrida de 5 km com largada e chegada no Teresina Shopping. Percurso plano, ideal para iniciantes e experientes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-race-primary mb-4 font-teko">Pontos do Percurso</h3>
                <div className="space-y-3">
                  {defaultPontos.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPontoSelecionado(p.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-colors ${
                        pontoSelecionado === p.id ? 'border-race-primary bg-race-primary/5' : 'border-gray-200 hover:border-race-primary/40'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center">
                          <span className="text-base">{p.tipo === 'inicio' ? '🏁' : p.tipo === 'checkpoint' ? '⚡' : p.tipo === 'hidratacao' ? '💧' : '🏆'}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">{p.nome}</span>
                            <span className="text-xs text-gray-600">{p.km} km</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{p.descricao}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <LeafletMap
                  pontos={defaultPontos}
                  pontoSelecionado={pontoSelecionado}
                  onPontoClick={(p) => setPontoSelecionado(p.id)}
                />
              </div>
            </div>
          </div>

          {/* Seções grandes e espaçosas */}
          {/* Cronograma - faixa ampla */}
          <section className="mt-14">
            <div className="bg-white rounded-3xl border border-gray-200 p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold text-race-primary mb-6 font-teko">Cronograma do Dia</h3>
              <div className="relative">
                <div className="absolute left-2 md:left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-race-primary to-race-secondary rounded-full" />
                <div className="space-y-6 pl-8 md:pl-12">
                  {[
                    { hora: '06:00', desc: 'Credenciamento e retirada de kit' },
                    { hora: '07:30', desc: 'Aquecimento coletivo e orientações' },
                    { hora: '08:00', desc: 'Largada oficial (5 km)' },
                    { hora: '09:30', desc: 'Cerimônia de premiação' },
                  ].map((item) => (
                    <div key={item.hora} className="relative">
                      <div className="absolute -left-8 md:-left-12 top-0 w-4 h-4 rounded-full bg-white border-4 border-race-primary" />
                      <div className="flex items-center justify-between">
                        <span className="text-lg md:text-xl font-semibold text-gray-900">{item.hora}</span>
                        <span className="text-sm md:text-base text-gray-600">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Regras - bloco em duas colunas amplas */}
          <section className="mt-12">
            <div className="bg-white rounded-3xl border border-gray-200 p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold text-race-primary mb-6 font-teko">Regras e Orientações</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 text-base">
                <ul className="space-y-3 list-disc list-inside">
                  <li>Chegar com 30 minutos de antecedência à largada.</li>
                  <li>Uso obrigatório do número de peito visível na frente.</li>
                  <li>Manter-se no percurso sinalizado e respeitar o staff.</li>
                  <li>Descartar resíduos apenas nas áreas indicadas.</li>
                </ul>
                <ul className="space-y-3 list-disc list-inside">
                  <li>É permitida caminhada; prioridade à segurança.</li>
                  <li>Menores somente acompanhados por responsável.</li>
                  <li>Animais de estimação não são permitidos no percurso.</li>
                  <li>Tempo de corte e encerramento conforme organização.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Pós-Prova - vitrine grande de benefícios */}
          <section className="mt-12">
            <div className="bg-white rounded-3xl border border-gray-200 p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold text-race-primary mb-6 font-teko">Pós-Prova</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { titulo: 'Mesa de Frutas', desc: 'Banana, maçã, melancia e laranja', emoji: '🍌' },
                  { titulo: 'Iogurte & Água', desc: 'Hidratação e reposição leve', emoji: '🥛' },
                  { titulo: 'Suporte Médico', desc: 'Primeiros socorros no local', emoji: '⛑️' },
                  { titulo: 'Área de Fotos', desc: 'Backdrop oficial e medalha', emoji: '📸' },
                ].map((b) => (
                  <div key={b.titulo} className="rounded-2xl border border-gray-200 p-6 text-center">
                    <div className="text-4xl mb-3">{b.emoji}</div>
                    <div className="text-lg font-semibold text-gray-900">{b.titulo}</div>
                    <div className="text-sm text-gray-600 mt-1">{b.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};

export default Sobre;


