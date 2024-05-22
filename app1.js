const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.get('/events', function (req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let startTime = Date.now();
  function geyRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
  const sendEvent = () => {
    // 检查是否已经发送了10秒
    let randomNum = geyRandom(500, 2000)
    if (Date.now() - startTime >= 100000) {
      res.write('event: close\ndata: {}\n\n'); // 发送一个特殊事件通知客户端关闭
      res.end(); // 关闭连接
      return;
    }

    const data = { message: 'Hello World', timestamp: new Date(), randomNum: randomNum };
    res.write(`data: ${JSON.stringify(data)}\n\n`);

    // 每隔2秒发送一次消息
    
    setTimeout(sendEvent, randomNum);
  };

  sendEvent();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
