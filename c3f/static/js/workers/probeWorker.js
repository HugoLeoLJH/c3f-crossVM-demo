var offscreenCan;
var gl;
var stallVertexIdLocation;
var numOfVertices;
var myWorker;
var num;
var tmp;
var sessionID;
var vertShader;
var fragShader;
var shaderProgram;

var OnePayload;
var ZeroPayload;
var bit_sequence;
var cur_vertex_code;
var index;
var ZeroTime;
var OneTime;

var canvas;

var ProbeTime;


var standard_str="00000000111111111010101000000000111111111010101000000000111111111010101000000000111111111010101000000000111111111010101000000000111111111010101000000000111111111010101000000000111111111010101000000000111111111010101000000000111111111010101000000000111111110000000011111111101010100000000011111111101010100000000011111111101010100000000011111111101010100000000011111111101010100000000011111111101010100000000011111111101010100000000011111111101010100000000011111111101010100000000011111111";

var a;
var b;


var Num=[];

var limit;
var limit0;
var limit1;

var distance;


var oldTime;
var Payload500;


var time_arr;

var blob_time;


var prepayload=655360;
var final_payload0;
var final_payload1;
var aveStallTime;
var aveProbeTime;
var interval;
var receive_num=0;

var GPU_type=0;
var time_clock_arr=[];


var fragment_code = `
    precision mediump float;

    void main(void)
    {
        gl_FragColor = vec4(1,0,0,1);
    }
    `;

var vertex_code = `
uniform int cur_stalled_vertex;

float stall_function(){
    float res = 0.01;
  
    for(int j=1; j < $payload$; j++)
    {
        res = sin(res);
    }
   
    return res;
}

void main(void) {
    gl_Position = vec4(stall_function(),0, 1,1);
    gl_PointSize = 1.0;
}
`;



var fragment_code_probe = `
    precision mediump float;

    void main(void)
    {
        gl_FragColor = vec4(1,0,0,1);
    }
    `;

var vertex_code_probe = `
uniform int cur_stalled_vertex;

float stall_function(){
    float res = 0.01;
    res=sin(res);
    for(int i=1; i < 0; i++)
    {
      
      res=sin(res);
    }
   
    return res;
}

void main(void) {
    gl_Position = vec4(stall_function(),0, 1,1);
    gl_PointSize = 1.0;
}
`;
// CRC32 Table
const CRC32_TABLE = [
    0x00000000, 0x77073096, 0xee0e612c, 0x990951ba, 0x076dc419, 0x706af48f, 0xe963a535, 0x9e6495a3,
    0x0edb8832, 0x79dcb8a4, 0xe0d5e91e, 0x97d2d988, 0x09b64c2b, 0x7eb17cbd, 0xe7b82d07, 0x90bf1d91,
    0x1db71064, 0x6ab020f2, 0xf3b97148, 0x84be41de, 0x1adad47d, 0x6ddde4eb, 0xf4d4b551, 0x83d385c7,
    0x136c9856, 0x646ba8c0, 0xfd62f97a, 0x8a65c9ec, 0x14015c4f, 0x63066cd9, 0xfa0f3d63, 0x8d080df5,
    0x3b6e20c8, 0x4c69105e, 0xd56041e4, 0xa2677172, 0x3c03e4d1, 0x4b04d447, 0xd20d85fd, 0xa50ab56b,
    0x35b5a8fa, 0x42b2986c, 0xdbbbc9d6, 0xacbcf940, 0x32d86ce3, 0x45df5c75, 0xdcd60dcf, 0xabd13d59,
    0x26d930ac, 0x51de003a, 0xc8d75180, 0xbfd06116, 0x21b4f4b5, 0x56b3c423, 0xcfba9599, 0xb8bda50f,
    0x2802b89e, 0x5f058808, 0xc60cd9b2, 0xb10be924, 0x2f6f7c87, 0x58684c11, 0xc1611dab, 0xb6662d3d,
    0x76dc4190, 0x01db7106, 0x98d220bc, 0xefd5102a, 0x71b18589, 0x06b6b51f, 0x9fbfe4a5, 0xe8b8d433,
    0x7807c9a2, 0x0f00f934, 0x9609a88e, 0xe10e9818, 0x7f6a0dbb, 0x086d3d2d, 0x91646c97, 0xe6635c01,
    0x6b6b51f4, 0x1c6c6162, 0x856530d8, 0xf262004e, 0x6c0695ed, 0x1b01a57b, 0x8208f4c1, 0xf50fc457,
    0x65b0d9c6, 0x12b7e950, 0x8bbeb8ea, 0xfcb9887c, 0x62dd1ddf, 0x15da2d49, 0x8cd37cf3, 0xfbd44c65,
    0x4db26158, 0x3ab551ce, 0xa3bc0074, 0xd4bb30e2, 0x4adfa541, 0x3dd895d7, 0xa4d1c46d, 0xd3d6f4fb,
    0x4369e96a, 0x346ed9fc, 0xad678846, 0xda60b8d0, 0x44042d73, 0x33031de5, 0xaa0a4c5f, 0xdd0d7cc9,
    0x5005713c, 0x270241aa, 0xbe0b1010, 0xc90c2086, 0x5768b525, 0x206f85b3, 0xb966d409, 0xce61e49f,
    0x5edef90e, 0x29d9c998, 0xb0d09822, 0xc7d7a8b4, 0x59b33d17, 0x2eb40d81, 0xb7bd5c3b, 0xc0ba6cad,
    0xedb88320, 0x9abfb3b6, 0x03b6e20c, 0x74b1d29a, 0xead54739, 0x9dd277af, 0x04db2615, 0x73dc1683,
    0xe3630b12, 0x94643b84, 0x0d6d6a3e, 0x7a6a5aa8, 0xe40ecf0b, 0x9309ff9d, 0x0a00ae27, 0x7d079eb1,
    0xf00f9344, 0x8708a3d2, 0x1e01f268, 0x6906c2fe, 0xf762575d, 0x806567cb, 0x196c3671, 0x6e6b06e7,
    0xfed41b76, 0x89d32be0, 0x10da7a5a, 0x67dd4acc, 0xf9b9df6f, 0x8ebeeff9, 0x17b7be43, 0x60b08ed5,
    0xd6d6a3e8, 0xa1d1937e, 0x38d8c2c4, 0x4fdff252, 0xd1bb67f1, 0xa6bc5767, 0x3fb506dd, 0x48b2364b,
    0xd80d2bda, 0xaf0a1b4c, 0x36034af6, 0x41047a60, 0xdf60efc3, 0xa867df55, 0x316e8eef, 0x4669be79,
    0xcb61b38c, 0xbc66831a, 0x256fd2a0, 0x5268e236, 0xcc0c7795, 0xbb0b4703, 0x220216b9, 0x5505262f,
    0xc5ba3bbe, 0xb2bd0b28, 0x2bb45a92, 0x5cb36a04, 0xc2d7ffa7, 0xb5d0cf31, 0x2cd99e8b, 0x5bdeae1d,
    0x9b64c2b0, 0xec63f226, 0x756aa39c, 0x026d930a, 0x9c0906a9, 0xeb0e363f, 0x72076785, 0x05005713,
    0x95bf4a82, 0xe2b87a14, 0x7bb12bae, 0x0cb61b38, 0x92d28e9b, 0xe5d5be0d, 0x7cdcefb7, 0x0bdbdf21,
    0x86d3d2d4, 0xf1d4e242, 0x68ddb3f8, 0x1fda836e, 0x81be16cd, 0xf6b9265b, 0x6fb077e1, 0x18b74777,
    0x88085ae6, 0xff0f6a70, 0x66063bca, 0x11010b5c, 0x8f659eff, 0xf862ae69, 0x616bffd3, 0x166ccf45,
    0xa00ae278, 0xd70dd2ee, 0x4e048354, 0x3903b3c2, 0xa7672661, 0xd06016f7, 0x4969474d, 0x3e6e77db,
    0xaed16a4a, 0xd9d65adc, 0x40df0b66, 0x37d83bf0, 0xa9bcae53, 0xdebb9ec5, 0x47b2cf7f, 0x30b5ffe9,
    0xbdbdf21c, 0xcabac28a, 0x53b39330, 0x24b4a3a6, 0xbad03605, 0xcdd70693, 0x54de5729, 0x23d967bf,
    0xb3667a2e, 0xc4614ab8, 0x5d681b02, 0x2a6f2b94, 0xb40bbe37, 0xc30c8ea1, 0x5a05df1b, 0x2d02ef8d
];


