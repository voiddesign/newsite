
var projects = [ 
	{ "name" : "bellflower", "date" : "12/12/12", "img" : "icon-01", "hours" : 80 },
	{ "name" : "dissolve", "date" : "1/2/12", "img" : "icon-02", "hours" : 14.5 },
	{ "name" : "clownhome", "date" : "8/4/10", "img" : "icon-03", "hours" : 0.25 },
	{ "name" : "pentacup", "date" : "9/1/10", "img" : "icon-04", "hours" : 4 },
	{ "name" : "plusdores", "date" : "4/6/07", "img" : "icon-05", "hours" : 30 },
	{ "name" : "pelogo", "date" : "3/14/11", "img" : "icon-06", "hours" : 13 },
	{ "name" : "alanmiller", "date" : "1/5/13", "img" : "icon-07", "hours" : 20 },
	{ "name" : "lostshores", "date" : "9/10/11", "img" : "icon-08", "hours" : 40 },
	{ "name" : "joeljeske", "date" : "5/13/12", "img" : "icon-09", "hours" : 35 },
	{ "name" : "faq", "date" : "10/9/11", "img" : "icon-10", "hours" : 2 }
	
];

for (var i = 0; i < 50; i++) {
	projects.push(randgenerator());
}

//								RANDOM PROJECT GENERATOR



function randgenerator() {
		var rdm = Math.floor(Math.random()*12+1),
			rdd = Math.floor(Math.random()*28+1),
			rdy = pad2(Math.floor(Math.random()*7+7));
		return {
			name: "random_" + rdm + rdd + rdy,
			date: rdm + "/" + rdd + "/" + rdy,
			img: "icon-" + pad2(Math.floor((Math.random()*10)+1)),
			hours: Math.random()*75+1
		};
}

function pad2(number) {
   
     return (number < 10 ? '0' : '') + number
   
}

$.post("http://localhost/samgalisoncom/wordpress/?json=get_page_index", function(data) {
	console.log(data);
	//you could do anything you want with the data here
});