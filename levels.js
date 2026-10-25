// Coordinates are [column, row], zero-based from the upper-left corner.
// Each level is self-contained. Replace the image and data together.
window.PANTORI_LEVELS = [
 {id:16,title:'Pierwszy łup',image:'assets/map-16.png',size:8,
 walls:[[0,0],[4,0],[6,1],[1,2],[3,5],[5,5],[0,6],[3,6],[5,7],[6,7]],
 fruits:[[3,2],[7,5],[1,6]],diamonds:[],spikes:[{at:[2,1],lever:[0,4]}],
 ghosts:[{at:[5,1],color:'red'},{at:[7,2],color:'blue'},{at:[1,3],color:'red'},{at:[6,3],color:'blue'},{at:[3,4],color:'red'},{at:[4,6],color:'yellow'},{at:[1,7],color:'red'}],pieces:['redT','redI','yellowI','blueS']},
 {id:17,title:'Sekret diamentów',image:'assets/map-17.png',size:8,
 walls:[[3,0],[0,1],[1,1],[7,1],[3,3],[6,3],[7,3],[0,6],[2,6],[6,6],[4,7]],
 fruits:[[5,1],[1,3],[4,4],[5,6]],diamonds:[[6,2],[2,4]],spikes:[],
 ghosts:[{at:[1,0],color:'green'},{at:[4,0],color:'green'},{at:[2,2],color:'blue'},{at:[3,4],color:'green'},{at:[6,4],color:'green'},{at:[1,6],color:'blue'},{at:[7,6],color:'blue'}],pieces:['blueS','blueL','greenU','greenT']},
 {id:18,title:'Ostatnia spiżarnia',image:'assets/map-18.png',size:8,
 walls:[[7,0],[2,1],[4,2],[5,2],[0,4],[7,4],[4,5],[4,7],[5,7]],
 fruits:[[1,2],[2,4],[6,4],[1,7]],diamonds:[],spikes:[{at:[2,3],lever:[6,3]}],
 ghosts:[{at:[2,0],color:'red'},{at:[3,1],color:'yellow'},{at:[6,1],color:'yellow'},{at:[0,2],color:'green'},{at:[5,4],color:'green'},{at:[0,5],color:'red'},{at:[3,6],color:'blue'},{at:[7,6],color:'blue'}],pieces:['yellowI','redT','blueL','greenT']}
];
window.PANTORI_PIECES={
 redT:{color:'red',name:'Czerwone T',cells:[[0,0],[1,0],[2,0],[1,1],[1,2]]},
 redI:{color:'red',name:'Czerwona belka',cells:[[0,0],[0,1],[0,2]]},
 yellowI:{color:'yellow',name:'Żółta belka',cells:[[0,0],[0,1],[0,2],[0,3]]},
 blueS:{color:'blue',name:'Niebieski zygzak',cells:[[1,0],[2,0],[1,1],[0,2],[1,2]]},
 blueL:{color:'blue',name:'Niebieski narożnik',cells:[[1,0],[0,1],[1,1]]},
 greenU:{color:'green',name:'Zielona podkowa',cells:[[0,0],[1,0],[1,1],[0,2],[1,2]]},
 greenT:{color:'green',name:'Zielone T',cells:[[0,0],[0,1],[1,1],[0,2]]}
};