// CRC32
function crc32(binaryStr) {

    while (binaryStr.length % 8 !== 0) {
        binaryStr += '0';
    }

    let crc = 0xffffffff; 


    for (let i = 0; i < binaryStr.length; i += 8) {

        let byteStr = binaryStr.slice(i, i + 8);
        let byte = parseInt(byteStr, 2); 


        crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ byte) & 0xff];
    }


    crc = crc ^ 0xffffffff;

    let binaryString = (crc >>> 0).toString(2).padStart(32, '0');
    return binaryString;
}

function convertToBinary(decimalInput) {
  decimalInput=decimalInput.toString();
  // Convert to string and extract the last two digits
  let lastTwoDigits = parseInt(decimalInput.slice(-2));

  // Convert the last two digits to binary and pad to 8 bits
  let binaryString = lastTwoDigits.toString(2).padStart(8, '0');
  return binaryString;
}

function convertHexToBinary(hexInput) {

  // Extract the first two characters
  let hexString = hexInput.slice(0, 2);

  // Convert the hex string to a decimal number
  let decimalValue = parseInt(hexString, 16);

  // Convert the decimal number to an 8-bit binary string
  let binaryString = decimalValue.toString(2).padStart(8, '0');

  return binaryString;
}

function Checksum8(data) {
  let checksum = 0;
  for (let i = 0; i < data.length; i++) {
      checksum += data.charCodeAt(i);
  }
  let ans=convertToBinary(checksum);
  return ans;
}


function initGL(){
  
  ///////////////if(browserType=='firefox'||browserType=='safari')////////////
  numOfVertices=1;

  prepare();
}

function prepare() {
  vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, vertex_code_probe);
  gl.compileShader(vertShader);
  var compiled = gl.getShaderParameter(vertShader, gl.COMPILE_STATUS);
  if (!compiled) {
    ////console.error(gl.getShaderInfoLog(vertShader));
  }
  // Fragment shader
  fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, fragment_code_probe);
  gl.compileShader(fragShader);
  compiled = gl.getShaderParameter(fragShader, gl.COMPILE_STATUS);
  if (!compiled) {
    ////console.error(gl.getShaderInfoLog(fragShader));
  }
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertShader);
  gl.attachShader(shaderProgram, fragShader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);
}

function deleteGL()
{
  gl.deleteShader(vertShader);
  gl.deleteShader(fragShader);
  gl.deleteProgram(shaderProgram);
}

function init()
{
  
  oldTime=-1;
  time_arr=new Array();

  num=0;
  tmp=0;

  initGL();
  prepare();
}

