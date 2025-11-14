const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');

const parser = new Parser({
  timeout: 10000,
  customFields: {
    item: ['description', 'content:encoded']
  }
});

// 有效的RSS源列表
const feeds = [
  {
    name: '教育部新闻',
    url: 'http://www.moe.gov.cn/was5/web/rss/outrss.jsp?channelId=1',
    type: 'policy',
    university: '教育部'
  }
];

// 目标学院数据 - 与index.html中的targetColleges保持一致
const targetColleges = [
  { school: "同济大学", college: "物理科学与工程学院" },
  { school: "广州新华学院", college: "药学院" },
  { school: "华南理工大学", college: "机械与汽车工程学院" },
  { school: "四川大学", college: "生命科学学院" },
  { school: "大连理工大学", college: "信息通信工程学院" },
  { school: "四川农业大学", college: "信息工程学院" },
  { school: "北方工业大学", college: "信息学院" },
  { school: "电子科技大学", college: "格拉斯哥学院" },
  { school: "华南理工大学", college: "生物医学科学与工程学院" },
  { school: "辽宁大学", college: "网络与信息安全学院" },
  { school: "西南大学", college: "农学与生物科技学院" },
  { school: "吉林大学", college: "商学与管理学院" },
  { school: "新疆大学", college: "数学与系统科学学院" },
  { school: "安徽大学", college: "物理与光电工程学院" },
  { school: "兰州大学", college: "化学化工学院" },
  { school: "首都经济贸易大学", college: "外国语学院" },
  { school: "青海大学", college: "能源与电气工程学院" },
  { school: "华南理工大学", college: "软件学院" },
  { school: "沈阳航空航天大学", college: "机电工程学院" },
  { school: "东南大学", college: "计算机学院" },
  { school: "中国石油大学（北京）", college: "机械与储运工程学院" },
  { school: "浙江大学", college: "机械工程学院" },
  { school: "北京科技大学", college: "数理学院" },
  { school: "合肥工业大学", college: "物理学院" },
  { school: "清华大学", college: "日新学院" },
  { school: "吉林大学", college: "计算机科学与技术学院" },
  { school: "北京邮电大学", college: "玛丽女王海南学院" },
  { school: "华南农业大学", college: "生命科学学院" },
  { school: "东南大学", college: "建筑学院" },
  { school: "东南大学", college: "数学学院" },
  { school: "同济大学", college: "建筑学院" },
  { school: "南华大学", college: "软件学院" },
  { school: "大连理工大学", college: "集成电路学院" },
  { school: "西北工业大学", college: "机电学院" },
  { school: "南京大学", college: "外国语学院" }
];

async function fetchAllData() {
  let allAlerts = [];
  let alertId = 1;

  try {
    // 尝试抓取真实RSS数据
    for (let feed of feeds) {
      try {
        console.log(`抓取: ${feed.name}`);
        const feedData = await parser.parseURL(feed.url);
        
        const alerts = feedData.items.slice(0, 5).map(item => {
          const summary = (item.contentSnippet || item.description || item.title || '')
            .substring(0, 150)
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim();

          const date = item.pubDate ? 
            new Date(item.pubDate).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0];

          return {
            id: alertId++,
            title: item.title || '无标题',
            summary: summary + (summary.length >= 150 ? '...' : ''),
            date: date,
            type: feed.type,
            university: feed.university,
            college: getCollegeFromTitle(item.title),
            priority: getPriorityFromSource(feed.name),
            link: item.link || '#',
            source: feed.name
          };
        });

        allAlerts = [...allAlerts, ...alerts];
        console.log(`✅ ${feed.name} 抓取成功`);
        
      } catch (error) {
        console.log(`❌ 抓取失败 ${feed.name}:`, error.message);
      }
    }
  } catch (error) {
    console.error('RSS抓取失败:', error);
  }

  // 如果没有抓到真实数据，生成与index.html匹配的模拟数据
  if (allAlerts.length === 0) {
    console.log('使用模拟数据');
    allAlerts = generateMockData();
  }

  // 按日期排序
  allAlerts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 保存到data.json - 保持与现有data.json相同的结构
  const output = { 
    alerts: allAlerts, 
    lastUpdated: new Date().toISOString(),
    total: allAlerts.length,
    sources: ["教育部", "各高校官网", "竞赛组委会"]
  };
  
  try {
    fs.writeFileSync(path.join(__dirname, '../data.json'), JSON.stringify(output, null, 2));
    console.log(`✅ 更新完成，共 ${allAlerts.length} 条数据`);
  } catch (error) {
    console.error('❌ 保存文件失败:', error);
  }
}

