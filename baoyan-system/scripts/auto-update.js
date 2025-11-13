const fs = require('fs');
const path = require('path');

// 模拟从多个数据源获取数据
async function fetchAllData() {
  console.log('开始自动更新数据...');
  
  // 这里模拟从多个API和RSS源获取数据
  // 在实际应用中，你可以替换为真实的API调用
  
  const alerts = [
    ...await fetchEducationNews(),
    ...await fetchUniversityAnnouncements(),
    ...await fetchCompetitionInfo()
  ];
  
  // 去重并排序
  const uniqueAlerts = removeDuplicates(alerts);
  uniqueAlerts.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return uniqueAlerts;
}

// 模拟获取教育新闻
async function fetchEducationNews() {
  console.log('获取教育新闻...');
  
  // 这里应该是真实的教育部/学校API调用
  // 暂时用模拟数据
  return [
    {
      id: generateId(),
      title: "教育部发布2025年研究生招生政策调整通知",
      summary: "2025年全国研究生招生政策将有重要调整，涉及推免生比例、考试科目等方面",
      date: getRecentDate(0),
      type: "policy",
      university: "教育部",
      college: "研究生司",
      priority: "high",
      link: "http://www.moe.gov.cn/",
      source: "教育部官网"
    },
    {
      id: generateId(),
      title: "全国大学生创新创业大赛启动报名",
      summary: "2025年全国大学生创新创业大赛正式启动，获奖项目将获得保研加分",
      date: getRecentDate(1),
      type: "competition",
      university: "全国组委会",
      college: "竞赛办公室",
      priority: "high",
      link: "#",
      source: "教育部通知",
      deadline: "2025-12-15"
    }
  ];
}

// 模拟获取大学通知
async function fetchUniversityAnnouncements() {
  console.log('获取大学通知...');
  
  const universities = [
    { name: "清华大学", short: "清华" },
    { name: "北京大学", short: "北大" },
    { name: "浙江大学", short: "浙大" },
    { name: "上海交通大学", short: "交大" },
    { name: "复旦大学", short: "复旦" },
    { name: "南京大学", short: "南大" },
    { name: "中国科学技术大学", short: "中科大" },
    { name: "哈尔滨工业大学", short: "哈工大" }
  ];
  
  let announcements = [];
  
  universities.forEach(uni => {
    // 模拟每个学校有1-3条通知
    const count = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < count; i++) {
      const types = ["academic", "policy", "competition"];
      const type = types[Math.floor(Math.random() * types.length)];
      
      announcements.push({
        id: generateId(),
        title: `${uni.name}${getRandomTitle(type)}`,
        summary: getRandomSummary(type, uni.short),
        date: getRecentDate(Math.floor(Math.random() * 7)),
        type: type,
        university: uni.name,
        college: getRandomCollege(),
        priority: Math.random() > 0.7 ? "high" : "medium",
        link: "#",
        source: `${uni.name}官网`
      });
    }
  });
  
  return announcements;
}

// 模拟获取竞赛信息
async function fetchCompetitionInfo() {
  console.log('获取竞赛信息...');
  
  const competitions = [
    "数学建模", "程序设计", "机器人", "创新创业", "电子设计",
    "物理实验", "化学实验", "生物技术", "人工智能", "大数据"
  ];
  
  return competitions.map(comp => ({
    id: generateId(),
    title: `2025年全国大学生${comp}竞赛通知`,
    summary: `2025年度${comp}竞赛正式开始报名，面向全国高校在校学生`,
    date: getRecentDate(Math.floor(Math.random() * 14)),
    type: "competition",
    university: "全国大学生竞赛组委会",
    college: `${comp}竞赛委员会`,
    priority: "high",
    link: "#",
    source: "竞赛官网",
    deadline: `2025-${String(Math.floor(Math.random() * 2) + 11).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
  }));
}

// 辅助函数
function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function getRecentDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

function getRandomTitle(type) {
  const titles = {
    academic: [
      "关于2025-2026学年课程安排的通知",
      "教务处关于期末考试安排的通告",
      "新学期教学工作计划通知"
    ],
    policy: [
      "2025年推免研究生政策解读",
      "强基计划培养方案说明会通知",
      "本科生科研训练计划申报通知"
    ],
    competition: [
      "校内选拔赛报名通知",
      "学科竞赛培训安排",
      "创新实践项目招募通知"
    ]
  };
  
  const arr = titles[type] || titles.academic;
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomSummary(type, university) {
  const summaries = {
    academic: `请${university}各学院学生注意相关安排，及时完成选课和考试准备`,
    policy: `${university}最新政策解读，涉及保研资格、奖学金评定等重要事项`,
    competition: `欢迎${university}同学积极报名参加，提升综合素质和竞争力`
  };
  
  return summaries[type] || "请相关学生关注具体通知内容";
}

function getRandomCollege() {
  const colleges = [
    "教务处", "研究生院", "本科生院", "计算机学院", "理学院",
    "工学院", "医学院", "经管学院", "法学院", "外国语学院"
  ];
  return colleges[Math.floor(Math.random() * colleges.length)];
}

function removeDuplicates(alerts) {
  const seen = new Set();
  return alerts.filter(alert => {
    const key = alert.title + alert.date;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// 主执行函数
async function main() {
  try {
    const alerts = await fetchAllData();
    
    const output = {
      alerts: alerts,
      lastUpdated: new Date().toISOString(),
      total: alerts.length,
      sources: ["教育部", "各高校官网", "竞赛组委会"]
    };
    
    fs.writeFileSync(
      path.join(__dirname, '../data.json'), 
      JSON.stringify(output, null, 2)
    );
    
    console.log(`✅ 自动更新完成！共生成 ${alerts.length} 条数据`);
    console.log(`📅 最后更新时间: ${output.lastUpdated}`);
    
  } catch (error) {
    console.error('❌ 自动更新失败:', error);
    process.exit(1);
  }
}

main();