// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor("white");

///////////////////////////////////////////////////////////////////////////////////////////////////

var PENCILTHICKNESS = 10;
var RUBBERTHICKNESS = 40;

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

// Dialog box for About Me
var aboutMeDialog = Ti.UI.createAlertDialog({
	title: 'About Me:',
	message: "Made by Karan Chaudhary:\n\nAn undergraduate pursuing" +
		  " Computer Engineering, who gets a little nervous right" +
		  "before goes to say Worcestershire sauce.",
	buttonNames: ['OK']
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
     	    saveDialogAndroid.show();
     	    break;
     	case 4:
     		aboutMeDialog.show();
     		break;
	}
});

menuView.add(menuTable);

// Toast to be shown on successfully saving the image
var toastImageSaved = Ti.UI.createNotification({
    message:"Image succesfully saved :)",
    duration: Ti.UI.NOTIFICATION_DURATION_SHORT
});

// Creates save dialog
var textFieldAndLabel = Ti.UI.createView({
	width: Ti.UI.FILL,
	height: Ti.UI.FILL
});
var textfield = Ti.UI.createTextField({
	width: "80%",
	height: Ti.UI.FILL,
	left: 0,
	// The keyboard shows up correctly but doesn't hide with any method
	// softKeyboardOnFocus: Ti.UI.Android.SOFT_KEYBOARD_SHOW_ON_FOCUS
});
textFieldAndLabel.add(textfield);
textFieldAndLabel.add( Ti.UI.createLabel({
	width: "20%",
	height: Ti.UI.FILL,
	right: 0,
	text: ".png",
	textAlign: "center",
	font: {fontSize: "24dp"}
}));
var saveDialogAndroid = Ti.UI.createAlertDialog({
	title: 'Name?',
	androidView: textFieldAndLabel,
	buttonNames: ['OK', 'Cancel']
});
saveDialogAndroid.addEventListener('click', function(e) {
    if (e.index == 0) {
    	var img = paint.toImage().media;
    	var _storage = "file:///storage/emulated/0";
    	var folder = Ti.Filesystem.getFile(_storage, 'Paint It Images');
    	if (!folder.exists()) {
   			folder.createDirectory();
		}
		var filename = textfield.value;
		var file = Titanium.Filesystem.getFile(folder.resolve(), filename + ".png");
		if (file.exists()) {
			var nameClashDialog = Ti.UI.createAlertDialog({
				title: "ERROR!",
				message: "Already a Image with same name",
				buttonNames: ["Change Name"]
			});
			nameClashDialog.addEventListener("click", function(e) {
				if (e.index == 0) {
					// change name
					// Calling this time doesn't blurs the image while saving to gallery
    				saveDialogAndroid.show();
				}
			});
			nameClashDialog.show();
		} else {
			file.write(img);
			// #Saves to gallery but blurs the image, and its not because of async with callbacks and setTimeout
			Ti.Media.Android.scanMediaFiles([file.nativePath], ["replace/png".replace("replace", filename)]);
			toastImageSaved.show();
		}
	}
});

///////////////////////////////////////////////////////////////////////////////////////////////////

// Create the main PaintView
var paintView = Ti.UI.createView({
	width: Ti.UI.FILL,
	height: Ti.UI.FILL,
	backgroundColor: "white",
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
	strokeColor: "#00f",
	strokeAlpha: 255,
	strokeWidth: PENCILTHICKNESS,
	eraseMode: false,
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
		colorPalette.hide();
	} else if (paint.eraseMode == false) {
		thicknessSliderPencil.show();
		animateSelectedTool("clockwise");
		colorPalette.show();
	} else {
		thicknessSliderRubber.show();
		animateSelectedTool("clockwise");
		colorPalette.show();
	}
});

// The color palette goes here		
var colorPalette = Ti.UI.createView({
	width: Ti.UI.SIZE,	
	height: Ti.UI.SIZE,
	right: "75dp",		
	top: "15dp",		
	layout: "horizontal",		
	visible: false		
});		
var colorPicker = require('color_picker');		
colorPickerWin = colorPicker.createColorPicker({
	hexColor: "#00f"		
});		
colorPickerWin.addEventListener("selectedcolor", function(e) {		
	paint.strokeColor = '#' + e.color;		
	color.borderColor = paint.strokeColor;		
	color.backgroundColor = paint.strokeColor;		
});		
var color = Ti.UI.createView({		
	width: "50dp",		
	height: "50dp",		
	borderRadius: "25dp",		
	borderWidth: "25dp",		
	borderColor: "#00f",		
	backgroundColor: "#00f",		
	colorPicker: false		
});		
color.addEventListener("click", function(e) {		
	paint.strokeColor = e.source.backgroundColor;		
});		
color.addEventListener("dblclick", function(e) {		
	colorPickerWin.open();		
	color.colorPicker = true;		
});		
color.addEventListener("longpress", function(e) {		
	colorPickerWin.open();		
	color.colorPicker = true;		
});		
colorPalette.add(color);		

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
paintView.add(colorPalette);
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

// Prevents the app to close on pressing back button
drawer.addEventListener("android:back", function(e) {
    var intent = Ti.Android.createIntent({
        action : Ti.Android.ACTION_MAIN
    });
 
    intent.addCategory(Ti.Android.CATEGORY_HOME);
    Ti.Android.currentActivity.startActivity(intent);
 
});

drawer.open();
