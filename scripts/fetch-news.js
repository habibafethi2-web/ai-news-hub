#!/usr/bin/env node
/**
 * AI News Hub — Daily News Fetcher v4 (Arabic)
 * Fetches 200+ global news items with Arabic descriptions
 * Runs via GitHub Actions every 3 hours
 */

const fs = require('fs');
const path = require('path');

const API_KEY = process.env.TAVILY_API_KEY || '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';

const QUERIES = [
    // AI NEWS بالعربية
    { query: "latest artificial intelligence breakthroughs AI 2026", category: "ai-news", section: "aiNewsGrid", max: 10 },
    { query: "new AI tools free 2026 product hunt AI tools", category: "ai-news", section: "aiNewsGrid", max: 10 },
    { query: "AI coding tools vibe coding Cursor Windsurf Copilot 2026", category: "ai-news", section: "aiNewsGrid", max: 10 },
    { query: "OpenAI GPT Claude Gemini Anthropic model release 2026", category: "ai-news", section: "aiNewsGrid", max: 8 },
    { query: "AGI artificial general intelligence news 2026", category: "ai-news", section: "aiNewsGrid", max: 8 },
    { query: "AI robotics humanoid robot news 2026", category: "ai-news", section: "aiNewsGrid", max: 8 },
    { query: "AI healthcare drug discovery news 2026", category: "ai-news", section: "aiNewsGrid", max: 8 },
    { query: "Stanford HAI AI Index Report 2026", category: "ai-news", section: "aiNewsGrid", max: 8 },
    { query: "AI regulation policy laws 2026 EU AI Act", category: "ai-news", section: "aiNewsGrid", max: 8 },
    { query: "AI startups funding investment 2026", category: "ai-news", section: "aiNewsGrid", max: 8 },

    // COMPANIES
    { query: "OpenAI latest news 2026", category: "companies", section: "companiesGrid", max: 8 },
    { query: "Google DeepMind Gemini AI news 2026", category: "companies", section: "companiesGrid", max: 8 },
    { query: "Microsoft Copilot Azure AI news 2026", category: "companies", section: "companiesGrid", max: 8 },
    { query: "Meta AI Facebook Instagram WhatsApp news 2026", category: "companies", section: "companiesGrid", max: 8 },
    { query: "Apple AI intelligence Siri news 2026", category: "companies", section: "companiesGrid", max: 8 },
    { query: "Amazon AWS Alexa AI news 2026", category: "companies", section: "companiesGrid", max: 8 },
    { query: "NVIDIA GPU AI chips Rubin news 2026", category: "companies", section: "companiesGrid", max: 8 },
    { query: "Anthropic Claude news 2026", category: "companies", section: "companiesGrid", max: 8 },
    { query: "SpaceX Tesla news 2026", category: "companies", section: "companiesGrid", max: 8 },
    { query: "Xiaomi Samsung Huawei tech news 2026", category: "companies", section: "companiesGrid", max: 8 },

    // PEOPLE
    { query: "Elon Musk news 2026 SpaceX IPO", category: "people", section: "peopleGrid", max: 8 },
    { query: "Sam Altman OpenAI news 2026", category: "people", section: "peopleGrid", max: 8 },
    { query: "Mark Zuckerberg Meta news 2026", category: "people", section: "peopleGrid", max: 8 },
    { query: "Jeff Bezos Amazon news 2026", category: "people", section: "peopleGrid", max: 8 },
    { query: "Bill Gates Warren Buffett news 2026", category: "people", section: "peopleGrid", max: 8 },
    { query: "Tim Cook Sundar Pichai Satya Nadella news 2026", category: "people", section: "peopleGrid", max: 8 },
    { query: "Hollywood celebrities famous actors news 2026", category: "people", section: "peopleGrid", max: 8 },
    { query: "Taylor Swift Beyoncé music news 2026", category: "people", section: "peopleGrid", max: 8 },

    // MOVIES
    { query: "latest movies 2026 box office top grossing", category: "movies", section: "moviesGrid", max: 10 },
    { query: "Hollywood movies news 2026", category: "movies", section: "moviesGrid", max: 8 },
    { query: "Marvel DC superhero movies 2026", category: "movies", section: "moviesGrid", max: 8 },
    { query: "Netflix streaming series 2026", category: "movies", section: "moviesGrid", max: 10 },
    { query: "Cannes film festival 2026", category: "movies", section: "moviesGrid", max: 8 },
    { query: "Disney Pixar DreamWorks animation 2026", category: "movies", section: "moviesGrid", max: 8 },
    { query: "Oscars Academy Awards 2026", category: "movies", section: "moviesGrid", max: 8 }
];

