// ===== AI News Hub - App Logic =====

// ===== Sources Data =====
const SOURCES = [
    { icon: '🗞️', name: 'TechCrunch', desc: 'أخبار التقنية والشركات الناشئة' },
    { icon: '📰', name: 'Reuters', desc: 'وكالة الأنباء العالمية' },
    { icon: '🔄', name: 'Reddit', desc: 'مجتمعات r/vibecoding, r/artificial' },
    { icon: '📱', name: 'Product Hunt', desc: 'أحدث المنتجات والأدوات' },
    { icon: '📡', name: 'BBC News', desc: 'أخبار عالمية موثوقة' },
    { icon: '🤖', name: 'المواقع الرسمية', desc: 'OpenAI, Google, Meta, Microsoft' },
    { icon: '🎬', name: 'IMDb & Rotten Tomatoes', desc: 'أخبار الأفلام والمسلسلات' },
    { icon: '📊', name: 'The Numbers', desc: 'إحصائيات شباك التذاكر' },
    { icon: '📺', name: 'Variety', desc: 'أخبار الترفيه والسينما' },
    { icon: '📝', name: 'The Verge', desc: 'أخبار التقنية اليومية' },
    { icon: '📈', name: 'CNBC', desc: 'أخبار الأسواق والتقنية' },
    { icon: '🌐', name: 'The Guardian', desc: 'أخبار دولية وتقنية' },
    { icon: '💻', name: 'Computerworld', desc: 'أخبار عالم التقنية' },
    { icon: '🔬', name: 'Stanford HAI', desc: 'أبحاث الذكاء الاصطناعي' },
    { icon: '📘', name: 'Forbes', desc: 'أخبار المليارديرات والشركات' },
    { icon: '📺', name: 'YouTube', desc: 'تحليلات فيديو من خبراء' },
    { icon: '🎯', name: 'Product Hunt', desc: 'أحدث أدوات AI' },
    { icon: '🧪', name: 'Google AI Blog', desc: 'آخر أبحاث Google' },
    { icon: '🆕', name: 'OpenAI News', desc: 'أخبار OpenAI الرسمية' },
    { icon: '📋', name: 'Medium', desc: 'مقالات تحليلية متعمقة' }
];

document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('ar-TN', options);
    document.getElementById('year').textContent = now.getFullYear();

    // Render sources
    renderSources();

    // Load news
    loadNews();

    // ===== Theme Toggle =====
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('ai-news-theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeToggle.textContent = '☀️';
    }

    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        this.textContent = isLight ? '☀️' : '🌙';
        localStorage.setItem('ai-news-theme', isLight ? 'light' : 'dark');
    });

    // ===== Smooth scroll for nav =====
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            const target = this.getAttribute('href');
            const el = document.querySelector(target);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ===== Active nav on scroll =====
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

        // Scroll to top button
        const scrollBtn = document.getElementById('scrollToTop');
        if (window.scrollY > 400) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });

    // ===== Scroll to top =====
    document.getElementById('scrollToTop').addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ===== Filter buttons =====
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.dataset.filter;
            filterNews(filter);
        });
    });

    // ===== Comments System =====
    initComments();
});

function renderSources() {
    const grid = document.getElementById('sourcesGrid');
    if (!grid) return;
    grid.innerHTML = '';
    SOURCES.forEach(s => {
        const card = document.createElement('div');
        card.className = 'source-card';
        card.innerHTML = `
            <span class="source-icon">${s.icon}</span>
            <h4>${s.name}</h4>
            <p>${s.desc}</p>
        `;
        grid.appendChild(card);
    });
}

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
        renderAllNews(newsData);
        updateStats(newsData);
        updateBreakingNews(newsData);
        document.getElementById('lastUpdate').textContent = newsData.updatedAt 
            ? new Date(newsData.updatedAt).toLocaleString('ar-TN')
            : new Date().toLocaleString('ar-TN');

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
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    api_key: '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',
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
                        section: q.section || 'allNewsGrid',
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