function sendPrepare(payload)
{
  // Vertex shader
  vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, cur_vertex_code);
  gl.compileShader(vertShader);
  var compiled = gl.getShaderParameter(vertShader, gl.COMPILE_STATUS);
  if (!compiled) {
    console.error(gl.getShaderInfoLog(vertShader));
  }

  // Fragment shader
  fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, fragment_code);
  gl.compileShader(fragShader);
  compiled = gl.getShaderParameter(fragShader, gl.COMPILE_STATUS);
  if (!compiled) {
      console.error(gl.getShaderInfoLog(fragShader));
  }

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertShader);
  gl.attachShader(shaderProgram, fragShader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);

  stallVertexIdLocation = gl.getUniformLocation(shaderProgram, "cur_stalled_vertex");

}

function payloadDrawing(payload)
{
  
  gl.uniform1i(stallVertexIdLocation, 0);
  gl.drawArrays(gl.POINTS, 0, numOfVertices);
  //gl.finish();
  const promise = new Promise(r => resolve = r)
  ////console.log("const promise = new Promise(r => resolve = r)");
  offscreenCan.convertToBlob(resolve, 'image/png', 1);
}
var tmp_delay=0;
var o_tmp;
var delay40_arr=[];
var flag_f=0;
function getDelay(payload)
{
  if(payload==0)
  {
	if(browserName=="safari"){
		cur_vertex_code = vertex_code.replace("$payload$", payload);  
    	sendPrepare(payload);
		gl.drawArrays(gl.POINTS, 0, numOfVertices);	
	}
    let startTime=Date.now();
    /*
    if(first_time==0)
    {
      first_time=1;
      cur_vertex_code = vertex_code.replace("$payload$", payload);
      

      
      gl.finish();
      
      //sendPrepare(payload);
      //payloadDrawing(payload);


      // Vertex shader
      vertShader = gl.createShader(gl.VERTEX_SHADER);
      
      

      
      gl.shaderSource(vertShader, cur_vertex_code);
      gl.compileShader(vertShader);
      var compiled = gl.getShaderParameter(vertShader, gl.COMPILE_STATUS);
      if (!compiled) {
        //console.error(gl.getShaderInfoLog(vertShader));
      }

      // Fragment shader
      fragShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragShader, fragment_code);
      gl.compileShader(fragShader);
      compiled = gl.getShaderParameter(fragShader, gl.COMPILE_STATUS);
      if (!compiled) {
          //console.error(gl.getShaderInfoLog(fragShader));
      }

      shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vertShader);
      gl.attachShader(shaderProgram, fragShader);
      gl.linkProgram(shaderProgram);
      
      gl.useProgram(shaderProgram);
      
      stallVertexIdLocation = gl.getUniformLocation(shaderProgram, "cur_stalled_vertex");
      gl.uniform1i(stallVertexIdLocation, 0);
      gl.drawArrays(gl.POINTS, 0, numOfVertices);
    }
    */
    //gl.finish();
	
	
    
    const promise = new Promise(r => resolve = r)
   
    offscreenCan.convertToBlob(resolve, 'image/png', 1);
    
    gl.flush();
    let endTime=Date.now();
    
    
    deleteGL();
    
    let delay=endTime-startTime;

    if(firstBit==1&&delay>5)
    {
      if(flag_f==0)
      {
        delay40_arr.push(tmp_delay);
        time_clock_arr.push(o_tmp);
        flag_f=1;
      }
      delay40_arr.push(delay);
      let o={"start":startTime,"end":endTime,"delay40":delay};
      time_clock_arr.push(o);
    }
    if(delay>5)
    {
      tmp_delay=delay;
      o_tmp={"start":startTime,"end":endTime,"delay40":delay};
    }
    if(payload==0&&delay>40)
    {

      if(delay<400)
      {
        if(oldTime==-1)
        {
          oldTime=endTime;
          //console.log("delay=",delay);
          //console.log("endTime=", endTime);
        }else
        {
          let delay1=endTime-oldTime;

          if(delay1<40)
          {

          }else if(delay1<400)
          {
            oldTime=endTime;
            delay=delay1;
            //console.log("delay=",delay);
            //console.log("endTime=", endTime);
          }else{
            oldTime=endTime;
            //console.log("delay=",delay);
            //console.log("endTime=", endTime);
          }
        }
      }else{
        oldTime=endTime;
        //console.log("delay= ",delay);
        //console.log("endTime=", endTime);
      }
    }
    return delay;
  }else
  { 
    /*
    let startTime=Date.now();
    cur_vertex_code = vertex_code.replace("$payload$", payload);
    gl.finish();
    
    sendPrepare(payload);
    payloadDrawing(payload);
    deleteGL();
    gl.flush();
    let endTime=Date.now();
    
    let delay=endTime-startTime;
    console.log("delay= ",delay);
    return delay;
    */
    let startTime=Date.now();
    cur_vertex_code = vertex_code.replace("$payload$", payload);
  
  
    gl.finish();
    
    sendPrepare(payload);
    //payloadDrawing(payload);
    gl.uniform1i(stallVertexIdLocation, 0);
    gl.drawArrays(gl.POINTS, 0, numOfVertices);
    //gl.finish();
    let start=Date.now();
    const promise = new Promise(r => resolve = r)
    
    offscreenCan.convertToBlob(resolve, 'image/png', 1);
    let end=Date.now();
    blob_time=end-start;

	gl.flush();
   //gl.finish();
    
    let endTime=Date.now();
    deleteGL();
    let delay=endTime-startTime;
    //console.log("delay= ",delay);
	//WaitTime(10);
    return delay;

  }
  
}

var index_arr=[];
var min_edge;
var max_edge;
var thre_arr=[];
var thre_low=0;

var totalLength=560;

