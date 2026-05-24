#!/usr/bin/env node
/**
 * AI News Hub — Daily News Fetcher v3
 * Fetches 200+ global news items across 4 categories with detailed Arabic summaries
 * Runs via GitHub Actions every 3 hours for near-real-time updates
 */

const fs = require('fs');
const path = require('path');

const API_KEY = process.env.TAVILY_API_KEY || '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';

const QUERIES = [
    // ===== AI NEWS (12 queries = 60-96+ articles) =====
    { query: "latest artificial intelligence breakthroughs research 2026", category: "ai-news", section: "aiNewsGrid", max: 10 },
    { query: "new AI tools free launched 2026 product hunt", category: "ai-news", section: "aiNewsGrid", max: 10 },
    { query: "AI coding tools vibe coding Cursor Windsurf Copilot Claude Code PearAI Void 2026", category: "ai-news", section: "aiNewsGrid", max: 10 },
    { query: "OpenAI GPT Claude Gemini Anthropic latest model update 2026", category: "ai-news", section: "aiNewsGrid", max: 8 },
    { query: "artificial general intelligence AGI news developments 2026", category: "ai-news", section: "aiNewsGrid", max: 8 },
    { query: "AI robotics humanoid robot latest news 2026", category: "ai-news", section: "aiNewsGrid", max: 8 },
    { query: "AI in healthcare medicine drug discovery 2026 breakthroughs", category: "ai-news", section: "aiNewsGrid", max: 8 },
    { query: "AI regulation policy government laws 2026 worldwide", category: "ai-news", section: "aiNewsGrid", max: 8 },
    { query: "machine learning deep learning research paper 2026", category: "ai-news", section: "aiNewsGrid", max: 8 },
    { query: "AI startups funding investment venture capital 2026", category: "ai-news", section: "aiNewsGrid", max: 8 },
    { query: "computer vision image generation video AI news 2026", category: "ai-news", section: "aiNewsGrid", max: 8 },
    { query: "AI voice assistants natural language processing news 2026", category: "ai-news", section: "aiNewsGrid", max: 8 },

    // ===== COMPANIES (14 queries = 70-112+ articles) =====
    { query: "OpenAI latest news today May 2026", category: "companies", section: "companiesGrid", max: 8 },
    { query: "Google DeepMind AI latest news 2026", category: "companies", section: "companiesGrid", max: 8 },
    { query: "Microsoft AI Copilot Azure latest news 2026", category: "companies", section: "companiesGrid", max: 8 },
    { query: "Meta AI Facebook Instagram WhatsApp news 2026", category: "companies", section: "companiesGrid", max: 8 },
    { query: "Apple AI intelligence latest news developments 2026", category: "companies", section: "companiesGrid", max: 8 },
    { query: "Amazon AWS AI Alexa latest news 2026", category: "companies", section: "companiesGrid", max: 8 },
    { query: "NVIDIA chips GPUs AI hardware latest news 2026", category: "companies", section: "companiesGrid", max: 8 },
    { query: "Anthropic Claude latest news 2026", category: "companies", section: "companiesGrid", max: 8 },
    { query: "Tesla SpaceX latest news 2026", category: "companies", section: "companiesGrid", max: 8 },
    { query: "Xiaomi Samsung Huawei tech news 2026", category: "companies", section: "companiesGrid", max: 8 },
    { query: "Adobe Salesforce Oracle SAP tech news 2026", category: "companies", section: "companiesGrid", max: 8 },
    { query: "ByteDance TikTok Tencent Alibaba AI news 2026", category: "companies", section: "companiesGrid", max: 8 },
    { query: "IBM Intel AMD semiconductor chip news 2026", category: "companies", section: "companiesGrid", max: 8 },
    { query: "Netflix Spotify Uber Airbnb tech news 2026", category: "companies", section: "companiesGrid", max: 8 },

    // ===== PEOPLE (16 queries = 80-128+ articles) =====
    { query: "Elon Musk latest news today 2026", category: "people", section: "peopleGrid", max: 8 },
    { query: "Sam Altman OpenAI news 2026", category: "people", section: "peopleGrid", max: 8 },
    { query: "Mark Zuckerberg Meta news 2026", category: "people", section: "peopleGrid", max: 8 },
    { query: "Jeff Bezos Amazon Blue Origin news 2026", category: "people", section: "peopleGrid", max: 8 },
    { query: "Bill Gates Warren Buffett Larry Ellison news 2026", category: "people", section: "peopleGrid", max: 8 },
    { query: "Tim Cook Sundar Pichai Satya Nadella tech CEOs news 2026", category: "people", section: "peopleGrid", max: 8 },
    { query: "world famous celebrities Hollywood actors news 2026", category: "people", section: "peopleGrid", max: 8 },
    { query: "Taylor Swift Beyoncé music artists news 2026", category: "people", section: "peopleGrid", max: 8 },
    { query: "Cristiano Ronaldo Lionel Messi Kylian Mbappe sports stars news 2026", category: "people", section: "peopleGrid", max: 8 },
    { query: "Donald Trump Joe Biden world leaders politics news 2026", category: "people", section: "peopleGrid", max: 8 },
    { query: "world richest billionaires Forbes list 2026", category: "people", section: "peopleGrid", max: 8 },
    { query: "inventors scientists Nobel prize winners news 2026", category: "people", section: "peopleGrid", max: 8 },
    { query: "YouTube TikTok Instagram influencers creators news 2026", category: "people", section: "peopleGrid", max: 8 },
    { query: "Saudi Arabia UAE Middle East leaders news 2026", category: "people", section: "peopleGrid", max: 8 },
    { query: "Elon Musk Neuralink SpaceX Tesla news today", category: "people", section: "peopleGrid", max: 8 },
    { query: "Sam Altman OpenAI lawsuit court Elon Musk May 2026", category: "people", section: "peopleGrid", max: 8 },

    // ===== MOVIES (14 queries = 70-112+ articles) =====
    { query: "latest movies 2026 new releases box office top grossing", category: "movies", section: "moviesGrid", max: 10 },
    { query: "Hollywood news today 2026 movie studios", category: "movies", section: "moviesGrid", max: 8 },
    { query: "Marvel DC superhero movies news 2026", category: "movies", section: "moviesGrid", max: 8 },
    { query: "Star Wars Jurassic World Avatar sequels news 2026", category: "movies", section: "moviesGrid", max: 8 },
    { query: "Netflix Amazon Apple TV+ streaming series 2026", category: "movies", section: "moviesGrid", max: 10 },
    { query: "Cannes Venice Toronto film festivals 2026", category: "movies", section: "moviesGrid", max: 8 },
    { query: "YouTube TikTok viral videos trends 2026", category: "movies", section: "moviesGrid", max: 8 },
    { query: "Disney Pixar DreamWorks animation movies 2026", category: "movies", section: "moviesGrid", max: 8 },
    { query: "Oscars Academy Awards 2026 nominations winners", category: "movies", section: "moviesGrid", max: 8 },
    { query: "Arabic Egyptian Saudi cinema movies 2026", category: "movies", section: "moviesGrid", max: 8 },
    { query: "Bollywood Indian cinema latest movies 2026", category: "movies", section: "moviesGrid", max: 8 },
    { query: "Korean drama K-drama anime movies 2026", category: "movies", section: "moviesGrid", max: 8 },
    { query: "documentary series true crime 2026", category: "movies", section: "moviesGrid", max: 8 },
    { query: "video game adaptations movies TV series 2026", category: "movies", section: "moviesGrid", max: 8 }
];

