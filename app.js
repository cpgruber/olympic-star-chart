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
    var angle = angle-0.25;//-0.25 makes the star point upward
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
  getDataMeans: function(data){
    return [
      d3.mean(data, function(d){return +d.points_mean}),
      d3.mean(data, function(d){return +d.rebounds_mean}),
      d3.mean(data, function(d){return +d.assists_mean}),
      d3.mean(data, function(d){return +d.steals_mean}),
      d3.mean(data, function(d){return +d.blocks_mean})
    ]
  },
  makeGuides: function(min,max,mean){
    var self = this;
    var stats = ["pts","reb","ast","stl","blk"]
    var guides = d3.select(".star").append("g").attr("class","guides");
    var guide = guides.selectAll("guide").data([min,max,mean]).enter().append("g")
      .attr("class",function(d,i){
        var type = (i==0)?"min":(i==1)?"max":"mean";
        return "guide "+type;
      });
    guide.selectAll("path").data(function(d){return d}).enter().append("path")
      .attr("d",function(d,i){
        var datum = d3.select(this.parentNode).datum();
        var pct = i/datum.length;
        var next = (i==datum.length-1)?0:i+1;
        var nextPct = next/datum.length;
        return "M 350 350 "+self.getCoords(d,pct,i)+" "+self.getCoords(datum[next],nextPct,next)
      })
      .style("stroke","black").style("fill","none")
      .style("stroke-width",0.2)

    guides.selectAll(":not(.min)").selectAll("text").data(function(d){return d}).enter().append("text")
      .attr("transform", function(d,i){
        var datum = d3.select(this.parentNode).datum();
        var pct = (i/datum.length)-0.25;
        var rotate = (i==2||i==3)?360/datum.length*i+180:360/datum.length*i;
        var xOff = self.getXoffset(d,pct,i);
        var yOff = self.getYoffset(d,pct,i);
        yOff += (i==2||i==3)?12:0;
        return "translate("+xOff+","+yOff+")rotate("+rotate+")";
      })
      .text(function(d,i){
        return d3.round(d,1)+" "+stats[i];
      })
      .attr('text-anchor', function(d,i){
        var anchor = "middle"
        return anchor;
      })
      .style("font-size","0.9em")
  },
  updateChart: function(data,color){
    var self = this;
    var dt = [+data.points_mean,+data.rebounds_mean,+data.assists_mean,+data.steals_mean,+data.blocks_mean];
    var playerName = data.player.replace(" ","-")
    var selection = d3.select(".star").selectAll(".arm-"+color).data(dt)
    var scales = self.pageComponents.scales;
    selection.transition().duration(500)
      .attr("d",function(d,i){
        var pct = i/dt.length;
        var next = (i==dt.length-1)?0:i+1;
        var nextPct = next/dt.length;
        return "M 350 350 "+self.getCoords(d,pct,i)+" "+self.getCoords(dt[next],nextPct,next)
      }).style("fill",color)

    selection.enter().append("path").attr("class","arm-"+color)
      .attr("d",function(d,i){
        var pct = i/dt.length;
        var next = (i==dt.length-1)?0:i+1;
        var nextPct = next/dt.length;
        return "M 350 350 "+self.getCoords(d,pct,i)+" "+self.getCoords(dt[next],nextPct,next)
      })
      .style("stroke","none").style("fill",color).style("fill-opacity",0.2)

    selection.exit().remove();
  },
  bindInteraction: function(){
    var self = this;
    d3.selectAll(".name").on("click", function(d){
      var color = d3.selectAll("input[name=color]:checked").node().value;
      var rgb = d3.rgb(color);
      var className = d3.select(this).attr("class");
      if (d3.select(this).attr("class").split(" ").length > 1 && d3.select(this).attr("class").split(" ")[1]!=color){
        return;
      }
      if (className == "name "+color){
        d3.selectAll(".arm-"+color).remove();
        d3.select(this).attr("class","name").style("background","none")
      }else{
        d3.select(".name."+color).attr("class","name").style("background","none")
        d3.select(this).attr("class","name "+color)
          .style("background", "rgba("+rgb.r+","+rgb.g+","+rgb.b+",0.2)")
        self.updateChart(d,color)
      }
    });

    d3.selectAll(".name").on("mouseover", function(d){
      var color = d3.selectAll("input[name=color]:checked").node().value;
      var rgb = d3.rgb(color);
      if (d3.select(this).attr("class").split(" ").length > 1){
        return;
      }
      if (d3.selectAll(".name."+color)[0].length == 0){
        d3.select(this)
          .style("background", "rgba("+rgb.r+","+rgb.g+","+rgb.b+",0.2)")
        self.updateChart(d,color)
        d3.selectAll(".arm-"+color).style("opacity",1)
      }
    })

    d3.selectAll(".name").on("mouseout", function(d){
      var color = d3.selectAll("input[name=color]:checked").node().value;
      if (d3.select(this).attr("class").split(" ").length > 1){
        return;
      }
      if (d3.selectAll(".name."+color)[0].length == 0){
        d3.select(this).style("background", "none")
        d3.selectAll(".arm-"+color).style("opacity",0)
      }
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
      var mean = self.getDataMeans(data);

      self.makeGuides(min,max,mean);
      var names = d3.select(".names").selectAll(".name").data(data).enter().append("div")
        .attr("class", "name").text(function(d){return d.player})
      self.bindInteraction();
    })
  }
}
star.init();
