'use client'
import { Lightbulb, Pencil, PencilRuler } from 'lucide-react'
import { motion } from 'motion/react'
import { Card } from '@/components/ui/card'

export default function Content() {
    return (
        <section className="bg-background py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto max-w-2xl text-center"
                >
                    <h2 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl text-balance">An agent that sounds like you</h2>
                    <p className="mt-4 text-lg leading-8 text-muted-foreground">
                        Go beyond a static portfolio. Give visitors a dynamic, conversational experience that accurately reflects your expertise.
                    </p>
                </motion.div>

                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:max-w-none">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="h-full"
                        >
                            <Card className="flex flex-col h-full border-border/50 bg-card shadow-sm transition-all hover:shadow-md">
                                <div className="p-8 flex flex-col h-full">
                                    <div className="mb-6 inline-flex p-3 w-fit rounded-xl bg-primary/10 text-primary">
                                        <Lightbulb className="size-6" />
                                    </div>
                                    <h3 className="mb-3 text-lg font-semibold text-foreground">Capture and qualify leads</h3>
                                    <p className="text-muted-foreground leading-relaxed text-sm flex-1">
                                        Mimick.me asks intent-based questions, collects contact details, and assigns lead confidence scores so you can prioritize serious opportunities first. Get a ranked stream of prospects inside your dashboard.
                                    </p>
                                </div>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="h-full"
                        >
                            <Card className="flex flex-col h-full border-border/50 bg-card shadow-sm transition-all hover:shadow-md">
                                <div className="p-8 flex flex-col h-full">
                                    <div className="mb-6 inline-flex p-3 w-fit rounded-xl bg-primary/10 text-primary">
                                        <Pencil className="size-6" />
                                    </div>
                                    <h3 className="mb-3 text-lg font-semibold text-foreground">RAG-backed retrieval</h3>
                                    <p className="text-muted-foreground leading-relaxed text-sm flex-1">
                                        Upload your resume, case studies, and service docs. Visitors get factual responses about your process, pricing ranges, and project fit without the hallucinations common in generic chat widgets.
                                    </p>
                                </div>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="h-full"
                        >
                            <Card className="flex flex-col h-full border-border/50 bg-card shadow-sm transition-all hover:shadow-md">
                                <div className="p-8 flex flex-col h-full">
                                    <div className="mb-6 inline-flex p-3 w-fit rounded-xl bg-primary/10 text-primary">
                                        <PencilRuler className="size-6" />
                                    </div>
                                    <h3 className="mb-3 text-lg font-semibold text-foreground">Book meetings when hot</h3>
                                    <p className="text-muted-foreground leading-relaxed text-sm flex-1">
                                        Connect Calendly or Google Calendar so qualified visitors can schedule directly from the chat flow while they are still engaged. Removing the back-and-forth that usually delays discovery calls.
                                    </p>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}
