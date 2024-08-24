# bilibili-comments-count
对哔哩哔哩中某一视频的评论数进行计数
<br>
<h1>前言</h1>
<br>最近几天原神纳塔音乐会事件在哔哩哔哩上持续发酵
<br>本着学习的精神，我对视频下的评论数量进行了爬取
<br>以此来统计不同时间的评论数量
<br>本工具利用 Node.Js 实现
<br>请安装 axios crypto fs 包
<br>本工具也可以对其他视频进行计数(修改 url )
<h2>需要注意的地方</h2>
<br>1. 对错误的处理机制几乎没有
<br>2. [https://api.bilibili.com/x/web-interface/nav] 这个神奇的url中的图片链接似乎是依靠ip来生成的，这也是得到变量 i 的关键
<br>3. R 怎么来的我也不是很清楚
<br>4. web_location 写死在源码中，应该可以不变
<br>5. mode 指的评论显示的方式，1 为普通显示，2 为按照最新评论显示，3 为按照热度显示
<br>6. plat 为平台,其中 1 为 pc
<br>7. 默认保留第一页到当下目录的 output.json 中
<br>8. 欢迎各位大佬指正
<br>9. 本工具仅供学习