const ARABIC_PREFIXES = {
    'ai-news': '🧠 أخبار الذكاء الاصطناعي: ',
    'companies': '🏢 أخبار الشركات التقنية: ',
    'people': '👤 أخبار المشاهير والشخصيات: ',
    'movies': '🎬 أخبار السينما والأفلام: '
};

function toArabicSummary(title, content, category) {
    if (!content && !title) return 'خبر عاجل من مصادرنا الموثوقة. اضغط على "اقرأ المزيد" للمقال الأصلي.';

    let text = `${title}. ${content || ''}`;
    text = text.replace(/<[^>]*>/g, '').replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();

    // Remove marketing boilerplate
    const boilerplate = [
        /Learn more[^.]*\./gi, /Sign up[^.]*\./gi, /Subscribe[^.]*\./gi,
        /Read more[^.]*\./gi, /Click here[^.]*\./gi, /Register now[^.]*\./gi,
        /Watch now[^.]*\./gi, /Don't miss[^.]*\./gi, /For more[^.]*\./gi,
        /Follow us[^.]*\./gi, /Get this delivered[^.]*\./gi,
        /Here's how[^.]*\./gi, /Find out even more[^.]*\./gi,
        /Advertisement[^.]*\./gi, /By .*? • /g,
        /Published[^.]*\./gi, /This article[^.]*\./gi,
        /All rights reserved[^.]*\./gi, /Copyright[^.]*\./gi
    ];
    boilerplate.forEach(re => { text = text.replace(re, ''); });
    text = text.trim();

    // If text is mostly English, wrap with Arabic context
    // Preserve all numbers, names, dates - these are universal
    const prefix = ARABIC_PREFIXES[category] || '📰 ';
    
    // Wrap in Arabic reporting style
    let arabicText = prefix + text;
    
    // Add Arabic fluff only if text is long enough
    if (arabicText.length > 300) {
        // Keep the full content - it has all the important info
        // Just cap reasonably
        const maxLen = 750;
        if (arabicText.length > maxLen) {
            const cut = arabicText.lastIndexOf('.', maxLen);
            arabicText = arabicText.substring(0, cut > maxLen * 0.6 ? cut + 1 : maxLen) + ' للمزيد اضغط على اقرأ المزيد.';
        }
    }

    return arabicText || 'خبر عاجل من مصادرنا الموثوقة، اضغط على "اقرأ المزيد" للمقال الأصلي.';
}

async function searchTavily(query, maxResults = 10) {
    try {
        const resp = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
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
            console.error(`❌ Tavily error ${resp.status} for "${query.substring(0, 40)}..."`);
            return [];
        }
        const data = await resp.json();
        return data.results || [];
    } catch (e) {
        console.error(`❌ Network error: ${e.message}`);
        return [];
    }
}

async function main() {
    console.log('🤖 AI News Hub v4 — Arabic News Fetcher');
    console.log(`📅 ${new Date().toISOString()}`);
    console.log(`🔍 Total queries: ${QUERIES.length}\n`);

    const allNews = [];
    const seenUrls = new Set();
    const now = new Date().toISOString();

    for (const q of QUERIES) {
        console.log(`🔍 [${q.category}] ${q.query.substring(0, 60)}...`);
        try {
            const results = await searchTavily(q.query, q.max || 8);
            let added = 0;

            for (const r of results) {
                if (!r.url || seenUrls.has(r.url)) continue;
                if (!r.title || r.title.length < 10) continue;
                seenUrls.add(r.url);

                const desc = toArabicSummary(r.title, r.content || '', q.category);

                allNews.push({
                    title: r.title.replace(/<[^>]*>/g, '').trim(),
                    description: desc,
                    url: r.url,
                    source: r.source || 'مصدر موثوق',
                    category: q.category,
                    section: q.section,
                    published: r.published_date || now
                });
                added++;
            }
            console.log(`   ✅ Added ${added}`);
        } catch (e) {
            console.error(`   ❌ Error: ${e.message}`);
        }
        await new Promise(r => setTimeout(r, 500));
    }

    // Sort newest first
    allNews.sort((a, b) => new Date(b.published) - new Date(a.published));

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

    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    fs.writeFileSync(path.join(dataDir, 'news.json'), JSON.stringify(output, null, 2), 'utf8');

    console.log(`\n✅ Done! ${allNews.length} news items saved.`);
    console.log(`   🧠 AI: ${output.stats.aiNews}`);
    console.log(`   🏢 Companies: ${output.stats.companies}`);
    console.log(`   👤 People: ${output.stats.people}`);
    console.log(`   🎬 Movies: ${output.stats.movies}`);
}

main().catch(console.error);