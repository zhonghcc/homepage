<template>
  <div id="app">
    <div id="cover" :style="coverimg"></div>
    <div id="main">
      <div id="content">
        <div id="avatar">
        <img src="./assets/logo.png"/>
        </div>
        <div id="oneline">
        一句话
        </div>
        <div id="nav">
        导航
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'App',
  data: ()=>{
    return {
      coverimg:""
    }
  },
  components: {
  },
  created: ()=>{
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
        self.coverimg="background:url("+url+")"
      }
    }).catch((err)=>{
      alert(err)
    })
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
  transition: 0.6s ease;
}
#main{
  display: table;
  width: 100%;
  height: 100%;
}
#avatar{

}
#content {
display: table-cell;
vertical-align: middle;
position: relative;
z-index: 800;
padding: 0 60px;
}
</style>
