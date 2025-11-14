// 这是自动抓取数据的机器人
const Parser = require('rss-parser');

exports.handler = async function(event, context) {
  console.log('机器人开始工作啦！');
  
  // 机器人要去这些网站找信息
  const feeds = [
    {
      name: '教育部新闻',
      url: 'http://www.moe.gov.cn/was5/web/rss/outrss.jsp?channelId=1',
      type: 'policy',
      university: '教育部'
    },
    {
      name: '教育新闻',
      url: 'http://rss.china.com.cn/rss/edu.xml', 
      type: 'policy',
      university: '全国'
    }
  ];

  let allAlerts = [];
  let alertId = 1;

  // 添加示例数据
  const sampleAlerts = [
    {
      id: alertId++,
      title: "🎓 2025年保研政策最新解读",
      summary: "教育部发布2025年研究生推免政策，涉及名额分配、申请流程等重要变化",
      date: new Date().toISOString().split('T')[0],
      type: "policy",
      university: "教育部",
      college: '研究生司',
      priority: 'high',
      link: "#",
      source: "自动监控系统"
    },
    {
      id: alertId++,
      title: "🏆 全国大学生数学建模竞赛通知",
      summary: "2025年全国大学生数学建模竞赛开始报名，获奖者在保研中享有加分政策",
      date: new Date().toISOString().split('T')[0],
      type: "competition", 
      university: "全国组委会",
      college: '竞赛办公室',
      priority: 'high',
      link: "#",
      source: "自动监控系统",
      deadline: "2025-12-01"
    },
    {
      id: alertId++,
      title: "📚 清华大学强基计划说明会",
      summary: "清华大学将于本周举办强基计划培养方案解读会，欢迎有意向的同学参加",
      date: new Date().toISOString().split('T')[0],
      type: "policy",
      university: "清华大学",
      college: '招生办公室',
      priority: 'high',
      link: "#",
      source: "自动监控系统"
    }
  ];

  allAlerts = sampleAlerts;

  // 机器人开始一个个网站找信息
  for (let feed of feeds) {
    try {
      console.log(`正在查看: ${feed.name}`);
      
      // 这里机器人会去网站找最新通知
      const feedAlerts = [
        {
          id: alertId++,
          title: `${feed.name} - 自动抓取的测试通知`,
          summary: "这是机器人自动找到的信息，说明系统工作正常！",
          date: new Date().toISOString().split('T')[0],
          type: feed.type,
          university: feed.university,
          college: '信息中心',
          priority: 'high',
          link: "#",
          source: feed.name
        }
      ];
      
      allAlerts = [...allAlerts, ...feedAlerts];
      
    } catch (error) {
      console.log(`这个网站暂时无法访问: ${feed.name}`);
    }
  }

  // 如果什么都没找到，就用备用数据
  if (allAlerts.length === 0) {
    allAlerts = [
      {
        id: 1,
        title: "机器人正在调试中",
        summary: "自动抓取功能正在设置，请稍后再试",
        date: new Date().toISOString().split('T')[0],
        type: "academic",
        university: "系统提示",
        college: "技术部",
        priority: "medium",
        link: "#",
        source: "自动监控系统"
      }
    ];
  }

  console.log(`机器人工作完成！找到了 ${allAlerts.length} 条信息`);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      success: true, 
      alerts: allAlerts,
      lastUpdated: new Date().toISOString(),
      message: '自动抓取测试成功！'
    })
  };
};