function calculateThreshod()
{
  let tmp_arr=Array.from(delay40_arr);
  postMessage(['timeData_receiver',tmp_arr.toString()]);
  tmp_arr.shift();
  tmp_arr.push(999999);


  tmp_arr.sort(function(a, b) {
    return a - b;
  });


  index_arr.push(0);
  for(let i=1;i<tmp_arr.length;i++)
  {
    if(tmp_arr[i]>tmp_arr[i-1]+3)
    {
      index_arr.push(i);
    }
  }
  let max_threshod=-1;
  let min_threshod=9999999;
  let max_id1=0;
  let max_id2=1;
  let o_arr=[];
  

  for(let i=1;i<index_arr.length;i++)
  {
    let tmp=index_arr[i]-index_arr[i-1];
    let o={num: tmp, id: i};
    o_arr.push(o)
    console.log("index ",i," = ",index_arr[i]);
  }


  for(let i=0;i<o_arr.length;i++)
  {
    console.log(o_arr[i]);
  }
  let n=0;
  for(let i=o_arr.length-1;i>=0;i--)
  {
    n=n+o_arr[i].num;  
  
    if(n==(totalLength-1))
    {
      if(i==0)
      {
        thre_low=0;
      }else{
        console.log("o_arr[i].id=",o_arr[i].id);
        thre_low=tmp_arr[index_arr[o_arr[i].id-1]];
      }
      break;
    }

    if(n>(totalLength-1))
    {


    }
    if(i==0)
    {

      break;
    }
  }

  o_arr.sort(function(a, b) {
    return b.num - a.num;
  });

  for(let i=0;i<o_arr.length;i++)
  {
    console.log(o_arr[i]);
  }

  
 for(let i=0;i<o_arr.length;i++)
 {
    thre_arr.push(tmp_arr[index_arr[o_arr[i].id-1]]);
 }

  for(let i=0;i<tmp_arr.length;i++)
  {

  }

  for(let i=0;i<thre_arr.length;i++)
  {

  }
}


function check_sequence(bit_sequence)
{
  let first8=bit_sequence.substring(0, 8);
  let last40=bit_sequence.substring(bit_sequence.length - 40);
  let last8=last40.substring(0, 8);
  let crc_result=last40.substring(8);
  let data512=bit_sequence.substring(8,520);
  let crc_new_checksum=crc32(data512);
  

  console.log("first8 = ",first8);
  console.log("last8 = ",last8);
  console.log("crc_old_result =",crc_result);
  console.log("crc_new_checksum = ",crc_new_checksum);


	
  if(first8!="01010000")
  {
    console.log("first8 fault");
    return false;
  }
  if(last8!="01011111")
  {
    console.log("last8 fault");
    return false;
  }
  
  if(crc_new_checksum!=crc_result)
  {
    console.log("CRC fault");
    return false;
  }

  console.log("Check OK");
  
  if(bit_sequence="01010000"+standard_str+"01011111"+crc_result)
  {

  }
  return true;
}



var receive_write=0;
var ReceiveError_count=0;
var finialresult;
function receive_next_ms()
{
  WaitTime(1000);
  receive_time_ms(); //receive 16 bit

  for(let i=0;i<delay40_arr.length;i++)
  {
	console.log("delay40 ",i," time =",delay40_arr[i]);
  }

  for(let i=0;i<time_arr.length;i++)
  {
    console.log("bit ",i," time =",time_arr[i]);
  }
  calculateThreshod();
  let right_time=0;
  for(let j=0;j<thre_arr.length;j++)
  {
    let result="";
    let th=thre_arr[j];
    
    for(let i=0;i<delay40_arr.length;i++)
    { 

      if(delay40_arr[i]>=thre_low)
      {

        if(i==0)
        {
          result=result+"0";
        }else{
          if(delay40_arr[i]<th)
          {
            result=result+"0";
          }else{
            result=result+"1";
          }
        }
      }
    }
    console.log("test result th=",th," : ","bit_sequence= ",result);


    time_arr=[];
    
    if(check_sequence(result)==true)
    {
		finialresult=result;
		right_time+=1;
    }else{

    }
  }

  console.log("right_time = ",right_time);
  if(right_time==1)
  {
    receive_right=1;
	postMessage(['Receive_Sequence',finialresult.substring(8,520)]);
    return true;
  }else{
    ReceiveError_count+=1
    receive_right=0;
    postMessage(['ReceiveError_count',ReceiveError_count]);
    return false;
  }
}




