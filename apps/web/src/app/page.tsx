import Image from "next/image";
import { loadSiteConfig } from "@/lib/content/config";
import { loadFeed } from "@/lib/content/server";
import { loadGitHubProfile, loadGitHubProjects } from "@/lib/github/server";
import { ResumeHeaderActions } from "@/components/ResumeHeaderActions";

type SectionKind = "about" | "skills" | "experience" | "projects";
type Block = { type: "paragraph"; text: string } | { type: "list"; items: string[] };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="cv-section rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-white/95">{title}</h2>
      <div className="mt-3 text-sm text-white/85">{children}</div>
    </section>
  );
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="mt-2 space-y-3">
      {blocks.map((b, idx) => {
        if (b.type === "paragraph") {
          return (
            <p key={idx} className="leading-7 text-white/85">
              {b.text}
            </p>
          );
        }
        return (
          <ul key={idx} className="list-disc space-y-2 pl-5 text-white/85 marker:text-white/50">
            {b.items?.map((it: string, i: number) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}

function formatUpdatedDate(dateString: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(dateString));
}

function formatCount(value: number) {
  return new Intl.NumberFormat(undefined, { notation: "compact" }).format(value);
}

function ProjectGrid({ projects }: { projects: Awaited<ReturnType<typeof loadGitHubProjects>> }) {
  if (projects.length === 0) {
    return <p className="leading-7 text-white/70">No public projects are configured yet.</p>;
  }

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      {projects.map((project) => (
        <article key={project.name} className="rounded-2xl border border-white/10 bg-black/20 p-4 transition-colors hover:bg-white/[0.06]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-white/95">{project.displayName}</h3>
              <p className="mt-1 text-sm leading-6 text-white/70">
                {project.description ?? "Public GitHub repository."}
              </p>
            </div>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-white/55">
              Public
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/65">
            {project.language ? <span className="rounded-full bg-white/6 px-2.5 py-1">{project.language}</span> : null}
            <span className="rounded-full bg-white/6 px-2.5 py-1">{formatCount(project.stars)} stars</span>
            <span className="rounded-full bg-white/6 px-2.5 py-1">{formatCount(project.forks)} forks</span>
            <span className="rounded-full bg-white/6 px-2.5 py-1">Updated {formatUpdatedDate(project.updatedAt)}</span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <a href={project.htmlUrl} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-white/90 hover:bg-white/15">
              GitHub Repo
            </a>
            {project.customPageUrl ? (
              <a href={project.customPageUrl} className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-white/90 hover:bg-white/15">
                Custom Page
              </a>
            ) : null}
            {project.homepage ? (
              <a href={project.homepage} target="_blank" rel="noreferrer" className="text-white/65 hover:text-white/90 hover:underline">
                Live site
              </a>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

export default async function Home() {
  const config = await loadSiteConfig();
  const [items, profile, repositoryProjects] = await Promise.all([
    loadFeed(),
    loadGitHubProfile(config.githubUsername),
    loadGitHubProjects(
      config.githubUsername,
      config.projects.hiddenRepositories,
      config.projects.featuredRepositories,
      config.projects.displayCount ?? 6
    )
  ]);

  const byKind = (kind: SectionKind) =>
    items.find((x) => x.post.type === "section" && x.revision.sectionKind === kind) ?? null;

  const about = byKind("about");
  const skills = byKind("skills");
  const experience = byKind("experience");
  const projects = byKind("projects");

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:py-12">
      <header className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 overflow-hidden rounded-full border border-white/15 bg-white/5">
            <Image src={profile.avatarUrl} alt={profile.name ?? profile.login} width={56} height={56} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white/95">{profile.name ?? config.displayName}</h1>
            <div className="mt-1 text-sm text-white/70">@{profile.login}</div>
            {profile.bio ? <p className="mt-2 max-w-prose text-sm leading-7 text-white/80">{profile.bio}</p> : null}
          </div>
        </div>
        <ResumeHeaderActions profileUrl={profile.htmlUrl} />
      </header>

      <div className="mt-8 grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-6">
          {skills ? (
            <Section title={skills.revision.title ?? "Skills"}>
              {skills.revision.summary ? (
                <p className="leading-7 text-white/80">{skills.revision.summary}</p>
              ) : null}
              <Blocks blocks={skills.revision.body.blocks} />
            </Section>
          ) : null}

          <Section title="Contact">
            <ul className="space-y-2 text-sm text-white/85">
              {config.contacts.map((contact) => (
                <li key={`${contact.label}-${contact.value}`} className="flex flex-col gap-0.5 rounded-xl border border-white/8 bg-black/10 p-3">
                  <span className="text-xs uppercase tracking-[0.18em] text-white/45">{contact.label}</span>
                  {contact.href ? (
                    <a href={contact.href} target="_blank" className="text-white/90 hover:underline" rel="noreferrer">
                      {contact.value}
                    </a>
                  ) : (
                    <span className="text-white/80">{contact.value}</span>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        </aside>

        {/* Main content */}
        <main className="space-y-6">
          {about ? (
            <Section title={about.revision.title ?? "About"}>
              {about.revision.summary ? (
                <p className="leading-7 text-white/80">{about.revision.summary}</p>
              ) : null}
              <Blocks blocks={about.revision.body.blocks} />
            </Section>
          ) : null}

          {experience ? (
            <Section title={experience.revision.title ?? "Experience"}>
              {experience.revision.summary ? (
                <p className="leading-7 text-white/80">{experience.revision.summary}</p>
              ) : null}
              <Blocks blocks={experience.revision.body.blocks} />
            </Section>
          ) : null}

          {projects ? (
            <Section title={config.projects.sectionTitle ?? projects.revision.title ?? "Projects"}>
              {projects.revision.summary ? (
                <p className="leading-7 text-white/80">{projects.revision.summary}</p>
              ) : null}
              <Blocks blocks={projects.revision.body.blocks} />
              {config.projects.sectionSummary ? (
                <p className="mt-4 text-sm leading-7 text-white/70">{config.projects.sectionSummary}</p>
              ) : null}
              <ProjectGrid projects={repositoryProjects} />
            </Section>
          ) : null}

          <footer className="cv-section mt-4 flex items-center text-xs text-white/50">
            <span>Updated {new Date().toLocaleDateString()}</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
