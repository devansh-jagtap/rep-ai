'use client';
import React from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { HeroHeader } from './header'
import { ChevronRight } from 'lucide-react'
import { Supabase } from '@/components/ui/svgs/supabase'
import { Slack } from '@/components/ui/svgs/slack'
import { Twilio } from '@/components/ui/svgs/twilio'
import { Linear } from '@/components/ui/svgs/linear'
import { Figma } from '@/components/ui/svgs/figma'
import { Vercel } from '@/components/ui/svgs/vercel'
import { Firebase } from '@/components/ui/svgs/firebase'
import { ClerkIconLight as Clerk } from '@/components/ui/svgs/clerk'
import { Claude } from '@/components/ui/svgs/claude'
import Image from 'next/image'

export default function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                <section className="bg-background">
                    <div className="relative py-32 md:pt-44">
                        <div className="mask-radial-from-45% mask-radial-to-75% mask-radial-at-top mask-radial-[75%_100%] mask-t-from-50% lg:aspect-9/4 absolute inset-0 aspect-square lg:top-24 dark:opacity-5">
                            <Image
                                src="https://images.unsplash.com/photo-1740516367177-ae20098c8786?q=80&w=2268&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                alt="hero background"
                                width={2268}
                                height={1740}
                                className="size-full object-cover object-top"
                            />
                        </div>
                        <div className="relative z-10 mx-auto w-full max-w-5xl px-6">
                            <div className="mx-auto max-w-md text-center">
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-balance font-serif text-4xl font-medium sm:text-5xl"
                                >
                                    Your 24/7 AI representative.
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                    className="text-muted-foreground mt-4 text-balance"
                                >
                                    Envoy helps you build personal AI agents that generate leads and showcase your skills, even when you’re offline.
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    <Button
                                        asChild
                                        className="mt-6 pr-1.5"
                                    >
                                        <Link href="/auth/signup">
                                            <span className="text-nowrap">Start Building</span>
                                            <ChevronRight className="opacity-50" />
                                        </Link>
                                    </Button>
                                </motion.div>
                            </div>
                            <div className="mx-auto mt-24 max-w-xl">
                                <div className="**:fill-foreground grid scale-95 grid-cols-3 gap-12">
                                    <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.1 }} className="ml-auto blur-[2px]">
                                        <Card className="shadow-foreground/10 flex h-8 w-fit items-center gap-2 rounded-xl px-3 sm:h-10 sm:px-4">
                                            <Supabase className="size-4" />
                                            <span className="text-nowrap font-medium max-sm:text-xs">Supabase</span>
                                        </Card>
                                    </motion.div>
                                    <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }} className="ml-auto">
                                        <Card className="shadow-foreground/10 flex h-8 w-fit items-center gap-2 rounded-xl px-3 sm:h-10 sm:px-4">
                                            <Slack className="size-4" />
                                            <span className="text-nowrap font-medium max-sm:text-xs">Slack</span>
                                        </Card>
                                    </motion.div>
                                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="ml-auto blur-[2px]">
                                        <Card className="shadow-foreground/10 flex h-8 w-fit items-center gap-2 rounded-xl px-3 sm:h-10 sm:px-4">
                                            <Figma className="size-4" />
                                            <span className="text-nowrap font-medium max-sm:text-xs">Figma</span>
                                        </Card>
                                    </motion.div>
                                    <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }} className="mr-auto">
                                        <Card className="shadow-foreground/10 flex h-8 w-fit items-center gap-2 rounded-xl px-3 sm:h-10 sm:px-4">
                                            <Vercel className="size-4" />
                                            <span className="text-nowrap font-medium max-sm:text-xs">Vercel</span>
                                        </Card>
                                    </motion.div>
                                    <motion.div animate={{ y: [0, -9, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }} className="blur-[2px]">
                                        <Card className="shadow-foreground/10 flex h-8 w-fit items-center gap-2 rounded-xl px-3 sm:h-10 sm:px-4">
                                            <Firebase className="size-3 sm:size-4" />
                                            <span className="text-nowrap font-medium max-sm:text-xs">Firebase</span>
                                        </Card>
                                    </motion.div>
                                    <motion.div animate={{ y: [0, -11, 0] }} transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}>
                                        <Card className="shadow-foreground/10 mx-a flex h-8 w-fit items-center gap-2 rounded-xl px-3 sm:h-10 sm:px-4">
                                            <Linear className="size-3 sm:size-4" />
                                            <span className="text-nowrap font-medium max-sm:text-xs">Linear</span>
                                        </Card>
                                    </motion.div>
                                    <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 2.1 }} className="ml-auto blur-[2px]">
                                        <Card className="shadow-foreground/10 flex h-8 w-fit items-center gap-2 rounded-xl px-3 sm:h-10 sm:px-4">
                                            <Twilio className="size-3 sm:size-4" />
                                            <span className="text-nowrap font-medium max-sm:text-xs">Twilio</span>
                                        </Card>
                                    </motion.div>
                                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}>
                                        <Card className="shadow-foreground/10 mx-a flex h-8 w-fit items-center gap-2 rounded-xl px-3 sm:h-10 sm:px-4">
                                            <Claude className="size-3 sm:size-4" />
                                            <span className="text-nowrap font-medium max-sm:text-xs">Claude AI</span>
                                        </Card>
                                    </motion.div>
                                    <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.8 }} className="blur-[2px]">
                                        <Card className="shadow-foreground/10 flex h-8 w-fit items-center gap-2 rounded-xl px-3 sm:h-10 sm:px-4">
                                            <Clerk className="size-3 sm:size-4" />
                                            <span className="text-nowrap font-medium max-sm:text-xs">Clerk </span>
                                        </Card>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
