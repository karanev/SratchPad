// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor("white");
///////////////////////////////////////////////////////////////////////////////////////////////////

var PENCILTHICKNESS = 10;
var RUBBERTHICKNESS = 40;

var OSNAME = Ti.Platform.osname;

///////////////////////////////////////////////////////////////////////////////////////////////////

// Create the menu view on the left which has menu implemented as table
var menuView = Ti.UI.createView({
	backgroundColor: "black",
	width: Ti.UI.FILL,
	height: Ti.UI.FILL
	// url: "menuView.js"
});

menuData = [
	{title:"Pencil", leftImage:"images/pencilToolSelected.png", textColor:"white", backgroundColor:"black", className:"menu"},
	{title:"Eraser", leftImage:"images/eraserTool.png", textColor:"black", backgroundColor:"white", className:"menu"},
	{title:"New", leftImage:"images/newImage.png", textColor:"black", backgroundColor:"white", className:"menu"},
	{title:"Save", leftImage:"images/saveImage.png", textColor:"black", backgroundColor:"white", className:"menu"},
	{title:"About Me", leftImage:"images/aboutMe.png", textColor:"black", backgroundColor:"white", className:"menu"}
];

rowData = [];

for (var i=0; i<menuData.length; i++){
	var img = Ti.UI.createImageView({
		image: menuData[i].leftImage,
		top: "15dp",
		height: "72dp",
		touchEnabled: false
	});
	
	var label = Ti.UI.createLabel({
		text: menuData[i].title,
		font: {fontsize: 48},
		bottom: "15dp",
		color: menuData[i].textColor,
		touchEnabled: false
	});
	
	var row = Ti.UI.createTableViewRow({
		height: "130dp",
		backgroundColor: menuData[i].backgroundColor,
		backgroundSelectedColor: "black",
		className: menuData[i].className
	});
	
	row.add(img);
	row.add(label);
	row.add( Ti.UI.createView({
            height: 1,
            width: Ti.UI.FILL,
            backgroundColor: "black",
            bottom: 0
    }) );
	rowData.push(row);
}

var menuTable = Ti.UI.createTableView({
	width: Ti.UI.FILL,
	height: Ti.UI.FILL,
	backgroundColor: "black",
	data: rowData
});

menuTable.addEventListener("click", function(e) {
	switch (e.index) {
    	case 0: //Pencil
    	    paint.eraseMode = false;
			paint.strokeWidth = PENCILTHICKNESS;
			menuTable.data[0].rows[0].children[0].image = "images/pencilToolSelected.png";
			menuTable.data[0].rows[0].backgroundColor = "black";
			menuTable.data[0].rows[0].children[1].color = "white";
			menuTable.data[0].rows[1].children[0].image = "images/eraserTool.png";
			menuTable.data[0].rows[1].backgroundColor = "white";
			menuTable.data[0].rows[1].children[1].color = "black";
			selectedTool.image = "images/pencilTool.png";
    	    break;
    	case 1: //Eraser
     	    paint.eraseMode = true;
			paint.strokeWidth = RUBBERTHICKNESS;
			menuTable.data[0].rows[0].children[0].image = "images/pencilTool.png";
			menuTable.data[0].rows[0].backgroundColor = "white";
			menuTable.data[0].rows[0].children[1].color = "black";
			menuTable.data[0].rows[1].children[0].image = "images/eraserToolSelected.png";
			menuTable.data[0].rows[1].backgroundColor = "black";
			menuTable.data[0].rows[1].children[1].color = "white";
			selectedTool.image = "images/eraserTool.png";
     	    break;
   	 	case 2: //New
   	 		paint.clear();
    	    break;
   		case 3: //Save
   			drawer.toggleLeftWindow();
     	    if (OSNAME == "android") {
     	    	saveDialogAndroid.show();
     	    } else {
     	    	saveDialogiOS.show();
     	    }
     	    break;
     	case 4:
     		alert("Created by Hashtag (Karan)");
     		break;
	}
});

menuView.add(menuTable);

// Toast to be shown on successfully saving the image
var toastImageSaved = Ti.UI.createNotification({
    message:"Image succesfully saved :)",
    duration: Ti.UI.NOTIFICATION_DURATION_SHORT
});

