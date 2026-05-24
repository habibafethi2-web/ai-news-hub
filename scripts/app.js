// ===== AI News Hub v2 - Complete Redesign =====
// Arabic summaries, charts, proper links, glass UI

const CATEGORY_LABELS = {
    'ai-news': { icon: '🧠', name: 'AI' },
    'companies': { icon: '🏢', name: 'شركات' },
    'people': { icon: '👤', name: 'شخصيات' },
    'movies': { icon: '🎬', name: 'أفلام' }
};

const CATEGORY_COLORS = {
    'ai-news': '#58a6ff',
    'companies': '#f59e0b',
    'people': '#a855f7',
    'movies': '#ef4444'
};

const SOURCES = [
    { icon: '🗞️', name: 'Reuters', desc: 'وكالة الأنباء العالمية' },
    { icon: '📰', name: 'TechCrunch', desc: 'أخبار التقنية' },
    { icon: '📡', name: 'BBC News', desc: 'أخبار عالمية' },
    { icon: '📝', name: 'The Verge', desc: 'تقنية يومية' },
    { icon: '📈', name: 'CNBC', desc: 'أسواق وتقنية' },
    { icon: '🌐', name: 'The Guardian', desc: 'أخبار دولية' },
    { icon: '📘', name: 'Forbes', desc: 'أعمال وثروات' },
    { icon: '🤖', name: 'OpenAI', desc: 'أخبار OpenAI' },
    { icon: '🧪', name: 'Google AI', desc: 'أبحاث Google' },
    { icon: '🎬', name: 'Hollywood Reporter', desc: 'أخبار السينما' },
    { icon: '📊', name: 'Box Office Mojo', desc: 'إيرادات الأفلام' },
    { icon: '🔬', name: 'Stanford HAI', desc: 'أبحاث AI' },
    { icon: '📺', name: 'Variety', desc: 'ترفيه وسينما' },
    { icon: '📋', name: 'Medium', desc: 'مقالات تحليلية' },
    { icon: '🎯', name: 'Product Hunt', desc: 'أحدث الأدوات' },
    { icon: '🔄', name: 'Reddit', desc: 'مجتمعات AI' },
    { icon: '📱', name: 'Mashable', desc: 'تقنية وأخبار' },
    { icon: '🗓️', name: 'TIME', desc: 'قائمة المؤثرين' },
    { icon: '📺', name: 'NBC News', desc: 'أخبار عامة' },
    { icon: '🌍', name: 'Al Jazeera', desc: 'أخبار دولية' }
];

