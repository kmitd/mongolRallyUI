angular.module('dashboardApp', [
	'ngMap', 
	'chart.js'])


.config(function(ChartJsProvider) {
  
 //
	 ChartJsProvider.setOptions({ colors : [ '#803690', '#00ADF9', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'] });
})

.controller("MainController", ['$scope',"$http", "$interval", mainControllerFct])


function mainControllerFct($scope, $http, $interval){
		
	/**
	INiT
	**/
	$scope.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=AIzaSyDEJDKFSDl6ndtqnRykHyahKnoQG_KN_hQ";
	
 	$scope.dataRootPath = "./docs/output"
	$scope.pathImages = $scope.dataRootPath+'/img';
	
	$scope.pathAvgsFile = $scope.dataRootPath+'/averages.json';
	$scope.pathEventsFile = $scope.dataRootPath+'/events.json';
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
		
		var loadEventA = loadEvents();
		var loadAvgA = loadAverages();
		var loadInsA = loadInstant();
		
		loadEventA.then(function(result){
			loadAvgA.then(function(result2){
				loadInsA.then(function(result3){
					console.log("loaded again");
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
		$interval(reload, 3000);
	 // console.log($scope.ends("20170713-095000.jpg",'.jpg'));
		map.bubbles($scope.data.events, {
		 popupTemplate: function(geo, ff) {
			 var display = "";
			 
			 if(ends(ff.img,'.jpg')) {
				 display = "<img class='img img-round' height='240px' src='"+$scope.pathImages+"/"+ff.img+"' alt='img'/>";
			 }
			 else if(ends(ff.img,'.mp4')) {
				 display = "<video  controls autoplay width='320' height='240' ><source src='"+$scope.pathImages+"/"+ff.img+"' type='video/mp4'></video>";
			 }
			 return "<div class='hoverinfo' ng-bind=\"hoverEdit=true\" ><div class=\"text-center\"> Recorded on <b>"+ timeConverter(ff.timestamp)
			 + "</b> next to "+ff.name+","+ff.countryName+"</div><div class='text-center'><br/><h4>"+ff.title+
			 "</h4>" +display+
			 "<p>"+ff.description+"</p></div></div>";
			 ;
				// testo, nome , luogo, timestamp
		 },
		 borderColor: '#000000',
		 borderWidth: 1,
		 fillOpacity: 1
		});
		
		$scope.ways = [];
		var step ;
		var arcs = [];
		if ($scope.data.events.length > 1) {
			
			for (step = 0; step < $scope.data.events.length-1; step++) {
				// TODO change this
				$scope.mongolRallyCountries[$scope.mapping[$scope.data.events[step].countryCode]] = { fillKey : "VISITED" };
				
				
				var arc2 = {
					location: {
						lat: $scope.data.events[step]['latitude'],
						lng: $scope.data.events[step]['longitude']
					}, 
					stopover:true  
				};
				var arc = {
					origin : {
						latitude: $scope.data.events[step]['latitude'],
						longitude: $scope.data.events[step]['longitude']
					}, destination: {
						latitude: $scope.data.events[step+1]['latitude'],
						longitude: $scope.data.events[step+1]['longitude']
					}
				};
				
				arcs.push(arc);
				$scope.ways.push(arc2);
			}
		}
		// console.log($scope.ways);
		map.arc(arcs, { strokeColor: 'rgba(100, 10, 200, 1)', strokeWidth: 2, arcSharpness: 0});
		
	
		$scope.mouseover = function(data){	 
		 data["badgeHovered"] = true ;	 
		}
		
		$scope.mouseout = function(data){	 
		 data["badgeHovered"] = false ;	 
		}
		
		/**
		BARS
		**/
		$scope.bar = { labels : [], speed : { data : []}, engine : { data : []}, temperature : {data : []}, humidity : {data : []}} ;
	
		angular.forEach($scope.data.averages, function(value,key){
			$scope.bar.labels.push(key); // KEY is the country
			
		 	$scope.bar.speed.data.push($scope.data.averages[key]["car.kph"]);
		 	$scope.bar.engine.data.push($scope.data.averages[key]["car.rpm"]);
			
		 	$scope.bar.temperature.data.push($scope.data.averages[key].temp);		 
		 	$scope.bar.humidity.data.push($scope.data.averages[key].hum);		 
			
		});
		
		
		/**
		Instant sensing
		**/
		
		
			
};

		
		
}

function ends(string,ending) {
	return string.endsWith(ending);
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
 




