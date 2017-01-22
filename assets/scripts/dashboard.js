angular.module('dashboardApp', ['uiGmapgoogle-maps','chart.js'])


.config(function(uiGmapGoogleMapApiProvider,ChartJsProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyDEJDKFSDl6ndtqnRykHyahKnoQG_KN_hQ',
        v: '3.20', //defaults to latest 3.X anyhow
        libraries: 'weather,geometry,visualization'
    });
 //
	 ChartJsProvider.setOptions({ colors : [ '#803690', '#00ADF9', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'] });
})

.controller("MainController", ['$scope','uiGmapGoogleMapApi',"$http", mainControllerFct])


function mainControllerFct($scope,uiGmapGoogleMapApi, $http){
		
	/**
	INiT
	**/
 

	$scope.loadedData = null;
	$scope.mapping = {
		GB : "GBR", CH :"CHE" ,AU: "AUT", RO: "ROU", HU: "HUN",
		FR: "FRA", BG: "BGR",DE: "DEU",TM :"TKM", TJ: "TJK", KG: "KGZ", KZ :"KAZ" ,
		MN : "MNG", UZ : "UZB", AM : "ARM", GE: "GEO", TR : "TUR", IR: "IRN"
	}// any better way?

	$scope.mongolRallyCountries = { GBR : {fillKey: "TOVISIT"},CHE : {fillKey: "TOVISIT"},AUT : {fillKey: "TOVISIT"},ROU : {fillKey: "TOVISIT"},HUN : {fillKey: "TOVISIT"}, FRA: {fillKey: "TOVISIT"}, BGR: {fillKey: "TOVISIT"}, DEU : {fillKey: "TOVISIT"},TKM: { fillKey: 'TOVISIT'},TJK : { fillKey: 'TOVISIT'},KGZ : { fillKey: 'TOVISIT'},KAZ : { fillKey: 'TOVISIT'}, MNG : { fillKey: 'TOVISIT'},UZB: {fillKey: 'TOVISIT'},ARM: {fillKey: 'TOVISIT'},GEO: {fillKey: 'TOVISIT'},TUR: {fillKey: 'TOVISIT'},IRN: {fillKey: 'TOVISIT'}
};

	var getClosestPlace = function(event){
		$http({
		  method: 'GET',
		  url: 'http://api.geonames.org/findNearbyPlaceNameJSON?username=KMI_TD&lat='+//'https://maps.googleapis.com/maps/api/geocode/json?latlng='+
		  event.latitude+'&lng='+event.longitude +"&lang=en&"
		  //+'&key=AIzaSyDEJDKFSDl6ndtqnRykHyahKnoQG_KN_hQ&result_type=country'
		}).then(function successCallback(response) {
			//console.log(response.data.geonames[0].name);
			event["closestplace"] = response.data.geonames[0].name;
			
		  }, function errorCallback(response,error) {
			  console.log(error);
		  });
	}

	var getCountry = function(i ) {
		$http({
		  method: 'GET',
		  url: 'http://api.geonames.org/countryCode?username=KMI_TD&lat='+//'https://maps.googleapis.com/maps/api/geocode/json?latlng='+
		  $scope.loadedData[i].latitude+'&lng='+$scope.loadedData[i].longitude
		  //+'&key=AIzaSyDEJDKFSDl6ndtqnRykHyahKnoQG_KN_hQ&result_type=country'
		}).then(function successCallback(response) {
			// console.log(response.data);
			$scope.mongolRallyCountries[$scope.mapping[response.data.trim()]] = { fillKey : "VISITED" };
			
		  }, function errorCallback(response,error) {
			  console.log(error);
		  });
	}
	
	

	var atStart = function() {
		return $http.get('docs/sensing_data/readings/event.json')
		.success(function(data) {
			$scope.loadedData = data;
	 		if ($scope.loadedData.length > 1) {
	 			for (step = 0; step < $scope.loadedData.length; step++) {
	 				getCountry(step);
	 				getClosestPlace($scope.loadedData[step]);
	 			};
	 		}
			// console.log($scope.loadedData);
		})
		.error(function(data,status,error,config){
			console.log(error);
		});
	}

	var start = atStart();
	
	start.then(function(result){
		
		 
		/**
		LINECHART
		**/
		// TODO here
		$scope.loadedData = result.data;
		console.log(1,$scope.mongolRallyCountries,$scope.mongolRallyCountries.CHE);
		for (var key in $scope.mongolRallyCountries) { 
			if (key == "GBR") {
				console.log(2,key,$scope.mongolRallyCountries[key]);				
			}
			
		}
		
		$scope.labels = $.map($scope.loadedData, function(value, index) {	    
			return [timeConverter(value.timestamp)];
		});
		 	

		$scope.series = ['fitbeat_I', 'fitbeat_M'];

		f1 = $.map($scope.loadedData, function(value, index) {
		    return [value["fitbeat1"]["beats_per_minute"]];
		});

		f2 = $.map($scope.loadedData, function(value, index) {
		    return [value["fitbeat2"]["beats_per_minute"]];
		});

		$scope.data = [f1,  f2];

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
		 
		 
		 
 	/**TIMELINE**/
   
 	    var map = new Datamap({
 			element: document.getElementById('map_container'),
 			fills: {
 			            VISITED: '#008000',
 			            TOVISIT: '#ADD8E6',
 			            defaultFill: '#afafaf',
 						PITSTOP : "#000000"
 			        },
 	        data: $scope.mongolRallyCountries,
 			scope: 'world',
 		    // Zoom in on Africa
 		    setProjection: function(element) {
				
				
 		      var projection = d3.geo.equirectangular()
 		        .center([50, 40])
 		        // .rotate([4.4, 0])
 		        .scale(400)
 		        .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
 		      var path = d3.geo.path()
 		        .projection(projection);
 	    		return {path: path, projection: projection};
 	  		}

 		});
		
		
		map.bubbles($scope.loadedData, {
		 popupTemplate: function(geo, data) {
			 
			 // TODO that's definitely a trick. (Discover why data and $scope.loadedData are different)
			 var result = $scope.loadedData.filter(function( obj ) {
			   return obj.timestamp == data.timestamp;
			 });
			 // console.log(result);
			 
			 return "<div class='hoverinfo' ng-bind=\"hoverEdit=true\" ><div class=\"text-center\"> Recorded on <b>" + timeConverter(data.timestamp)
			 	+ "</b> next to "+result[0].closestplace+"</div><div><img class='img img-round' src="+data.img+"  alt='img'></div></div>";
				// testo, nome , luogo, timestamp
		 },
		 borderColor: '#000000',
		 borderWidth: 1,
		 fillOpacity: 1
		});
		
		
		var step ;
		var arcs = [];
		if ($scope.loadedData.length > 1) {
			for (step = 0; step < $scope.loadedData.length-1; step++) {
				var arc = {
					origin : {
						latitude: $scope.loadedData[step]['latitude'],
						longitude: $scope.loadedData[step]['longitude']
					}, destination: {
						latitude: $scope.loadedData[step+1]['latitude'],
						longitude: $scope.loadedData[step+1]['longitude']
					}
				}
				arcs.push(arc);
			}
		}

		map.arc(arcs, { strokeColor: 'rgba(100, 10, 200, 1)', strokeWidth: 2, arcSharpness: 0});
		
		
		
});
		
		
		//


	

	/**
	DONUT
	**/
	$scope.donut = {} ;
	$scope.donut.labels = ["MNG","TAJ", "KAZ"]//["Sunny", "Rainy", "Cloudy"];
	$scope.donut.data = [100, 50, 20];
	
	/**
	Bubble
	**/  
	
	$scope.bubble = {};
	$scope.bubble.series = ['Series A', 'Series B'];

	$scope.bubble.data = [
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
}


function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var time = date + ' ' + month + ' ' + year + ', ' + hour + ':' + min  ;
  return time;
};
 




