#!/usr/bin/env node
/**
 * AI News Hub — Daily News Fetcher
 * Runs via GitHub Actions every day to fetch & save fresh news
 */

const fs = require('fs');
const path = require('path');

const API_KEY = process.env.TAVILY_API_KEY || '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';

const QUERIES = [
    {
        query: "latest artificial intelligence news breakthroughs 2026",
        category: "ai-news",
        section: "aiNewsGrid"
    },
    {
        query: "OpenAI Google DeepMind Meta AI Microsoft Anthropic latest news May 2026",
        category: "companies",
        section: "companiesGrid",
        max: 10
    },
    {
        query: "OpenAI latest news today 2026",
        category: "companies",
        section: "companiesGrid"
    },
    {
        query: "Google AI Gemini latest news 2026",
        category: "companies",
        section: "companiesGrid"
    },
    {
        query: "AI coding tools vibe coding Cursor Windsurf Copilot Claude Code 2026",
        category: "ai-news",
        section: "aiNewsGrid"
    },
    {
        query: "Elon Musk news today 2026",
        category: "people",
        section: "peopleGrid"
    },
    {
        query: "Sam Altman news today 2026",
        category: "people",
        section: "peopleGrid"
    },
    {
        query: "world famous celebrities news today 2026",
        category: "people",
        section: "peopleGrid"
    },
    {
        query: "tech billionaires news today May 2026",
        category: "people",
        section: "peopleGrid"
    },
    {
        query: "latest movies 2026 new releases box office",
        category: "movies",
        section: "moviesGrid"
    },
    {
        query: "Hollywood movies news today May 2026",
        category: "movies",
        section: "moviesGrid"
    },
    {
        query: "best new AI tools free 2026 launch",
        category: "ai-news",
        section: "aiNewsGrid"
    }
];

async function searchTavily(query, maxResults = 8) {
    const resp = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            api_key: API_KEY,
            query: query,
            search_depth: 'advanced',
            max_results: maxResults,
            include_answer: false,
            include_raw_content: false
        })
    });

    if (!resp.ok) {
        console.error(`❌ Tavily error for "${query}": ${resp.status}`);
        return [];
    }

    const data = await resp.json();
    return data.results || [];
}

async function main() {
    console.log('🤖 AI News Hub — Daily News Fetcher');
    console.log(`📅 ${new Date().toISOString()}\n`);

    const allNews = [];
    const seenUrls = new Set();
    const now = new Date().toISOString();

    for (const q of QUERIES) {
        console.log(`🔍 Searching: ${q.query}`);
        try {
            const results = await searchTavily(q.query, q.max || 8);
            let added = 0;

            for (const r of results) {
                if (!r.url || seenUrls.has(r.url)) continue;
                seenUrls.add(r.url);

                allNews.push({
                    title: r.title || 'خبر',
                    description: r.content 
                        ? r.content.replace(/<[^>]*>/g, '').substring(0, 250) + '...'
                        : 'اقرأ المزيد على المصدر الأصلي',
                    url: r.url,
                    source: r.source || 'مصدر موثوق',
                    category: q.category,
                    section: q.section,
                    published: r.published_date || now
                });
                added++;
            }

            console.log(`   ✅ Added ${added} news items`);
        } catch (e) {
            console.error(`   ❌ Error: ${e.message}`);
        }

        // Small delay between requests
        await new Promise(r => setTimeout(r, 500));
    }

    // Shuffle lightly within sections to keep it fresh
    const sections = ['aiNewsGrid', 'companiesGrid', 'peopleGrid', 'moviesGrid'];
    const output = {
        updatedAt: now,
        date: new Date().toLocaleDateString('ar-TN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        }),
        news: allNews,
        stats: {
            total: allNews.length,
            aiNews: allNews.filter(n => n.section === 'aiNewsGrid').length,
            companies: allNews.filter(n => n.section === 'companiesGrid').length,
            people: allNews.filter(n => n.section === 'peopleGrid').length,
            movies: allNews.filter(n => n.section === 'moviesGrid').length
        }
    };

    // Write to data directory
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(dataDir, 'news.json'),
        JSON.stringify(output, null, 2),
        'utf8'
    );

    console.log(`\n✅ Done! ${allNews.length} news items saved.`);
    console.log(`   🧠 AI: ${output.stats.aiNews}`);
    console.log(`   🏢 Companies: ${output.stats.companies}`);
    console.log(`   👤 People: ${output.stats.people}`);
    console.log(`   🎬 Movies: ${output.stats.movies}`);
    console.log(`📁 Saved to data/news.json`);
}

main().catch(console.error);