<template>
  <div id="app">
    <div id="cover"></div>
    <div id="main">
      <div id="content">
        <div id="avator">
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
export default {
  name: 'App',
  components: {
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
    color: #2c3e50;
    width:100%;
    height:100%;
}
#main{
  display: table;
  width: 100%;
  height: 100%;
}
#content {
display: table-cell;
vertical-align: middle;
position: relative;
z-index: 800;
padding: 0 60px;
}
</style>
