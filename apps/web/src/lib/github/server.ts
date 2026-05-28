export type GitHubProfile = {
  login: string;
  name: string | null;
  avatarUrl: string;
  htmlUrl: string;
  bio: string | null;
};

export type GitHubProject = {
  name: string;
  displayName: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  updatedAt: string;
};

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim().length ? v.trim() : undefined;
}

export async function loadGitHubProfile(username: string): Promise<GitHubProfile> {
  const token = env("GITHUB_TOKEN");

  const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "m1rw-platform",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    next: { revalidate: 60 * 60 }
  });

  if (!res.ok) {
    return {
      login: username,
      name: username,
      avatarUrl: "https://avatars.githubusercontent.com/u/0?v=4",
      htmlUrl: `https://github.com/${username}`,
      bio: null
    };
  }

  const data = (await res.json()) as {
    login: string;
    name: string | null;
    avatar_url: string;
    html_url: string;
    bio: string | null;
  };

  return {
    login: data.login,
    name: data.name,
    avatarUrl: data.avatar_url,
    htmlUrl: data.html_url,
    bio: data.bio
  };
}

type GitHubRepoApiResponse = {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
};

type FeaturedRepository = {
  name: string;
  label?: string;
  description?: string;
  homepage?: string;
};

export async function loadGitHubProjects(
  username: string,
  featuredRepositories: FeaturedRepository[] = [],
  displayCount = 6
): Promise<GitHubProject[]> {
  const token = env("GITHUB_TOKEN");

  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?type=public&sort=updated&per_page=100`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "m1rw-platform",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      next: { revalidate: 60 * 15 }
    }
  );

  if (!res.ok) {
    return featuredRepositories.slice(0, displayCount).map((project) => ({
      name: project.name,
      displayName: project.label ?? project.name,
      description: project.description ?? null,
      htmlUrl: `https://github.com/${username}/${project.name}`,
      homepage: project.homepage ?? null,
      language: null,
      stars: 0,
      forks: 0,
      updatedAt: new Date(0).toISOString()
    }));
  }

  const repos = (await res.json()) as GitHubRepoApiResponse[];
  const repoMap = new Map(repos.map((repo) => [repo.name.toLowerCase(), repo]));
  const seen = new Set<string>();
  const ordered: GitHubProject[] = [];

  const pushRepo = (repo: GitHubRepoApiResponse | undefined, override?: FeaturedRepository) => {
    if (!repo) return;
    const key = repo.name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);

    ordered.push({
      name: repo.name,
      displayName: override?.label ?? repo.name,
      description: override?.description ?? repo.description,
      htmlUrl: repo.html_url,
      homepage: override?.homepage ?? repo.homepage,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      updatedAt: repo.updated_at
    });
  };

  if (featuredRepositories.length > 0) {
    for (const featured of featuredRepositories) {
      pushRepo(repoMap.get(featured.name.toLowerCase()), featured);
    }
  }

  for (const repo of repos) {
    pushRepo(repo);
    if (ordered.length >= displayCount) break;
  }

  return ordered.slice(0, displayCount);
}