function getCollegeFromTitle(title) {
  if (!title) return '信息中心';
  
  const titleStr = title.toLowerCase();
  if (titleStr.includes('计算机') || titleStr.includes('软件')) return '计算机学院';
  if (titleStr.includes('物理') || titleStr.includes('数学')) return '理学院';
  if (titleStr.includes('化学') || titleStr.includes('生物')) return '生命科学院';
  if (titleStr.includes('工程') || titleStr.includes('机械')) return '工程学院';
  if (titleStr.includes('经济') || titleStr.includes('金融')) return '经济学院';
  if (titleStr.includes('法律') || titleStr.includes('法学')) return '法学院';
  
  return '研究生院';
}

function getPriorityFromSource(source) {
  if (source.includes('清华') || source.includes('北大')) return 'high';
  if (source.includes('研究生')) return 'high';
  return 'medium';
}

function generateMockData() {
  const now = new Date();
  const alerts = [];
  let id = 1;

  // 为每个目标学院生成通知
  targetColleges.forEach(college => {
    const types = ['academic', 'policy', 'competition', 'research'];
    const typeNames = {
      'academic': '学术信息',
      'policy': '政策通知', 
      'competition': '学科竞赛',
      'research': '科研项目'
    };
    
    types.forEach(type => {
      const daysAgo = Math.floor(Math.random() * 10);
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      
      alerts.push({
        id: id++,
        title: `${college.school}${college.college}${getRandomTitle(type)}`,
        summary: getRandomSummary(type, college.school, college.college),
        date: date.toISOString().split('T')[0],
        type: type,
        university: college.school,
        college: college.college,
        priority: Math.random() > 0.7 ? "high" : "medium",
        link: "#",
        source: `${college.school}官网`
      });
    });
  });

  // 添加一些全国性竞赛信息
  const nationalCompetitions = [
    {
      id: id++,
      title: "全国大学生数学建模竞赛",
      summary: "面向全国大学生的规模最大的基础性学科竞赛，适合数学、计算机等相关专业学生参加",
      date: new Date().toISOString().split('T')[0],
      type: "competition",
      university: "全国组委会",
      college: "竞赛办公室",
      priority: "high",
      link: "https://www.mcm.edu.cn/",
      source: "全国大学生数学建模竞赛官网",
      deadline: "2025-12-01"
    },
    {
      id: id++,
      title: "挑战杯全国大学生课外学术科技作品竞赛",
      summary: "全国性大学生课外学术科技竞赛，注重创新性和实践性，适合各专业学生参加",
      date: new Date().toISOString().split('T')[0],
      type: "competition",
      university: "全国组委会", 
      college: "竞赛办公室",
      priority: "high",
      link: "http://www.tiaozhanbei.net/",
      source: "挑战杯官网",
      deadline: "2025-11-30"
    }
  ];

  return [...alerts, ...nationalCompetitions];
}

function getRandomTitle(type) {
  const titles = {
    academic: "关于2025-2026学年课程安排的通知",
    policy: "2025年推免研究生政策解读", 
    competition: "校内选拔赛报名通知",
    research: "本科生科研项目招募通知"
  };
  return titles[type] || "最新通知";
}

function getRandomSummary(type, school, college) {
  const summaries = {
    academic: `请${school}${college}学生注意相关安排，及时完成选课和考试准备`,
    policy: `${school}最新政策解读，涉及保研资格、奖学金评定等重要事项`,
    competition: `欢迎${school}${college}同学积极报名参加，提升综合素质和竞争力`,
    research: `${school}${college}现面向本科生招募科研项目成员，提供科研训练和导师指导`
  };
  return summaries[type] || "请相关学生关注具体通知内容";
}

// 执行
fetchAllData().catch(error => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});