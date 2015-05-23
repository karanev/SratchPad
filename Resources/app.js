// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#fff');

///////////////////////////////////////////////////////////////////////////////////////////////////

// Create the menu view on the left which has menu implemented as table
var menuView = Ti.UI.createView({
	backgroundColor: "white",
	width: Ti.UI.FILL,
	height: Ti.UI.FILL
	// url: "menuView.js"
});

menuData = [
	{title:"Pencil", leftImage:"images/pencilTool.png", className:"menu"},
	{title:"Eraser", leftImage:"images/eraserTool.png", className:"menu"},
	{title:"New", leftImage:"images/newImage.png", className:"menu"},
	{title:"Save", leftImage:"images/saveImage.png", className:"menu"},
];

rowData = [];

for (var i=0; i<4; i++){
	var img = Ti.UI.createImageView({
		image: menuData[i].leftImage,//earlier 18 top and no height
		top: "15dp",
		height: "72dp",
		touchEnabled: false
	});
	
	var label = Ti.UI.createLabel({
		text: menuData[i].title,
		font: {fontsize: 48},
		bottom: "15dp",
		color: "black",
		touchEnabled: false
	});
	
	var row = Ti.UI.createTableViewRow({
		height: "130dp",
		className: menuData[i].className
	});
	
	row.add(img);
	row.add(label);
	row.add( Ti.UI.createView({
            height: 1,
            width: Ti.UI.FILL,
            backgroundColor: "#000",
            bottom: 0
    }) );
	rowData.push(row);
}

var menuTable = Ti.UI.createTableView({
	width: Ti.UI.FILL,
	height: Ti.UI.FILL,
	data: rowData
});

menuTable.addEventListener("click", function(e) {
	switch (e.index) {
    	case 0: //Pencil
    	    paint.eraseMode = false;
			paint.strokeWidth = 10;
			selectedTool.image = "images/pencilTool.png";
			thicknessSlider.value = 10;
    	    break;
    	case 1: //Eraser
     	    paint.eraseMode = true;
			paint.strokeWidth = 40;
			selectedTool.image = "images/eraserTool.png";
			thicknessSlider.value = 40;
     	    break;
   	 	case 2: //New
   	 		paint.clear();
    	    break;
   		case 3: //Save
     	    Ti.API.info("It works");
     	    break;
	}
});

menuView.add(menuTable);

///////////////////////////////////////////////////////////////////////////////////////////////////

// Create the main PaintView
var paintView = Ti.UI.createView({
	width: Ti.UI.FILL,
	height: Ti.UI.FILL,
	backgroundColor: "white"
	//url: "paintView.js"
});

// Create the module inorder to make paint view
var Paint = require("ti.paint");

var paint = Paint.createPaintView({
	left: 0,
	top: 0,
	width: "100%",
	height: "100%",
	strokeColor: "#000",
	strokeAlpha: 255,
	strokeWidth: 10,
	eraseMode: false
});

var selectedTool = Ti.UI.createImageView({
	image: "images/pencilTool.png",
	width: "40dp", height: "40dp",
	top: "15dp", right: "15dp"
});
selectedTool.addEventListener("click", function(e) {
	if (thicknessSlider.visible) {
		thicknessSlider.hide();
		var matrix = Ti.UI.create2DMatrix();
    	matrix = matrix.rotate(360, 0);
    	var a = Ti.UI.createAnimation({
        	transform : matrix,
        	duration : 500
    	});
    	selectedTool.animate(a);
	} else {
		thicknessSlider.show();
		var matrix = Ti.UI.create2DMatrix();
    	matrix = matrix.rotate(0, 360);
    	var a = Ti.UI.createAnimation({
        	transform : matrix,
        	duration : 500
    	});
    	selectedTool.animate(a);
	}
});

var t = Titanium.UI.create2DMatrix();
t = t.rotate(-90);
thicknessSlider = Titanium.UI.createSlider({
	min: 0,
    max: 80,
    value: 10,
    width: "150dp",
    height: Ti.UI.SIZE,
    top: "110dp", right: "-37dp",
    transform: t,
    visible: false
});
thicknessSlider.addEventListener("change", function(e) {
	paint.strokeWidth = e.value;
});

var openMenu = Ti.UI.createImageView({
	image: "images/menuAndMore.png",
	width: "50dp", height: "32dp",
	bottom: "15dp", left: "15dp"
});
openMenu.addEventListener("click", function(e){
	drawer.toggleLeftWindow();
});

// Add PaintView to our centerView i.e. paintView
paintView.add(paint);
paintView.add(selectedTool); //adding after all so as to make it visible
paintView.add(thicknessSlider);
paintView.add(openMenu);

///////////////////////////////////////////////////////////////////////////////////////////////////

// CREATE THE MODULE
var NappDrawerModule = require('dk.napp.drawer');

var drawer = NappDrawerModule.createDrawer({
	backgroundColor: "white",
	fullscreen:false,
	navBarHidden:true,
	leftWindow: menuView,
	centerWindow: paintView,
	fading: 0.2, // 0-1
	parallaxAmount: 0.3, //0-1
	shadowWidth:"30dp",
	leftDrawerWidth: "130dp",
	animationMode: NappDrawerModule.ANIMATION_NONE,
	closeDrawerGestureMode: NappDrawerModule.CLOSE_MODE_MARGIN,
	openDrawerGestureMode: NappDrawerModule.OPEN_MODE_NONE,
	orientationModes: [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT]
});

drawer.open();
