var offscreenCan;
var gl;
var Canvas;
var myWorker;
var current_URL;
var bar_width=0;
var progress = 0;
var abc={};
var serverWorker;
var flagBar=0;
var fixedBitSequence;
var interval=0;

function generateBinaryString(length) {
    let result = "";
    for (let i = 0; i < length; i++) {
        result += Math.random() < 0.5 ? "0" : "1";
    }
    return result;
}

function fnBrowserDetect() {
  let userAgent = navigator.userAgent;
  let browserName;

  if(userAgent.match(/edg/i)){
    browserName = "edge";
  }else if(userAgent.match(/opr/i)){
    browserName = "opera";
  }else if(userAgent.match(/chrome|chromium|crios/i)){
    browserName = "chrome";
  }else if(userAgent.match(/firefox|fxios/i)){
    browserName = "firefox";
  }else if(userAgent.match(/safari/i)){
    browserName = "safari";
  }else{
    browserName="No browser detection";
  }
  if (navigator.brave) browserName = "brave";
  return browserName;
}

function isWebRTCSupported() {
	return !!(window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection);
  }
  
function isTorBrowser() {
	let userAgent = navigator.userAgent;


	if (userAgent.includes("TorBrowser")) {
		return true;
	}


	if (!isWebRTCSupported()) {
		return true;
	}

	return false;
}

function copyInputValue() {
  const value = document.getElementById("inputText").textContent;


  navigator.clipboard.writeText(value)
    .then(() => {
      console.log("Copied to clipboard: " + value);
    })
    .catch(err => {
      console.error("Failed to copy: ", err);
    });
}


function convertToFixedBitSequence() {
  const inputText = document.getElementById('inputText').textContent;

  const intervalValue = 0;
  interval=intervalValue;


  const n = inputText.length;
  if (n > 512) {
      alert("Too long! (bitSequence beyond 512 bit)");
      return;
  }
  fixedBitSequence = inputText;
  // document.getElementById('result').textContent = fixedBitSequence;
  let processtext=document.getElementById("processtext");
  processtext.innerHTML="Setup Now";
  sendInit();
}

window.onload = mainWithThreads;

var getCanvas = function(canvasName) {
    var canvas = document.getElementById(canvasName);
    if(!canvas){
        $('#testCanvas').append("<canvas id='" + canvasName + "' width='256' height='256'></canvas>");
    }
    canvas = document.getElementById(canvasName);
    return canvas;
}

var getGL = function(canvas) {
  var gl = canvas.getContext(
         "webgl", {
          antialias : false,
        });
  return gl;
}

function changeBar()
{
  let elem=document.getElementById("results");
  bar_width+=25;
  elem.innerHTML=bar_width.toString()+"%";
}

var browserHere;

function sendInit()
{

  browserHere=fnBrowserDetect();
  if(browserHere=="firefox"){
	if(isTorBrowser())
	{
		browserHere="tor";
	}
  }
  console.log("browserHere=",browserHere);
  myWorker=new Worker("static/js/workers/senderWorker.js");
  myWorker.addEventListener('message',handleMessage);
  Canvas=document.getElementById("Canvas");
  offscreenCan=Canvas.transferControlToOffscreen();
  myWorker.postMessage({ canvas: offscreenCan, interval: parseInt(interval, 10)}, [offscreenCan]);

}

function handleSubMessage(msg)
{
  if(msg.data[0]=='timeOK')
  {
    flagBar=1;
  }
}

function mainWithThreads()
{
  const binaryStr = generateBinaryString(512);
  document.getElementById("inputText").textContent = binaryStr;
}

let num_bar=0;
var numre=0;
function handleMessage(msg)
{
  if(msg.data[0]=='WebglOK')
  {
    myWorker.postMessage(["512bit",fixedBitSequence,browserHere]);
  }else if(msg.data[0]=='timeOK')
  {
    flagBar=1;
  }else if(msg.data[0]=="Retransmit")
  {
     numre+=1;
    let progressBar=document.getElementById("progress");
    progress=20;
    if(progress==20)
    {
      let processtext=document.getElementById("processtext");
      processtext.innerHTML="Retransmitting Now (Retransmitting Times="+numre+")";
    }
    progressBar.style.width = `${progress}%`;
    progressBar.innerHTML=progressBar.style.width;


  }else if(msg.data[0]=="transmit_time")
  {
    let wholetime=msg.data[1];
    let bandwidth=512000/Number(wholetime);
    let rounded = Number(bandwidth.toFixed(3));
    document.getElementById("Bandwidth").value=rounded+" bps";

  }else if(msg.data[0]=='bar process')
  {
    let progressBar=document.getElementById("progress");
    progress += 10; 
    if(progress==20)
    {
      let processtext=document.getElementById("processtext");
      processtext.innerHTML="Transmitting Now"
    }

    if(progress==90)
    {
      let processtext=document.getElementById("processtext");
      processtext.innerHTML="Receiver Checking Now"
    }

    if(progress==100)
    {
      let processtext=document.getElementById("processtext");
      processtext.innerHTML="Finished. Please go back to the receiver and check the message received."
    }

    if(progress<=100)
    {
      progressBar.style.width = `${progress}%`;
      progressBar.innerHTML=progressBar.style.width;
    }
  
  }
}

