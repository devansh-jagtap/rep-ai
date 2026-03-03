import { Target, Brain, Workflow, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function WhyMimick() {
  const points = [
    {
      title: "Stop losing qualified leads",
      description: "Most freelancers and boutique agencies lose work before a real conversation starts. Visitors skim project thumbnails and bounce because they don't know if you're available, if your offer fits, or what the next step is. Contact forms are slow, and static pages can't answer follow-up questions.",
      icon: Target
    },
    {
      title: "Grounded in your actual expertise",
      description: "Upload your own materials (project history, offer details, FAQs), and our assistant uses retrieval-augmented generation (RAG) to fetch relevant facts. Answers stay grounded in your real expertise instead of drifting into generic chatbot filler.",
      icon: Brain
    },
    {
      title: "A complete conversion system",
      description: "Mimick.me is not just another chatbot or portfolio builder. It combines brand-aligned conversational UX, factual knowledge retrieval, and conversion workflows (like Calendar scheduling) into one seamless experience.",
      icon: Workflow
    },
    {
      title: "Focus only on serious prospects",
      description: "Instead of answering the same pre-sale questions repeatedly, let your agent handle first-line discovery 24/7. Focus your time on high-confidence leads that are already qualified. Give yourself a measurable advantage.",
      icon: Zap
    }
  ]

  return (
    <section className="bg-muted/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <div className="lg:sticky lg:top-32">
            <h2 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl text-balance">
              Why Mimick.me
            </h2>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl text-balance">
              Turning static portfolios into intelligent conversion surfaces that work while you sleep. Give your visitors a responsive, always-on agent that explains your work and qualifies intent.
            </p>
          </div>

          <div className="flex flex-col gap-8">
            {points.map((point, i) => (
              <Card key={i} className="p-8 border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <point.icon className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-foreground mb-3">{point.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
