import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { publicPricingTiers } from '@/lib/structured-data'

const allFeatures = Array.from(new Set(publicPricingTiers.flatMap((plan) => plan.features)))

export default function Pricing() {
    return (
        <section className="bg-background @container py-24">
            <div className="mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <h2 className="text-balance font-serif text-4xl font-medium">Simple, transparent pricing</h2>
                    <p className="text-muted-foreground mx-auto mt-4 max-w-md text-balance">Everything you need to deploy your AI representative and start generating leads.</p>
                </div>

                <div className="mt-12 overflow-x-auto">
                    <table aria-label="Pricing plan comparison" className="w-full border-separate border-spacing-0 @xl:border-spacing-3">
                        <thead>
                            <tr className="align-top">
                                <th scope="col" className="sr-only">Plan details</th>
                                {publicPricingTiers.map((plan) => {
                                    const isHighlighted = 'highlighted' in plan && plan.highlighted

                                    return (
                                        <th key={plan.name} scope="col" className="min-w-[250px] p-0 align-top">
                                            <Card
                                                variant={isHighlighted ? 'default' : 'mixed'}
                                                className={cn('relative p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl', isHighlighted && 'ring-primary')}>
                                                <div className="mb-6">
                                                    <h3 className="text-foreground font-medium text-lg">{plan.name}</h3>
                                                    <p className="text-muted-foreground mt-1 text-sm min-h-[40px] font-normal">{plan.description}</p>
                                                </div>
                                                <div>
                                                    <span className="font-serif text-5xl font-medium">{plan.priceDisplay}</span>
                                                    <span className="text-muted-foreground font-normal">{plan.period}</span>
                                                </div>
                                                <Button
                                                    asChild
                                                    variant={isHighlighted ? 'default' : 'outline'}
                                                    className="mt-8 w-full gap-2">
                                                    <Link href="/auth/signup" title={`Get started with ${plan.name}`}>
                                                        Get Started
                                                        <ArrowRight aria-hidden="true" className="size-4" />
                                                    </Link>
                                                </Button>
                                            </Card>
                                        </th>
                                    )
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {allFeatures.map((feature) => (
                                <tr key={feature} className="border-b border-border/50 align-middle">
                                    <th scope="row" className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">{feature}</th>
                                    {publicPricingTiers.map((plan) => (
                                        <td key={`${plan.name}-${feature}`} className="px-4 py-3 text-center align-middle">
                                            {plan.features.includes(feature) ? (
                                                <span className="inline-flex items-center justify-center" aria-label={`${plan.name} includes ${feature}`}>
                                                    <Check aria-hidden="true" className="text-primary size-4 shrink-0" />
                                                </span>
                                            ) : (
                                                <span aria-label={`${plan.name} does not include ${feature}`} className="text-muted-foreground">—</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <p className="text-muted-foreground mt-12 text-center text-sm">
                    No hidden fees. Upgrade, downgrade, or cancel anytime.
                </p>
            </div>
        </section>
    )
}
