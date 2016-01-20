var svg = d3.select("body").append("svg").attr("height",700).attr("width",700)
var star = svg.append("g").attr("class","star");
var scale = d3.scale.linear().domain([0,10]).range([0,350]);

var xOff = function(val,pct){
  return 350+scale(val)*Math.cos(pct*2*Math.PI);
}
var yOff = function(val,pct){
  return 350+scale(val)*Math.sin(pct*2*Math.PI);
}
var getCoords = function(val,pct){
  return "L "+xOff(val,pct)+" "+yOff(val,pct)
}

function update(data){
  var selection = d3.select(".star").selectAll(".arm").data(data)

  selection.transition().duration(500)
    .attr("d",function(d,i){
      var pct = i/data.length;
      var next = (i==data.length-1)?0:i+1;
      var nextPct = next/data.length;
      return "M 350 350 "+getCoords(d,pct)+" "+getCoords(data[next],nextPct)
    })

  selection.enter().append("path").attr("class","arm")
    .attr("d",function(d,i){
      var pct = i/data.length;
      var next = (i==data.length-1)?0:i+1;
      var nextPct = next/data.length;
      return "M 350 350 "+getCoords(d,pct)+" "+getCoords(data[next],nextPct)
    })
    .style("stroke","black").style("fill","none")

  selection.exit().remove();
}
