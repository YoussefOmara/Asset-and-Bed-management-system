var ctx = document.getElementById('myChart').getContext('2d');
      var Issued_vs_non_issued = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ["Free Beds","Occupied beds"],
            datasets: [{ 
                data: [70,10],
                borderColor:[
                  "#3cba9f",
                  "#ffa500",
                ],
                backgroundColor: [
                  "rgb(60,186,159,0.1)",
                  "rgb(255,165,0,0.1)",
                ],
                borderWidth:2,
              }]
          },
        options: {
          title: {
            display: true,
            text: "Issued vs non issued"
          },
          scales: {
            xAxes: [{ 
               display: false,
            }],
            yAxes: [{
               display: false,
            }],
          }
        },
      });

///////////////////////////////////
var ctx = document.getElementById('myChart2').getContext('2d');

      var myChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ["Ultrasound Probes & Transducers","Anesthesia Ventilators", "Surgical Chairs"],
          datasets: [{ 
              data: [70,10,6],
              borderColor:[
                "#3cba9f",
                "#ffa500",
                "#c45850",
              ],
              backgroundColor: [
                "rgb(60,186,159,0.1)",
                "rgb(255,165,0,0.1)",
                "rgb(196,88,80,0.1)",
              ],
              borderWidth:2,
            }]
        },
      options: {
        title: {
          display: true,
          text: "Devices categories with missing Parts"
        },
        scales: {
          xAxes: [{ 
             display: false,
          }],
          yAxes: [{
             display: false,
          }],
        }
      },
    });
////////////////////////////////////////////////////////


var ctx = document.getElementById('myChart3').getContext('2d');

var xValues = ["Anesthesia Ventilators", "Hospital Beds", "Surgical Chairs", "Ultrasound Probes & Transducers"];
var yValues = [55, 49, 44, 24];
var barColors = ["red", "green","blue","orange"];

var requested_devices=new Chart(ctx, {
  type: "bar",
  data: {
    labels: xValues,
    datasets: [{
      backgroundColor: barColors,
      data: yValues
    }]
  },
  options: {
    legend: {display: false},
    title: {
      display: true,
      text: "Most Requested assets Categories"
    },
    scales: {
      xAxes: [{ 
         display: true,
      }],
      yAxes: [{
         display: true,
      }],
    }
  },
});

///////////////////////////////////////////
var y_Values = [100,520,480,725,452,643,556,120,75,450,423];
var x_Values = [1990,1995,2000,2005,2010,2015,2020,2025,2030,2035,2040];

new Chart("myChart_1", {
  type: "line",
  data: {
    labels: x_Values,
    datasets: [{
      backgroundColor: "rgba(0,0,0,0.8)",
      borderColor: "rgba(0,0,0,0.1)",
      data: y_Values
    }]
  },
  options:{
    legend: {display: false},
    title: {
        display: true,
        text: "NO of Patients over the years"
      },
      scales: {
        xAxes: [{ 
            scaleLabel: {
                display: true,
                labelString: 'Years'
              }
            }],
        yAxes: [{
            scaleLabel: {
                display: true,
                labelString: 'No. of Patietns'
              }
        }],
      }
  }
});