// Arabic summary generator
function generateArabicSummary(item) {
    const desc = item.description || '';
    const title = item.title || '';
    let summary = '';

    // Try to extract meaningful summary
    if (desc.length < 30) {
        // Fallback: generate from title
        summary = title;
    } else {
        // Clean and truncate
        let clean = desc
            .replace(/<[^>]*>/g, '')
            .replace(/\n+/g, ' ')
            .replace(/\\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        // Remove common boilerplate
        const boilerplate = [
            /Learn more[^.]*\./gi,
            /Sign up[^.]*\./gi,
            /Subscribe[^.]*\./gi,
            /Read more[^.]*\./gi,
            /Get this delivered[^.]*\./gi,
            /Here's how[^.]*\./gi,
            /Find out even more[^.]*\./gi,
            /Advertisement[^.]*\./gi,
            /By .*? • /g,
            /Published[^.]*\./gi,
            /This article[^.]*\./gi
        ];
        boilerplate.forEach(re => { clean = clean.replace(re, ''); });

        // Take first meaningful part
        clean = clean.trim();
        
        // Translate key terms to Arabic
        clean = clean
            .replace(/announced|unveiled|launched|revealed/g, 'أعلنت عن')
            .replace(/acquired|bought/g, 'استحوذت على')
            .replace(/partnership/g, 'شراكة')
            .replace(/launch|release/g, 'إطلاق')
            .replace(/new model/g, 'نموذج جديد')
            .replace(/free/g, 'مجاني')
            .replace(/AI|artificial intelligence/g, 'الذكاء الاصطناعي')
            .replace(/pricing/g, 'أسعار')
            .replace(/features/g, 'ميزات')
            .replace(/upgrade/g, 'تحديث')
            .replace(/beta/g, 'نسخة تجريبية')
            .replace(/open source/g, 'مفتوح المصدر')
            .replace(/enterprise/g, 'للمؤسسات')
            .replace(/developer/g, 'مطور')
            .replace(/integration/g, 'دمج')
            ;

        // Cap at good length
        if (clean.length > 250) {
            clean = clean.substring(0, 247) + '...';
        }

        summary = clean;
    }

    return summary || 'خبر عاجل من مصادرنا الموثوقة. اضغط على "اقرأ المزيد" للمقال الأصلي.';
}

document.addEventListener('DOMContentLoaded', function() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('ar-TN', options);
    document.getElementById('year').textContent = now.getFullYear();

    renderSources();
    loadNews();

    // ===== THEME =====
    const themeBtn = document.getElementById('themeToggle');
    const saved = localStorage.getItem('ai-news-theme') || 'dark';
    if (saved === 'light') {
        document.body.classList.add('light-mode');
        themeBtn.textContent = '☀️';
    }
    themeBtn.addEventListener('click', function() {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        this.textContent = isLight ? '☀️' : '🌙';
        localStorage.setItem('ai-news-theme', isLight ? 'light' : 'dark');
    });

    // ===== HEADER SCROLL =====
    window.addEventListener('scroll', function() {
        const header = document.getElementById('header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Scroll to top button
        const scrollBtn = document.getElementById('scrollToTop');
        if (window.scrollY > 400) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });

    document.getElementById('scrollToTop').addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ===== NAVIGATION =====
    document.querySelectorAll('.nav-link, .footer-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            if (!section) return;

            // Update nav active
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            const navLink = document.querySelector(`.nav-link[data-section="${section}"]`);
            if (navLink) navLink.classList.add('active');

            // Scroll to section
            if (section === 'all') {
                window.scrollTo({ top: document.getElementById('newsSection').offsetTop - 140, behavior: 'smooth' });
                // Reset filter
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
                filterNews('all');
            } else if (section === 'charts') {
                document.getElementById('charts').scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else if (section === 'about') {
                document.getElementById('about').scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else if (['ai-news', 'companies', 'people', 'movies'].includes(section)) {
                window.scrollTo({ top: document.getElementById('newsSection').offsetTop - 140, behavior: 'smooth' });
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                const btn = document.querySelector(`.filter-btn[data-filter="${section}"]`);
                if (btn) {
                    btn.classList.add('active');
                    filterNews(section);
                }
            }
        });
    });

    // ===== FILTER BUTTONS =====
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterNews(this.dataset.filter);
        });
    });

    // ===== COMMENTS =====
    initComments();
});

function renderSources() {
    const grid = document.getElementById('sourcesGrid');
    if (!grid) return;
    grid.innerHTML = SOURCES.map(s => `
        <div class="source-card">
            <span class="source-icon">${s.icon}</span>
            <h4>${s.name}</h4>
            <p>${s.desc}</p>
        </div>
    `).join('');
}

async function loadNews() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');

    try {
        let newsData = null;

        try {
            const resp = await fetch('data/news.json?' + Date.now());
            if (resp.ok) newsData = await resp.json();
        } catch(e) {}

        if (!newsData || !newsData.news || newsData.news.length === 0) {
            newsData = getFallbackNews();
        }

        loading.style.display = 'none';
        
        // Add Arabic summaries
        newsData.news = newsData.news.map(item => ({
            ...item,
            arabicSummary: generateArabicSummary(item)
        }));

        renderAllNews(newsData);
        updateStats(newsData);
        renderCharts(newsData);
        updateBreakingNews(newsData);

        const updateEl = document.getElementById('lastUpdate');
        if (newsData.updatedAt) {
            const d = new Date(newsData.updatedAt);
            updateEl.textContent = d.toLocaleDateString('ar-TN', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } else {
            updateEl.textContent = now.toLocaleString('ar-TN');
        }

        const badge = document.getElementById('totalBadge');
        if (badge && newsData.news) {
            badge.textContent = newsData.news.length + ' خبراً';
        }

        document.getElementById('liveCount').textContent = newsData.news.length + ' خبراً';

    } catch (err) {
        console.error(err);
        loading.style.display = 'none';
        const fallback = getFallbackNews();
        fallback.news = fallback.news.map(item => ({
            ...item,
            arabicSummary: generateArabicSummary(item)
        }));
        renderAllNews(fallback);
        updateStats(fallback);
        renderCharts(fallback);
        updateBreakingNews(fallback);
        document.getElementById('lastUpdate').textContent = new Date().toLocaleString('ar-TN');
        document.getElementById('totalBadge').textContent = fallback.news.length + ' خبراً';
        document.getElementById('liveCount').textContent = fallback.news.length + ' خبراً';
    }
}

