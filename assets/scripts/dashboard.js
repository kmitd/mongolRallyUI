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

.controller("MainController", ['$scope','uiGmapGoogleMapApi',"$http", "$interval", mainControllerFct])


function mainControllerFct($scope,uiGmapGoogleMapApi, $http, $interval){
		
	/**
	INiT
	**/
 	$scope.dataRootPath = "./docs/output"
	$scope.pathImages = $scope.dataRootPath+'/img';
	
	$scope.pathAvgsFile = $scope.dataRootPath+'/averages.json';
	$scope.pathEventsFile = $scope.dataRootPath+'/event.json';
	$scope.pathInstantSensingFile = $scope.dataRootPath+'/instant.json';
	
	$scope.data = { };
	
	$scope.mapping = {
		GB : "GBR", CH :"CHE" ,AU: "AUT", RO: "ROU", HU: "HUN",
		FR: "FRA", BG: "BGR",DE: "DEU",TM :"TKM", TJ: "TJK", KG: "KGZ", KZ :"KAZ" ,
		MN : "MNG", UZ : "UZB", AM : "ARM", GE: "GEO", TR : "TUR", IR: "IRN", RU : "RUS", BY : "BLR", PL: "POL", NL : "NLD"
	}// any better way?

	$scope.mongolRallyCountries = { BLR : {fillKey: "NONE"}, NLD : {fillKey: "NONE"},POL : {fillKey: "NONE"}, RUS : {fillKey : "NONE"}, GBR : {fillKey: "TOVISIT"},AUT : {fillKey: "TOVISIT"},ROU : {fillKey: "TOVISIT"},HUN : {fillKey: "TOVISIT"}, FRA: {fillKey: "TOVISIT"}, BGR: {fillKey: "TOVISIT"}, DEU : {fillKey: "TOVISIT"},TKM: { fillKey: 'TOVISIT'},TJK : { fillKey: 'TOVISIT'},KGZ : { fillKey: 'TOVISIT'},KAZ : { fillKey: 'TOVISIT'}, MNG : { fillKey: 'TOVISIT'},UZB: {fillKey: 'TOVISIT'},ARM: {fillKey: 'TOVISIT'},GEO: {fillKey: 'TOVISIT'},TUR: {fillKey: 'TOVISIT'},IRN: {fillKey: 'TOVISIT'}, BEL : {fillKey: 'TOVISIT'}
};
	
	var map;


	var loadEvents = function() {
		return $http.get($scope.pathEventsFile).success(function(response){
	        $scope.data.events = response;
	    })
		.error(function(data,status,error,config){
			console.log("Cannot read events file");
		});
	};
	
	var loadAverages = function() {
		return 	$http.get($scope.pathAvgsFile).success(function(response1){
        	$scope.data.averages = response1;
		})	
    	.error(function(data,status,error,config){
			console.log("Cannot read averages file");
		})	
	};
	
	var loadInstant = function() {
		return 	$http.get($scope.pathInstantSensingFile).success(function(response2){
        	$scope.data.instant = response2;         
		})
		.error(function(data,status,error,config){
			console.log("Cannot read instant sensing file");
		});
	};
	
	var loadEvent = loadEvents();
	var loadAvg = loadAverages();
	var loadIns = loadInstant();
		
	loadEvent.then(function(){
		loadAvg.then(function(){
			loadIns.then(function(){
				start();
			});
		});
	});



	function reload() {
		map.updateChoropleth($scope.mongolRallyCountries);
		loadEvent.then(function(result){
			// $scope.data.events = result.data;
			loadAvg.then(function(result2){
				// $scope.data.averages = result2.data;
				loadIns.then(function(result3){
					console.log("loaded again",result3);
					console.log($scope.data.instant.temperature);
					$scope.data.instant = result3.data;
				});
			});
		});
	} ;
	
    map = new Datamap({
	element: document.getElementById('map_container'),
	fills: {
	            VISITED: '#008000',
	            TOVISIT: '#ADD8E6',
	            defaultFill: '#afafaf',
				NONE : '#afafaf',
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


	var start = function(){	
		// $interval(reload, 3000);
		
		map.bubbles($scope.data.events, {
		 popupTemplate: function(geo, data) {
			 
			 return "<div class='hoverinfo' ng-bind=\"hoverEdit=true\" ><div class=\"text-center\"> Recorded on <b>" + timeConverter(data.timestamp)
			 	+ "</b> next to "+data.name+","+data.countryName+"</div><div class='text-center'><br/><h4>"+data.title+"</h4><img class='img img-round' height='200px' src='"+$scope.pathImages+"/"+data.img+"'  alt='img'><p>"+data.description+"</p></div></div>";
				// testo, nome , luogo, timestamp
		 },
		 borderColor: '#000000',
		 borderWidth: 1,
		 fillOpacity: 1
		});
		
		
		var step ;
		var arcs = [];
		if ($scope.data.events.length > 1) {
			for (step = 0; step < $scope.data.events.length-1; step++) {
				// TODO change this
				$scope.mongolRallyCountries[$scope.mapping[$scope.data.events[step].countryCode]] = { fillKey : "VISITED" };
				console.log();
				var arc = {
					origin : {
						latitude: $scope.data.events[step]['latitude'],
						longitude: $scope.data.events[step]['longitude']
					}, destination: {
						latitude: $scope.data.events[step+1]['latitude'],
						longitude: $scope.data.events[step+1]['longitude']
					}
				}
				arcs.push(arc);
			}
		}

		map.arc(arcs, { strokeColor: 'rgba(100, 10, 200, 1)', strokeWidth: 2, arcSharpness: 0});
		
	
		$scope.mouseover = function(data){
			console.log("hello",data);
		 return "<div class='hoverinfo' ng-bind=\"hoverEdit=true\" ><div class=\"text-center\"> Recorded on </div></div>";
			
		}
		
		
		/**
		BARS
		**/
		$scope.bar = { labels : [], speed : { data : []}, temperature : {data : []}, humidity : {data : []}} ;
	
		angular.forEach($scope.data.averages, function(value,key){
			$scope.bar.labels.push(key);
		 	$scope.bar.speed.data.push($scope.data.averages[key].speed);
		 	$scope.bar.temperature.data.push($scope.data.averages[key].temperature);		 
		 	$scope.bar.humidity.data.push($scope.data.averages[key].humidity);		 
			
		});
		
		
		/**
		Instant sensing
		**/
		
		
			
};

		
		
}


function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp );
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var time = date + ' ' + month + ' ' + year + ', ' + hour + ':' + min  ;
  return time;
};
 




