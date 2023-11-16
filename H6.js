"use strict";

var canvas;
var gl;
var program;

var numPositions  = 0;

var positions = [];
var normals=[];

var DeltaH=0.25;
var DeltaR=0.25;
var DeltaA=3;

var DeltaHLight=0.5;
var DeltaRLight=0.5;
var DeltaALight=3;

var H=0;
var R=3;
var A=radians(35);

var light2H=0;
var light2R=10;
var light2A=radians(35);

var currentProjection=0;

var currentVertexShader="vertex-shader-gouraud";
var currentFragmentShader="fragment-shader-gouraud";

var modelViewMatrixLoc;
var projectionMatrixLoc;

var nBuffer;
var normalLoc;
var vBuffer;
var positionLoc;

var material_ambient=vec3(0.6, 0.2, 0.2);
var material_diffuse=vec3(0.9, 0.1, 0.1);
var material_specular=vec3(0.8, 0.8, 0.8);
var material_shininess=80.0;


var light1_ambient= vec3(0.2, 0.2, 0.2);
var light1_diffuse = vec3(0.6, 0.6, 0.6);
var light1_specular =vec3(1.0, 1.0, 1.0); 
var light1_position

var ambientProduct1;
var diffuseProduct1;
var specularProduct1;

var light2_ambient= vec3(0.1, 0.1, 0.1);
var light2_diffuse = vec3(0.6, 0.6, 0.6);
var light2_specular =vec3(1.0, 1.0, 1.0); 
var light2_position;

var ambientProduct2;
var diffuseProduct2;
var specularProduct2;





window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //event listener for model to be loaded
    var ModelMenu = document.getElementById("modelMenu");
    ModelMenu.addEventListener("click", function(){
        switch(ModelMenu.selectedIndex){
            case 0://bunny
                
                loadSmf("bunny_1k.smf.txt");
                render();
                break;
            case 1://Superellipsoid
                
                loadSmf("bound-sprellpsd.smf.txt");
                render();
                break;
            
            case 2://Sphere
                
                loadSmf("bound-lo-sphere.smf.txt");
                render();
                break;
        }
    });



    //event listener for shading menu 
    var ShadingMenu = document.getElementById("shadingMenu");
    ShadingMenu.addEventListener("click", function(){
        switch(ShadingMenu.selectedIndex){
            case 0://Gouraud
                currentVertexShader="vertex-shader-gouraud";
                currentFragmentShader="fragment-shader-gouraud";
                render();
               
                break;
            case 1://Phong
            currentVertexShader="vertex-shader-phong";
            currentFragmentShader="fragment-shader-phong";
            render();
               
            break;
        }
    });



    //event listener for projection menu
    var projectionMenu =  document.getElementById("projectionMenu");
    projectionMenu.addEventListener("click", function(){
        switch(projectionMenu.selectedIndex){
            case 0://parallel
                currentProjection=0;
                render();
               
                break;
            case 1://perspective
                currentProjection=1;
                render();
               
                break;
        }
    });

    //event listener for material menu
    var materialMenu =  document.getElementById("materialMenu");
    materialMenu.addEventListener("click", function(){
        switch(materialMenu.selectedIndex){
            case 0://specified material
                material_ambient=vec3(0.6, 0.2, 0.2);
                material_diffuse=vec3(0.9, 0.1, 0.1);
                material_specular=vec3(0.8, 0.8, 0.8);
                material_shininess=80.0;
                render();
               
                break;
            case 1://green with more muted diffuse and shine
                material_ambient=vec3(0.2, 0.8, 0.2);
                material_diffuse=vec3(0.1, 0.3, 0.1);
                material_specular=vec3(0.3, 0.3, 0.3);
                material_shininess=10.0;
                render();
               
                break;
            case 2://matte blue
                material_ambient=vec3(0.2, 0.2, 0.7);
                material_diffuse=vec3(0.1, 0.1, 0.7);
                material_specular=vec3(0.2, 0.2, 0.2);
                material_shininess=1.0;
                render();
               
                break;
        }
    });

    //key press event listener
    window.addEventListener("keydown",function() {
        switch(event.keyCode){
            case 65: //A increase H camera
                
                H+=DeltaH;
                render();
                break;
            case 83: //S decrease H camera
    
                H-=DeltaH;
                render();
                break;
            case 68: //D increase R camera
               
                R+=DeltaR;
                render();
                break;
            case 70: //F decrease R camera
               
                if((R-DeltaR)>0){
                    R-=DeltaR;
                }
                render();
                break;
            case 71: //G increase angle camera
                
                A+=radians(DeltaA);
                render();
                break;
            case 72: //H decrease angle camera
                
                A-=radians(DeltaA);
                render();
                break;
            case 82: //R reset
                H=0;
                R=3;
                A=radians(35);

                loadSmf("bound-lo-sphere.smf.txt");

                currentProjection=0;

                currentFragmentShader="fragment-shader-gouraud";
                currentVertexShader="vertex-shader-gouraud";

                light2H=0;
                light2R=10;
                light2A=radians(35);

                material_ambient=vec3(0.6, 0.2, 0.2);
                material_diffuse=vec3(0.9, 0.1, 0.1);
                material_specular=vec3(0.8, 0.8, 0.8);
                material_shininess=80.0;

                render();
                break;

            case 90: //Z increase H light
                //window.alert("increase Height Light");
                light2H+=DeltaHLight;
                render();
                break;

            case 88: //X decrease H light
                //window.alert("decrease Height Light");
                light2H-=DeltaHLight;
                render();
                break;

            case 67: //C increase R light
                //window.alert("increase radius Light");
                light2R+=DeltaRLight;
                render();
                break;

            case 86: // V decrease R light
                //window.alert("decrease radius Light");
                
                if(light2R-DeltaRLight>0){
                    light2R-=DeltaRLight;
                }
                render();
                break;
            
            case 66: // B increase A light
                //window.alert("increase angle Light");
                light2A+=radians(DeltaALight);
                render();
                break;

            case 78: // N decrease A light
                //window.alert("decrease angle Light");
                light2A-=radians(DeltaALight);
                render();
                break;
            

        }
    });
    
    loadSmf("bound-lo-sphere.smf.txt");
    render();
}

