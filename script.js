// script.js

const img = new Image(); // used to load image from <input> and draw to canvas

var btn = document.getElementsByTagName('button'); // Ref to the buttons

const myCanvas = document.getElementById('user-image');

const ctx = myCanvas.getContext('2d');

var speechSyn = window.speechSynthesis;

var voiceSec = document.getElementById('voice-selection');
var volume = 100;

var speak1 = undefined;
var speak2 = undefined;

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  console.log('loading image');
  
  // toggle relevant buttons
  btn[0].disabled = false; // Generate
   
  btn[1].disabled = true; // Clear
  btn[2].disabled = true; // Read Text

  // get Dimensions
  let imgDimensions = getDimensions(myCanvas.width, myCanvas.height, img.width, img.height);
  let canvasWidth = imgDimensions['width'];
  let canvasHeight = imgDimensions['height'];
  let canvasStartX = imgDimensions['startX'];
  let canvasStartY = imgDimensions['startY'];

  // fill with black
  ctx.rect(0,0,myCanvas.width,myCanvas.height);
  ctx.fillStyle = 'black';
  ctx.fill();

  // draw image
  ctx.drawImage(img, canvasStartX, canvasStartY, canvasWidth, canvasHeight);

  document.getElementById('image-input').value = null;
  document.getElementById('text-top').value = "";
  document.getElementById('text-bottom').value = "";

  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});


const fileSelect = document.getElementById("image-input");
fileSelect.addEventListener('change', () => {
  let file = document.getElementById('image-input').files[0]

  //img.src = 'images/' + file.name;
  img.src = URL.createObjectURL(file); //allows the use of any image, not just in the images directory
  img.alt = file.name; 
});

const submitBtn = btn[0];
submitBtn.addEventListener('click',() =>{
  let s = myCanvas.width/5;
  ctx.font = s + "px Comic Sans MS";
  ctx.fillStyle = "white"
  ctx.textAlign ='center';
  ctx.fillText(document.getElementById('text-top').value,myCanvas.width/2,myCanvas.height * 2/10);
  ctx.fillText(document.getElementById('text-bottom').value,myCanvas.width/2,myCanvas.height * 9/10);

  //document.getElementById('text-top').value = "";
  //document.getElementById('text-bottom').value = "";
  
  btn[0].disabled = true;
  btn[1].disabled = false;
  btn[2].disabled = false;

  // populate voices
  
  voiceSec.disabled = false;
  voiceSec.remove(0);

  /*let voicesList = speechSyn.getVoices();

  voicesList.map((v) => {
    let option = document.createElement('option');
    option.text = v.name;
    voiceSec.add(option);
  })*/

  speak1 = new SpeechSynthesisUtterance(document.getElementById('text-top').value);
  speak2 = new SpeechSynthesisUtterance(document.getElementById('text-bottom').value);

  let voices = speechSyn.getVoices();

  for(var i = 0; i < voices.length ; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSec.add(option);
  }
});

// can't clear text when there's no image on canvas
const clearBtn = btn[1];
clearBtn.addEventListener('click', () => {
  console.log('clearing image');

  // clear rectangle
  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);

  // clear image
  img.src = "";
  img.alt = "";

  // clear text
  //document.getElementById('text-top').value = "";
  //document.getElementById('text-bottom').value = "";

  // enable gen, disable clear, disable read
  btn[0].disabled = false;
  btn[1].disabled = true;
  btn[2].disabled = true;

  window.speechSynthesis.cancel();
});

const readBtn = btn[2];
readBtn.addEventListener('click', () => { 
  let voices = speechSyn.getVoices(); 
  
  var selectedOption = voiceSec.selectedOptions[0].getAttribute('data-name');
    for(var i = 0; i < voices.length ; i++) {
      if(voices[i].name === selectedOption) {
        speak1.voice = voices[i];
        speak2.voice = voices[i];
      }
    }

  
    speak1.volume = volume/100; 
    speak2.volume = volume/100; 

    speechSyn.speak(speak1);
    speechSyn.speak(speak2);

    console.log('finished speaking');
  
    //inputTxt.blur();
});

const volGroup = document.getElementById("volume-group");
volGroup.addEventListener('input', () =>{
  volume = document.querySelector('div > input').value;
  let vImage = document.getElementsByTagName('img')[0];
  /*
  volume-level-3: 67-100
  volume-level-2: 34-66
  volume-level-1: 1-33
  volume-level-0: 0
 
  */
  
  
  if (volume >= 67 && volume <= 100){
    vImage.src = "icons/volume-level-3.svg";
    vImage.alt = "Volume Level 3";

    //console.log(volume);
    //console.log (vImage.src);
  } else if (volume <= 66 && volume >= 34){
    vImage.src = "icons/volume-level-2.svg";
    vImage.alt = "Volume Level 2";
    
    //console.log(volume);
    //console.log (vImage.src);
  } else if (volume <= 33 && volume >= 1) {
    vImage.src = "icons/volume-level-1.svg";
    vImage.alt = "Volume Level 1";
    
    //console.log(volume);
    //console.log (vImage.src);
  } else {
    vImage.src = "icons/volume-level-0.svg"
    vImage.alt = "Volume Level 0";
    
    //console.log(volume);
    //console.log (vImage.src);
  }
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
