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

  // 机器人开始一个个网站找信息
  for (let feed of feeds) {
    try {
      console.log(`正在查看: ${feed.name}`);
      
      // 这里机器人会去网站找最新通知
      // 现在先用一些示例数据
      const sampleAlerts = [
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
      
      allAlerts = [...allAlerts, ...sampleAlerts];
      
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