// Simple Express backend that analyzes public GitHub repos (quick analysis).
// Optional DEEP mode clones repo and runs `npx cloc` (requires git & node).

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
// Using the official SDK is the best way to handle the API call
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const fs = require('fs/promises');
const os = require('os');
const { exec } = require('child_process');

// ===== Constants & Defaults =====
const PORT = process.env.PORT || 4000;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
// Use a specific, stable model name
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-preview-05-20';

// Max bytes per file snippet
const FILE_SNIPPET_BYTES = 5000;
// Max number of files to fetch
const FILE_FETCH_LIMIT = 5;

// ===== Basic App Setup =====
const app = express();
app.use(cors());
app.use(express.json());

// Optional rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60, // 60 requests/minute
});
app.use(limiter);

// ===== In-memory cache =====
const _cache = new Map();
function getCache(key) {
  const v = _cache.get(key);
  if (!v) return null;
  if (v.exp && v.exp < Date.now()) {
   _cache.delete(key);
    return null;
  }
  return v.data;
}
function setCache(key, data, ttlMs = 1000 * 60 * 60) {
  _cache.set(key, { data, exp: Date.now() + ttlMs });
}

// ===== Helper: GitHub headers =====
function ghHeaders() {
  const headers = { 'User-Agent': 'repo-analyzer' };
  if (GITHUB_TOKEN) headers.Authorization = `token ${GITHUB_TOKEN}`;
  return headers;
}

// ===== Helper: Safe GET with axios =====
async function safeGet(url, opts = {}) {
  try {
    return await axios.get(url, opts);
  } catch (err) {
    if (err.response) {
      throw new Error(`GET ${url} failed with ${err.response.status}: ${JSON.stringify(err.response.data)}`);
    }
    throw err;
  }
}

// ===== Helper: Parse GitHub repo URL =====
function parseRepoUrl(url) {
  try {
    const m = url.match(/github\.com\/([^/]+)\/([^/]+)(?:\.git|\/|$)/i);
    if (!m) return null;
    return { owner: m[1], repo: m[2].replace(/\.git$/, '') };
  } catch {
    return null;
  }
}

// ===== SSE send =====
function sseSend(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

// ===== Build LLM prompt =====
function buildLLMPrompt(meta, readmeText, files) {
  let prompt = `Analyze the following GitHub repository:\n\nMetadata:\n${JSON.stringify(meta, null, 2)}\n\n`;
  if (readmeText) {
    prompt += `README (truncated):\n${readmeText}\n\n`;
  }
  if (files && files.length) {
    prompt += `Code snippets:\n`;
    files.forEach(f => {
      prompt += `\n--- File: ${f.path} ---\n${f.snippet}\n`;
    });
  }
  prompt += `\nProvide a concise summary of the repository, key features, and technologies used.`;
  return prompt;
}

// ===== Gemini API Call (using the official SDK for reliability) =====
async function callGemini(promptText) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured in environment');
  }
  
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    
    const result = await model.generateContent(promptText);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error('Gemini API call failed:', err.message);
    throw new Error(`LLM summarization failed: ${err.message}`);
  }
}

// ===== Fetch raw file snippet =====
async function fetchRawFile(owner, repo, branch, path) {
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
  const res = await safeGet(rawUrl, {
    responseType: 'arraybuffer',
    headers: ghHeaders(),
    timeout: 20000,
  });
  let buf = Buffer.from(res.data);
  if (buf.length > FILE_SNIPPET_BYTES) buf = buf.slice(0, FILE_SNIPPET_BYTES);
  return buf.toString('utf8');
}

// ===== Project Health Score Calculation =====
function calculateHealthScore(repoData, commitActivity, contributors) {
  // Define weights for different metrics
  const WEIGHTS = {
    STARS: 0.3,
    FORKS: 0.2,
    COMMITS: 0.3,
    CONTRIBUTORS: 0.2
  };

  // Normalize metrics to a 0-1 range
  // Stars: Cap at a very high number (e.g., 5000) for a meaningful scale
  const starScore = Math.min(repoData.stargazers_count, 5000) / 5000;
  // Forks: Cap at a lower number (e.g., 500) as they are less common than stars
  const forkScore = Math.min(repoData.forks_count, 500) / 500;
  // Commits: Use total commits over the last year
  const totalCommits = (commitActivity || []).reduce((sum, week) => sum + week.total, 0);
  const commitScore = Math.min(totalCommits, 1000) / 1000;
  // Contributors: Use the number of unique contributors
  const contributorScore = Math.min((contributors || []).length, 50) / 50;
  
  // Calculate the weighted composite score
  const finalScore = (
    (starScore * WEIGHTS.STARS) +
    (forkScore * WEIGHTS.FORKS) +
    (commitScore * WEIGHTS.COMMITS) +
    (contributorScore * WEIGHTS.CONTRIBUTORS)
  ) * 100; // Scale to 1-100
  
  return Math.round(finalScore);
}

