// ===================== 1. 全局渐入元素：移出视口重置，进入重新播放动画 =====================

const fadeElements = document.querySelectorAll('.fade-in');
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // 进入后取消观察，保持显示状态
            fadeObserver.unobserve(entry.target);
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
    // ========== 预设容器高度，防止滚动时遮罩跳动 ==========
    const containers = [
        { selector: '.chart-container.large-chart', minHeight: '500px' },
        { selector: '.chart-container.big-chart', minHeight: '450px' },
        { selector: '.transition-chart-container', minHeight: '350px' },
        { selector: '.rare-disease-container', minHeight: '600px' },
        { selector: '.mini-chart-wrapper', minHeight: '250px' },
        { selector: '.map-container', minHeight: '550px' }
    ];
    
    containers.forEach(({ selector, minHeight }) => {
        const el = document.querySelector(selector);
        if (el) el.style.minHeight = minHeight;
    });
    // ========== 预设结束 ==========
    
    // 原有代码
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
            // 先让左边的框显示出来
            const leftContainer = document.querySelector('.chart-cell-topleft .chart-container.large-chart');
            if (leftContainer) {
                leftContainer.classList.add('visible');
            }
            
            // 再初始化图表
            if (tumorChart) tumorChart.destroy();
            setTimeout(() => initTumorChart(), 200);
        } else {
            // 移出视口时移除类，下次进入重新播放
            const leftContainer = document.querySelector('.chart-cell-topleft .chart-container.large-chart');
            if (leftContainer) {
                leftContainer.classList.remove('visible');
            }
        }
    });
}, { threshold: 0.15 });

