<template>
  <div id="app">
    <div id="cover">
      <!-- 壁纸单独一层，解码完成后淡入，避免大图直接替换造成闪烁 -->
      <div id="cover-img" :class="{ ready: coverUrl }" :style="coverUrl ? { backgroundImage: 'url(' + coverUrl + ')' } : null"></div>
      <div id="coverbg"></div>
    </div>
    <div id="main">
      <div id="content">
        <!-- 所有元素从一开始就占好位置，只做透明度和位移动画，不会引起整列重新居中 -->
        <div id="avatar" class="fade-item d1">
          <img src="./assets/zhonghcc.jpg" width="75" height="75" alt="Zhonghcc"/>
        </div>
        <div id="name" class="fade-item d2">
          Zhonghcc
        </div>
        <div class="line fade-item d2"></div>
        <div class="poem fade-item d3">
          <!-- 诗词区预留高度，文字到达后再淡入 -->
          <div class="poem-text" :class="{ ready: poemContent }">
            <span class="poemContent">{{poemContent}}</span>
            <span class="poemTitle">{{poemTitle}}</span>
          </div>
        </div>
        <div id="nav" class="fade-item d4">
          <ul>
            <li> <a href="https://zhonghcc.com" class="btn">首页</a> </li>
            <li> <a href="https://blog.zhonghcc.com" class="btn">博客</a> </li>
            <li> <a href="http://picup.zhonghcc.com" class="btn">PicUp</a> </li>
            <li> <a href="https://loan.zhonghcc.com" class="btn">贷款计算器</a> </li>
          </ul>
        </div>
        <div id="social" class="fade-item d5">
          <ul>
            <li> <a href="https://github.com/zhonghcc" class="btn"><v-icon name="brands/github"/></a> </li>
            <li> <a href="https://www.zhihu.com/people/wu-chen-zhi" class="btn"><v-icon name="brands/zhihu"/></a> </li>
          </ul>
        </div>
      </div>
    </div>
    <div id="copyright">{{mycopyright}}<span class="sep"> · </span><a class="beian" href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">京ICP备20023556号-1</a><template v-if="imgcopyright"><br>Photography: {{imgcopyright}}</template></div>
  </div>
</template>

<script>
import axios from 'axios'
// 只引入用到的两个图标；全量引入 vue-awesome/icons 会把上千个图标打进包里
import 'vue-awesome/icons/brands/github'
import 'vue-awesome/icons/brands/zhihu'
import Icon from 'vue-awesome/components/Icon'
import taglines from './taglines'

export default {
  name: 'App',
  data(){
    return {
      coverUrl:"",
      // 起始年份固定，结束年份取当前年份，不用每年手改
      mycopyright:"© 2020–" + new Date().getFullYear() + " Zhonghcc",
      imgcopyright:"",
      poemContent:"",
      poemTitle:"",
    }
  },
  components: {
    'v-icon': Icon
  },
  created(){
    var self = this
    // 标签页标题：名字在前保证可辨认，后面随机接一句
    document.title = 'Zhonghcc · ' + taglines[Math.floor(Math.random() * taglines.length)]
    // 壁纸与诗词都走同域的 /api，由 proxy 服务缓存并做多源回退，前端不再直连第三方
    axios.get('/api/wallpaper', { timeout: 5000 })
    .then((resp)=>{
      var data = resp.data;
      self.imgcopyright = data.copyright;
      // 优先用 Bing CDN 原图，加载失败再用本机缓存副本
      self.loadCover(data.url, data.fallback);
    }).catch((err)=>{
      console.warn('wallpaper meta failed, use cached image', err);
      self.loadCover('/api/wallpaper/image');
    });
    axios.get('/api/poem', { timeout: 5000 })
    .then((resp)=>{
      var data = resp.data;
      self.poemContent = data.content;
      self.poemTitle = "——  "+ data.author + '「 ' + data.origin + ' 」'
    }).catch((err)=>{
      console.warn('poem failed', err);
    });
  },
  methods:{
    // 先在内存里预加载，成功后再设为背景；失败则尝试备用地址，全部失败保留灰色底
    loadCover:function(url, fallback){
      var self = this
      if(!url) return
      var img = new Image()
      img.onload = function(){
        // 先在后台解码再显示，避免解码大图时卡住正在进行的入场动画
        var show = function(){ self.coverUrl = url }
        if (img.decode) img.decode().then(show, show)
        else show()
      }
      img.onerror = function(){
        if(fallback) self.loadCover(fallback)
      }
      img.src = url
    }
  }
}
</script>

