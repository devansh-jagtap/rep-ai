'use client'
import { Lightbulb, Pencil, PencilRuler } from 'lucide-react'
import { motion } from 'motion/react'

export default function Content() {
    return (
        <section className="bg-background @container py-24">
            <div className="mx-auto max-w-2xl px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5 }}
                    className="space-y-4"
                >
                    <h2 className="text-balance font-serif text-4xl font-medium">An agent that sounds like you</h2>
                    <p className="text-muted-foreground">Go beyond a static portfolio. Give visitors a dynamic, conversational experience that accurately reflects your expertise.</p>
                </motion.div>
                <div className="@xl:grid-cols-3 mt-12 grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="space-y-3 border-t pt-6"
                    >
                        <Lightbulb className="text-muted-foreground size-4" />
                        <p className="text-muted-foreground leading-6">
                            <span className="text-foreground font-medium">Capture and qualify leads.</span> Mimick.me asks intent-based questions, collects contact details, and assigns lead confidence scores so you can prioritize serious opportunities first. Instead of manually triaging inbox messages, you get a ranked stream of prospects inside your dashboard with context from each conversation.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-3 border-t pt-6"
                    >
                        <Pencil className="text-muted-foreground size-4" />
                        <p className="text-muted-foreground leading-6">
                            <span className="text-foreground font-medium">Answer detailed questions with RAG-backed retrieval.</span> Upload your resume, case studies, and service docs, then let retrieval-augmented generation ground every answer in your own knowledge base. Visitors get factual responses about your process, pricing ranges, and project fit without the hallucinations common in generic chat widgets.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="space-y-3 border-t pt-6"
                    >
                        <PencilRuler className="text-muted-foreground size-4" />
                        <p className="text-muted-foreground leading-6">
                            <span className="text-foreground font-medium">Book meetings while the conversation is hot.</span> Connect Calendly or Google Calendar so qualified visitors can schedule directly from the chat flow while they are still engaged. You keep tone control and brand consistency, but remove the back-and-forth that usually delays discovery calls.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