function response_ms()
{
  WaitTime(1000);
  if(receive_right==1)
  {
    sendSequence('01010101');

  }else{
    sendSequence('00001111');
  }
  WaitTime(1000);
}

  var firstbit_delay;
  var secondbit_start;
  var lastbit_end;
  function receive_time()
  {
    //console.log('\n');
    //console.log('function: receive(len)');

    let result='';
    //console.log("let result=''; "+"result= ",result);

    //console.log("let num=0; "+"num= "+0);
    let BeginTimer=Date.now();
    let firstBit=0;
    while(1)
    {
      //console.log("while(1)");
      let EndTimer=Date.now();
      if(firstBit!==0)
      {
        if((EndTimer-BeginTimer)>200)
        {
          break;
        }
      }
      let delay=getDelay(0);
      let judgeflag=0
      //console.log("delay= ",delay)
      if(delay<40)//It's a probe
      {
        //console.log("2");
        judgeflag=-1;
      }else if(delay<limit)//It's a bit 0
      {
        //console.log("0");
        judgeflag=0;
      }else
      {//It's a bit 1
        //console.log("1");
        judgeflag=1;
      }

      let bit=judgeflag;
      //console.log("judgeBit()");
      //console.log("let bit=judgeBit(); "+"bit= "+bit);

      //console.log("if(bit!==-1) ","bit= ",bit);
      if(bit!==-1)
      { if(firstBit==0)
        {
          firstbit_delay=delay;
          secondbit_start=Date.now();
        }
        firstBit=1;
        BeginTimer=Date.now();
        lastbit_end=Date.now();
        //console.log("{");
        result+=bit;
        //console.log("result+=bit; ","result= ",result," ","bit= ",bit);
      
        //console.log("num++; ","num= ",num);
        //console.log("}");
      }else{

      }

      //console.log("if(num==len) ","num= ",num," ","len= ",len);
      /*
      if(num==len)
      {
        //console.log("{");
        //console.log("break;");
        //console.log("}");
        break;
      }
      */

    }

    console.log("result= ",result);  
    return result;
  }
  
  var firstBit=0;
  var time_arr=new Array();
  function receive_time_ms()
  {
    //console.log('\n');
    //console.log('function: receive(len)');
    
    let result='';
    //console.log("let result=''; "+"result= ",result);

    //console.log("let num=0; "+"num= "+0);
    let BeginTimer=Date.now();
    firstBit=0;

    while(1)
    {
      //console.log("while(1)");
      let EndTimer=Date.now();
      if(firstBit!==0)
      {
        if((EndTimer-BeginTimer)>1500)
        {
          firstBit=0;
          flag_f=0;
          let o={"start":999,"end":999,"delay40":999};
          time_clock_arr.push(o);
          break;
        }
      }
      let delay=getDelay(0);
      let judgeflag=0
      //console.log("delay= ",delay)
      if(delay<40)//It's a probe
      {
        //console.log("2");
        judgeflag=-1;
      }else
      {
        judgeflag=delay;
      }

      let bit=judgeflag;
      //console.log("judgeBit()");
      //console.log("let bit=judgeBit(); "+"bit= "+bit);

      //console.log("if(bit!==-1) ","bit= ",bit);
      if(bit!==-1)
      { if(firstBit==0)
        {
          firstbit_delay=delay;
          //delay40_arr.push(tmp_delay);
          secondbit_start=Date.now();
        }
        firstBit=1;
        BeginTimer=Date.now();
        lastbit_end=Date.now();
        //console.log("{");
        
        time_arr.push(delay);
        //result+=bit;
        //console.log("result+=bit; ","result= ",result," ","bit= ",bit);
      
        //console.log("num++; ","num= ",num);
        //console.log("}");
      }else{

      }

      //console.log("if(num==len) ","num= ",num," ","len= ",len);
      /*
      if(num==len)
      {
        //console.log("{");
        //console.log("break;");
        //console.log("}");
        break;
      }
      */

    }

    return;
  }





function handleMessage(msg)
{
  
}


function generatingInfo_Normal(id, info_type,normal_info)
{
  let result={};
  result['id']=id;
  result['info_type']=info_type;
  result['normal_info']=normal_info;
  return result;
}




function send_Info_Normal(info)
{

}
var browserName;
function fnBrowserDetect() {
  let userAgent = navigator.userAgent;


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

function receiveBegin()
{
  let info;
  fnBrowserDetect();
  console.log("browserName= ",browserName);
  init();


}

const levenshteinDistance = (str1 = '', str2 = '') => {
  const track = Array(str2.length + 1).fill(null).map(() =>
  Array(str1.length + 1).fill(null));
  for (let i = 0; i <= str1.length; i += 1) {
     track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
     track[j][0] = j;
  }
  for (let j = 1; j <= str2.length; j += 1) {
     for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
           track[j][i - 1] + 1, // deletion
           track[j - 1][i] + 1, // insertion
           track[j - 1][i - 1] + indicator, // substitution
        );
     }
  }
  return track[str2.length][str1.length];
};

function sendOneBit(payload)
{
  let start=Date.now();
  //console.log("startTime= ",start);
  getDelay(payload);
  let end=Date.now();
  let delay=end-start;
  //console.log("delay= ",delay);
  //console.log("endTime= ",end);
}


function sendSequence(str)
{
  for(let i=0;i<str.length;i++)
  {
    if(str[i]=='0')
    {
      sendOneBit(ZeroPayload);
    }else
    {
      sendOneBit(OnePayload);
    }
  }
}
 

