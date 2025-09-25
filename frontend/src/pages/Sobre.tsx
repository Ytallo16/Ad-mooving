import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
                <ul className="space-y-8">
                  {[
                    { hora: '05:20h', desc: 'Concentração' },
                    { hora: '05:40h', desc: 'Aquecimento' },
                    { hora: '06h', desc: 'Largada' },
                    { hora: '07:30h-09:30h', desc: 'Cerimônia de premiação' },
                  ].map((item) => (
                    <li key={item.hora} className="relative">
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

          {/* Premiação */}
          <section className="mt-12">
            <div className="bg-white rounded-3xl border border-gray-200 p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold text-race-primary mb-6 font-teko">Premiação</h3>
              <p className="text-gray-700 text-base md:text-lg">
                Troféus para os 3 primeiros colocados de cada categoria (masculino e feminino).
              </p>
            </div>
          </section>

          {/* Retirada de Kits */}
          <section className="mt-12">
            <div className="bg-white rounded-3xl border border-gray-200 p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold text-race-primary mb-6 font-teko">Retirada de Kits</h3>
              <div className="space-y-2 text-gray-700">
                <p><span className="font-semibold">Data:</span> em breve</p>
                <p><span className="font-semibold">Local:</span> em breve</p>
                <p className="mt-3 font-semibold">Documentos Necessários:</p>
                <ul className="list-disc pl-5 text-sm md:text-base">
                  <li>Comprovante de inscrição e documento original com foto.</li>
                </ul>
                <p className="text-sm md:text-base mt-3">
                  A retirada de kits por terceiros poderá ser feita mediante apresentação do comprovante de inscrição e cópia de documento de identificação com foto do inscrito.
                </p>
              </div>
            </div>
          </section>

          {/* Kit do Atleta - estilo lista simples com ícone e bullets */}
          <section className="mt-12">
            <div className="bg-white rounded-3xl border border-gray-200 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl" aria-hidden>👕</span>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Kit do Atleta</h3>
              </div>
              <hr className="border-gray-200 mb-6" />
              <ul className="list-disc pl-6 space-y-4 text-gray-800 text-base md:text-lg">
                <li>Camiseta oficial</li>
                <li>Número de peito</li>
                <li>Chip de cronometragem</li>
                <li>Medalha (pós-prova)</li>
                <li>Ecobag</li>
                <li>Pódio e backdrop para fotos</li>
              </ul>
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
      
      <Footer />
    </div>
  );
};

export default Sobre;


