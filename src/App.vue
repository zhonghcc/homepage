<template>
  <div id="app">
    <div id="cover" :style="coverimg">
      <div id="coverbg"></div>
    </div>
    <div id="main">
      <div id="content">
        <transition name="slide-fade" mode="out-in" appear appear-class="custom-appear-class">
        <div id="avatar" v-show="shows[0]" >
        <img src="./assets/zhonghcc.jpg"/>
        </div>
        </transition>
        <transition name="slide-fade" mode="out-in" appear>
        <div id="name" v-show="shows[1]" >
          Zhonghcc
        </div>
        </transition>
        <div class="line"></div>
        <transition name="slide-fade" mode="out-in" appear>
        <div v-show="shows[2]" >
          <span class="poemContent">{{poemContent}}</span>
          <span class="poemTitle">{{poemTitle}}</span>
        </div>
        </transition>
        <transition name="slide-fade" mode="out-in" appear>
        <div id="nav" v-show="shows[3]" >
          <ul>
            <li> <a href="https://zhonghcc.com" class="btn">首页</a> </li>
            <li> <a href="https://blog.zhonghcc.com" class="btn">博客</a> </li>
            <li> <a href="https://picmeup.zhonghcc.com" class="btn">PicMeUp</a> </li>
            <li> <a href="https://loan.zhonghcc.com" class="btn">贷款计算器</a> </li>
          </ul>
        </div>
        </transition>
        <transition name="slide-fade" mode="out-in" appear>
        <div id="social" v-show="shows[4]" >
          <ul>
            <li> <a href="https://github.com/zhonghcc" class="btn"><v-icon name="brands/github"/></a> </li>
            <li> <a href="https://www.zhihu.com/people/wu-chen-zhi" class="btn"><v-icon name="brands/zhihu"/></a> </li>
          </ul>
        </div>
        </transition>
      </div>
    </div>
    <div id="copyright">{{mycopyright}}<br>Photography: {{imgcopyright}}</div>
  </div>
</template>

<script>
import axios from 'axios'
import 'vue-awesome/icons'
// import 'vue-awesome/icons/brands'
import Icon from 'vue-awesome/components/Icon'

export default {
  name: 'App',
  data(){
    return {
      coverimg:"",
      mycopyright:"Copyright © 2020 Zhonghcc",
      imgcopyright:"",
      shows:[false,false,false,false,false],
      poemContent:"",
      poemTitle:"",
    }
  },
  components: {
    'v-icon': Icon
  },
  created(){
    var self = this
    axios.get('https://bird.ioliu.cn/v1/?url=https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=8')
    .then((resp)=>{
      if(resp.status==200){
        var images = resp.data.images;
        var imgUrls = []
        for (let i = 0; i < images.length; i++) {
          const item = images[i];
          imgUrls.push(item.url);
        }
        var imgUrl = imgUrls[0];
        var url = "https://www.bing.com"+imgUrl;
        self.coverimg="background:url("+url+")"+ " center center / cover no-repeat rgb(102, 102, 102)"
        self.imgcopyright = images[0].copyright;
      }
    }).catch((err)=>{
      alert(err)
    });
       axios.get('https://v1.jinrishici.com/all.json')
    .then((resp)=>{
      if(resp.status==200){
        var data = resp.data;
        self.poemContent = data.content;
        self.poemTitle = "——  "+ data.author + '「 ' + data.origin + ' 」'
      }
    }).catch((err)=>{
      alert(err)
    }); 
  },
  mounted(){
    var self = this
    for(var i=0;i<self.shows.length;i++){

      setTimeout((i)=>{
        console.log("set true"+ i)
        self.$set(self.shows, i, true)
        console.log(self.shows)
      },100*(i+1),i)
    }
  },
  methods:{
    getCoverImg:function(){

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
    height:100%;
}
#cover{
  display:block;
  position:fixed;
  width:100%;
  height:100%;
  background-color:#000000;
  /* transition: 0.6s ease; */
}
#coverbg{
  display:block;
  width:100%;
  height:100%;
  background-color:#000000;
  opacity: 0.5;
}
#main{
  display: table;
  width: 100%;
  height: 100%;
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
display: table-cell;
vertical-align: middle;
position: relative;
z-index: 800;
padding: 0 10px;
}
.line{
  height: 1px;
  border-top: 1px solid rgba(255,255,255,0.2);
  text-align: center;
  max-width: 400px;
  margin:25px auto;
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
  color:rgba(255,255,255,0.6);
  font-weight: bold;
  font-size:36px;
}
#social li a:visited{
  color:white;
}
.fa-icon {
  width: auto;
  height: 1em; /* or any other relative font sizes */

  /* You would have to include the following two lines to make this work in Safari */
  max-width: 100%;
  max-height: 100%;
}
#copyright{
  font-size:14px;
  color:#eee;
  position:fixed;
  text-align:right;
  bottom:0;
  right:0;
  margin-bottom: 10px;
  margin-right:10px;
}
.slide-fade-enter-active {
  /* transition: all .5s cubic-bezier(1.0, 0.5, 0.8, 1.0); */
  transition: all 2s;
}
.slide-fade-leave-active {
  transition: all 0.5s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active for below version 2.1.8 */ {
  transform: translateY(40px);
  transfrom: scale(0);
  visibility: hidden;
}
.custom-appear-class{
 visibility: hidden; 
}
</style>
