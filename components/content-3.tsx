import { Lightbulb, Pencil, PencilRuler } from 'lucide-react'

export default function Content() {
    return (
        <section className="bg-background @container py-24">
            <div className="mx-auto max-w-2xl px-6">
                <div className="space-y-4">
                    <h2 className="text-balance font-serif text-4xl font-medium">An agent that sounds like you</h2>
                    <p className="text-muted-foreground">Go beyond a static portfolio. Give visitors a dynamic, conversational experience that accurately reflects your expertise.</p>
                </div>
                <div className="@xl:grid-cols-3 mt-12 grid grid-cols-2 gap-6 text-sm">
                    <div className="space-y-3 border-t pt-6">
                        <Lightbulb className="text-muted-foreground size-4" />
                        <p className="text-muted-foreground leading-5">
                            <span className="text-foreground font-medium">Capture Leads</span> Your agent can qualify potential clients and collect their contact info automatically.
                        </p>
                    </div>

                    <div className="space-y-3 border-t pt-6">
                        <Pencil className="text-muted-foreground size-4" />
                        <p className="text-muted-foreground leading-5">
                            <span className="text-foreground font-medium">Answer Questions</span> Train your AI on your past projects, pricing, and process so it can answer FAQs instantly.
                        </p>
                    </div>

                    <div className="space-y-3 border-t pt-6">
                        <PencilRuler className="text-muted-foreground size-4" />
                        <p className="text-muted-foreground leading-5">
                            <span className="text-foreground font-medium">Match Your Tone</span> Configure your agent to be professional, friendly, bold, or casual—just like you.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