function getFallbackNews() {
    return {
        updatedAt: new Date().toISOString(),
        date: new Date().toLocaleDateString('ar-TN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        news: [
            {
                title: "تقرير Stanford HAI 2026: 53% من السكان تبنوا الذكاء الاصطناعي التوليدي",
                description: "أظهر تقرير جامعة ستانفورد السنوي أن الذكاء الاصطناعي التوليدي انتشر بسرعة قياسية متجاوزاً معدلات تبني الكمبيوتر والإنترنت. القيمة التقديرية للمستهلكين الأمريكيين بلغت 172 مليار دولار سنوياً، والاستثمار في AI بالولايات المتحدة وصل إلى 285.9 مليار دولار في 2025.",
                url: "https://hai.stanford.edu/ai-index/2026-ai-index-report",
                source: "Stanford HAI",
                category: "ai-news",
                published: new Date().toISOString()
            },
            {
                title: "Google I/O 2026: Gemini 3.5 Flash و Google Spark وكلاء AI يعملون 24/7",
                description: "Google أعلنت في مؤتمر I/O 2026 عن Gemini 3.5 Flash الأسرع والأكثر كفاءة، و Google Spark كوكلاء AI دائمين يعملون على مدار الساعة لمساعدتك في حياتك الرقمية اليومية.",
                url: "https://techcrunch.com/2026/05/19/google-updates-its-gemini-app-to-take-on-chatgpt-and-claude-at-io-2026",
                source: "TechCrunch",
                category: "companies",
                published: new Date().toISOString()
            },
            {
                title: "SpaceX تعلن عن طرح عام أولي قد يجعل إيلون ماسك أول تريليونير",
                description: "SpaceX قدمت أوراق الطرح العام الأولي في اكتتاب قد يكون الأكبر في التاريخ. إيلون ماسك يمتلك الحصة الأكبر في الشركة، مما قد يجعله أول تريليونير في العالم.",
                url: "https://www.aljazeera.com/economy/2026/5/20/elon-musks-spacex-unveils-filing-for-blockbuster-ipo",
                source: "Al Jazeera",
                category: "people",
                published: new Date().toISOString()
            },
            {
                title: "The Mandalorian & Grogu يتصدر شباك التذاكر بـ 81.9 مليون دولار",
                description: "فيلم Star Wars الجديد حقق 81.9 مليون دولار في أول 3 أيام من عرضه، متصدراً شباك التذاكر في أمريكا الشمالية ومتفوقاً على جميع الأفلام المنافسة.",
                url: "https://www.the-numbers.com/weekend-box-office-chart",
                source: "The Numbers",
                category: "movies",
                published: new Date().toISOString()
            },
            {
                title: "مقارنة شاملة: Cursor vs Windsurf vs Copilot vs Claude Code 2026",
                description: "دليل شامل لمقارنة أفضل أدوات البرمجة بالذكاء الاصطناعي في 2026 مع الأسعار والميزات والتوصيات. Cursor يتصدر التصنيف بـ 5 نجوم، يليه Windsurf و Claude Code.",
                url: "https://medium.com/@kanerika/github-copilot-vs-claude-code-vs-cursor-vs-windsurf-2026-c54f8a5cc051",
                source: "Medium",
                category: "ai-news",
                published: new Date().toISOString()
            },
            {
                title: "OpenAI تتجه للاكتتاب العام ومكتب جديد في سنغافورة",
                description: "OpenAI تخطط للاكتتاب العام (IPO) وتفتتح أول مختبر تطبيقي خارج الولايات المتحدة في سنغافورة. الشركة تتوسع عالمياً مع شراكات جديدة مع Amazon Web Services.",
                url: "https://www.reuters.com/technology/openai",
                source: "Reuters",
                category: "companies",
                published: new Date().toISOString()
            },
            {
                title: "محاكمة إيلون ماسك ضد OpenAI تنتهي ببراءة الشركة",
                description: "هيئة المحلفين رفضت دعوى إيلون ماسك ضد OpenAI وأكدت شرعية خطتها الربحية. القاضي أحكام براءة الشركة من جميع التهم المقدمة.",
                url: "https://www.theguardian.com/technology/2026/may/19/what-did-we-learn-from-elon-musk-and-sam-altmans-courtroom-drama",
                source: "The Guardian",
                category: "people",
                published: new Date().toISOString()
            },
            {
                title: "أفضل أفلام 2026: Super Mario Galaxy في الصدارة و Mandalorian يقتحم السباق",
                description: "The Super Mario Galaxy Movie يتصدر شباك التذاكر العالمي بـ 423 مليون دولار محلياً. The Mandalorian & Grogu في طريقه لتحقيق أرقام قياسية مع Project Hail Mary في المركز الثالث.",
                url: "https://en.wikipedia.org/wiki/List_of_2026_box_office_number-one_films_in_the_United_States",
                source: "Wikipedia",
                category: "movies",
                published: new Date().toISOString()
            },
            {
                title: "Anthropic تطلق Claude Mythos: أقوى نموذج للأمن السيبراني",
                description: "Anthropic كشفت عن Claude Mythos ضمن مبادرة Project Glasswing بالتعاون مع Amazon, Apple, Google, Microsoft و NVIDIA. يضم 40+ شريكاً في الأمن السيبراني.",
                url: "https://dentro.de/ai/news",
                source: "داخل/دي",
                category: "companies",
                published: new Date().toISOString()
            },
            {
                title: "أفضل 39 أداة AI مجانية في 2026 من DataCamp",
                description: "دليل شامل لأفضل أدوات الذكاء الاصطناعي المجانية في 2026 مع شرح مفصل لكل أداة. يشمل أدوات البرمجة، التصميم، الكتابة، الفيديو، الصوت، والمزيد.",
                url: "https://www.datacamp.com/blog/free-ai-tools",
                source: "DataCamp",
                category: "ai-news",
                published: new Date().toISOString()
            },
            {
                title: "Meta تطلق Muse Spark: نموذج AI جديد للميتافيرس والتطبيقات",
                description: "Meta أعلنت عن Muse Spark، نموذج ذكاء اصطناعي متعدد الوسائط يعمل عبر Facebook و Instagram و WhatsApp والنظارات الذكية، مع دعم كامل للمطورين.",
                url: "https://www.marketingprofs.com/opinions/2026/54530/ai-update-april-10-2026-ai-news-and-views-from-the-past-week",
                source: "MarketingProfs",
                category: "companies",
                published: new Date().toISOString()
            },
            {
                title: "أفضل 10 أدوات Vibe Coding 2026: Cursor يتصدر و Windsurf يطارده",
                description: "قائمة بأفضل أدوات البرمجة بالذكاء الاصطناعي في 2026. Cursor في الصدارة، يليه Lovable و v0 من Vercel و Windsurf و Kilo Code الجديد.",
                url: "https://roadmap.sh/vibe-coding/best-tools",
                source: "Roadmap.sh",
                category: "ai-news",
                published: new Date().toISOString()
            }
        ]
    };
}