if (tumorSection) {
    tumorObserver.observe(tumorSection);
}
let tumorChartInitializing = false;
function initTumorChart() {
    if (!tumorCanvas) return;
        if (tumorChartInitializing) return;  // 👈 加这行
    tumorChartInitializing = true; 
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
            
            popupCard.style.left = (relX - 90) + 'px';
            popupCard.style.top = (relY - 180) + 'px';
            
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
     tumorChartInitializing = false; 
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

// 通用查找：先按 id，再按 class
function getTargetElement(targetId) {
    return document.getElementById(targetId) || document.querySelector(`.${targetId}`);
}

// 点击跳转
navDots.forEach(dot => {
    dot.addEventListener('click', () => {
        const targetElement = getTargetElement(dot.dataset.target);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// 滚动高亮
let navTicking = false;
window.addEventListener('scroll', () => {
    if (!navTicking) {
        requestAnimationFrame(() => {
            const scrollY = window.scrollY || window.pageYOffset;
            const viewportHeight = window.innerHeight;
            let current = '';

            // 从所有导航点反向查找对应元素
            const targets = Array.from(navDots)
                .map(dot => ({
                    id: dot.dataset.target,
                    el: getTargetElement(dot.dataset.target)
                }))
                .filter(item => item.el);

            // 从下往上找第一个进入视口的
            for (let i = targets.length - 1; i >= 0; i--) {
                if (scrollY + viewportHeight * 0.4 >= targets[i].el.offsetTop) {
                    current = targets[i].id;
                    break;
                }
            }

            navDots.forEach(dot => {
                dot.classList.toggle('active', dot.dataset.target === current);
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

// ===================== 10. 过渡页动画 + 迷你图表动画 =====================
const chartSection = document.querySelector('.chart-section');
const transitionChartContainer = document.querySelector('.transition-chart-container');
const miniChartWrapper = document.getElementById('miniChart');

let miniChartAnimated = false;


// ========== 过渡页动画：标题渐入（支持多个过渡页） ==========
function handleAllTransitionAnimations() {
    const allTransitionPages = document.querySelectorAll('.disease-transition');
    
    allTransitionPages.forEach(page => {
        const title = page.querySelector('.transition-title');
        const subtitle = page.querySelector('.transition-subtitle');
        
        if (!title && !subtitle) return;
        
        const scrollY = window.scrollY || window.pageYOffset;
        const pageTop = page.offsetTop;
        const pageHeight = page.offsetHeight;
        const viewportHeight = window.innerHeight;
        
        const pageCenter = pageTop + pageHeight / 2;
        const viewportCenter = scrollY + viewportHeight / 2;
        const distanceFromCenter = Math.abs(viewportCenter - pageCenter);
        const triggerDistance = viewportHeight * 0.4;
        
        if (distanceFromCenter < triggerDistance) {
            if (title) title.classList.add('visible');
            if (subtitle) subtitle.classList.add('visible');
        } else if (distanceFromCenter > viewportHeight * 0.8) {
            if (title) title.classList.remove('visible');
            if (subtitle) subtitle.classList.remove('visible');
        }
    });
}


// ========== 迷你图表动画（在 chart-section 内） ==========
let miniChartVisible = false;

function handleMiniChartAnimation() {
    if (!chartSection || !transitionChartContainer) return;
    
    const scrollY = window.scrollY || window.pageYOffset;
    const sectionTop = chartSection.offsetTop;
    const sectionHeight = chartSection.offsetHeight;
    const viewportHeight = window.innerHeight;
    
    // 判断 chart-section 是否在视口内
    const sectionInView = (sectionTop < scrollY + viewportHeight) && 
                          (sectionTop + sectionHeight > scrollY);

    // 进入视口时触发动画
    if (sectionInView && !miniChartVisible) {
        miniChartVisible = true;
        if (transitionChartContainer) {
            transitionChartContainer.classList.add('visible');
        }
        setTimeout(() => {
            animateMiniChart();
        }, 100);
    }

    // 离开视口时重置动画
    if (!sectionInView && miniChartVisible) {
        miniChartVisible = false;
        if (transitionChartContainer) {
            transitionChartContainer.classList.remove('visible');
        }
        resetMiniChart();
    }
}

let miniChartTimer = null;

function animateMiniChart() {
    if (!miniChartWrapper) return;
    
    const groups = miniChartWrapper.querySelectorAll('.peak-group');
    const maxValue = 36;
    const maxPeakHeight = 180;
    
    // 先重置所有三角形
    groups.forEach(group => {
        const peak = group.querySelector('.peak');
        const label = group.querySelector('.peak-label');
        if (peak) {
            peak.style.borderBottomWidth = '0';
            peak.classList.remove('animated');
        }
        if (label) {
            label.classList.remove('show');
        }
    });
    
    // 延迟一下再播放动画，确保重置生效
miniChartTimer = setTimeout(() => {  // 👈 改成 miniChartTimer =
    groups.forEach((group, index) => {
            const value = parseInt(group.dataset.value);
            const peak = group.querySelector('.peak');
            const label = group.querySelector('.peak-label');
            const height = (value / maxValue) * maxPeakHeight;
            
            setTimeout(() => {
                if (peak) {
                    peak.style.borderBottomWidth = `${height}px`;
                    peak.style.borderBottomColor = '#4a90e2';
                    peak.classList.add('animated');
                    
                    // 👇 新增：给每个柱形添加悬停交互
                    addPeakHoverEffect(peak, group, value);
                }
                
                setTimeout(() => {
                    if (label) {
                        label.classList.add('show');
                    }
                }, 60);
            }, index * 150);
        });
    }, 500);
}

// 👇 新增函数：柱形悬停交互
function addPeakHoverEffect(peak, group, value) {
    const label = group.querySelector('.peak-label');
    const yearLabel = group.querySelector('.year-label');
    
    // 鼠标进入
    group.addEventListener('mouseenter', () => {
        // 柱形变色 + 发光
        peak.style.borderBottomColor = '#1a5f7a';
        peak.style.filter = 'drop-shadow(0 6px 16px rgba(26, 95, 122, 0.5))';
        peak.style.transform = 'translateY(-4px)';
        
        // 数字标签放大变色
        if (label) {
            label.style.transform = 'scale(1.4)';
            label.style.color = '#1a5f7a';
            label.style.fontWeight = '700';
        }
        
        // 年份标签变色
        if (yearLabel) {
            yearLabel.style.color = '#1a5f7a';
            yearLabel.style.fontWeight = '600';
        }
    });
    
    // 鼠标离开
    group.addEventListener('mouseleave', () => {
        // 恢复柱形
        peak.style.borderBottomColor = '#4a90e2';
        peak.style.filter = 'none';
        peak.style.transform = 'translateY(0)';
        
        // 恢复数字标签
        if (label) {
            label.style.transform = 'scale(1)';
            label.style.color = '#1a1a2e';
            label.style.fontWeight = '600';
        }
        
        // 恢复年份标签
        if (yearLabel) {
            yearLabel.style.color = '#555';
            yearLabel.style.fontWeight = 'normal';
        }
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

let globalTicking = false;
window.addEventListener('scroll', () => {
    if (!globalTicking) {
        window.requestAnimationFrame(() => {
            handleAllTransitionAnimations();
            handleMiniChartAnimation();
            globalTicking = false;
        });
        globalTicking = true;
    }
});

// 初始检查
handleAllTransitionAnimations();
handleMiniChartAnimation();





// ===================== 12. 罕见病图表动画 =====================
function initRareDiseaseChart() {
    const bottleSvg = `<svg viewBox="0 0 24 24" class="rare-icon-item">
        <path d="M10 2h4v2h-4V2zm1 4h2v2h-2V6zm-3 4h8v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V10h4zm0 2v6h6v-6H8z"/>
    </svg>`;

    const rows = document.querySelectorAll('.rare-chart-row');
    
    rows.forEach(row => {
        const year = row.dataset.year;
        const count = parseInt(row.dataset.count);
        const iconGroup = row.querySelector('.rare-icon-group');
        const countLabel = row.querySelector('.rare-count-label');
        
        // 清空旧图标
        iconGroup.innerHTML = '';
        
        // 生成对应数量的图标
        for (let i = 0; i < count; i++) {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = bottleSvg;
            const icon = wrapper.firstElementChild;
            icon.classList.add(`rare-icon-${year}`);
            // 设置动画延迟，实现从左到右依次出现
            icon.style.animationDelay = `${i * 0.08}s`;
            iconGroup.appendChild(icon);
        }
        
        // 数字标签延迟显示
        countLabel.style.animationDelay = `${count * 0.08 + 0.2}s`;
    });
}

// 罕见病页面进入视口时触发动画
const rareSection = document.querySelector('.rare-disease-section');
let rareChartAnimated = false;

if (rareSection) {
    const rareObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !rareChartAnimated) {
                rareChartAnimated = true;
                setTimeout(() => initRareDiseaseChart(), 200);
            }
            // 离开视口时重置，下次进入重新播放
            if (!entry.isIntersecting) {
                rareChartAnimated = false;
            }
        });
    }, { threshold: 0.3 });
    
    rareObserver.observe(rareSection);
}

// ===================== 13. 慢性病图表动画 =====================
const chronicChartSection = document.querySelector('.chronic-chart-section');
let chronicChartAnimated = false;

function initChronicChart() {
    const chronicColumns = document.querySelectorAll('.chronic-chart-section .bar-column');
    const chronicMaxScale = 70;

    chronicColumns.forEach(col => {
        const value = parseInt(col.getAttribute('data-value'));
        const stem = col.querySelector('.stem');
        const head = col.querySelector('.head');

        const percentage = (value / chronicMaxScale) * 100;

        setTimeout(() => {
            stem.style.height = `${percentage}%`;
        }, 100);

        if (window.getComputedStyle) {
            const headColor = window.getComputedStyle(head).backgroundColor;
            stem.style.backgroundColor = headColor;
        }
    });
}

if (chronicChartSection) {
    const chronicObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !chronicChartAnimated) {
                chronicChartAnimated = true;
                setTimeout(() => initChronicChart(), 200);
            }
            // 离开视口时重置，下次进入重新播放
            if (!entry.isIntersecting) {
                chronicChartAnimated = false;
                // 重置杆子高度
                const stems = document.querySelectorAll('.chronic-chart-section .stem');
                stems.forEach(stem => {
                    stem.style.height = '0';
                });
            }
        });
    }, { threshold: 0.3 });

    chronicObserver.observe(chronicChartSection);
}

// ===================== 15. 肿瘤深度解读 - 滚动驱动动画（三人从容版 + 150vh + 提前展示） =====================
function initTumorDeepDive() {
    const section = document.getElementById('tumor-deep-dive');
    if (!section) return;
    
    const runboy = document.getElementById('characterRunboy');
    const boyill = document.getElementById('characterBoyill');
    const playboy = document.getElementById('characterPlayboy');
    const textLeft = document.getElementById('deepDiveTextLeft');
    const textRight = document.getElementById('deepDiveTextRight');
    const textRightBottom = document.getElementById('deepDiveTextRightBottom');
    
    if (!runboy || !boyill || !playboy || !textLeft || !textRight || !textRightBottom) return;
    
    function getSectionBounds() {
        const rect = section.getBoundingClientRect();
        const scrollY = window.scrollY || window.pageYOffset;
        const viewportHeight = window.innerHeight;
        
        return {
            top: rect.top + scrollY,
            bottom: rect.bottom + scrollY,
            height: rect.height,
            viewportHeight: viewportHeight
        };
    }
    
    function getProgress() {
        const bounds = getSectionBounds();
        const scrollY = window.scrollY || window.pageYOffset;
        
        // 150vh 页面：section 顶部进入视野就开始，底部快离开才结束
        const start = bounds.top - bounds.viewportHeight * 0.8;
        const end = bounds.bottom - bounds.viewportHeight * 0.2;
        const range = end - start;
        
        if (range <= 0) return 0;
        
        let progress = (scrollY - start) / range;
        progress = Math.max(0, Math.min(1, progress));
        
        return progress;
    }
    
    function mapRange(value, inMin, inMax, outMin, outMax, clamped = true) {
        let result = outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
        if (clamped) {
            result = Math.max(outMin, Math.min(outMax, result));
        }
        return result;
    }
    
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    function update() {
        const progress = getProgress();
        
        // ========== 三人从容时间线（150vh 优化版 + 提前展示）==========
        //
        // 【runboy - 第1个，上方，左→右】
        // 0.00-0.04  淡入
        // 0.04-0.22  停顿（从容等待）
        // 0.22-0.30  奔跑前半段：左边(-350) → 中间(0)
        // 0.30-0.36  奔跑后半段：中间(0) → 右边(500)，最后淡出
        //
        // 【boyill - 第2个，中间，右→左】
        // 0.30-0.34  淡入
        // 0.34-0.52  停顿（从容等待）
        // 0.52-0.60  奔跑前半段：右边(350) → 中间(0)
        // 0.60-0.66  奔跑后半段：中间(0) → 左边(-500)，最后淡出
        //
        // 【playboy - 第3个，下方，左→右】
        // 0.58-0.62  淡入
        // 0.62-0.82  停顿（从容等待，有充足时间看）
        // 0.82-0.88  奔跑前半段：左边(-350) → 中间(0)
        // 0.88-0.94  奔跑后半段：中间(0) → 右边(500)，最后淡出
        
        // ========== runboy 动画（上方，左→右）==========
        let runboyX, runboyOpacity;
        
        if (progress <= 0.04) {
            runboyX = -350;
            runboyOpacity = mapRange(progress, 0.00, 0.04, 0, 1);
        } else if (progress <= 0.22) {
            runboyX = -350;
            runboyOpacity = 1;
        } else if (progress <= 0.30) {
            const t = mapRange(progress, 0.22, 0.30, 0, 1);
            runboyX = -350 + (350 * easeInOutCubic(t));
            runboyOpacity = 1;
        } else if (progress <= 0.36) {
            const t = mapRange(progress, 0.30, 0.36, 0, 1);
            runboyX = 0 + (500 * easeInOutCubic(t));
            runboyOpacity = mapRange(t, 0.0, 1.0, 1, 0);
        } else {
            runboyX = 500;
            runboyOpacity = 0;
        }
        
        // 右侧文本（runboy 的）
        let rightTextOpacity;
        if (progress <= 0.04) {
            rightTextOpacity = mapRange(progress, 0.00, 0.04, 0, 1);
        } else if (progress <= 0.26) {
            rightTextOpacity = 1;
        } else if (progress <= 0.30) {
            rightTextOpacity = mapRange(progress, 0.26, 0.30, 1, 0);
        } else {
            rightTextOpacity = 0;
        }
        
        // ========== boyill 动画（中间，右→左）==========
        let boyillX, boyillOpacity;
        
        if (progress <= 0.30) {
            boyillX = 350;
            boyillOpacity = 0;
        } else if (progress <= 0.34) {
            boyillX = 350;
            boyillOpacity = mapRange(progress, 0.30, 0.34, 0, 1);
        } else if (progress <= 0.52) {
            boyillX = 350;
            boyillOpacity = 1;
        } else if (progress <= 0.60) {
            const t = mapRange(progress, 0.52, 0.60, 0, 1);
            boyillX = 350 - (350 * easeInOutCubic(t));
            boyillOpacity = 1;
        } else if (progress <= 0.66) {
            const t = mapRange(progress, 0.60, 0.66, 0, 1);
            boyillX = 0 - (500 * easeInOutCubic(t));
            boyillOpacity = mapRange(t, 0.0, 1.0, 1, 0);
        } else {
            boyillX = -500;
            boyillOpacity = 0;
        }
        
        // 左侧文本（boyill 的）
        let leftTextOpacity;
        if (progress <= 0.30) {
            leftTextOpacity = 0;
        } else if (progress <= 0.34) {
            leftTextOpacity = mapRange(progress, 0.30, 0.34, 0, 1);
        } else if (progress <= 0.56) {
            leftTextOpacity = 1;
        } else if (progress <= 0.60) {
            leftTextOpacity = mapRange(progress, 0.56, 0.60, 1, 0);
        } else {
            leftTextOpacity = 0;
        }
        
        // ========== playboy 动画（下方，左→右）==========
        let playboyX, playboyOpacity;
        
        if (progress <= 0.58) {
            playboyX = -350;
            playboyOpacity = 0;
        } else if (progress <= 0.62) {
            playboyX = -350;
            playboyOpacity = mapRange(progress, 0.58, 0.62, 0, 1);
        } else if (progress <= 0.82) {
            playboyX = -350;
            playboyOpacity = 1;
        } else if (progress <= 0.88) {
            const t = mapRange(progress, 0.82, 0.88, 0, 1);
            playboyX = -350 + (350 * easeInOutCubic(t));
            playboyOpacity = 1;
        } else if (progress <= 0.94) {
            const t = mapRange(progress, 0.88, 0.94, 0, 1);
            playboyX = 0 + (500 * easeInOutCubic(t));
            playboyOpacity = mapRange(t, 0.0, 1.0, 1, 0);
        } else {
            playboyX = 500;
            playboyOpacity = 0;
        }
        
        // playboy 的右侧文本
        let rightBottomTextOpacity;
        if (progress <= 0.58) {
            rightBottomTextOpacity = 0;
        } else if (progress <= 0.62) {
            rightBottomTextOpacity = mapRange(progress, 0.58, 0.62, 0, 1);
        } else if (progress <= 0.86) {
            rightBottomTextOpacity = 1;
        } else if (progress <= 0.88) {
            rightBottomTextOpacity = mapRange(progress, 0.86, 0.88, 1, 0);
        } else {
            rightBottomTextOpacity = 0;
        }
        
        // ========== 应用样式 ==========
        runboy.style.transform = `translate(calc(-50% + ${runboyX}px), -50%)`;
        runboy.style.opacity = runboyOpacity;
        
        boyill.style.transform = `translate(calc(-50% + ${boyillX}px), -50%)`;
        boyill.style.opacity = boyillOpacity;
        
        playboy.style.transform = `translate(calc(-50% + ${playboyX}px), -50%)`;
        playboy.style.opacity = playboyOpacity;
        
        textRight.style.opacity = rightTextOpacity;
        textLeft.style.opacity = leftTextOpacity;
        textRightBottom.style.opacity = rightBottomTextOpacity;
    }
    
    let ticking = false;
    
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                update();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
    
    update();
    
    console.log('✅ 肿瘤深度解读动画已就绪（三人从容版 + 150vh + 提前展示）');
}

document.addEventListener('DOMContentLoaded', () => {
    initTumorDeepDive();
});


// ===================== 15. 全局遮罩：过渡页位置镂空 =====================
function updateGlobalOverlay() {
    const overlay = document.querySelector('.global-overlay');
    if (!overlay) return;

    const viewportHeight = window.innerHeight;

    // 找到所有过渡页
    const transitions = document.querySelectorAll('.disease-transition');

    if (transitions.length === 0) {
        overlay.style.webkitMaskImage = 'none';
        overlay.style.maskImage = 'none';
        return;
    }

    // 构建渐变：默认不透明，在过渡页位置透明
    let gradientParts = [];

    transitions.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const top = (rect.top / viewportHeight) * 100;
        const height = (rect.height / viewportHeight) * 100;
        const bottom = top + height;

       // 镂空区域：过渡页中间 50% 透明，边缘羽化更柔和
const holeTop = top + height * 0.25;      // 👈 往上扩（原来是 0.35）
const holeBottom = top + height * 0.75;   // 👈 往下扩（原来是 0.65）

gradientParts.push(
    `black ${holeTop}%`,
    `transparent ${holeTop + 5}%`,        // 👈 羽化更柔和（原来是 2%）
    `transparent ${holeBottom - 5}%`,     // 👈 羽化更柔和（原来是 2%）
    `black ${holeBottom}%`
);

    });

    const maskValue = `linear-gradient(to bottom, ${gradientParts.join(', ')})`;
    overlay.style.webkitMaskImage = maskValue;
    overlay.style.maskImage = maskValue;
}

// 滚动时更新遮罩
let overlayTicking = false;
window.addEventListener('scroll', () => {
    if (!overlayTicking) {
        requestAnimationFrame(() => {
            updateGlobalOverlay();
            overlayTicking = false;
        });
        overlayTicking = true;
    }
});

// 初始调用
updateGlobalOverlay();

// ===================== 16. 初始化完成日志 =====================
console.log('✅ 医保目录人群地图 - 已就绪');
console.log('📊 图表将在滚动到对应区域时自动加载');
console.log('🗺️ 点击地图上的蓝色圆点查看省份数据');
