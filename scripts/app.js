// ===== AI News Hub - App Logic =====

const API_KEY = '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';

document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('ar-TN', options);
    document.getElementById('year').textContent = now.getFullYear();

    // Load news
    loadNews();

    // Smooth scroll for nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            const target = this.getAttribute('href');
            document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Active nav on scroll
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 200;
        sections.forEach(section => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            if (scrollPos >= top && scrollPos < bottom) {
                const id = section.getAttribute('id');
                document.querySelectorAll('.nav-link').forEach(l => {
                    l.classList.toggle('active', l.getAttribute('href') === '#' + id);
                });
            }
        });
    });
});

async function loadNews() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');

    try {
        // First try to load from local data file
        let newsData = null;
        
        try {
            const resp = await fetch('data/news.json');
            if (resp.ok) {
                newsData = await resp.json();
            }
        } catch(e) {
            console.log('No local data, fetching live...');
        }

        if (!newsData || !newsData.news || newsData.news.length === 0) {
            // Fetch live from API
            newsData = await fetchLiveNews();
        }

        loading.style.display = 'none';
        renderNews(newsData);
        updateStats(newsData);

    } catch (err) {
        console.error('Error loading news:', err);
        loading.style.display = 'none';
        document.getElementById('errorMessage').textContent = 
            'حدث خطأ أثناء تحميل الأخبار. الرجاء المحاولة مرة أخرى.';
        error.classList.remove('hidden');
    }
}

async function fetchLiveNews() {
    const queries = [
        {
            query: "latest artificial intelligence news 2026",
            category: "ai-news",
            section: "aiNewsGrid"
        },
        {
            query: "OpenAI Google Meta Microsoft AI company news May 2026",
            category: "companies",
            section: "companiesGrid"
        },
        {
            query: "celebrity news today famous people",
            category: "people",
            section: "peopleGrid"
        },
        {
            query: "latest movie news 2026 film releases",
            category: "movies",
            section: "moviesGrid"
        }
    ];

    const allNews = [];
    const now = new Date().toISOString();

    for (const q of queries) {
        try {
            const resp = await fetch('https://api.tavily.com/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    api_key: API_KEY,
                    query: q.query,
                    search_depth: 'advanced',
                    max_results: 8,
                    include_answer: false,
                    include_raw_content: false
                })
            });

            if (!resp.ok) continue;
            const data = await resp.json();

            if (data.results) {
                data.results.forEach(r => {
                    allNews.push({
                        title: r.title || 'خبر',
                        description: r.content ? r.content.substring(0, 200) + '...' : 'اقرأ المزيد على المصدر الأصلي',
                        url: r.url,
                        source: r.source || 'مصدر موثوق',
                        category: q.category,
                        section: q.section,
                        published: r.published_date || now
                    });
                });
            }
        } catch(e) {
            console.log(`Error fetching ${q.query}:`, e);
        }
    }

    return { news: allNews, updatedAt: now };
}

function renderNews(data) {
    const grids = {
        aiNewsGrid: document.getElementById('aiNewsGrid'),
        companiesGrid: document.getElementById('companiesGrid'),
        peopleGrid: document.getElementById('peopleGrid'),
        moviesGrid: document.getElementById('moviesGrid')
    };

    // Clear grids
    Object.values(grids).forEach(g => g.innerHTML = '');

    // Group by section
    const grouped = { aiNewsGrid: [], companiesGrid: [], peopleGrid: [], moviesGrid: [] };
    
    data.news.forEach(item => {
        if (grouped[item.section]) {
            grouped[item.section].push(item);
        } else {
            // Fallback: put in aiNewsGrid
            grouped.aiNewsGrid.push(item);
        }
    });

    // Render each section
    Object.keys(grouped).forEach(key => {
        const grid = grids[key];
        const items = grouped[key];
        
        if (items.length === 0) {
            grid.innerHTML = `<div class="news-card" style="grid-column: 1/-1; text-align:center; padding:40px;">
                <p style="color:#8b949e;">لا توجد أخبار حالياً في هذا القسم. سيتم التحديث قريباً.</p>
            </div>`;
            return;
        }

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = `news-card ${item.category || 'ai-news'}`;
            
            const pubDate = item.published ? new Date(item.published).toLocaleDateString('ar-TN', {
                year: 'numeric', month: 'short', day: 'numeric'
            }) : 'اليوم';

            card.innerHTML = `
                <span class="source-tag">${item.source || 'مصدر موثوق'}</span>
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <div class="card-footer">
                    <span>📅 ${pubDate}</span>
                    <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="read-link">
                        اقرأ المزيد ←
                    </a>
                </div>
            `;
            grid.appendChild(card);
        });
    });

    // Update last update time
    const updateTime = data.updatedAt ? new Date(data.updatedAt).toLocaleString('ar-TN') : new Date().toLocaleString('ar-TN');
    document.getElementById('lastUpdate').textContent = updateTime;
}

function updateStats(data) {
    document.getElementById('newsCount').textContent = data.news ? data.news.length : 0;
}

// ===== Sources Data =====
const sources = [
    { icon: '🗞️', name: 'TechCrunch', desc: 'أخبار التقنية والشركات الناشئة' },
    { icon: '📰', name: 'Reuters', desc: 'وكالة الأنباء العالمية' },
    { icon: '🔄', name: 'Reddit', desc: 'مجتمعات r/vibecoding, r/artificial' },
    { icon: '📱', name: 'Product Hunt', desc: 'أحدث المنتجات والأدوات' },
    { icon: '🤖', name: 'المواقع الرسمية', desc: 'OpenAI, Google, Meta, Microsoft' },
    { icon: '🎬', name: 'IMDb & Rotten Tomatoes', desc: 'أخبار الأفلام والمسلسلات' }
];

// Render sources
const sourcesGrid = document.getElementById('sourcesGrid');
if (sourcesGrid) {
    sources.forEach(s => {
        const card = document.createElement('div');
        card.className = 'source-card';
        card.innerHTML = `
            <span class="source-icon">${s.icon}</span>
            <h4>${s.name}</h4>
            <p>${s.desc}</p>
        `;
        sourcesGrid.appendChild(card);
    });
}