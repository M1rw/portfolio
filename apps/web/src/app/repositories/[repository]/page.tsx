import Link from "next/link";
import { notFound } from "next/navigation";
import { loadRepositoryPage } from "@/lib/content/repositories";

type PageProps = {
  params: Promise<{ repository: string }>;
};

export default async function RepositoryPage({ params }: PageProps) {
  const { repository } = await params;
  const page = await loadRepositoryPage(repository);

  if (!page) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10 md:py-14">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">Repository page</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white/95">{page.title}</h1>
          {page.summary ? <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">{page.summary}</p> : null}
        </div>
        <Link href="/" className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white/90 hover:bg-white/15">
          Back home
        </Link>
      </div>

      <section className="cv-section rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm">
        <div className="space-y-4 text-sm text-white/85">
          {page.body.blocks.map((block, index) => {
            if (block.type === "paragraph") {
              return (
                <p key={index} className="leading-7 text-white/85">
                  {block.text}
                </p>
              );
            }

            return (
              <ul key={index} className="list-disc space-y-2 pl-5 text-white/85 marker:text-white/50">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          })}
        </div>

        {page.githubRepo ? (
          <div className="mt-6">
            <a href={`https://github.com/M1rw/${page.githubRepo}`} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white/90 hover:bg-white/15">
              Open GitHub Repo
            </a>
          </div>
        ) : null}
      </section>
    </div>
  );
}