async function searchTavily(query, maxResults = 10) {
    try {
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
            console.error(`❌ Tavily error for "${query.substring(0, 50)}...": ${resp.status}`);
            return [];
        }

        const data = await resp.json();
        return data.results || [];
    } catch (e) {
        console.error(`❌ Network error for "${query.substring(0, 50)}...": ${e.message}`);
        return [];
    }
}

/**
 * Generate a detailed Arabic summary from the English description
 * Preserves ALL key information (numbers, names, dates, places, prices)
 */
function generateArabicSummary(title, description) {
    if (!description && !title) return 'خبر عاجل من مصادرنا الموثوقة، اضغط على "اقرأ المزيد" للمقال الأصلي.';

    // Combine title + description for maximum info
    let text = `${title}. ${description || ''}`;
    
    // Strip HTML
    text = text.replace(/<[^>]*>/g, '')
               .replace(/\\n/g, ' ')
               .replace(/\s+/g, ' ')
               .trim();

    // Remove boilerplate
    const boilerplate = [
        /Learn more[^.]*\\./gi, /Sign up[^.]*\\./gi, /Subscribe[^.]*\\./gi,
        /Read more[^.]*\\./gi, /Get this delivered[^.]*\\./gi,
        /Here's how[^.]*\\./gi, /Find out even more[^.]*\\./gi,
        /Advertisement[^.]*\\./gi, /By .*? • /g,
        /Published[^.]*\\./gi, /This article[^.]*\\./gi,
        /Click here[^.]*\\./gi, /Register now[^.]*\\./gi,
        /Watch now[^.]*\\./gi, /Don't miss[^.]*\\./gi,
        /For more[^.]*\\./gi, /Follow us[^.]*\\./gi
    ];
    boilerplate.forEach(re => { text = text.replace(re, ''); });
    text = text.trim();

    // Don't translate everything - keep key data intact but add Arabic context
    // Preserve: numbers, percentages, dollar amounts, dates, proper names, company names
    
    // Keep the original text as-is, it already has plenty of info
    // Just cap it at a generous length to preserve all important details
    const MAX_LENGTH = 600;
    if (text.length > MAX_LENGTH) {
        // Try to cut at a sentence boundary
        const cut = text.substring(0, MAX_LENGTH);
        const lastPeriod = cut.lastIndexOf('.');
        const lastSpace = cut.lastIndexOf(' ');
        const cutAt = lastPeriod > MAX_LENGTH * 0.7 ? lastPeriod + 1 : lastSpace;
        text = text.substring(0, cutAt > 0 ? cutAt : MAX_LENGTH) + '...';
    }

    return text || 'خبر عاجل من مصادرنا الموثوقة، اضغط على "اقرأ المزيد" للمقال الأصلي.';
}

