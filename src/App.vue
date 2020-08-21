<template>
  <div id="app">
    <div id="cover" :style="coverimg">
      <div id="coverbg"></div>
    </div>
    <div id="main">
      <div id="content">
        <transition name="slide-fade" >
        <div id="avatar" v-show="shows[0]">
        <img src="./assets/zhonghcc.jpg"/>
        </div>
        </transition>
        <transition name="slide-fade" >
        <div id="name" v-show="shows[1]">
          Zhonghcc
        </div>
        </transition>
        <transition name="slide-fade" >
        <div id="oneline" v-show="shows[2]">
        一句话
        </div>
        </transition>
        <transition name="slide-fade" >
        <div id="nav" v-show="shows[3]">
          <ul>
            <li> <a href="https://zhonghcc.com" class="btn">首页</a> </li>
            <li> <a href="https://blog.zhonghcc.com" class="btn">博客</a> </li>
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
export default {
  name: 'App',
  data(){
    return {
      coverimg:"",
      mycopyright:"Copyright © 2020 Zhonghcc",
      imgcopyright:"",
      shows:[false,false,false,false,false],
      s:false

    }
  },
  components: {
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
    })
  },
  mounted(){
    var self = this
    for(var i=0;i<self.shows.length;i++){

      setTimeout((i)=>{
        console.log("set true"+ i)
        self.$set(self.shows, i, true)
        console.log(self.shows)
      },500*(i+1),i)
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
padding: 0 60px;
}
#nav{
  
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
  width:80px;
  height:36px;
  line-height: 36px;
  border:1px solid white;
  border-radius: 18px;
  margin:10px;
  color:white;
  font-weight: bold;
}
#nav li a:visited{
  color:white;
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
  transition: all .5s;
}
.slide-fade-leave-active {
  transition: all .5s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active for below version 2.1.8 */ {
  transform: translateY(20px);
  opacity: 0;
}
</style>
