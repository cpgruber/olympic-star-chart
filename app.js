var star = {
  pageComponents:{
    scales:[]
  },
  getPageComponents: function(){
    var pageComponents = this.pageComponents;
    pageComponents.svg = d3.select(".svg-container").append("svg").attr("height",700).attr("width",700);
    pageComponents.star = pageComponents.svg.append("g").attr("class","star");
    for (var i=0;i<5;i++){
      pageComponents.scales.push(d3.scale.linear().range([20,300]))
    }
  },
  getXoffset: function(val,angle,idx){
    var scale = this.pageComponents.scales[idx];
    return 350+scale(val)*Math.cos(angle*2*Math.PI);
  },
  getYoffset: function(val,angle,idx){
    var scale = this.pageComponents.scales[idx];
    return 350+scale(val)*Math.sin(angle*2*Math.PI);
  },
  getCoords: function(val, angle, idx){
    return "L "+this.getXoffset(val,angle,idx)+" "+this.getYoffset(val,angle,idx)
  },
  makeScales: function(extents){
    var scales = this.pageComponents.scales;
    scales[0].domain(extents[0])
    scales[1].domain(extents[1])
    scales[2].domain(extents[2])
    scales[3].domain(extents[3])
    scales[4].domain(extents[4])
  },
  getExtents: function(data){
    return [
      d3.extent(data, function(d){return +d.points_mean}),
      d3.extent(data, function(d){return +d.rebounds_mean}),
      d3.extent(data, function(d){return +d.assists_mean}),
      d3.extent(data, function(d){return +d.steals_mean}),
      d3.extent(data, function(d){return +d.blocks_mean})
    ]
  },
  makeGuides: function(min,max){
    var self = this;
    d3.select(".star").selectAll(".min").data(min).enter().append("path").attr("class","min")
      .attr("d",function(d,i){
        var pct = i/min.length;
        var next = (i==min.length-1)?0:i+1;
        var nextPct = next/min.length;
        return "M 350 350 "+self.getCoords(d,pct,i)+" "+self.getCoords(min[next],nextPct,next)
      })
      .style("stroke","black").style("fill","none")
      .style("stroke-width",0.2)

    d3.select(".star").selectAll(".max").data(max).enter().append("path").attr("class","max")
      .attr("d",function(d,i){
        var pct = i/max.length;
        var next = (i==max.length-1)?0:i+1;
        var nextPct = next/max.length;
        return "M 350 350 "+self.getCoords(d,pct,i)+" "+self.getCoords(max[next],nextPct,next)
      })
      .style("stroke","black").style("fill","none")
      .style("stroke-width",0.2)
  },
  updateChart: function(data){
    var self = this;
    var dt = [+data.points_mean,+data.rebounds_mean,+data.assists_mean,+data.steals_mean,+data.blocks_mean]
    var selection = d3.select(".star").selectAll(".arm").data(dt)
    var scales = self.pageComponents.scales;
    selection.transition().duration(500)
      .attr("d",function(d,i){
        var pct = i/dt.length;
        var next = (i==dt.length-1)?0:i+1;
        var nextPct = next/dt.length;
        return "M 350 350 "+self.getCoords(d,pct,i)+" "+self.getCoords(dt[next],nextPct,next)
      })

    selection.enter().append("path").attr("class","arm")
      .attr("d",function(d,i){
        var pct = i/dt.length;
        var next = (i==dt.length-1)?0:i+1;
        var nextPct = next/dt.length;
        return "M 350 350 "+self.getCoords(d,pct,i)+" "+self.getCoords(dt[next],nextPct,next)
      })
      .style("stroke","black").style("fill","none")

    selection.exit().remove();
  },
  bindInteraction: function(){
    var self = this;
    d3.selectAll(".name").on("mouseover", function(d){
      self.updateChart(d)
      d3.select(".player").text(d.player)
    })
  },
  init:function(){
    var self = this;
    self.getPageComponents();
    d3.csv("olympic.csv", function(err,data){
      var extents = self.getExtents(data);
      self.makeScales(extents);
      var min = extents.map(function(d){return d[0]})
      var max = extents.map(function(d){return d[1]})
      self.makeGuides(min,max);
      var names = d3.select(".names").selectAll(".name").data(data).enter().append("div")
        .attr("class", "name").text(function(d){return d.player})
      self.bindInteraction();
    })
  }
}
star.init();