// Creates save dialogs
if (OSNAME == "android") {
	var textfield = Ti.UI.createTextField();
	var saveDialogAndroid = Ti.UI.createAlertDialog({
	    title: 'Name?',
	    androidView: textfield,
	    buttonNames: ['OK', 'Cancel']
	});
	saveDialogAndroid.addEventListener('click', function(e) {
	    if (e.index == 0) {
	    	var img = paint.toImage().media;
	    	var _storage = 'file:///storage/emulated/0/';
	    	var folder = Ti.Filesystem.getFile(_storage, 'Paint It');
	    	if (!folder.exists()) {
    			folder.createDirectory();
			}
			var filename = textfield.value;
			var file = Titanium.Filesystem.getFile(folder.resolve(), filename + ".png");
			if (file.exists()) {
				
			var nameClashDialog = Ti.UI.createAlertDialog({
				title: "Alert!",
				text: "Already a Image with same name",
				buttonNames: ["Overwrite", "Change Name"]
			});
			nameClashDialog.show();
			
			}
	    	file.write(img);
	    	Ti.Media.Android.scanMediaFiles([file.nativePath], ["replace/png".replace("replace", filename)]);
	    	toastImageSaved.show();
	    }
	});
} else {
	var saveDialogiOS = Ti.UI.createAlertDialog({
    	title: 'Name?',
    	style: Ti.UI.iPhone.AlertDialogStyle.PLAIN_TEXT_INPUT,
    	buttonNames: ['OK', 'Cancel']
	});
	saveDialogiOS.addEventListener('click', function(e) {
	    if (e.index == 0){
	    	var img = paint.toImage().media;
	    	var folder = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'Paint It');
	    	if (!folder.exists()){
    			folder.createDirectory();
			}
			var filename = e.text;
			var file = Titanium.Filesystem.getFile(folder.resolve(), filename);
	    	file.write(img);
	    	var imageForGallery = Ti.FileSystem.getFile(folder.resolve(), filename);
    		Ti.Media.saveToPhotoGallery(imageForGallery);
    		// some toast like notification in future here if I supported iOS
	    }
	});
}

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
	backgroundColor: "white",
	strokeColor: "#000",
	strokeAlpha: 255,
	strokeWidth: PENCILTHICKNESS,
	eraseMode: false
});

var selectedTool = Ti.UI.createImageView({
	image: "images/pencilTool.png",
	width: "50dp", height: "50dp",
	top: "15dp", right: "15dp"
});
var animateSelectedTool = function( turn ) {
	var matrix = Ti.UI.create2DMatrix();
	if (turn == "clockwise") {
    	matrix = matrix.rotate(0, 360);
    } else {
    	matrix = matrix.rotate(360, 0);
    } 
    var a = Ti.UI.createAnimation({
    	transform : matrix,
        duration : 500
    });
    selectedTool.animate(a);
};
selectedTool.addEventListener("click", function(e) {
	if (thicknessSliderPencil.visible || thicknessSliderRubber.visible) {
		thicknessSliderPencil.hide();
		thicknessSliderRubber.hide();
		animateSelectedTool("anticlockwise");
	} else if (paint.eraseMode == false) {
		thicknessSliderPencil.show();
		animateSelectedTool("clockwise");
	} else {
		thicknessSliderRubber.show();
		animateSelectedTool("clockwise");
	}
});

var t = Titanium.UI.create2DMatrix();
t = t.rotate(-90);
thicknessSliderRubber = Titanium.UI.createSlider({
	min: 0,
    max: 100,
    value: RUBBERTHICKNESS,
    width: "150dp",
    height: Ti.UI.SIZE,
    top: "120dp", right: "-39dp",
    transform: t,
    visible: false
});
thicknessSliderPencil = Titanium.UI.createSlider({
	min: 0,
    max: 50,
    value: PENCILTHICKNESS,
    width: "150dp",
    height: Ti.UI.SIZE,
    top: "120dp", right: "-39dp",
    transform: t,
    visible: false
});
thicknessSliderRubber.addEventListener("change", function(e) {
	paint.strokeWidth = RUBBERTHICKNESS = e.value;
});
thicknessSliderPencil.addEventListener("change", function(e) {
	paint.strokeWidth = PENCILTHICKNESS = e.value;
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
paintView.add(thicknessSliderRubber);
paintView.add(thicknessSliderPencil);
paintView.add(openMenu);

///////////////////////////////////////////////////////////////////////////////////////////////////

// CREATE THE MODULE
var NappDrawer = require('dk.napp.drawer');

var drawer = NappDrawer.createDrawer({
	backgroundColor: "white",
	fullscreen: false,
	navBarHidden: true,
	leftWindow: menuView,
	centerWindow: paintView,
	fading: 0.2, // 0-1
	parallaxAmount: 0.3, //0-1
	shadowWidth:"30dp",
	leftDrawerWidth: "130dp",
	animationMode: NappDrawer.ANIMATION_NONE,
	closeDrawerGestureMode: NappDrawer.CLOSE_MODE_MARGIN,
	openDrawerGestureMode: NappDrawer.OPEN_MODE_NONE,
	orientationModes: [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT]
});

drawer.open();
