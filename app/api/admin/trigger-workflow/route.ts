import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { secret, departement, max } = await req.json();

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const githubToken = process.env.GITHUB_ACTIONS_TOKEN;
  const githubRepo = process.env.GITHUB_REPO; // e.g. "username/repo"

  if (!githubToken || !githubRepo) {
    return NextResponse.json(
      { error: "GITHUB_ACTIONS_TOKEN ou GITHUB_REPO non configuré" },
      { status: 500 }
    );
  }

  const res = await fetch(
    `https://api.github.com/repos/${githubRepo}/actions/workflows/prospect.yml/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ref: "main",
        inputs: {
          departement: departement || "",
          max: String(max || 50),
        },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: `GitHub API error ${res.status}: ${text}` },
      { status: 500 }
    );
  }

  // GitHub returns 204 No Content on success
  return NextResponse.json({
    ok: true,
    logsUrl: `https://github.com/${githubRepo}/actions/workflows/prospect.yml`,
  });
}