// ===== Repo Analyzer =====
async function analyzeRepoNonCloning(owner, repo, sendProgress) {
  const base = 'https://api.github.com';

  sendProgress('meta', 'Fetching repository metadata');
  const repoRes = (await safeGet(`${base}/repos/${owner}/${repo}`, { headers: ghHeaders() })).data;

  sendProgress('languages', 'Fetching languages');
  const languages = (await safeGet(`${base}/repos/${owner}/${repo}/languages`, { headers: ghHeaders() })).data;

  sendProgress('contributors', 'Fetching contributors');
  let contributors = [];
  try {
    const cRes = (await safeGet(`${base}/repos/${owner}/${repo}/contributors`, { headers: ghHeaders(), params: { per_page: 50 } })).data;
    contributors = cRes.map(c => ({ login: c.login, contributions: c.contributions, avatar_url: c.avatar_url }));
  } catch {}

  sendProgress('commits', 'Fetching commit activity');
  let commitActivity = [];
  try {
    const caRes = (await safeGet(`${base}/repos/${owner}/${repo}/stats/commit_activity`, { headers: ghHeaders(), timeout: 30000 })).data;
    if (Array.isArray(caRes)) commitActivity = caRes.map(w => ({ week: w.week, total: w.total }));
  } catch {}

  sendProgress('readme', 'Fetching README');
  let readmeText = '';
  try {
    const readmeRes = (await safeGet(`${base}/repos/${owner}/${repo}/readme`, { headers: ghHeaders() })).data;
    if (readmeRes && readmeRes.download_url) {
      const raw = await safeGet(readmeRes.download_url, { headers: ghHeaders() });
      readmeText = raw.data.toString().slice(0, 50000);
    }
  } catch {}

  sendProgress('tree', 'Listing repository file tree');
  let selectedFiles = [];
  try {
    const defaultBranch = repoRes.default_branch || 'main';
    const branchRes = (await safeGet(`${base}/repos/${owner}/${repo}/git/refs/heads/${defaultBranch}`, { headers: ghHeaders() })).data;
    const commitSha = branchRes.object?.sha;
    if (commitSha) {
      const commitRes = (await safeGet(`${base}/repos/${owner}/${repo}/git/commits/${commitSha}`, { headers: ghHeaders() })).data;
      const treeSha = commitRes.tree?.sha;
      if (treeSha) {
        const treeRes = (await safeGet(`${base}/repos/${owner}/${repo}/git/trees/${treeSha}`, { headers: ghHeaders(), params: { recursive: 1 }, timeout: 30000 })).data;
        const files = (treeRes.tree || []).filter(i => i.type === 'blob');
        const priority = p => (/^src\//.test(p) ? 0 : /^lib\//.test(p) ? 1 : /index\./.test(p) ? 2 : /main\./.test(p) ? 3 : /^app\./.test(p) ? 4 : 10);
        files.sort((a, b) => priority(a.path) - priority(b.path));
        const selected = [];
        for (const f of files) {
          if (selected.length >= FILE_FETCH_LIMIT) break;
          if (/\.(png|jpg|jpeg|gif|ico|svg|woff|ttf|pdf|zip|exe)$/i.test(f.path)) continue;
          selected.push(f);
        }
        for (const f of selected) {
          try {
            const snippet = await fetchRawFile(owner, repo, defaultBranch, f.path);
            selectedFiles.push({ path: f.path, snippet });
          } catch {}
        }
      }
    }
  } catch {}

  // Calculate the Project Health Score
  const healthScore = calculateHealthScore(repoRes, commitActivity, contributors);

  const quickSummary = {
    full_name: repoRes.full_name,
    description: repoRes.description,
    html_url: repoRes.html_url,
    stars: repoRes.stargazers_count,
    forks: repoRes.forks_count,
    open_issues: repoRes.open_issues_count,
    license: repoRes.license ? (repoRes.license.spdx_id || repoRes.license.name) : null,
    topics: repoRes.topics || [],
    default_branch: repoRes.default_branch,
    healthScore, // Add the health score to the summary object
  };

  sendProgress('llm', 'Preparing prompt for LLM summarization');
  const prompt = buildLLMPrompt(quickSummary, readmeText, selectedFiles);
  let llmSummary = null;
  try {
    llmSummary = await callGemini(prompt);
  } catch (err) {
    llmSummary = `LLM summarization failed: ${err.message}`;
  }

  return {
    meta: quickSummary,
    languages,
    contributors,
    commitActivity,
    files: selectedFiles.map(f => ({ path: f.path, snippet: f.snippet.slice(0, 2000) })),
    llmSummary,
  };
}

// ===== SSE API Route =====
app.get('/api/analyze-stream', async (req, res) => {
  const { repoUrl, llm } = req.query;
  if (!repoUrl) return res.status(400).json({ error: 'repoUrl query param required' });

  const cacheKey = `${repoUrl}::llm=${llm ? '1' : '0'}`;
  const cached = getCache(cacheKey);
  if (cached) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    sseSend(res, 'progress', { message: 'Serving cached analysis' });
    sseSend(res, 'result', cached);
    return res.end();
  }

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  function sendProgressEvent(msg) {
    sseSend(res, 'progress', { message: msg });
  }

  let parsed;
  try {
    parsed = parseRepoUrl(repoUrl);
    if (!parsed) {
      sseSend(res, 'error', { error: 'Invalid GitHub repo URL' });
      return res.end();
    }
  } catch {
    sseSend(res, 'error', { error: 'Failed to parse repo url' });
    return res.end();
  }

  try {
    sendProgressEvent('Starting analysis pipeline');
    const result = await analyzeRepoNonCloning(parsed.owner, parsed.repo, sendProgressEvent);
    setCache(cacheKey, result);
    sseSend(res, 'result', result);
    sseSend(res, 'done', { message: 'Analysis complete' });
    res.end();
  } catch (err) {
    console.error('Analysis failed', err);
    sseSend(res, 'error', { error: err.message || 'Analysis failed' });
    res.end();
  }
});

// ===== Root =====
app.get('/', (req, res) => res.send('Repo analyzer backend running'));

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`Repo analyzer listening on ${PORT}`);
});