function estimate_independence()
{


  let bit0Time;
  let bit1Time;
  let time500;


  let start;
  let end;
  let test1_sum=0;
  let test2_sum=0;
  let test5_sum=0;
  /*
  //Calculating prepayload time
  let arr1=[];
  for(let i=0;i<33;i++)
  {
    start=Date.now();
    getDelay(prepayload);
    end=Date.now();
    let delay=end-start;
    if(i>0)
    {
      arr1.push(delay);
    }
  }
  aveStallTime=median(arr1);
  */
  let arr_min=[];
  let arr_payload=[];
  for(let i=60;i<70;i++)
  {
    let min=10000000;
    let max=-1;
    let payloadInterval=10000;
    let tmp=i*payloadInterval;

    for(let j=0;j<3;j++)
    {
      let delay=getDelay(tmp);
      if(delay>max)
      {
        max=delay;
      }
      if(delay<min)
      {
        min=delay;
      }
    }
    arr_min.push(min);
    arr_payload.push(tmp);
    console.log("payload= ",tmp," ","min= ",min);
  }

  let max=-1;

  let index=0;
  for(let i=0;i<arr_min.length;i++)
  {
    if(arr_min[i]>max)
    {
      index=i;
    }
  }
  prepayload=arr_payload[index];
  aveStallTime=arr_min[index];



  //Calculating probe time
  for(let i=0;i<5;i++)
  {
    
    getDelay(655360);
    
    if(i==1)
    {
      start=Date.now();
    }
    if(i==4)
    {
      end=Date.now();
      aveProbeTime=(end-start)/4;
    }
  }  
  console.log("Probe Time = ",aveProbeTime);
  /*
  interval=Math.ceil(30*aveProbeTime);
  console.log("interval=",interval);
  interval=Math.max(150,interval);
  interval=Math.min(300,interval);
  */
  interval=200;
  console.log("interval = ",interval);
  //interval=Math.min(500,interval);

  final_payload0=(prepayload/aveStallTime)*(0.4*interval);
  final_payload0=Math.floor(final_payload0);


  final_payload1=(prepayload/aveStallTime)*(0.8*interval);
  final_payload1=Math.floor(final_payload1);

  Payload500=(prepayload/aveStallTime)*(600);
  Payload500=Math.floor(Payload500);

  

  let f=0;
  while(1)
  {
    //Test Payload500
    for(let i=0;i<3;i++)
    {
      start=Date.now();
      getDelay(Payload500);
      end=Date.now();
      let delay=end-start;
      if(i!=0)
      {
        test5_sum+=delay;
      }
    }

    time500=Math.ceil(test5_sum/2);
    test5_sum=0;
    console.log("500 time = ",time500);
    
    if(time500<500)
    {
      Payload500+=Math.ceil(200*Payload500/time500);
      
    }else  if(time500<700)
    {
      Payload500+=Math.ceil(100*Payload500/time500);
    }else{
      break;
    }
  }

  while(1)
  {
    //Test
    for(let i=0;i<5;i++)
    {
      start=Date.now();
      getDelay(final_payload0);
      end=Date.now();
      let delay=end-start;
      if(i!=0)
      {
        test1_sum+=delay;
      }
    }

    bit0Time=Math.ceil(test1_sum/4);
    test1_sum=0;
    console.log("bit0 time = ",bit0Time);

    let tt=0;
    for(let i=0;i<5;i++)
    {
      start=Date.now();
      getDelay(final_payload0);
      end=Date.now();
      let delay=end-start;
      if(i!=0)
      {

		if(blob_time<50)
		{
			tt=1;
		}
		
        test1_sum+=delay;
      }
    }
    if(tt==1)
    {
      final_payload0+=Math.ceil(15*prepayload/aveStallTime);
      bit0Time=Math.ceil(test1_sum/4);
      test1_sum=0;
      tt=0;
      console.log("bit0 time = ",bit0Time);
    }else
    {
      bit0Time=Math.ceil(test1_sum/4);
      test1_sum=0;
      console.log("bit0 time = ",bit0Time);
      break;
    }

  }

 
  while(1)
  {
    if(bit0Time<70)
    {
      final_payload0+=Math.ceil(10*prepayload/aveStallTime);
    }else{
      break;
    }

    for(let i=0;i<5;i++)
    {
      start=Date.now();
      getDelay(final_payload0);
      end=Date.now();
      let delay=end-start;
      if(i!=0)
      {
        test1_sum+=delay;
      }
    }

    bit0Time=Math.ceil(test1_sum/4);
    test1_sum=0;
    console.log("bit0 time = ",bit0Time);
  }
    
  while(1)
  {
    for(let i=0;i<5;i++)
    {
      start=Date.now();
      getDelay(final_payload1);
      end=Date.now();
      let delay=end-start;
      if(i!=0)
      {
        test2_sum+=delay;
      }
    }
    bit1Time=Math.floor(test2_sum/4);
    test2_sum=0;
    console.log("bit1 time = ",bit1Time);


    if(bit1Time<=(bit0Time+40))
    {
      final_payload1+=Math.ceil(20*prepayload/aveStallTime);
    }else{
      break;
    }
  }
    
  console.log("Estimate Time OK");
 
  ZeroTime=bit0Time;
  OneTime=bit1Time;
  ZeroPayload=final_payload0;
  OnePayload=final_payload1;
}


