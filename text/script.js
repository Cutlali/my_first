// ===================== 1. 全局渐入元素：移出视口重置，进入重新播放动画 =====================
const fadeElements = document.querySelectorAll('.fade-in');
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        } else {
            entry.target.classList.remove('active');
        }
    });
}, { threshold: 0.15 });

fadeElements.forEach(el => fadeObserver.observe(el));

// ===================== 2. 顶部滚动进度条 =====================
window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop || window.pageYOffset;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    document.querySelector('.progress-bar').style.width = `${progress}%`;
});

// ===================== 封面粒子动画 =====================
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resize();
    window.addEventListener('resize', resize);
    
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.opacitySpeed = (Math.random() - 0.5) * 0.005;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.opacity += this.opacitySpeed;
            
            if (this.opacity <= 0.05 || this.opacity >= 0.6) {
                this.opacitySpeed *= -1;
            }
            
            if (this.x < 0 || this.x > canvas.width || 
                this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(74, 144, 226, ${this.opacity})`;
            ctx.fill();
        }
    }
    
    const particleCount = 80;
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function drawLines() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(74, 144, 226, ${0.08 * (1 - distance / 150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        drawLines();
        
        animationId = requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(animationId);
    });
}

// ===================== 封面滑出动画（跟随滚动进度） =====================
function initCoverScrollAnimation() {
    const cover = document.querySelector('.cover');
    if (!cover) return;
    
    const titleLeft = cover.querySelector('.title-left');
    const titleRight = cover.querySelector('.title-right');
    const subtitle = cover.querySelector('.cover-subtitle');
    const divider = cover.querySelector('.cover-divider');
    const stats = cover.querySelector('.cover-stats');
    const footer = cover.querySelector('.cover-footer');
    
    let coverTicking = false;
    
    function handleCoverScroll() {
        const scrollY = window.scrollY || window.pageYOffset;
        const coverHeight = cover.offsetHeight;
        
        let progress = Math.min(scrollY / coverHeight, 1);
        progress = Math.max(progress, 0);
        
        const easedProgress = 1 - Math.pow(1 - progress, 2);
        
        if (titleLeft) {
            const offsetX = easedProgress * 150;
            const opacity = 1 - easedProgress;
            titleLeft.style.transform = `translateX(-${offsetX}%)`;
            titleLeft.style.opacity = opacity;
        }
        
        if (titleRight) {
            const offsetX = easedProgress * 150;
            const opacity = 1 - easedProgress;
            titleRight.style.transform = `translateX(${offsetX}%)`;
            titleRight.style.opacity = opacity;
        }
        
        if (subtitle) {
            subtitle.style.opacity = 1 - easedProgress;
            subtitle.style.transform = `translateY(${easedProgress * 30}px)`;
        }
        
        if (divider) {
            divider.style.opacity = 1 - easedProgress;
        }
        
        if (stats) {
            stats.style.opacity = 1 - easedProgress;
            stats.style.transform = `translateY(${easedProgress * 20}px)`;
        }
        
        if (footer) {
            footer.style.opacity = 1 - easedProgress;
        }
    }
    
    window.addEventListener('scroll', () => {
        if (!coverTicking) {
            window.requestAnimationFrame(() => {
                handleCoverScroll();
                coverTicking = false;
            });
            coverTicking = true;
        }
    });
    
    handleCoverScroll();
}

// ===================== 数字滚动动画 =====================
function initCounterAnimation() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;
    
    let animated = false;
    
    function animateCounter(counter) {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const startTime = performance.now();
        const startValue = 0;
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(startValue + (target - startValue) * easeOut);
            
            counter.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                counter.textContent = target;
            }
        }
        
        requestAnimationFrame(update);
    }
    
    function checkCounters() {
        if (animated) return;
        
        const scrollY = window.scrollY || window.pageYOffset;
        const viewportHeight = window.innerHeight;
        
        counters.forEach(counter => {
            const rect = counter.getBoundingClientRect();
            if (rect.top < viewportHeight * 0.8 && rect.bottom > 0) {
                animated = true;
                setTimeout(() => {
                    counters.forEach(c => animateCounter(c));
                }, 500);
            }
        });
    }
    
    window.addEventListener('scroll', checkCounters);
    setTimeout(checkCounters, 300);
}

// ===================== 页面加载初始化 =====================
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initCoverScrollAnimation();
    initCounterAnimation();
});

// ===================== 3. 封面背景视差滚动 =====================
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const coverBg = document.querySelector('.cover-bg');
    if (coverBg) {
        coverBg.style.transform = `translateY(${scrollY * 0.3}px)`;
    }
});

// ===================== 4. 数据卡片数字滚动动画 =====================
function animateNumber(element, target, duration = 2000) {
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (target - start) * easeOutQuart);
        
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target.toLocaleString();
        }
    }
    
    requestAnimationFrame(update);
}

const dataCards = document.querySelectorAll('.data-card .num');
const dataObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const card = entry.target;
            const text = card.textContent;
            const match = text.match(/[\d.]+/);
            if (match) {
                const num = parseFloat(match[0].replace(/,/g, ''));
                const suffix = text.replace(match[0], '');
                card.textContent = '0' + suffix;
                setTimeout(() => {
                    animateNumber(card, num);
                    setTimeout(() => {
                        card.textContent = text;
                    }, 2000);
                }, 300);
            }
            dataObserver.unobserve(card);
        }
    });
}, { threshold: 0.5 });

dataCards.forEach(card => dataObserver.observe(card));

// ===================== 5. 地图弹窗逻辑 =====================
const provinceData = {
    fujian: {
        title: "福建｜双通道药品扩至603种",
        data: "新增95个国家谈判药品，为患者提供更全面的用药保障",
        people: "目录重点纳入法布雷病、脊髓性肌萎缩症（SMA）、地中海贫血症等罕见病特效药，同时覆盖肿瘤、自身免疫病、慢性病等临床急需高价药"
    },
    jiangxi: {
        title: "江西｜双通道药品共478个",
        data: "按保障类别细分：A类318个、B类160个。",
        people: "药品覆盖肿瘤、罕见病、慢性病、精神疾病等重大疾病与临床刚需领域"
    },
    hebei: {
        title: "河北｜131种药品纳入双通道",
        data: "112种谈判药品+19种商保药品",
        people: "112种谈判药涵盖肿瘤、抗感染、慢性病、罕见病、精神疾病等领域；19种商保创新药包含戈谢病、短肠综合征、神经母细胞瘤等罕见病用药"
    }
};

const points = document.querySelectorAll('.map-point');
const popup = document.getElementById('popup');
const popupTitle = document.getElementById('popup-title');
const popupData = document.getElementById('popup-data');
const popupPeople = document.getElementById('popup-people');
const closeBtn = document.querySelector('.close-btn');

points.forEach(point => {
    point.addEventListener('click', (e) => {
        e.stopPropagation();
        const province = point.dataset.province;
        const data = provinceData[province];
        if (data) {
            popupTitle.textContent = data.title;
            popupData.textContent = data.data;
            popupPeople.textContent = data.people;
            popup.style.display = 'flex';
            setTimeout(() => {
                popup.querySelector('.popup-content').style.transform = 'scale(1)';
                popup.querySelector('.popup-content').style.opacity = '1';
            }, 10);
        }
    });
});

function closePopup() {
    popup.querySelector('.popup-content').style.transform = 'scale(0.8)';
    popup.querySelector('.popup-content').style.opacity = '0';
    setTimeout(() => {
        popup.style.display = 'none';
    }, 300);
}

closeBtn.addEventListener('click', closePopup);
popup.addEventListener('click', (e) => {
    if (e.target === popup) {
        closePopup();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup.style.display === 'flex') {
        closePopup();
    }
});
// ===================== 6. 环形递进图表：肿瘤药物 =====================
let tumorChart = null;
const tumorSection = document.querySelector('.chart-section');
const tumorCanvas = document.getElementById('tumorChart');

const drugImageData = [
    {
        name: '奥希替尼',
        img: 'images/drugs/osimertinib.jpg',
        desc: '肺癌三代EGFR靶向药',
        drugNames: '奥希替尼、阿来替尼等'
    },
    {
        name: '信迪利单抗',
        img: 'images/drugs/sintilimab.jpg',
        desc: 'PD-1免疫检查点抑制剂',
        drugNames: '信迪利单抗、卡瑞利珠单抗等'
    },
    {
        name: '德曲妥珠单抗',
        img: 'images/drugs/trastuzumab.jpg',
        desc: 'HER2 ADC抗体偶联药物',
        drugNames: '德曲妥珠单抗、戈沙妥珠单抗等'
    },
    {
        name: '拉罗替尼',
        img: 'images/drugs/larotrectinib.jpg',
        desc: 'NTRK广谱抗癌靶向药',
        drugNames: '拉罗替尼、恩曲替尼等'
    }
];

// 注册全局插件（只注册一次）
if (typeof Chart !== 'undefined' && Chart.registry && Chart.registry.plugins) {
    if (!Chart.registry.plugins.get('centerText')) {
        Chart.register({
            id: 'centerText',
            afterDraw: function(chart) {
                if (chart.canvas.id !== 'tumorChart') return;
                
                const ctx = chart.ctx;
                const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
                const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
                
                ctx.save();
                ctx.beginPath();
                ctx.arc(centerX, centerY, 55, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = 'rgba(74, 144, 226, 0.2)';
                ctx.shadowBlur = 20;
                ctx.fill();
                ctx.restore();
                
                ctx.save();
                ctx.beginPath();
                ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                ctx.strokeStyle = 'rgba(74, 144, 226, 0.15)';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
                
                ctx.save();
                ctx.fillStyle = '#1a1a2e';
                ctx.font = 'bold 18px "Noto Sans SC", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('肿瘤用药', centerX, centerY - 8);
                
                ctx.fillStyle = '#4a90e2';
                ctx.font = 'bold 24px "DM Serif Display", serif';
                ctx.fillText('100种', centerX, centerY + 18);
                ctx.restore();
            }
        });
    }
}

const tumorObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (tumorChart) tumorChart.destroy();
            setTimeout(() => initTumorChart(), 200);
        }
    });
}, { threshold: 0.2 });

if (tumorSection) {
    tumorObserver.observe(tumorSection);
}

function initTumorChart() {
    if (!tumorCanvas) return;
    const ctx = tumorCanvas.getContext('2d');
    
    const popupCard = document.getElementById('piePopupCard');
    const popupImg = document.getElementById('popupDrugImg');
    const popupName = document.getElementById('popupDrugName');
    const popupCount = document.getElementById('popupDrugCount');
    const popupDesc = document.getElementById('popupDrugDesc');
    
    const chartData = [17, 23, 28, 32];
    const labels = [
        '2018年 肺癌靶向药',
        '2019年 PD-1免疫治疗',
        '2023年 ADC抗体偶联药物',
        '2024年 广谱抗癌靶向药'
    ];
    const colors = [
        '#cce0f5',
        '#99c2eb',
        '#66a3e0',
        '#3385d6'
    ];
    const hoverColors = [
        '#b3d4f0',
        '#80b3e5',
        '#4d94db',
        '#1a75d1'
    ];
    
    tumorChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: chartData,
                backgroundColor: colors,
                hoverBackgroundColor: hoverColors,
                borderColor: '#ffffff',
                borderWidth: 4,
                cutout: '50%',
                circumference: 270,
                rotation: 225,
                borderRadius: 6,
                spacing: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    align: 'center',
                    labels: {
                        padding: 20,
                        font: {
                            family: "'Inter', 'PingFang SC', sans-serif",
                            size: 13
                        },
                        boxWidth: 15,
                        boxHeight: 15,
                        usePointStyle: true,
                        pointStyleWidth: 15
                    }
                },
                tooltip: {
                    enabled: false
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    });
    
    // 用原生事件处理悬停
    tumorCanvas.addEventListener('mousemove', function(e) {
        const points = tumorChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
        
        if (points.length > 0) {
            const index = points[0].index;
            const data = drugImageData[index];
            
            if (popupImg) popupImg.src = data.img;
            if (popupName) popupName.textContent = data.name;
            if (popupCount) popupCount.textContent = chartData[index] + '种';
            if (popupDesc) popupDesc.textContent = data.desc;
            
            const meta = tumorChart.getDatasetMeta(0);
            const arc = meta.data[index];
            const midAngle = (arc.startAngle + arc.endAngle) / 2;
            const midRadius = (arc.outerRadius + arc.innerRadius) / 2;
            
            const arcX = arc.x + Math.cos(midAngle) * midRadius;
            const arcY = arc.y + Math.sin(midAngle) * midRadius;
            
            const canvasRect = tumorCanvas.getBoundingClientRect();
            const wrapperRect = tumorCanvas.parentElement.getBoundingClientRect();
            
            const relX = arcX + (canvasRect.left - wrapperRect.left);
            const relY = arcY + (canvasRect.top - wrapperRect.top);
            
            popupCard.style.left = (relX - 110) + 'px';
            popupCard.style.top = (relY - 210) + 'px';
            
            popupCard.classList.add('active');
            tumorCanvas.style.cursor = 'pointer';
        } else {
            popupCard.classList.remove('active');
            tumorCanvas.style.cursor = 'default';
        }
    });
    
    tumorCanvas.addEventListener('mouseleave', function() {
        if (popupCard) {
            popupCard.classList.remove('active');
        }
        tumorCanvas.style.cursor = 'default';
    });
}

// ===================== 7. 柱线组合图：年度数据 =====================
let barLineChart = null;
const barLineSection = document.querySelector('.line-bar-chart-section');
const barLineCanvas = document.getElementById('yearChart');

const barLineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (barLineChart) barLineChart.destroy();
            setTimeout(() => initBarLineChart(), 200);
        }
    });
}, { threshold: 0.2 });

if (barLineSection) {
    barLineObserver.observe(barLineSection);
}

function initBarLineChart() {
    if (!barLineCanvas) return;
    const ctx = barLineCanvas.getContext('2d');
    
    barLineChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
            datasets: [
                {
                    type: 'bar',
                    label: '目录总数（种）',
                    data: [2535, 2709, 2800, 2860, 2967, 3088, 3159, 3253],
                    backgroundColor: 'rgba(26, 95, 122, 0.5)',
                    borderColor: 'rgba(26, 95, 122, 0.8)',
                    borderWidth: 1,
                    borderRadius: 6,
                    barPercentage: 0.65,
                    categoryPercentage: 0.8,
                    yAxisID: 'y',
                    order: 2
                },
                {
                    type: 'line',
                    label: '调入数量（种）',
                    data: [17, 218, 119, 74, 111, 126, 91, 114],
                    borderColor: '#F7C331',
                    backgroundColor: '#F7C331',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: false,
                    pointRadius: 5,
                    pointBackgroundColor: '#F7C331',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 8,
                    yAxisID: 'y1',
                    order: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            family: "'Inter', 'PingFang SC', sans-serif",
                            size: 14
                        },
                        usePointStyle: true,
                        pointStyleWidth: 10
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 52, 96, 0.9)',
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: {
                        family: "'Inter', sans-serif",
                        size: 14
                    },
                    bodyFont: {
                        family: "'Inter', sans-serif",
                        size: 13
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 2000,
                    position: 'left',
                    title: {
                        display: true,
                        text: '目录总数（种）',
                        font: {
                            family: "'Inter', sans-serif",
                            size: 13
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.06)'
                    },
                    ticks: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        }
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    title: {
                        display: true,
                        text: '调入数量（种）',
                        font: {
                            family: "'Inter', sans-serif",
                            size: 13
                        }
                    },
                    ticks: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        },
                        stepSize: 50
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        }
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// ===================== 8. 右侧悬浮导航：点击跳转 + 滚动高亮 =====================
const navDots = document.querySelectorAll('.nav-dot');
const sections = document.querySelectorAll('section');

navDots.forEach(dot => {
    dot.addEventListener('click', () => {
        const targetId = dot.dataset.target;
        const targetSection = document.querySelector(`.${targetId}`);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

let navTicking = false;
window.addEventListener('scroll', () => {
    if (!navTicking) {
        requestAnimationFrame(() => {
            const scrollY = window.scrollY || window.pageYOffset;
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                const sectionHeight = section.clientHeight;
                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    current = section.className.split(' ')[0];
                }
            });
            
            navDots.forEach(dot => {
                dot.classList.remove('active');
                if (dot.dataset.target === current) {
                    dot.classList.add('active');
                }
            });
            
            navTicking = false;
        });
        navTicking = true;
    }
});

// ===================== 9. 主标题滚动缩放动画 =====================
const mainTitle = document.querySelector('.main-title');
const coverSection = document.querySelector('.cover');
let titleTicking = false;

function updateTitleScale() {
    const scrollY = window.scrollY || window.pageYOffset;
    if (coverSection && scrollY <= coverSection.offsetHeight) {
        let scale = 1 - (scrollY / coverSection.offsetHeight) * 0.3;
        scale = Math.max(0.7, scale);
        mainTitle.style.transform = `scale(${scale})`;
    }
    titleTicking = false;
}

window.addEventListener('scroll', () => {
    if (!titleTicking) {
        window.requestAnimationFrame(updateTitleScale);
        titleTicking = true;
    }
});

// ===================== 10. 过渡页动画：文字渐入 + 图表生长 =====================
const transitionPage = document.querySelector('.transition-page');
const transitionTitle = document.querySelector('.transition-title');
const transitionSubtitle = document.querySelector('.transition-subtitle');
const transitionChartContainer = document.querySelector('.transition-chart-container');
const miniChartWrapper = document.getElementById('miniChart');
let transitionAnimated = false;

function handleTransitionAnimation() {
    if (!transitionPage) return;
    
    const scrollY = window.scrollY || window.pageYOffset;
    const pageTop = transitionPage.offsetTop;
    const pageHeight = transitionPage.offsetHeight;
    const viewportHeight = window.innerHeight;
    
    const pageCenter = pageTop + pageHeight / 2;
    const viewportCenter = scrollY + viewportHeight / 2;
    
    const distanceFromCenter = Math.abs(viewportCenter - pageCenter);
    const triggerDistance = viewportHeight * 0.4;
    
    if (distanceFromCenter < triggerDistance) {
        if (transitionTitle) {
            transitionTitle.classList.add('visible');
        }
        if (transitionSubtitle) {
            transitionSubtitle.classList.add('visible');
        }
        
        if (!transitionAnimated && transitionChartContainer) {
            transitionAnimated = true;
            
            setTimeout(() => {
                transitionChartContainer.classList.add('visible');
                
                setTimeout(() => {
                    animateMiniChart();
                }, 600);
            }, 800);
        }
    } else if (distanceFromCenter > viewportHeight * 0.8) {
        if (transitionTitle) {
            transitionTitle.classList.remove('visible');
        }
        if (transitionSubtitle) {
            transitionSubtitle.classList.remove('visible');
        }
        if (transitionChartContainer) {
            transitionChartContainer.classList.remove('visible');
        }
        
        if (transitionAnimated) {
            transitionAnimated = false;
            resetMiniChart();
        }
    }
}

function animateMiniChart() {
    if (!miniChartWrapper) return;
    
    const groups = miniChartWrapper.querySelectorAll('.peak-group');
    const maxValue = 36;
    const maxPeakHeight = 180;
    
    groups.forEach((group, index) => {
        const value = parseInt(group.dataset.value);
        const peak = group.querySelector('.peak');
        const label = group.querySelector('.peak-label');
        const height = (value / maxValue) * maxPeakHeight;
        
        setTimeout(() => {
            peak.style.borderBottomWidth = `${height}px`;
            peak.style.borderBottomColor = '#4a90e2';
            peak.classList.add('animated');
            
            setTimeout(() => {
                label.classList.add('show');
            }, 600);
        }, index * 150);
    });
}

function resetMiniChart() {
    if (!miniChartWrapper) return;
    
    const peaks = miniChartWrapper.querySelectorAll('.peak');
    const labels = miniChartWrapper.querySelectorAll('.peak-label');
    
    peaks.forEach(peak => {
        peak.style.borderBottomWidth = '0';
        peak.classList.remove('animated');
    });
    
    labels.forEach(label => {
        label.classList.remove('show');
    });
}

let transitionTicking = false;
window.addEventListener('scroll', () => {
    if (!transitionTicking) {
        window.requestAnimationFrame(() => {
            handleTransitionAnimation();
            transitionTicking = false;
        });
        transitionTicking = true;
    }
});

handleTransitionAnimation();

// ===================== 11. 移动端触摸优化 =====================
let touchStartY = 0;
document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.body.addEventListener('touchmove', function(e) {
    if (e.target === document.body) {
        e.preventDefault();
    }
}, { passive: false });

// ===================== 12. 初始化完成日志 =====================
console.log('✅ 医保目录人群地图 - 已就绪');
console.log('📊 图表将在滚动到对应区域时自动加载');
console.log('🗺️ 点击地图上的蓝色圆点查看省份数据');
这是js