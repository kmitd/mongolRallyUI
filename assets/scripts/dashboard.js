angular.module('dashboardApp', ['uiGmapgoogle-maps','chart.js'])

.controller('MapController', ['$scope','uiGmapGoogleMapApi' , mapController])
.controller('LineController',['$scope',lineController])
.controller('DonutCtrl',['$scope',donutCtrl])
.controller('BubbleCtrl',['$scope',bubbleCtrl])
.controller('TimelineCtrl',['$scope',timelineCtrl])
.controller('StoryTellingCtrl',['$scope',storyTelling])

.config(function(uiGmapGoogleMapApiProvider,ChartJsProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyDEJDKFSDl6ndtqnRykHyahKnoQG_KN_hQ',
        v: '3.20', //defaults to latest 3.X anyhow
        libraries: 'weather,geometry,visualization'
    });
	
	 ChartJsProvider.setOptions({ colors : [ '#803690', '#00ADF9', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'] });
})

function mapController($scope,uiGmapGoogleMapApi ){
	$scope.hello="Hello";
	
 
	
	uiGmapGoogleMapApi.then(function(maps) {
		
		$scope.map = { "center" : {
          "latitude" :55.567248,
          "longitude" : 50.951069            
        },
        "zoom" : 3,
	
		"events": {}
				
		};
		
	
	
		$scope.stroke = {color:'#edfd2e', weight : 3};
		$scope.waypoints = [{"latitude": 52.0417200	, "longitude": -0.7558300, options:{ icon : {url: './docs/p.png', scaledSize:{ width: 23, height: 15.5 } }, optimized: false}},  {"latitude": 44.4268, "longitude":  26.1025, options : {opacity: 0.0}}	, 	{"latitude":50.310699,"longitude":50.599457 , options : {opacity: 0.0}}, {"latitude" : 51.8238785, "longitude": 107.60733800000003, options:{  optimized: false, icon : {url: './docs/T.png', scaledSize:{ width: 24.6, height: 21.6 } } }}];
	});
	
	
		
} ;

function storyTelling($scope){
	$scope.story = { kilom: 100 , activities: "Pasta", where: "Kobe"};
	
};

function lineController($scope){
    $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
     $scope.series = ['Series A', 'Series B'];
     $scope.data = [
       [65, 59, 80, 81, 56, 55, 40],
       [28, 48, 40, 19, 86, 27, 90]
     ];
     $scope.onClick = function (points, evt) {
       console.log(points, evt);
     };
     $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
     $scope.options = {
       scales: {
         yAxes: [
           {
             id: 'y-axis-1',
             type: 'linear',
             display: true,
             position: 'left'
           },
           {
             id: 'y-axis-2',
             type: 'linear',
             display: true,
             position: 'right'
           }
         ]
       }
     };
	
};

function donutCtrl($scope){
	$scope.labels = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
	  $scope.data = [300, 500, 100];
};

function bubbleCtrl($scope){
	$scope.series = ['Series A', 'Series B'];

	    $scope.data = [
	      [{
	        x: 40,
	        y: 10,
	        r: 20
	      }],
	      [{
	        x: 10,
	        y: 30,
	        r: 50
	      }],[{
	        x: 20,
	        y: 20,
	        r: 30
	      }],[{
	        x: 15,
	        y: 20,
			  r: 10
	      }]
	    ];
};

function timelineCtrl($scope){
	$scope.hoverEdit = false;
	$scope.events = [{type: "fa fa-check", badge:"primary",title: "I'm a title", when: "Thu, Nov. 11th", from: "Twitter",text: "hello",class:"timeline-inverted"}, {type: "fa fa-thumbs-up",text: "hello",title: "I'm another title",when: "Wed, Nov. 18th", from: "SMS", text: "hello", badge:"success"},{class:"timeline-inverted", type: "fa fa-fire-extinguisher", badge:"warning",text: "hello",title: "I'm another title",when: "Wed, Nov. 18th", from: "SMS", text: "hello", badge:"danger"},{type: "fa fa-car", badge:"warning",text: "hello",title: "I'm another title",when: "Wed, Nov. 18th", from: "SMS", text: "hello" }];
};