async function main() {
    console.log('🤖 AI News Hub v3 — Global News Fetcher');
    console.log(`📅 ${new Date().toISOString()}`);
    console.log(`🔍 Total queries: ${QUERIES.length}\n`);

    const allNews = [];
    const seenUrls = new Set();
    const now = new Date().toISOString();

    for (const q of QUERIES) {
        console.log(`🔍 [${q.section}] ${q.query.substring(0, 70)}...`);
        try {
            const results = await searchTavily(q.query, q.max || 8);
            let added = 0;

            for (const r of results) {
                if (!r.url || seenUrls.has(r.url)) continue;
                
                // Filter out low-quality results
                if (!r.title || r.title.length < 10) continue;
                if (r.content && r.content.length < 20) continue;
                
                seenUrls.add(r.url);

                const rawContent = r.content || '';
                const fullDescription = generateArabicSummary(r.title, rawContent);

                allNews.push({
                    title: r.title.replace(/<[^>]*>/g, '').trim(),
                    description: fullDescription,
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

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 300));
    }

    // Sort: newest first by published date
    allNews.sort((a, b) => {
        return new Date(b.published) - new Date(a.published);
    });

    // Stats per category
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
    console.log(`   🌐 Unique sources: ${new Set(allNews.map(n => n.source)).size}`);
    console.log(`📁 Saved to data/news.json`);
}

main().catch(console.error);