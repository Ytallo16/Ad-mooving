import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import LeafletMap, { pontosInteresse as defaultPontos } from "@/components/LeafletMap";

const Sobre = () => {
  const [pontoSelecionado, setPontoSelecionado] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      {/* Header estilo Patrocinadores */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl font-teko">Sobre o Evento</h1>
          <p className="max-w-2xl mx-auto text-xl text-blue-100 mt-4 font-29lt">
            Corrida de 5 km com largada e chegada no Teresina Shopping. 
          </p>
        </div>
      </div>

      <section className="py-12">
        <div className="container mx-auto px-4">

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
          {/* Cronograma - faixa ampla revisada (alinhamento simétrico) */}
          <section className="mt-14">
            <div className="bg-white rounded-3xl border border-gray-200 p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold text-race-primary mb-8 font-teko">Cronograma do Dia</h3>
              <div className="relative mx-auto max-w-4xl">
                {/* Linha vertical central da timeline */}
                <div className="absolute left-6 top-0 bottom-0 border-l-2 border-race-primary/30" />
                <ul className="space-y-8 pl-16">
                  {[
                    { hora: '06:00', desc: 'Credenciamento e retirada de kit' },
                    { hora: '07:30', desc: 'Aquecimento coletivo e orientações' },
                    { hora: '08:00', desc: 'Largada oficial (5 km)' },
                    { hora: '09:30', desc: 'Cerimônia de premiação' },
                  ].map((item) => (
                    <li key={item.hora} className="relative">
                      {/* Ponto da timeline perfeitamente centralizado na linha */}
                      <span className="absolute left-6 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gradient-to-r from-race-primary to-race-secondary ring-4 ring-white" />
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold bg-race-primary/10 text-race-primary min-w-[84px]">
                          {item.hora}
                        </span>
                        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700">
                          {item.desc}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Regras - organização limpa em duas colunas, sem ícones */}
          <section className="mt-12">
            <div className="bg-white rounded-3xl border border-gray-200 p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold text-race-primary mb-8 font-teko">Regras e Orientações</h3>
              {(() => {
                const itens = [
                  'Chegue 30 min antes da largada para credenciamento e ajustes.',
                  'Uso obrigatório do número de peito visível na parte frontal.',
                  'Mantenha-se no percurso sinalizado e siga o staff.',
                  'Descarte resíduos apenas nas áreas indicadas.',
                  'Caminhar é permitido; priorize sua segurança e a de todos.',
                  'Menores somente acompanhados por responsável legal.',
                ];
                const colA = itens.filter((_, i) => i % 2 === 0);
                const colB = itens.filter((_, i) => i % 2 === 1);
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[colA, colB].map((col, idx) => (
                      <ul key={idx} className="space-y-3">
                        {col.map((texto, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="mt-2 inline-block w-2 h-2 rounded-full bg-race-primary" />
                            <span className="text-sm md:text-base text-gray-700">{texto}</span>
                          </li>
                        ))}
                      </ul>
                    ))}
                  </div>
                );
              })()}
              <div className="mt-6 text-xs text-gray-500">
                Observação: regras complementares e tempo de corte poderão ser comunicados pela organização.
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


