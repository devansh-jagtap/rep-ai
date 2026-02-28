import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const plans = [
    {
        name: 'Starter',
        price: '$0',
        period: '',
        description: 'Perfect for students and job seekers looking to stand out.',
        features: [
            '1 AI Portfolio',
            '1 AI Agent Clone',
            '100 AI Messages / mo',
            'Standard Templates',
        ],
    },
    {
        name: 'Pro',
        price: '$19',
        period: '/month',
        description: 'Your 24/7 automated sales representative.',
        features: [
            '3 AI Portfolios',
            '3 AI Agents',
            '1,000 AI Messages / mo',
            'Google Calendar Integration',
            'Lead Capture & CRM',
            'Premium Templates',
            'Custom Domain Support',
        ],
        highlighted: true,
    },
    {
        name: 'Agency',
        price: '$49',
        period: '/month',
        description: 'Scale your portfolio business with power metrics.',
        features: [
            '10 AI Portfolios',
            '10 AI Agents',
            '10,000 AI Messages / mo',
            'Deep AI Analytics',
            'Webhook Integrations',
            'Priority Support',
        ],
    },
]

export default function Pricing() {
    return (
        <section className="bg-background @container py-24">
            <div className="mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <h2 className="text-balance font-serif text-4xl font-medium">Simple, transparent pricing</h2>
                    <p className="text-muted-foreground mx-auto mt-4 max-w-md text-balance">Everything you need to deploy your AI representative and start generating leads.</p>
                </div>
                <div className="@xl:grid-cols-3 @xl:gap-3 mt-12 grid gap-6">
                    {plans.map((plan) => (
                        <Card
                            key={plan.name}
                            variant={plan.highlighted ? 'default' : 'mixed'}
                            className={cn('relative p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl', plan.highlighted && 'ring-primary')}>
                            <div className="mb-6">
                                <h3 className="text-foreground font-medium text-lg">{plan.name}</h3>
                                <p className="text-muted-foreground mt-1 text-sm min-h-[40px]">{plan.description}</p>
                            </div>
                            <div>
                                <span className="font-serif text-5xl font-medium">{plan.price}</span>
                                <span className="text-muted-foreground">{plan.period}</span>
                            </div>
                            <ul className="mt-6 space-y-3 flex-1">
                                {plan.features.map((feature) => (
                                    <li
                                        key={feature}
                                        className="text-muted-foreground flex items-center gap-2 text-sm leading-snug">
                                        <Check className="text-primary size-4 shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Button
                                asChild
                                variant={plan.highlighted ? 'default' : 'outline'}
                                className="mt-8 w-full gap-2">
                                <Link href="/auth/signup">
                                    Get Started
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </Card>
                    ))}
                </div>
                <p className="text-muted-foreground mt-12 text-center text-sm">
                    No hidden fees. Upgrade, downgrade, or cancel anytime.
                </p>
            </div>
        </section>
    )
}
