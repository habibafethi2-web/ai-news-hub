// ===== AI News Hub v3 — Complete Overhaul =====
// Optimized for 500+ news items with detailed summaries
// Arabic UI, charts, modal reader, manual refresh

const CATEGORY_LABELS = {
    'ai-news': { icon: '🧠', name: 'AI', color: '#58a6ff' },
    'companies': { icon: '🏢', name: 'شركات', color: '#f59e0b' },
    'people': { icon: '👤', name: 'شخصيات', color: '#a855f7' },
    'movies': { icon: '🎬', name: 'أفلام', color: '#ef4444' }
};

const CATEGORY_NAMES = {
    'ai-news': 'الذكاء الاصطناعي',
    'companies': 'الشركات',
    'people': 'الشخصيات',
    'movies': 'الأفلام'
};

const ITEMS_PER_PAGE = 24;

let allNewsData = [];
let currentFilter = 'all';
let currentPage = 1;
let isLoadingMore = false;

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

            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            const navLink = document.querySelector(`.nav-link[data-section="${section}"]`);
            if (navLink) navLink.classList.add('active');

            if (section === 'all') {
                window.scrollTo({ top: document.getElementById('newsSection').offsetTop - 140, behavior: 'smooth' });
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
                setFilter('all');
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
                    setFilter(section);
                }
            }
        });
    });

    // ===== FILTER BUTTONS =====
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            setFilter(this.dataset.filter);
        });
    });

    // ===== SCROLL DETECTION FOR INFINITE SCROLL =====
    window.addEventListener('scroll', function() {
        if (isLoadingMore) return;
        const grid = document.getElementById('allNewsGrid');
        if (!grid) return;
        
        const rect = grid.getBoundingClientRect();
        const distanceFromBottom = rect.bottom - window.innerHeight - window.scrollY;
        
        if (distanceFromBottom < 400) {
            loadMoreItems();
        }
    });

    // ===== MANUAL REFRESH =====
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.textContent = '🔄 جاري التحديث...';
            this.disabled = true;
            // Clear cache and reload
            const cacheKey = 'data/news.json?' + Date.now();
            fetch(cacheKey)
                .then(r => r.json())
                .then(data => {
                    allNewsData = data.news || [];
                    currentPage = 1;
                    document.getElementById('lastUpdate').textContent = new Date().toLocaleString('ar-TN');
                    renderCurrentPage();
                    updateStats(data);
                    renderCharts(data);
                    updateBreakingNews(data);
                    document.getElementById('liveCount').textContent = allNewsData.length + ' خبراً';
                    document.getElementById('totalBadge').textContent = allNewsData.length + ' خبراً';
                    this.textContent = '🔄 تم التحديث ✓';
                    setTimeout(() => { this.textContent = '🔄 تحديث الأخبار'; this.disabled = false; }, 3000);
                })
                .catch(() => {
                    this.textContent = '❌ فشل التحديث';
                    setTimeout(() => { this.textContent = '🔄 تحديث الأخبار'; this.disabled = false; }, 3000);
                });
        });
    }

    // ===== COMMENTS =====
    initComments();
});

