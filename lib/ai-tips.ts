export async function suggestWeeklyTip(performanceSummary: string): Promise<{ tip: string }> {
  // Mock AI service - in production this would call a real AI API
  const tips = [
    "Tente focar nos hábitos com menor consistência esta semana. Pequenos melhoramentos diários fazem grande diferença!",
    "O seu dia mais produtivo foi excelente! Tente replicar as condições que levaram a esse sucesso.",
    "Considere dividir hábitos mais difíceis em micro-hábitos. Por exemplo, se 'exercício' está difícil, comece com '5 flexões'.",
    "A consistência é mais importante que a perfeição. Celebre os pequenos progressos diários!",
    "Tente agrupar hábitos similares no mesmo período do dia para criar rotinas mais fortes.",
    "Identifique os gatilhos que levam ao sucesso nos seus melhores dias e replique-os conscientemente.",
    "Considere adicionar um hábito de reflexão diária de 2 minutos para aumentar a autoconsciência.",
    "Os seus dados mostram padrões interessantes. Tente manter um diário para identificar o que funciona melhor.",
  ]

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Select tip based on performance (simplified logic)
  const randomTip = tips[Math.floor(Math.random() * tips.length)]

  return { tip: randomTip }
}
