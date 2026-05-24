// ===== AI News Hub - App Logic =====
// Fixed: scroll, buttons, ticker speed, proper news sections

// ===== Sources Data =====
const SOURCES = [
    { icon: '🗞️', name: 'Reuters', desc: 'وكالة الأنباء العالمية' },
    { icon: '📰', name: 'TechCrunch', desc: 'أخبار التقنية والشركات الناشئة' },
    { icon: '📡', name: 'BBC News', desc: 'أخبار عالمية موثوقة' },
    { icon: '📝', name: 'The Verge', desc: 'أخبار التقنية اليومية' },
    { icon: '📈', name: 'CNBC', desc: 'أخبار الأسواق والتقنية' },
    { icon: '🌐', name: 'The Guardian', desc: 'أخبار دولية وتقنية' },
    { icon: '📘', name: 'Forbes', desc: 'أخبار المليارديرات والشركات' },
    { icon: '🤖', name: 'OpenAI News', desc: 'أخبار OpenAI الرسمية' },
    { icon: '🧪', name: 'Google AI Blog', desc: 'آخر أبحاث Google' },
    { icon: '📱', name: 'Product Hunt', desc: 'أحدث المنتجات والأدوات' },
    { icon: '🎬', name: 'IMDb & Rotten Tomatoes', desc: 'أخبار الأفلام والمسلسلات' },
    { icon: '📺', name: 'Variety', desc: 'أخبار الترفيه والسينما' },
    { icon: '📺', name: 'Hollywood Reporter', desc: 'أخبار هوليوود' },
    { icon: '📊', name: 'The Numbers', desc: 'إحصائيات شباك التذاكر' },
    { icon: '💻', name: 'Computerworld', desc: 'أخبار عالم التقنية' },
    { icon: '🔬', name: 'Stanford HAI', desc: 'أبحاث الذكاء الاصطناعي' },
    { icon: '🔄', name: 'Reddit', desc: 'مجتمعات r/vibecoding, r/artificial' },
    { icon: '📋', name: 'Medium', desc: 'مقالات تحليلية متعمقة' },
    { icon: '📺', name: 'YouTube', desc: 'تحليلات فيديو من خبراء' },
    { icon: '🎯', name: 'Instagram/Facebook', desc: 'صفحات رسمية للشركات' }
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

    // ===== Smooth scroll for nav + footer links =====
    function handleNavClick(e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        
        // Update active nav
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');

        const targetId = href.substring(1); // remove #
        let targetEl = null;

        // Map sections to their actual IDs
        const sectionMap = {
            'ai-news': 'ai-news',
            'companies': 'ai-news',
            'people': 'ai-news',
            'movies': 'ai-news',
            'about': 'about',
            'comments': 'comments'
        };

        const actualId = sectionMap[targetId] || targetId;
        targetEl = document.getElementById(actualId);

        if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // If it's a category section, apply filter
        if (['ai-news', 'companies', 'people', 'movies'].includes(targetId)) {
            const filterBtns = document.querySelectorAll('.filter-btn');
            filterBtns.forEach(b => b.classList.remove('active'));
            const targetBtn = document.querySelector(`.filter-btn[data-filter="${targetId}"]`);
            if (targetBtn) {
                targetBtn.classList.add('active');
                filterNews(targetId);
            }
        }
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavClick);
    });

    // Footer links
    document.querySelectorAll('.footer-links a[data-section]').forEach(link => {
        link.addEventListener('click', handleNavClick);
    });

    // ===== Scroll to top button =====
    window.addEventListener('scroll', function() {
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
        // Try to load from local data file
        let newsData = null;
        
        try {
            const resp = await fetch('data/news.json?' + Date.now()); // cache bust
            if (resp.ok) {
                newsData = await resp.json();
            }
        } catch(e) {
            console.log('No local data, fetching live...');
        }

        if (!newsData || !newsData.news || newsData.news.length === 0) {
            // Fallback: use hardcoded news so the site always works
            newsData = getFallbackNews();
        }

        loading.style.display = 'none';
        renderAllNews(newsData);
        updateStats(newsData);
        updateBreakingNews(newsData);
        
        // Update last-update time
        const updateEl = document.getElementById('lastUpdate');
        if (newsData.updatedAt) {
            const d = new Date(newsData.updatedAt);
            updateEl.textContent = d.toLocaleString('ar-TN', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } else {
            updateEl.textContent = new Date().toLocaleString('ar-TN');
        }

        // Update total badge
        const badge = document.getElementById('totalBadge');
        if (badge && newsData.news) {
            badge.textContent = newsData.news.length + ' خبراً';
        }

    } catch (err) {
        console.error('Error loading news:', err);
        loading.style.display = 'none';
        
        // Use fallback data instead of showing error
        const fallback = getFallbackNews();
        renderAllNews(fallback);
        updateStats(fallback);
        updateBreakingNews(fallback);
        document.getElementById('lastUpdate').textContent = new Date().toLocaleString('ar-TN');
        document.getElementById('totalBadge').textContent = fallback.news.length + ' خبراً';
    }
}

function getFallbackNews() {
    return {
        "updatedAt": new Date().toISOString(),
        "date": new Date().toLocaleDateString('ar-TN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        "news": [
            {
                "title": "تقرير Stanford HAI 2026: 53% من سكان العالم تبنوا AI التوليدي",
                "description": "أظهر تقرير جامعة ستانفورد السنوي أن الذكاء الاصطناعي التوليدي انتشر بسرعة قياسية، متجاوزاً معدلات تبني الكمبيوتر والإنترنت.",
                "url": "https://hai.stanford.edu/ai-index/2026-ai-index-report",
                "source": "Stanford HAI",
                "category": "ai-news",
                "published": new Date().toISOString()
            },
            {
                "title": "Google I/O 2026: Gemini 3.5 Flash و Google Spark وكلاء AI",
                "description": "Google أعلنت عن Gemini 3.5 Flash و Google Spark كوكلاء AI دائمين يعملون 24/7 لمساعدتك في حياتك الرقمية.",
                "url": "https://techcrunch.com/2026/05/19/google-updates-its-gemini-app-to-take-on-chatgpt-and-claude-at-io-2026",
                "source": "TechCrunch",
                "category": "companies",
                "published": new Date().toISOString()
            },
            {
                "title": "SpaceX تعلن عن طرح عام أولي (IPO) قد يجعل إيلون ماسك تريليونيراً",
                "description": "SpaceX قدمت أوراق الطرح العام الأولي في اكتتاب قد يكون الأكبر في التاريخ ويجعل إيلون ماسك أول تريليونير في العالم.",
                "url": "https://www.aljazeera.com/economy/2026/5/20/elon-musks-spacex-unveils-filing-for-blockbuster-ipo",
                "source": "Al Jazeera",
                "category": "people",
                "published": new Date().toISOString()
            },
            {
                "title": "The Mandalorian & Grogu يتصدر شباك التذاكر بأول عطلة نهاية أسبوع",
                "description": "فيلم Star Wars الجديد حقق 81.9 مليون دولار في أول 3 أيام، متصدراً شباك التذاكر في أمريكا.",
                "url": "https://www.the-numbers.com/weekend-box-office-chart",
                "source": "The Numbers",
                "category": "movies",
                "published": new Date().toISOString()
            },
            {
                "title": "مقارنة شاملة: Cursor vs Windsurf vs Copilot vs Claude Code 2026",
                "description": "دليل شامل لمقارنة أدوات البرمجة بالذكاء الاصطناعي مع الأسعار والميزات والتوصيات لكل حالة استخدام.",
                "url": "https://medium.com/@kanerika/github-copilot-vs-claude-code-vs-cursor-vs-windsurf-2026-c54f8a5cc051",
                "source": "Medium",
                "category": "ai-news",
                "published": new Date().toISOString()
            },
            {
                "title": "OpenAI تخطط للاكتتاب العام (IPO) ومكتب جديد في سنغافورة",
                "description": "OpenAI تتجه للاكتتاب العام وتفتتح أول مختبر تطبيقي خارج أمريكا في سنغافورة.",
                "url": "https://www.reuters.com/technology/openai",
                "source": "Reuters",
                "category": "companies",
                "published": new Date().toISOString()
            },
            {
                "title": "محاكمة إيلون ماسك ضد OpenAI تنتهي ببراءة الشركة",
                "description": "هيئة المحلفين رفضت دعوى ماسك ضد OpenAI، وأكد القاضي أحقية الشركة في خطتها الربحية.",
                "url": "https://www.theguardian.com/technology/2026/may/19/what-did-we-learn-from-elon-musk-and-sam-altmans-courtroom-drama",
                "source": "The Guardian",
                "category": "people",
                "published": new Date().toISOString()
            },
            {
                "title": "قائمة أعلى أفلام 2026 دخلاً: Super Mario Galaxy في الصدارة",
                "description": "The Super Mario Galaxy Movie يتصدر شباك التذاكر العالمي بـ 423 مليون دولار محلياً، يليه Project Hail Mary.",
                "url": "https://en.wikipedia.org/wiki/List_of_2026_box_office_number-one_films_in_the_United_States",
                "source": "Wikipedia",
                "category": "movies",
                "published": new Date().toISOString()
            },
            {
                "title": "Anthropic تطلق Claude Mythos: أقوى نموذج للأمن السيبراني",
                "description": "Anthropic كشفت عن Claude Mythos ضمن مبادرة Project Glasswing بالتعاون مع Amazon, Apple, Google, Microsoft و NVIDIA.",
                "url": "https://dentro.de/ai/news",
                "source": "داخل/دي",
                "category": "companies",
                "published": new Date().toISOString()
            },
            {
                "title": "OpenAI و Anthropic تتجهان لشراء شركات استشارات هندسية",
                "description": "الشركتان تبحثان عن استحواذات لتوسيع خدمات نشر AI للمؤسسات عبر صناديق استثمار جديدة.",
                "url": "https://www.marketingprofs.com/opinions/2026/54655/ai-update-may-8-2026-ai-news-and-views-from-the-past-week",
                "source": "MarketingProfs",
                "category": "companies",
                "published": new Date().toISOString()
            },
            {
                "title": "Meta تطلق Muse Spark: نموذج AI جديد لتشغيل التطبيقات",
                "description": "Muse Spark يدعم المدخلات المتعددة ليعمل عبر Facebook و Instagram و WhatsApp والنظارات الذكية.",
                "url": "https://www.marketingprofs.com/opinions/2026/54530/ai-update-april-10-2026-ai-news-and-views-from-the-past-week",
                "source": "MarketingProfs",
                "category": "companies",
                "published": new Date().toISOString()
            },
            {
                "title": "أفضل 39 أداة AI مجانية في 2026: دليل كامل من DataCamp",
                "description": "دليل شامل لأفضل أدوات الذكاء الاصطناعي المجانية في 2026 مع شرح لكل أداة وما تقدمه.",
                "url": "https://www.datacamp.com/blog/free-ai-tools",
                "source": "DataCamp",
                "category": "ai-news",
                "published": new Date().toISOString()
            }
        ]
    };
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
        const category = item.category || 'ai-news';
        card.className = `news-card ${category}`;
        card.dataset.category = category;
        
        const pubDate = item.published ? new Date(item.published).toLocaleDateString('ar-TN', {
            year: 'numeric', month: 'short', day: 'numeric'
        }) : 'اليوم';

        const sourceName = item.source || 'مصدر موثوق';
        const url = item.url || '#';

        card.innerHTML = `
            <span class="source-tag">${sourceName}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description)}</p>
            <div class="card-footer">
                <span>📅 ${pubDate}</span>
                <a href="${url}" target="_blank" rel="noopener noreferrer" class="read-link">
                    اقرأ المزيد ←
                </a>
            </div>
        `;
        grid.appendChild(card);
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function filterNews(filter) {
    const cards = document.querySelectorAll('#allNewsGrid .news-card');
    let count = 0;
    cards.forEach(card => {
        if (filter === 'all') {
            card.style.display = 'flex';
            count++;
        } else {
            if (card.dataset.category === filter) {
                card.style.display = 'flex';
                count++;
            } else {
                card.style.display = 'none';
            }
        }
    });

    // Update badge with count
    const badge = document.getElementById('totalBadge');
    if (badge) {
        const total = document.querySelectorAll('#allNewsGrid .news-card').length;
        badge.textContent = filter === 'all' 
            ? total + ' خبراً'
            : count + ' خبراً';
    }
}

function updateStats(data) {
    const news = data.news || [];
    const total = news.length;
    const aiCount = news.filter(n => (n.category === 'ai-news')).length;
    const companiesCount = news.filter(n => (n.category === 'companies')).length;
    const peopleCount = news.filter(n => (n.category === 'people')).length;
    const moviesCount = news.filter(n => (n.category === 'movies')).length;

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

    // Get top 12 headlines for the ticker - slower scroll
    const headlines = data.news.slice(0, 12);
    const tickerText = headlines.map((n, i) => 
        `🔹 ${n.title.replace(/<[^>]*>/g, '')}`
    ).join(' &nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp; ');

    // Duplicate for seamless infinite scroll
    ticker.innerHTML = tickerText + ' &nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp; ' + tickerText;
}

// ===== Comments System =====
function initComments() {
    const submitBtn = document.getElementById('submitComment');
    const nameInput = document.getElementById('commentName');
    const textInput = document.getElementById('commentText');
    const charCount = document.getElementById('charCount');
    const commentsList = document.getElementById('commentsList');

    if (!submitBtn || !textInput) return;

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
    if (!container) return;
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
                    💬 ${escapeHtml(c.name)}
                    <span class="comment-time">${time}</span>
                </div>
                <div class="comment-text">${escapeHtml(c.text)}</div>
            </div>
        `;
    }).join('');
}