<style>
html,body {
  width:100%;
  height:100%;
  margin:0;
  padding:0;
}
a{
  text-decoration: none;
}
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #eeeeee;
    width:100%;
    /* 主体与页脚上下排布，内容高了页面可以滚动，页脚不会压到图标上 */
    min-height:100%;
    display:flex;
    flex-direction:column;
}
#cover{
  display:block;
  position:fixed;
  width:100%;
  height:100%;
  background-color:#000000;
  /* transition: 0.6s ease; */
}
#cover-img{
  position:absolute;
  top:0;
  left:0;
  width:100%;
  height:100%;
  background:rgb(102, 102, 102) center center / cover no-repeat;
  opacity:0;
  transition: opacity 1.2s ease;
}
#cover-img.ready{
  opacity:1;
}
#coverbg{
  position:absolute;
  top:0;
  left:0;
  width:100%;
  height:100%;
  background-color:#000000;
  opacity: 0.5;
}
#main{
  flex:1;
  display:flex;
  align-items:center;
  justify-content:center;
  width: 100%;
}
#avatar{

}
#avatar img{
  border:2px solid #aaa;
  box-shadow:5px 2px 6px #000;
}
#name {
  margin-top :5px;
  font-size:25px;
}
#content {
  width: 100%;
  position: relative;
  z-index: 800;
  padding: 40px 10px;
  box-sizing: border-box;
}
.line{
  height: 1px;
  border-top: 1px solid rgba(255,255,255,0.2);
  text-align: center;
  max-width: 400px;
  margin:25px auto;
}
.poem{
  /* 两行诗句的高度，文字到达前先占位 */
  min-height: 78px;
}
.poem-text{
  opacity:0;
  transition: opacity .6s ease;
}
.poem-text.ready{
  opacity:1;
}
.poemContent{
  display:block;
  font-size:18px;
  margin-top:30px;
}
.poemTitle{
  display:block;
  margin-top:8px;
  font-size:16px;

}
#nav{
  margin-top:20px;
}
#nav ul{
  list-style: none;
  margin:0;
    position: relative;
    margin: 0;
    padding:0;
    list-style-type: none;
}
#nav li{
  display:inline-block;
}
#nav li a{
  display:block;
  width:90px;
  height:36px;
  line-height: 36px;
  border:1px solid white;
  border-radius: 18px;
  margin:10px;
  color:white;
  font-weight: bold;
  font-size:16px;
}
@media screen and (max-width: 1000px){
  #nav li{
    display:block;
  }
  #nav li a{
    display:block;
    margin:0 auto;
    margin-top:15px;
    width:50%;
    height:36px;
    line-height: 36px;
    border:1px solid white;
    border-radius: 18px;
    color:white;
    font-weight: bold;
    font-size:16px;
  }
}
#nav li a:visited{
  color:white;
}
#social{
  margin-top:20px;
}
#social ul{
  list-style: none;
  margin:0;
    position: relative;
    margin: 0;
    padding:0;
    list-style-type: none;
}
#social li{
  display:inline-block;
}
#social li a{
  display:block;
  width:60px;
  height:36px;
  line-height: 36px;
  margin:10px;
  color:rgba(255,255,255,0.9);
  font-weight: bold;
  font-size:36px;
  filter: drop-shadow(0 1px 3px rgba(0,0,0,0.6));
  transition: color .2s ease, transform .2s ease;
}
#social li a:hover{
  color:#ffffff;
  transform: translateY(-2px);
}
#social li a:visited{
  color:white;
}
.fa-icon {
  /* 图标库自带的这条样式没有随组件引入，缺了它 SVG 会默认填成黑色 */
  fill: currentColor;
  width: auto;
  height: 1em; /* or any other relative font sizes */

  /* You would have to include the following two lines to make this work in Safari */
  max-width: 100%;
  max-height: 100%;
}
#copyright{
  /* 放在文档流里，位于主体下方，不再固定浮在右下角盖住内容 */
  position:relative;
  z-index:800;
  font-size:13px;
  line-height:1.6;
  text-align:right;
  padding: 0 12px 10px;
  color:rgba(255,255,255,0.7);
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}
@media screen and (max-width: 1000px){
  #copyright{
    text-align:center;
  }
}
/* 备案号与版权行同色，悬停时加下划线提示可点击 */
#copyright .beian{
  color:inherit;
}
#copyright .beian:hover{
  text-decoration: underline;
}
/* 入场动画：只动透明度和位移，交给合成层处理，不触发重新布局 */
.fade-item{
  animation: fade-up .9s cubic-bezier(.22,.61,.36,1) both;
}
.d1{ animation-delay: .1s; }
.d2{ animation-delay: .25s; }
.d3{ animation-delay: .4s; }
.d4{ animation-delay: .55s; }
.d5{ animation-delay: .7s; }
@keyframes fade-up{
  from{ opacity:0; transform: translateY(24px); }
  to{ opacity:1; transform: none; }
}
/* 系统设置了减少动态效果时直接显示 */
@media (prefers-reduced-motion: reduce){
  .fade-item{ animation: none; }
  #cover-img, .poem-text{ transition: none; }
}
</style>
