//declare all main variables 
let you  = document.getElementsByClassName("you")[0];
let computer = document.getElementsByClassName("computer")[0];
let button = document.getElementsByTagName("svg");
let choice1 = document.getElementsByClassName("choice1")[0];
let choice2 = document.getElementsByClassName("choice2")[0];
let clear = document.getElementById("clear");
//when page is loaded with clearClick button function
onload = ()=>{
    if(sessionStorage.getItem("you")==undefined&&sessionStorage.getItem("computer")==undefined){
        sessionStorage.setItem("you",0);
        sessionStorage.setItem("computer",0);
    }
    you.innerHTML = sessionStorage.getItem("you");
    computer.innerHTML = sessionStorage.getItem("computer");
}
clear.onclick = ()=>{
    sessionStorage.clear();
    location.reload();
}
//buttons functions 
function play(e){
 document.body.style.overflow = "hidden"
let object = button[e];
let newElement = object.cloneNode(true);
function remove(){
    return setInterval(function(){newElement.classList.add("remove"); },8000);
    }
function humanAction(){
newElement.classList.add("newItem");
choice1.appendChild(newElement);
if(setInterval(function(){newElement.classList.add("showItem")},100)){
    if(remove()){
        setInterval(function(){if(choice1.contains(newElement))choice1.removeChild(newElement);},8100) 
        return true;
    }
    return false;
}
}
if(humanAction()){
    function stopPlaying(){
    for(let j in button){
      if(parseInt(j)){
        button[j].onclick = null;
        button[j].classList.add("removeHover");

      }
    }
}
stopPlaying()
const num = Math.floor(Math.random() * 3) + 1
let newElement2 = button[num].cloneNode(true);
/////////////////// here was the problem
function changeText(){
     choice2.innerHTML = "";
    choice2.appendChild(newElement2);
    newElement2.classList.add("newItem");
    setInterval(function(){newElement2.classList.add("showItem")},100)
}
var time1 = 800;
var time2 = 1500;
setTimeout(()=>{choice2.innerHTML="The Computer is Thinking ..."},time1)
time1 *= 10000;
setInterval(changeText,time2)
time2 *= 10000;
/////////////////////////
function determineWinner(){
    let hu = newElement.attributes[1].value;
    let co = newElement2.attributes[1].value;
  if(hu!==co){
     if(hu=="rock"&&co=="scissor"){sessionStorage.setItem("you",parseInt(parseInt(sessionStorage.getItem("you"))+1));setInterval(function(){location.reload();},3000)}
     if(hu=="scissor"&&co=="rock"){sessionStorage.setItem("computer",parseInt(parseInt(sessionStorage.getItem("computer"))+1));setInterval(function(){location.reload();},3000)}
     if(hu=="peper"&&co=="rock"){sessionStorage.setItem("you",parseInt(parseInt(sessionStorage.getItem("you"))+1));setInterval(function(){location.reload();},3000)}
     if(hu=="rock"&&co=="peper"){sessionStorage.setItem("computer",parseInt(parseInt(sessionStorage.getItem("computer"))+1));setInterval(function(){location.reload();},3000)}
     if(hu=="scissor"&&co=="peper"){sessionStorage.setItem("you",parseInt(parseInt(sessionStorage.getItem("you"))+1));setInterval(function(){location.reload();},3000)}
     if(hu=="peper"&&co=="scissor"){sessionStorage.setItem("computer",parseInt(parseInt(sessionStorage.getItem("computer"))+1));setInterval(function(){location.reload();},3000)}
  }else{
    setInterval(function(){location.reload();},3000)
  }
}
determineWinner()
//dont touch them 
}
}
//start the game
function startGame(){
  for(let b in button){
      button[b].onclick = ()=>{
         play(b);
      }
  }
}
startGame();