function renderSources() {
    const grid = document.getElementById('sourcesGrid');
    if (!grid) return;
    const sources = [
        { icon: '🗞️', name: 'Reuters', desc: 'وكالة الأنباء العالمية' },
        { icon: '📰', name: 'TechCrunch', desc: 'أخبار التقنية' },
        { icon: '📡', name: 'BBC News', desc: 'أخبار عالمية' },
        { icon: '📝', name: 'The Verge', desc: 'تقنية يومية' },
        { icon: '📈', name: 'CNBC', desc: 'أسواق وتقنية' },
        { icon: '🌐', name: 'The Guardian', desc: 'أخبار دولية' },
        { icon: '📘', name: 'Forbes', desc: 'أعمال وثروات' },
        { icon: '🎬', name: 'Hollywood Reporter', desc: 'أخبار السينما' },
        { icon: '📊', name: 'Box Office Mojo', desc: 'إيرادات الأفلام' },
        { icon: '🔬', name: 'Stanford HAI', desc: 'أبحاث AI' },
        { icon: '📺', name: 'Variety', desc: 'ترفيه وسينما' },
        { icon: '🎯', name: 'Product Hunt', desc: 'أحدث الأدوات' },
        { icon: '🔄', name: 'Reddit', desc: 'مجتمعات AI' },
        { icon: '📱', name: 'Mashable', desc: 'تقنية وأخبار' },
        { icon: '📋', name: 'Medium', desc: 'مقالات تحليلية' },
        { icon: '🗓️', name: 'TIME', desc: 'قائمة المؤثرين' },
        { icon: '🌍', name: 'Al Jazeera', desc: 'أخبار دولية' },
        { icon: '📺', name: 'NBC News', desc: 'أخبار عامة' },
        { icon: '💻', name: 'Computerworld', desc: 'تقنية معلومات' },
        { icon: '📡', name: 'Space.com', desc: 'الفضاء والعلوم' }
    ];
    grid.innerHTML = sources.map(s => `
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
        
        allNewsData = newsData.news || [];
        
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
            updateEl.textContent = new Date().toLocaleString('ar-TN');
        }

        const badge = document.getElementById('totalBadge');
        if (badge) badge.textContent = allNewsData.length + ' خبراً';
        document.getElementById('liveCount').textContent = allNewsData.length + ' خبراً';

    } catch (err) {
        console.error(err);
        loading.style.display = 'none';
        const fallback = getFallbackNews();
        allNewsData = fallback.news || [];
        renderAllNews(fallback);
        updateStats(fallback);
        renderCharts(fallback);
        updateBreakingNews(fallback);
        document.getElementById('lastUpdate').textContent = new Date().toLocaleString('ar-TN');
        document.getElementById('totalBadge').textContent = allNewsData.length + ' خبراً';
        document.getElementById('liveCount').textContent = allNewsData.length + ' خبراً';
    }
}

function getFallbackNews() {
    return {
        updatedAt: new Date().toISOString(),
        date: new Date().toLocaleDateString('ar-TN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        news: [
            {
                title: "تقرير Stanford HAI 2026: 53% من سكان العالم تبنوا الذكاء الاصطناعي التوليدي في 3 سنوات فقط",
                description: "أظهر تقرير جامعة ستانفورد السنوي للعام 2026 (AI Index Report) أن الذكاء الاصطناعي التوليدي انتشر بسرعة قياسية متجاوزاً معدلات تبني الكمبيوتر الشخصي والإنترنت. النتائج الرئيسية: 53% من سكان العالم تبنوا AI التوليدي، القيمة التقديرية للمستهلكين الأمريكيين بلغت 172 مليار دولار سنوياً، الاستثمار في AI بالولايات المتحدة وصل إلى 285.9 مليار دولار في 2025. الاستثمار العالمي بلغ 150.8 مليار دولار في 2025 بزيادة 80% عن 2024. المؤسسات التي تستخدم AI: 89% في سنغافورة، 78% في الإمارات، 75% في الهند.",
                url: "https://hai.stanford.edu/ai-index/2026-ai-index-report",
                source: "Stanford HAI",
                category: "ai-news",
                published: new Date().toISOString()
            },
            {
                title: "Google I/O 2026: إطلاق Gemini 3.5 Flash و Google Spark مع وكلاء AI يعملون 24/7",
                description: "Google أعلنت في مؤتمر I/O 2026 عن عدة منتجات جديدة: Gemini 3.5 Flash النموذج الأسرع مع ميزة 'Thinking Budget' للتحكم في مقدار التفكير قبل الرد. Google Spark وكلاء AI دائمين يعملون على مدار الساعة. Google Antigravity IDE بيئة برمجة مجانية بالكامل مع Gemini 3. Google Lens أصبح يدردش معك في الوقت الحقيقي. Project Starline للاتصال ثلاثي الأبعاد.",
                url: "https://techcrunch.com/2026/05/19/google-updates-its-gemini-app-to-take-on-chatgpt-and-claude-at-io-2026",
                source: "TechCrunch",
                category: "companies",
                published: new Date().toISOString()
            },
            {
                title: "SpaceX تعلن طرحاً عاماً أولياً (IPO) قد يجعل إيلون ماسك أول تريليونير في العالم",
                description: "SpaceX قدمت أوراق الطرح العام الأولي (IPO) في اكتتاب قد يكون الأكبر في التاريخ. التقييم المتوقع: 300-350 مليار دولار. إيلون ماسك يمتلك 42% من الشركة مما قد يجعله أول تريليونير في العالم. Starlink تمثل 60% من إيرادات SpaceX مع 5 ملايين مشترك عالمياً. Starship أكملت 8 رحلات تجارية ناجحة في 2026.",
                url: "https://www.aljazeera.com/economy/2026/5/20/elon-musks-spacex-unveils-filing-for-blockbuster-ipo",
                source: "Al Jazeera",
                category: "people",
                published: new Date().toISOString()
            },
            {
                title: "The Mandalorian & Grogu يتصدر شباك التذاكر بـ 81.9 مليون دولار في أول أسبوع",
                description: "فيلم Star Wars الجديد The Mandalorian & Grogu حقق 81.9 مليون دولار في أول 3 أيام من عرضه على 4,300 شاشة في أمريكا الشمالية. الفيلم من إنتاج Disney/Lucasfilm ومن إخراج Jon Favreau. التوقعات تشير إلى تجاوز 600 مليون دولار عالمياً. الفيلم يحتل حالياً المركز الثاني في قائمة أعلى أفلام 2026 بعد The Super Mario Galaxy Movie (423 مليون دولار محلياً).",
                url: "https://www.the-numbers.com/weekend-box-office-chart",
                source: "The Numbers",
                category: "movies",
                published: new Date().toISOString()
            }
        ]
    };
}

function setFilter(filter) {
    currentFilter = filter;
    currentPage = 1;
    
    const filtered = getFilteredItems();
    const title = document.getElementById('newsSectionTitle');
    const names = {
        'all': '📰 جميع الأخبار',
        'ai-news': '🧠 أخبار الذكاء الاصطناعي',
        'companies': '🏢 أخبار الشركات',
        'people': '👤 أخبار الشخصيات',
        'movies': '🎬 أخبار الأفلام'
    };
    title.textContent = names[filter] || '📰 جميع الأخبار';
    document.getElementById('totalBadge').textContent = filtered.length + ' خبراً';

    renderItemsPage(filtered.slice(0, ITEMS_PER_PAGE), true);
}

function getFilteredItems() {
    if (currentFilter === 'all') return allNewsData;
    return allNewsData.filter(n => n.category === currentFilter);
}

function renderAllNews(data) {
    if (!data.news) return;
    
    // Store for modal
    window._newsData = data.news;
    allNewsData = data.news;
    
    setFilter('all');
}

function renderItemsPage(items, reset = false) {
    const grid = document.getElementById('allNewsGrid');
    if (!grid) return;

    if (reset) {
        grid.innerHTML = '';
    }

    if (items.length === 0) {
        if (reset) {
            grid.innerHTML = '<div class="news-card empty-state" style="grid-column:1/-1;text-align:center;padding:60px 40px;"><p style="color:var(--text3);font-size:1.1rem;">لا توجد أخبار في هذا القسم حالياً.</p><p style="color:var(--text3);font-size:0.9rem;margin-top:10px;">حاول تحديث الصفحة أو اختر قسماً آخر.</p></div>';
        }
        return;
    }

    const fragment = document.createDocumentFragment();

    items.forEach((item) => {
        const cat = item.category || 'ai-news';
        const catInfo = CATEGORY_LABELS[cat] || { icon: '📰', name: 'أخبار', color: '#58a6ff' };
        const pubDate = item.published ? new Date(item.published).toLocaleDateString('ar-TN', {
            year: 'numeric', month: 'short', day: 'numeric'
        }) : 'اليوم';
        const desc = item.description || 'خبر عاجل من مصادرنا الموثوقة. اضغط على "اقرأ المزيد" للمقال الأصلي.';
        
        // Truncate description for card view
        const shortDesc = desc.length > 200 ? desc.substring(0, 197) + '...' : desc;

        const card = document.createElement('div');
        card.className = `news-card ${cat}`;
        card.dataset.category = cat;
        card.innerHTML = `
            <div class="card-top">
                <span class="source-tag">${item.source || 'مصدر موثوق'}</span>
                <span class="category-tag">${catInfo.icon} ${catInfo.name}</span>
            </div>
            <h3>${escapeHtml(item.title)}</h3>
            <div class="news-summary">${escapeHtml(shortDesc)}</div>
            <div class="card-footer">
                <span>📅 ${pubDate}</span>
                <button class="read-link" onclick="openArticleModal('${escapeHtml(item.url)}', '${escapeHtml(item.title)}', '${escapeHtml(desc)}', '${item.source || 'مصدر موثوق'}', '${cat}', '${item.published || ''}')">
                    📖 اقرأ المزيد ←
                </button>
            </div>
        `;
        fragment.appendChild(card);
    });

    grid.appendChild(fragment);
}

function loadMoreItems() {
    if (isLoadingMore) return;
    
    const filtered = getFilteredItems();
    const totalLoaded = document.querySelectorAll('#allNewsGrid .news-card').length;
    // Subtract the empty state if present
    const loadedCount = totalLoaded;

    if (loadedCount >= filtered.length) return;

    isLoadingMore = true;
    const nextItems = filtered.slice(loadedCount, loadedCount + ITEMS_PER_PAGE);
    
    if (nextItems.length > 0) {
        renderItemsPage(nextItems);
    }
    
    isLoadingMore = false;
}

// ===== Article Modal (opens FULL article inside the site) =====
function openArticleModal(url, title, description, source, category, published) {
    const cat = category || 'ai-news';
    const catInfo = CATEGORY_LABELS[cat] || { icon: '📰', name: 'أخبار', color: '#58a6ff' };
    const pubDate = published ? new Date(published).toLocaleDateString('ar-TN', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }) : 'التاريخ غير متوفر';

    // Clean and format the full description
    let cleanDesc = (description || 'المحتوى الكامل متوفر على المصدر الأصلي.')
        .replace(/<[^>]*>/g, '')
        .replace(/\\n/g, '\n')
        .replace(/\s+/g, ' ')
        .trim();

    // Add source attribution
    const fullContent = `${cleanDesc}\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n📌 المصدر: ${source || 'مصدر موثوق'}\n📅 التاريخ: ${pubDate}\n━━━━━━━━━━━━━━━━━━━━━━━━`;

    document.getElementById('modalCategory').textContent = `${catInfo.icon} ${catInfo.name}`;
    document.getElementById('modalCategory').style.background = catInfo.color;
    document.getElementById('modalSource').textContent = source || 'مصدر موثوق';
    document.getElementById('modalDate').textContent = `📅 ${pubDate}`;
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalContent').textContent = fullContent;
    document.getElementById('modalSourceLink').href = url || '#';
    
    const modal = document.getElementById('articleModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Reset scroll position
    modal.scrollTop = 0;
    modal.querySelector('.modal-content').scrollTop = 0;
}

function closeArticleModal() {
    document.getElementById('articleModal').classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeArticleModal();
});

function escapeHtml(text) {
    if (!text) return '';
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}

function updateStats(data) {
    const news = data.news || allNewsData || [];
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
    const news = data.news || allNewsData || [];
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
                        <span class="chart-bar-value">${b.count.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Animate bars
    setTimeout(() => {
        barContainer.querySelectorAll('.chart-bar-fill').forEach(el => {
            el.style.width = el.style.width;
        });
    }, 100);

    // Donut chart
    const donut = document.getElementById('donutChart');
    document.getElementById('donutTotal').textContent = total.toLocaleString();

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
            gradientParts.push(`var(--surface2) ${currentDeg}deg 360deg`);
        }

        donut.style.background = `conic-gradient(${gradientParts.join(', ')})`;
    } else {
        donut.style.background = 'var(--surface2)';
    }

    // Legend
    const legend = document.getElementById('donutLegend');
    const legendColors = ['#58a6ff', '#f59e0b', '#a855f7', '#ef4444'];
    const legendLabels = ['AI', 'شركات', 'شخصيات', 'أفلام'];
    legend.innerHTML = legendLabels.map((l, i) => {
        const c = counts[categories[i]];
        const pct = total > 0 ? Math.round((c / total) * 100) : 0;
        return `
            <div class="donut-legend-item">
                <span class="donut-legend-dot" style="background:${legendColors[i]}"></span>
                ${l} — ${c.toLocaleString()} (${pct}%)
            </div>
        `;
    }).join('');
}

function updateBreakingNews(data) {
    const ticker = document.getElementById('breakingText');
    if (!ticker) return;
    const news = data.news || allNewsData || [];
    if (news.length === 0) return;

    // Take first 20 headlines
    const headlines = news.slice(0, 20).map((n, i) =>
        `🔹 ${n.title.replace(/<[^>]*>/g, '').trim()}`
    ).join(' &nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp; ');

    // Duplicate for seamless loop
    ticker.innerHTML = headlines + ' &nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp; ' + headlines;
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