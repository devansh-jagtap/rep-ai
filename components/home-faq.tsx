import { productFaqs } from "@/lib/structured-data";

export default function HomeFaq() {
  return (
    <section className="bg-background py-24" aria-labelledby="homepage-faq-heading">
      <div className="mx-auto max-w-4xl px-6">
        <h2 id="homepage-faq-heading" className="font-serif text-4xl font-medium text-balance">
          Frequently asked questions
        </h2>
        <div className="mt-8 space-y-4">
          {productFaqs.map((faq) => (
            <details key={faq.question} className="group rounded-xl border border-border bg-card p-5">
              <summary className="cursor-pointer list-none font-medium text-foreground marker:hidden">
                {faq.question}
              </summary>
              <p className="text-muted-foreground mt-3 leading-6">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
