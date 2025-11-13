const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');

const parser = new Parser({
  timeout: 10000,
  customFields: {
    item: ['description', 'content:encoded']
  }
});

// 更全面的RSS源列表，专注于保研相关
const feeds = [
  {
    name: '清华大学研究生招生',
    url: 'https://www.tsinghua.edu.cn/xxgk/xsdt.htm', // 需要替换为真实RSS
    type: 'policy',
    university: '清华大学'
  },
  {
    name: '北京大学研究生院',
    url: 'https://www.pku.edu.cn/news/xsdt/', // 需要替换为真实RSS
    type: 'policy',
    university: '北京大学'
  },
  {
    name: '中国研究生招生信息网',
    url: 'https://yz.chsi.com.cn/kyzx/kydt/', // 需要替换为真实RSS
    type: 'policy',
    university: '全国'
  },
  // 更多学校...
];

async function fetchAllData() {
  let allAlerts = [];
  let alertId = 1;

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
    } catch (error) {
      console.log(`抓取失败 ${feed.name}:`, error.message);
    }
  }

  // 如果没有抓到数据，使用示例数据
  if (allAlerts.length === 0) {
    allAlerts = getSampleData();
  }

  // 按日期排序
  allAlerts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 保存到data.json
  const output = { 
    alerts: allAlerts, 
    lastUpdated: new Date().toISOString(),
    total: allAlerts.length
  };
  fs.writeFileSync(path.join(__dirname, '../data.json'), JSON.stringify(output, null, 2));
  console.log(`更新完成，共 ${allAlerts.length} 条数据`);
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

function getSampleData() {
  const currentDate = new Date().toISOString().split('T')[0];
  return [
    {
      id: 1,
      title: "自动监控系统测试通知",
      summary: "这是系统自动生成的测试数据，请配置真实的RSS源",
      date: currentDate,
      type: "academic",
      university: "测试大学",
      college: "测试学院",
      priority: "medium",
      link: "#",
      source: "自动监控系统"
    }
  ];
}

fetchAllData();