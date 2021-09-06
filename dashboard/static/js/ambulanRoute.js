//script for map
// set up map
            
            var center = [-1.328499, 121.589203];
            var map = L.map('map').setView(center, 6);
            var url = "data/ambulan.geojson";   //{{url_for('data_source',filename='ambulan.geojson')}};
            var myOldId= null;
            var layers ={};
            var dailyJarak=[];
            var dailyLayanan=[];
            
            //icon 
            var startIcon = L.icon({
				iconSize: [48, 48],
				iconAnchor: [24, 24],
				popupAnchor:  [1, -24],
				iconUrl: 'dashboard/static/icons/awal.png'
			});
			
			var endIcon = L.icon({
				iconSize: [48, 48],
				iconAnchor: [24, 24],
				popupAnchor:  [1, -24],
				iconUrl: 'dashboard/static/icons/latest.png'
			});
					
			var realtime= L.realtime( function(success,error){
					fetch(url)
					.then(function(response){return response.json();})
					.then(function(data){
							//console.log(data.features.length);
							var mydata = data.features;
							var myroute = [[]];
							var myfeature =[]; 
							var mygeojson = {"type": "FeatureCollection", "features": []} ;
																							
							//console.log(mydata);
							mydata.forEach(function(item){
								if(item.properties.mid && myOldId != item.properties.mid){
									myOldId = item.properties.mid;
									//console.log(item.properties.driver);
									
									myroute[myOldId]=[];
									driver = item.properties.driver;
									upid =[item.properties.upid];
									time =[item.properties.waktu];
									state=[item.properties.state];
									
									myroute[myOldId] ={type:'Feature',
										properties:{ id:myOldId, driver: driver,upid: upid,state:state,time:time},
										geometry:{type:'LineString',coordinates:[item.geometry.coordinates]}};
									
								} else{
									myroute[myOldId].properties.state.push(item.properties.state);
									myroute[myOldId].properties.upid.push(item.properties.upid);
									myroute[myOldId].properties.time.push(item.properties.waktu);
									myroute[myOldId].geometry.coordinates.push(item.geometry.coordinates);
								}
								
							});
							//console.log('data',data);
							
							myroute.forEach(function(key){
								//console.log(key);
								if(key !=0){
										//console.log(key.properties.id);
									myfeature.push(key);
									
								}
							}); 
							
							mygeojson.features.push.apply(mygeojson.features,myfeature)
							//updating list
							success(
							mygeojson
							); 	
						})
					.catch(error);
				},{
					interval:5000,
					style: function(feature){
							d = '#' + Math.floor(feature.properties.id + Math.random()*16777215).toString(16);
							return {
								"color": d,
								"opacity": 0.7
							}
						},
					onEachFeature: markerPointer
					}
			).addTo(map);
			
			//addmarker
			function markerPointer(feature,layer){
				numpts = feature.geometry.coordinates.length;
				//console.log(numpts);
				var beg = feature.geometry.coordinates[0];
				var end = feature.geometry.coordinates[numpts-1];
				var akhir = numpts-1;
				//layers ={};
				layers[feature.properties.id]=layer;
				
				//start marker
				L.marker([beg[1],beg[0]],{icon:startIcon})
				.bindPopup(function(){
						return '<h3>' + feature.properties.driver + '</h3>' +
								'<p>' + feature.properties.state[0] +'</p>' +
								'<b>'+ feature.properties.upid[0] +'</b>'+
								'<p>' + new Date(feature.properties.time[0]);
				}).addTo(map);
				
				//end marker 
				if(end != beg)
					L.marker([end[1],end[0]],{icon:endIcon})
					.bindPopup(function(){
												
						return '<h3>' + feature.properties.driver + '</h3>' +
								'<p>' + feature.properties.state[akhir] +'</p>' +
								'<b>'+ feature.properties.upid[akhir] +'</b>'+
								'<p>' + new Date(feature.properties.time[akhir])+'</p>' +
								'<p> Jarak :'+ (distance(beg[1],beg[0],end[1],end[0])).toFixed(2)+' km </p>';
						
					}).addTo(map);
				
			};
			
			function colorLine(feature){
					
			};
			
			//jarak ambil dari https://stackoverflow.com/a/21623206
			function distance(lat1, lon1, lat2, lon2) {
				var p = 0.017453292519943295;    // Math.PI / 180
				var c = Math.cos;
				var a = 0.5 - c((lat2 - lat1) * p)/2 + 
						c(lat1 * p) * c(lat2 * p) * 
						(1 - c((lon2 - lon1) * p))/2;

				return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
			};
								         
            //watermark logo
            L.Control.Support = L.Control.extend({
					onAdd: function(map){
						var img = L.DomUtil.create('img');
						img.src ='https://github.com/azhargiri/mit-logo/raw/master/logo_mit_300.png';
						img.style.width ='52px';
						img.title ='mitsociety.id';
						return img;						
					},
					
					onRemove: function(map){
					}
			})
			
			L.control.support = function(opts){
					return new L.Control.Support(opts)
				}
		
						
			L.control.support({position:'bottomleft'}).addTo(map); 
            
            // Stamen's Toner basemap
            L.tileLayer(
                'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
                    attribution: 'Map tiles by <a href="http://stamen.com">' +
                        'Stamen Design</a>, under' +
                        '<a href="http://creativecommons.org/licenses/by/3.0">' +
                        'CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">' +
                        'OpenStreetMap</a>, under' +
                        '<a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
            }).addTo(map);
            
            realtime.once('update', function() {
				map.fitBounds(realtime.getBounds(), {maxZoom: 8});
			});
							
			//hitung jarak
			//[1,2,3,4,5] ==>[[1,2],[2,3],[3,4],[4,5]
			
			function sumJarak(arr, size) {
				//var myArray = [];
				var dist=0;
				for(var i = 0; i < arr.length-1; i ++) {
					var test = arr.slice(i, i+size);
					var tempDist = (distance(test[0][1],test[0][0],test[1][1],test[1][0])).toFixed(2);
					dist += +tempDist;
					
				}
				
				return dist;
			}
				
			function dailyDist(data){
					//id,tanggal,jarak
					let id =data.feature.properties.id;
					let tanggal =new Date(data.feature.properties.time[data.feature.properties.time.length - 1]).toLocaleDateString('id-ID');
					let jarak = sumJarak(data.feature.geometry.coordinates,2);
					
					let harian ={
						id: id,
						tanggal: tanggal,
						jarak: (jarak).toFixed(2)
						}
					return harian;
				}
			
			function jarakSeries(data){
				//durasi harian, bulanan atau tahun
				//data dijadiin {x,y} 
				//jarak ditiap tanggal, bulan dan tahun yg sama di jumlahkan
				var jarakDaily = data.reduce(function(allDates,date){
						if(allDates.some(function(e){
								return e.tanggal === date.tanggal
							})){
								allDates.filter(function(e){
									return e.tanggal === date.tanggal
									})[0].jarak += +date.jarak
							
							}else{
									allDates.push({
											tanggal: date.tanggal,
											jarak: +date.jarak
										})
								}
							return allDates
								
					}, []);
					
					var dailyData = jarakDaily.map(function(item){
							return {x:item['tanggal'],y:item['jarak']};
						});
					
					return dailyData;	
			}
			
			function layananSeries(data){
					var freqLayanan= new Map();
					data.forEach(function(tgl){
							var key = tgl.tanggal;
							var count = freqLayanan.get(key)||0;
							freqLayanan.set(key, ++count);
						});
					
					var layananHarian = Array.from(freqLayanan,([x,y])=>({x,y}))
					
					return layananHarian;
			}
			
			
			function routeUpdate(realtime){
				var tampilkan = realtime._featureLayers;
				var keys = Object.keys(tampilkan);
				//console.log(keys.length);
				var list = document.getElementById("displayed-list");
				list.innerHTML = "";
				var layanan = document.getElementById("layanan");
				layanan.innerHTML ="<b>Total Layanan : "+keys.length+ "</b>";
				var kilo = document.getElementById("kilometer");
				kilometer=0
				var rawJarakHarian= [];
								
				keys.forEach(function(route){
						let mydist = dailyDist(tampilkan[route]);
						var li = document.createElement("li");
						li.innerHTML = '['+mydist.id+'] '+ tampilkan[route].feature.properties.driver +': '+mydist.jarak+' Km';
						list.appendChild(li);
						kilometer = Number(kilometer)+Number(mydist.jarak);
						kilo.innerHTML ="<b>Total Jarak : "+(kilometer).toFixed(2)+" Km</b>";
						rawJarakHarian.push(mydist);
						
					}); 
				
					mydaily=jarakSeries(rawJarakHarian);
					layanHarian = layananSeries(rawJarakHarian);
					dailyJarak.splice(0,dailyJarak.length,...mydaily);
					dailyLayanan.splice(0,dailyLayanan.length,...layanHarian);			 
				}
				
			realtime.on('update', function(e){
					routeUpdate(e.target);
					initChartHarian(chartHarian,dailyJarak);
					initChartHarian(layananHarian,dailyLayanan);
										
				});
				
				//sidebar
				// create the sidebar instance and add it to the map
				var sidebar = L.control.sidebar({ container: 'sidebar' })
							.addTo(map);
							//.open('home');
				// be notified when a panel is opened
				sidebar.on('content', function (ev) {
					switch (ev.id) {
						case 'autopan':
							sidebar.options.autopan = true;
							break;
						default:
							sidebar.options.autopan = false;
					}
				});
							
				//chart harian 
								
				function myContext(selector){	
					const ctx = document.querySelector(selector).getContext('2d');
					return ctx;
				}
				
				function myConfig(label,title){
						const config = {
							type: 'line',
							data: {
								labels: [],
								datasets: [{
										data: [],//kosongkan dulu
										label: label,
										borderColor: "#3e95cd",
										fill: false
									}]
								},
							options: {
								plugins:{
									title: {
										display: true,
										text: title
									},
								},
								scales:{
									x:{
										type:'time',
										display:true,
										time:{
											parser:'DD.MM.YYYY'
										}
									}
								}
							}
							
						};
						return config;
					}
				
					
				var chartHarian = new Chart(myContext("#daily-chart"), myConfig('Jarak Harian','Jarak Tempuh Harian Chart'));
				var layananHarian = new Chart(myContext('#layanan-chart'),myConfig('Layanan Harian','Chart Layanan Harian'));
				
				
				function initChartHarian(chart,data){
					chart.data.datasets[0].data = data;
					chart.update();
				}