function estimate_core()
{
  
  let bit0Time;
  let bit1Time;
  let time500;

  
  let start;
  let end;
  let test1_sum=0;
  let test2_sum=0;
  let test5_sum=0;
  /*
  //Calculating prepayload time
  let arr1=[];
  for(let i=0;i<33;i++)
  {
    start=Date.now();
    getDelay(prepayload);
    end=Date.now();
    let delay=end-start;
    if(i>0)
    {
      arr1.push(delay);
    }
  }
  aveStallTime=median(arr1);
  */
  let arr_min=[];
  let arr_payload=[];
  for(let i=60;i<70;i++)
  {
    let min=10000000;
    let max=-1;
    let payloadInterval=10000;
    let tmp=i*payloadInterval;

    for(let j=0;j<3;j++)
    {
      let delay=getDelay(tmp);
      if(delay>max)
      {
        max=delay;
      }
      if(delay<min)
      {
        min=delay;
      }
    }
    arr_min.push(min);
    arr_payload.push(tmp);
    console.log("payload= ",tmp," ","min= ",min);
  }

  let max=-1;

  let index=0;
  for(let i=0;i<arr_min.length;i++)
  {
    if(arr_min[i]>max)
    {
      index=i;
    }
  }
  prepayload=arr_payload[index];
  aveStallTime=arr_min[index];



  //Calculating probe time
  for(let i=0;i<5;i++)
  {
    
    getDelay(655360);
    
    if(i==1)
    {
      start=Date.now();
    }
    if(i==4)
    {
      end=Date.now();
      aveProbeTime=(end-start)/4;
    }
  }  
  console.log("Probe Time = ",aveProbeTime);
  /*
  interval=Math.ceil(20*aveProbeTime);
  console.log("interval=",interval);
  interval=Math.max(150,interval);
  interval=Math.min(300,interval);
  */
  interval=200;
  console.log("interval = ",interval);
  //interval=Math.min(500,interval);

  final_payload0=(prepayload/aveStallTime)*(0.4*interval);
  final_payload0=Math.floor(final_payload0);


  final_payload1=(prepayload/aveStallTime)*(0.8*interval);
  final_payload1=Math.floor(final_payload1);

  Payload500=(prepayload/aveStallTime)*(600);
  Payload500=Math.floor(Payload500);

  
  let arr500 = [0, 0, 0, 0, 0];

  let f=0;
  let temp=600;
  while(1)
  {
    //Test Payload500
    for(let j=0;j<5;j++)
    {
      test5_sum=0;
      for(let i=0;i<3;i++)
      {
        start=Date.now();
        getDelay(Payload500+j);
        end=Date.now();
        let delay=end-start;
        if(i!=0)
        {
          test5_sum+=delay;
        }
      }
      time500=Math.ceil(test5_sum/2);
      arr500[j]=time500;
      console.log("500 time = ",time500);
      
    }
    
    
 
    let max500=-1;
    let ans=0;
    for(let i=0;i<5;i++)
    {
      if(arr500[i]>max500)
      {
        max500=arr500[i];
        ans=i;
      }
      if(arr500[i]>700&&arr500[i]<1000)
      {
        max500=arr500[i];
        ans=i;
        break;
      }
    }
    Payload500=Payload500+ans;
    time500=max500;
    console.log("500 time = ",time500);
    if(time500>1000)
    {
      temp=100;
      Payload500-=Math.ceil(temp*Payload500/time500);
    }
    else if(time500<500)
    {
      temp=210;
      Payload500+=Math.ceil(temp*Payload500/time500);
        
    }else  if(time500<700)
    {
      temp=60;
      Payload500+=Math.ceil(temp*Payload500/time500);
    }else{
      break;
    }
    
  }

  f=0;
  while(1)
  {
    //Test
    for(let i=0;i<5;i++)
    {
      start=Date.now();
      getDelay(final_payload0);
      end=Date.now();
      let delay=end-start;
      if(i!=0)
      {
        test1_sum+=delay;
      }
    }

    bit0Time=Math.ceil(test1_sum/4);
    test1_sum=0;
    console.log("bit0 time = ",bit0Time);
    if(bit0Time<70)
    {
    
      if(f<4)
      {
        final_payload0+=1;
        f+=1;
      }else
      {
        final_payload0+=Math.ceil(10*prepayload/aveStallTime);
        f=0;
      }

    }else{
      break;
    }
  }
  
  f=0;
  while(1)
  {
    for(let i=0;i<5;i++)
    {
      start=Date.now();
      getDelay(final_payload1);
      end=Date.now();
      let delay=end-start;
      if(i!=0)
      {
        test2_sum+=delay;
      }
    }
    bit1Time=Math.floor(test2_sum/4);
    test2_sum=0;
    console.log("bit1 time = ",bit1Time);

    if(bit1Time<=(bit0Time+40))
    {
      if(f<4)
      {
        f+=1
        final_payload1+=1;
      }else
      {
        final_payload1+=Math.ceil(10*prepayload/aveStallTime);
        f=0;
      }
    }else{
      break;
    }
    
  }
  


  console.log("Estimate Time OK");


  ZeroTime=bit0Time;
  OneTime=bit1Time;
  ZeroPayload=final_payload0;
  OnePayload=final_payload1;
}



function judgeGPU()
{
  let min=99999999;
  let max=-1;
  let start;
  let end;
  for(let i=1655360;i<1655366;i++)
  {
    start=Date.now();
    getDelay(i);
    if(i<1655362)
    {
      end=Date.now();
      continue;
    }


    end=Date.now();
    let delay=end-start;
    console.log("delay= ",delay);
    if(delay>max)
    {
      max=delay;
    }

    if(delay<min)
    {
      min=delay
    }

    
  }


  console.log("min= ",min," ","max=",max);
  if(ff=0)
  {
    ff=1;
  }else{
    if((max-min)<20)
    {

      return 0;
    }else{
      console.log("core gpu");
      return 1;
    }
  }
}


function send_flag()
{
	if(browser_receiver!="tor")
	{
		for(let i=0;i<10;i++)
		{
			getDelay(Payload500);
			getDelay(OnePayload);
		}
	}else
	{
		for(let i=0;i<7;i++)
		{
			getDelay(Payload500);
			getDelay(OnePayload);
			getDelay(OnePayload);
		}
	}
  console.log("sended flag");
}


function receive_flag()
{
  //console.log('\n');
  //console.log('function: receive(len)');

  let result='';
  //console.log("let result=''; "+"result= ",result);

  //console.log("let num=0; "+"num= "+0);
  let BeginTimer=Date.now();
  let firstBit=0;

  while(1)
  {
    //console.log("while(1)");
    let EndTimer=Date.now();
    if(firstBit!==0)
    {
      if((EndTimer-BeginTimer)>1500)
      {
        break;
      }
    }
    let delay=getDelay(0);
	//console.log("delay=",delay);
    //console.log("judgeBit()");
    //console.log("let bit=judgeBit(); "+"bit= "+bit);

    //console.log("if(bit!==-1) ","bit= ",bit);
    if(delay>90)
    {
      console.log("flag delay=",delay);
      firstBit=1;
      BeginTimer=Date.now();
      //console.log("{");
      if(delay<500)
      {
        result+="0";
      }else{
        result+="1";
      }
      //console.log("result+=bit; ","result= ",result," ","bit= ",bit);
    
      //console.log("num++; ","num= ",num);
      //console.log("}");
    }else{

    }

    //console.log("if(num==len) ","num= ",num," ","len= ",len);
    /*
    if(num==len)
    {
      //console.log("{");
      //console.log("break;");
      //console.log("}");
      break;
    }
    */

  }

  console.log("result= ",result);
  return result;


}