function renderAllNews(data) {
    const grid = document.getElementById('allNewsGrid');
    if (!grid) return;

    if (!data.news || data.news.length === 0) {
        grid.innerHTML = '<div class="news-card" style="grid-column:1/-1;text-align:center;padding:40px;"><p style="color:var(--text3);">لا توجد أخبار حالياً.</p></div>';
        return;
    }

    grid.innerHTML = data.news.map(item => {
        const cat = item.category || 'ai-news';
        const catInfo = CATEGORY_LABELS[cat] || { icon: '📰', name: 'أخبار' };
        const pubDate = item.published ? new Date(item.published).toLocaleDateString('ar-TN', {
            year: 'numeric', month: 'short', day: 'numeric'
        }) : 'اليوم';
        const summary = item.arabicSummary || generateArabicSummary(item);
        const url = item.url || '#';

        return `
            <div class="news-card ${cat}" data-category="${cat}">
                <div class="card-top">
                    <span class="source-tag">${item.source || 'مصدر موثوق'}</span>
                    <span class="category-tag">${catInfo.icon} ${catInfo.name}</span>
                </div>
                <h3>${escapeHtml(item.title)}</h3>
                <div class="news-summary">${escapeHtml(summary)}</div>
                <div class="card-footer">
                    <span>📅 ${pubDate}</span>
                    <a href="${url}" target="_blank" rel="noopener noreferrer" class="read-link">
                        اقرأ المزيد ←
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

function escapeHtml(text) {
    if (!text) return '';
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}

function filterNews(filter) {
    const cards = document.querySelectorAll('#allNewsGrid .news-card');
    let count = 0;
    cards.forEach(c => {
        if (filter === 'all') {
            c.style.display = 'flex';
            count++;
        } else {
            if (c.dataset.category === filter) {
                c.style.display = 'flex';
                count++;
            } else {
                c.style.display = 'none';
            }
        }
    });

    const title = document.getElementById('newsSectionTitle');
    const filternames = {
        'all': '📰 جميع الأخبار',
        'ai-news': '🧠 أخبار الذكاء الاصطناعي',
        'companies': '🏢 أخبار الشركات',
        'people': '👤 أخبار الشخصيات',
        'movies': '🎬 أخبار الأفلام'
    };
    title.textContent = filternames[filter] || '📰 جميع الأخبار';

    const badge = document.getElementById('totalBadge');
    const total = document.querySelectorAll('#allNewsGrid .news-card').length;
    badge.textContent = filter === 'all' ? total + ' خبراً' : count + ' خبراً';
}

function updateStats(data) {
    const news = data.news || [];
    const total = news.length;
    const counts = {
        'ai-news': news.filter(n => n.category === 'ai-news').length,
        'companies': news.filter(n => n.category === 'companies').length,
        'people': news.filter(n => n.category === 'people').length,
        'movies': news.filter(n => n.category === 'movies').length
    };

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statAi').textContent = counts['ai-news'];
    document.getElementById('statCompanies').textContent = counts['companies'];
    document.getElementById('statPeople').textContent = counts['people'];
    document.getElementById('statMovies').textContent = counts['movies'];
    document.getElementById('footerNewsCount').textContent = total;
}

function renderCharts(data) {
    const news = data.news || [];
    const categories = ['ai-news', 'companies', 'people', 'movies'];
    const counts = {};
    categories.forEach(c => counts[c] = news.filter(n => n.category === c).length);
    const total = news.length;

    // Bar chart
    const barContainer = document.getElementById('barChart');
    const barData = [
        { key: 'ai-news', label: '🧠 AI', count: counts['ai-news'], cls: 'ai' },
        { key: 'companies', label: '🏢 شركات', count: counts['companies'], cls: 'companies' },
        { key: 'people', label: '👤 شخصيات', count: counts['people'], cls: 'people' },
        { key: 'movies', label: '🎬 أفلام', count: counts['movies'], cls: 'movies' }
    ];

    const maxCount = Math.max(...barData.map(b => b.count), 1);

    barContainer.innerHTML = barData.map(b => {
        const pct = Math.round((b.count / maxCount) * 100);
        return `
            <div class="chart-bar-row">
                <span class="chart-bar-label">${b.label}</span>
                <div class="chart-bar-track">
                    <div class="chart-bar-fill ${b.cls}" style="width:${pct}%">
                        <span class="chart-bar-value">${b.count}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Trigger animation after render
    setTimeout(() => {
        barContainer.querySelectorAll('.chart-bar-fill').forEach(el => {
            el.style.width = el.style.width;
        });
    }, 100);

    // Donut chart
    const donut = document.getElementById('donutChart');
    document.getElementById('donutTotal').textContent = total;

    // Calculate conic gradient for donut
    if (total > 0) {
        let gradientParts = [];
        let currentDeg = 0;
        const segments = [
            { count: counts['ai-news'], color: '#58a6ff' },
            { count: counts['companies'], color: '#f59e0b' },
            { count: counts['people'], color: '#a855f7' },
            { count: counts['movies'], color: '#ef4444' }
        ];

        segments.forEach(seg => {
            if (seg.count > 0) {
                const pct = (seg.count / total) * 360;
                const endDeg = currentDeg + pct;
                gradientParts.push(`${seg.color} ${currentDeg}deg ${endDeg}deg`);
                currentDeg = endDeg;
            }
        });

        if (gradientParts.length > 0 && currentDeg < 360) {
            gradientParts.push(`#1e293b ${currentDeg}deg 360deg`);
        }

        donut.style.background = `conic-gradient(${gradientParts.join(', ')})`;
    } else {
        donut.style.background = '#1e293b';
    }

    // Legend
    const legend = document.getElementById('donutLegend');
    const legendColors = ['#58a6ff', '#f59e0b', '#a855f7', '#ef4444'];
    const legendLabels = ['AI', 'شركات', 'شخصيات', 'أفلام'];
    legend.innerHTML = legendLabels.map((l, i) => {
        const c = counts[categories[i]];
        return `
            <div class="donut-legend-item">
                <span class="donut-legend-dot" style="background:${legendColors[i]}"></span>
                ${l} (${c})
            </div>
        `;
    }).join('');
}

function updateBreakingNews(data) {
    const ticker = document.getElementById('breakingText');
    if (!ticker || !data.news || data.news.length === 0) return;

    const headlines = data.news.slice(0, 12);
    const text = headlines.map((n, i) =>
        `🔹 ${n.title.replace(/<[^>]*>/g, '')}`
    ).join(' &nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp; ');

    ticker.innerHTML = text + ' &nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp; ' + text;
}

// ===== COMMENTS =====
function initComments() {
    const submitBtn = document.getElementById('submitComment');
    const nameInput = document.getElementById('commentName');
    const textInput = document.getElementById('commentText');
    const charCount = document.getElementById('charCount');
    if (!submitBtn || !textInput) return;

    textInput.addEventListener('input', function() {
        charCount.textContent = this.value.length;
    });

    renderComments();

    submitBtn.addEventListener('click', function() {
        const name = nameInput.value.trim() || 'زائر';
        const text = textInput.value.trim();
        if (!text) { alert('الرجاء كتابة تعليق'); return; }
        if (text.length > 500) { alert('التعليق طويل جداً'); return; }

        const comment = {
            id: Date.now(),
            name, text,
            time: new Date().toISOString()
        };

        const comments = JSON.parse(localStorage.getItem('ai-news-comments') || '[]');
        comments.unshift(comment);
        localStorage.setItem('ai-news-comments', JSON.stringify(comments));

        nameInput.value = '';
        textInput.value = '';
        charCount.textContent = '0';
        renderComments();
    });
}

function renderComments() {
    const container = document.getElementById('commentsList');
    if (!container) return;
    const comments = JSON.parse(localStorage.getItem('ai-news-comments') || '[]');

    if (comments.length === 0) {
        container.innerHTML = '<p class="no-comments">لا توجد تعليقات بعد. كن أول من يعلق!</p>';
        return;
    }

    container.innerHTML = comments.map(c => `
        <div class="comment-item">
            <div class="comment-author">
                💬 ${escapeHtml(c.name)}
                <span class="comment-time">${new Date(c.time).toLocaleString('ar-TN')}</span>
            </div>
            <div class="comment-text">${escapeHtml(c.text)}</div>
        </div>
    `).join('');
}