function loadFileAJAX(name) {
    var xhr = new XMLHttpRequest(),
    okStatus = document.location.protocol === "file:" ? 0 : 200;
    xhr.open('GET', name, false);
    xhr.send(null);
    return xhr.status == okStatus ? xhr.responseText : null;
};


function loadSmf(name)
{
    var smf_file = loadFileAJAX(name);
    var lines = smf_file.split('\n');
    var verticies=[];
    var subNormals=[];
    var faces=[];
    positions=[];
    normals=[];
    numPositions=0;

    for(var line=0;line<lines.length;line++){
        //window.alert("line "+line);
        var strings = lines[line].trimRight().split(' ');
        switch(strings[0]){
            case('v'):
            //process verticies
            verticies.push(vec3(parseFloat(strings[1]), parseFloat(strings[2]), parseFloat(strings[3])));
            subNormals.push(vec3(0,0,0));
            break;
            case('f'):
            //process faces
            faces.push(vec3(parseInt(strings[1]), parseInt(strings[2]), parseInt(strings[3])));
            positions.push(verticies[strings[1]-1]);
            positions.push(verticies[strings[2]-1]);
            positions.push(verticies[strings[3]-1]);
            numPositions+=3;

            //create normal vector for each face
            var a=subtract(verticies[strings[2]-1],verticies[strings[1]-1]);
            var b=subtract(verticies[strings[3]-1], verticies[strings[1]-1]);
            var n=cross(a,b);
            n=normalize(n);
            //var finalNormalVector=n;

            //add finalNormalVector to normal structure
            subNormals[strings[1]-1]=add(subNormals[strings[1]-1],n);
            subNormals[strings[2]-1]=add(subNormals[strings[2]-1],n);
            subNormals[strings[3]-1]=add(subNormals[strings[3]-1],n);

            
            break;
        }

    }
    //normalize normal vectors
    for(var j=0;j<subNormals.length;j++){
        subNormals[j]=normalize(subNormals[j]);

    }
    //push normals
    for (var i=0; i<faces.length;i++){
        var normalvec1=(subNormals[faces[i][0]-1]);
        var normalvec2=(subNormals[faces[i][1]-1]);
        var normalvec3=(subNormals[faces[i][2]-1]);
        normals.push(normalvec1);
        normals.push(normalvec2);
        normals.push(normalvec3);
        

        
    }
}



function render()
{

    program = initShaders(gl, currentVertexShader, currentFragmentShader);
    gl.useProgram(program);

    //
    //  Load shaders and initialize attribute buffers
    //

    nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    normalLoc = gl.getAttribLocation( program, "aNormal");
    gl.vertexAttribPointer( normalLoc, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( normalLoc );

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);


    positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    //
    //assign uniform variables
    //

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc=gl.getUniformLocation(program, "projectionMatrix");

    //camera light calculations
    ambientProduct1=mult(light1_ambient,material_ambient);
    diffuseProduct1=mult(light1_diffuse,material_diffuse);
    specularProduct1=mult(light1_specular,material_specular);
    light1_position=vec3(0.0,0.2,0.0);

    gl.uniform3fv(gl.getUniformLocation(program,"ambientProduct1"), flatten(ambientProduct1));
    gl.uniform3fv(gl.getUniformLocation(program,"diffuseProduct1"), flatten(diffuseProduct1));
    gl.uniform3fv(gl.getUniformLocation(program,"specularProduct1"), flatten(specularProduct1));
    gl.uniform3fv(gl.getUniformLocation(program,"light1_position"), flatten(light1_position));
    gl.uniform1f(gl.getUniformLocation(program,"shininess"),material_shininess);


    //moving light calculations
    ambientProduct2=mult(light2_ambient,material_ambient);
    diffuseProduct2=mult(light2_diffuse,material_diffuse);
    specularProduct2=mult(light2_specular,material_specular);
    light2_position=vec3(light2R*Math.cos(light2A),light2H,light2R*Math.sin(light2A)); //model coordinates

    gl.uniform3fv(gl.getUniformLocation(program,"ambientProduct2"), flatten(ambientProduct2));
    gl.uniform3fv(gl.getUniformLocation(program,"diffuseProduct2"), flatten(diffuseProduct2));
    gl.uniform3fv(gl.getUniformLocation(program,"specularProduct2"), flatten(specularProduct2));
    gl.uniform3fv(gl.getUniformLocation(program,"light2_position"), flatten(light2_position));

    //
    //beginning of traditional render function
    //
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var eye=vec3(R*Math.cos(A),H,R*Math.sin(A));
    var at=vec3(0.0,0.0,0.0);
    var up=vec3(0.0,1.0, 0.0);

    var fovy=45;
    var aspect=1;
    var near=0.01;
    var far=100;
    var left=-2;
    var right=2;
    var bottom=-2;
    var top=2;

    var projectionMatrix;
   
    var modelViewMatrix=lookAt(eye, at, up);

    if(currentProjection==1){//perspective
        projectionMatrix=perspective(fovy, aspect, near, far);
    }
    else if(currentProjection==0){//parallel
        projectionMatrix=ortho(left, right,bottom, top, near, far);
    }

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
}