function renderAllNews(data) {
    const grid = document.getElementById('allNewsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!data.news || data.news.length === 0) {
        grid.innerHTML = `<div class="news-card" style="grid-column: 1/-1; text-align:center; padding:40px;">
            <p style="color:#8b949e;">لا توجد أخبار حالياً. سيتم التحديث قريباً.</p>
        </div>`;
        return;
    }

    data.news.forEach(item => {
        const card = document.createElement('div');
        card.className = `news-card ${item.category || 'ai-news'}`;
        card.dataset.category = item.category || 'ai-news';
        
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
}

function filterNews(filter) {
    const cards = document.querySelectorAll('#allNewsGrid .news-card');
    cards.forEach(card => {
        if (filter === 'all') {
            card.style.display = 'flex';
        } else {
            card.style.display = card.dataset.category === filter ? 'flex' : 'none';
        }
    });
}

function updateStats(data) {
    const news = data.news || [];
    const total = news.length;
    const aiCount = news.filter(n => (n.category === 'ai-news' || n.section === 'aiNewsGrid')).length;
    const companiesCount = news.filter(n => (n.category === 'companies' || n.section === 'companiesGrid')).length;
    const peopleCount = news.filter(n => (n.category === 'people' || n.section === 'peopleGrid')).length;
    const moviesCount = news.filter(n => (n.category === 'movies' || n.section === 'moviesGrid')).length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statAi').textContent = aiCount;
    document.getElementById('statCompanies').textContent = companiesCount;
    document.getElementById('statPeople').textContent = peopleCount;
    document.getElementById('statMovies').textContent = moviesCount;
    document.getElementById('footerNewsCount').textContent = total;
}

function updateBreakingNews(data) {
    const ticker = document.getElementById('breakingText');
    if (!ticker || !data.news || data.news.length === 0) return;

    // Get top 8 headlines for the ticker
    const topHeadlines = data.news.slice(0, 8);
    const tickerText = topHeadlines.map((n, i) => 
        `🔹 ${n.title.replace(/<[^>]*>/g, '')}`
    ).join(' &nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp; ');

    ticker.innerHTML = tickerText;
}

// ===== Comments System =====
function initComments() {
    const submitBtn = document.getElementById('submitComment');
    const nameInput = document.getElementById('commentName');
    const textInput = document.getElementById('commentText');
    const charCount = document.getElementById('charCount');
    const commentsList = document.getElementById('commentsList');

    // Character counter
    textInput.addEventListener('input', function() {
        charCount.textContent = this.value.length;
    });

    // Load saved comments
    renderComments();

    // Submit comment
    submitBtn.addEventListener('click', function() {
        const name = nameInput.value.trim() || 'زائر';
        const text = textInput.value.trim();

        if (!text) {
            alert('الرجاء كتابة تعليق قبل الإرسال');
            return;
        }

        if (text.length > 500) {
            alert('التعليق طويل جداً (الحد الأقصى 500 حرف)');
            return;
        }

        const comment = {
            id: Date.now(),
            name: name,
            text: text,
            time: new Date().toISOString()
        };

        // Save to localStorage
        const comments = JSON.parse(localStorage.getItem('ai-news-comments') || '[]');
        comments.unshift(comment);
        localStorage.setItem('ai-news-comments', JSON.stringify(comments));

        // Clear form
        nameInput.value = '';
        textInput.value = '';
        charCount.textContent = '0';

        // Re-render
        renderComments();
    });
}

function renderComments() {
    const container = document.getElementById('commentsList');
    const comments = JSON.parse(localStorage.getItem('ai-news-comments') || '[]');

    if (comments.length === 0) {
        container.innerHTML = '<p class="no-comments">لا توجد تعليقات بعد. كن أول من يعلق!</p>';
        return;
    }

    container.innerHTML = comments.map(c => {
        const time = new Date(c.time).toLocaleString('ar-TN');
        return `
            <div class="comment-item">
                <div class="comment-author">
                    💬 ${c.name}
                    <span class="comment-time">${time}</span>
                </div>
                <div class="comment-text">${c.text}</div>
            </div>
        `;
    }).join('');
}
