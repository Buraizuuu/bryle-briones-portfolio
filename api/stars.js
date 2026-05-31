export default async function handler(req, res) {
  const { repo } = req.query;
  if (!repo || !/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repo)) {
    return res.status(400).json({ error: 'invalid repo' });
  }

  const response = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  const data = await response.json();
  if (typeof data.stargazers_count !== 'number') {
    return res.status(502).json({ error: 'upstream error' });
  }

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');
  res.status(200).json({ stars: data.stargazers_count });
}
