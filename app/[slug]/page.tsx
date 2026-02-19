interface PublicAIPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicAIPage({ params }: PublicAIPageProps) {
  const { slug } = await params;

  return (
    <main className="mx-auto max-w-3xl p-10">
      <h1 className="text-3xl font-bold">Public AI Page</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-300">
        You are viewing <span className="font-mono">/{slug}</span>.
      </p>
    </main>
  );
}