var totalFlag="";


function sev_flag()
{
  while(1)
  {
    let flag=receive_flag();
    totalFlag+=flag;
    if(totalFlag.indexOf("10101010")!=-1)
    {
		browser_sender="nonTor";
      break;
    }

	if(totalFlag.indexOf("100100100100")!=-1)
    {
		browser_sender="tor";
      break;
    }
  }
}

var handnum=0;
var sev_flag_num1=0;
var send_flag_num2=0;
var sev_receive_num3=0;
var threshold_flag_num4=0;
var info;
var clock;
function go_receive3()
{
  sev_flag();

	GPU_type=judgeGPU();


  if(GPU_type==0)
  {
    estimate_independence();
	console.log("independence gpu");
  }else{
    estimate_core();
	console.log("core gpu");
  }
  clock=Date.now();
  WaitTime(1000);
  send_flag();



}

function env_reset()
{
  time_arr=[];
  delay40_arr=[];
  time_clock_arr=[];
  index_arr=[];
  thre_arr=[];
}
var receive_right=0;
var numFlag=0;
function receive_cycle()
{
  while(receive_right==0)
  {
	if(browser_receiver=="tor")
	{
    	receive_next_ms_tor();
	}else{
		receive_next_ms();
	}
    env_reset();
	if(browser_sender=="tor")
	{
    	Response_tor();
	}else{
		response_ms();
	}
  }

}

function finishPhase()
{
	totalFlag="";
	while(1)
	{
	  let flag=receive_flag();
	  totalFlag+=flag;
	  if(totalFlag.indexOf("11101110")!=-1)
	  {

		break;
	  }
	}


}




function go_receive4()
{
  
  
  WaitTime(300);
  go_receive3();
  receive_cycle();

}

function finishSignal()
{
	for(let i=0;i<5;i++)
	{
		getDelay(Payload500);
		getDelay(Payload500);
		getDelay(Payload500);
		getDelay(OnePayload);	
	}

}


var browser_receiver;
onmessage=(e)=>{

	if(typeof(e.data[0])=='string'&& e.data[0]=='browser')
	{
		console.log("This is the V1");
		browser_receiver=e.data[1];
		receiveBegin();
		go_receive4();
	}else{
		offscreenCan=e.data.canvas;
		gl=offscreenCan.getContext("webgl");
		postMessage(["WebglOK"]);
	}
    
  }

function estimateProbePayload()
{
  let min=10000000;
  let max=-1;
  for(let j=0;j<50;j++)
  {
    let delay=getDelay(0);
    if(delay>max)
    {
      max=delay;
    }
    if(delay<min)
    {
      min=delay;
    }
  }
  ProbeTime=min;
  console.log("ProbeTime: ",ProbeTime,"min= ",min," ","max= ",max);
}


function WaitTime(time)
{
  let start =Date.now();
  
  while(1)
  {
    let end=Date.now();
    if(end-start>time)
    {
      break;
    }
  }

}



var bit0payload;
var bit1payload;
function Response_tor()
{
	WaitTime(1000);
	bit0payload=ZeroPayload*2;
	bit1payload=OnePayload*4;
	let delay;
	if(receive_right==1)
	{
		let tmp_sequence="01010101";

		for(let i=0;i<tmp_sequence.length;i++)
		{
			if(tmp_sequence[i]=='0')
			{
			delay=getDelay(bit0payload);
			}else{
			delay=getDelay(bit1payload);
			}
			console.log("delay=",delay);
		}
	
  
	}else{
		let tmp_sequence="00001111";

		for(let i=0;i<tmp_sequence.length;i++)
		{
		  if(tmp_sequence[i]=='0')
		  {
			delay=getDelay(bit0payload);
		  }else{
			delay=getDelay(bit1payload);
		  }
		  console.log("delay=",delay);
		}
	}
	WaitTime(1000);



}

function receive_next_ms_tor()
{
	WaitTime(1000);

	limitTor=ZeroTime+100;
	console.log("limitTor=",limitTor);
	let right_time=0;
	let tor_result=receive_time_tor();
	console.log("bit_result=",tor_result);
	if(tor_result.length!=560)
	{
		ReceiveError_count+=1
		receive_right=0;
		postMessage(['ReceiveError_count',ReceiveError_count]);
		return false;
	}
	if(check_sequence(tor_result)==true)
    {
		finialresult=tor_result;
    	right_time+=1;
    }else{

    }
  console.log("right_time = ",right_time);
  if(right_time==1)
  {
    receive_right=1;
	postMessage(['Receive_Sequence',finialresult.substring(8,520)]);
    return true;
  }else{
    ReceiveError_count+=1
    receive_right=0;
    postMessage(['ReceiveError_count',ReceiveError_count]);
    return false;
  }
}


var limitTor;

function receive_time_tor()
{
  let result='';
  let BeginTimer=Date.now();
  let firstBit=0;
  while(1)
  {
    let EndTimer=Date.now();
    if(firstBit!==0)
    {
      if((EndTimer-BeginTimer)>200)
      {
        break;
      }
    }
    let delay=getDelay(0);
    let judgeflag=0
    if(delay<80)
    {
      judgeflag=-1;
    }else if(delay<limitTor)
    {
      judgeflag=0;
    }else
    {

      judgeflag=1;
    }

    let bit=judgeflag;

    if(bit!==-1)
    {	
		if(firstBit==0)
		{
      		firstBit=1;
			result+='0';
		}else{
			result+=bit;
		}
      BeginTimer=Date.now();
      
      //arr.push(delay);
    }else{

    }

  }


  return result;
}