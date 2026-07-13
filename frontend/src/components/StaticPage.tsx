interface StaticPageProps {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{ title: string; body: string }>;
}

export function StaticPage({ eyebrow, title, intro, sections }: StaticPageProps) {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-cream py-16">
      <article className="mx-auto max-w-3xl px-4 sm:px-6">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-terracotta">{eyebrow}</p>
        <h1 className="font-serif text-4xl text-ink sm:text-5xl">{title}</h1>
        <p className="mt-5 text-lg leading-8 text-muted">{intro}</p>
        <div className="mt-12 space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl text-ink">{section.title}</h2>
              <p className="mt-3 whitespace-pre-line leading-7 text-muted">{section.body}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
