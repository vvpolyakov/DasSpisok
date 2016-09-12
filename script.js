var s,sI,sID,sTimeout={};
//localStorage["1"]=22;
//alert(localStorage["1"]);
//delete localStorage['password5'];
console.log(localStorage);
var needSync=0;
var postProgress=0;
setInterval(function(){if(needSync)sync()},5000);
setInterval(function(){needSync=1},60000);
//$(window).hashchange(function(){accNavbar();});
$(document).on("pagechange",function(a,b){accNavbar();});
$.mobile.ignoreNextHashChange = true;
$.mobile.defaultPageTransition = 'none';


$(document).on("pageinit", function(event){
  // initial configuration
    $.mobile.allowCrossDomainPages = true;
    $.support.cors = true;
    $.mobile.pushStateEnabled = false;
});
        



var save = function() {
//    needSync=1;
    localStorage["spisok"+localStorage["auth"]] = JSON.stringify(s);
    console.log("SAVE");
    console.log(localStorage["spisok"+localStorage["auth"]]);
    //();
    
}

var sync = function() {
    if (postProgress) {
	setTimeout(function(){sync()},500);
	return;
    }
    needSync=0;
    if (localStorage["auth"]>0){
    $(".sync-btn").addClass("ui-icon-clock");
    $(".sync-btn").removeClass("ui-icon-recycle");
    post({action:"spisok"},function(remote){
	    $(".sync-btn").addClass("ui-icon-recycle");
	    $(".sync-btn").removeClass("ui-icon-clock");
	    var last;
	    try{
		last = JSON.parse(localStorage["lastsync"+localStorage["auth"]]);
	    }catch(e){}
	    if (!remote.length) remote=[];
	    for(var i=0; i<s.length ;i++) {
//console.log(s[i]);
		if (s[i].del==1) {
		    post({action:"delete",id:s[i].id},function(){ });
		    for (j=0; j<remote.length; j++) 
			if (remote[j].id == s[i].id) remote.splice(j,1);
		    s.splice(i,1);
		    last.splice(i,1);
		    i--;
		    continue;
			
		} else for (j=0; j<remote.length; j++) {
		    if (remote[j].id == s[i].id) {
			if(remote[j].data!=s[i].data) {
console.log(remote[j].dt+"!="+s[i].dt);			    
			    if (remote[j].dt!=s[i].dt) {
				var newdata=spisokMerge(remote[i].data,s[i].data,last[i].data);
				s[i].data=newdata;
			    }

			    $(".sync-btn").addClass("ui-icon-clock");
			    $(".sync-btn").removeClass("ui-icon-recycle");
			    post({action:"save",id:s[i].id,name:s[i].name,data:s[i].data,dt:0},function(d){
				$(".sync-btn").addClass("ui-icon-recycle");
				$(".sync-btn").removeClass("ui-icon-clock");

console.log("savecallback1");
			        for (var n in s) if (s[n].id==d.postid){ 
console.log(n);
				    s[n].dt=d.dt;    
				}
		    		save();
				localStorage["lastsync"+localStorage["auth"]] = localStorage["spisok"+localStorage["auth"]];

				//for(var k=0; k<local.length; k++) {
				//    if (local[k].id=d.id) local[k].dt=d.dt;
				//}
			    });
			}
			break;
		    } 
		}
		if (j==remote.length) {
		    if (s[i].id<=0) {

			//Добавление
			post({action:"save",id:s[i].id,name:s[i].name,data:s[i].data,dt:0},function(d){
console.log("savecallback2");
console.log(d);
console.log(s);
			    for (var n in s) if (s[n].id==d.postid){ 
console.log(n);
		    		s[n].dt=d.dt;
		    		s[n].id=d.id;
		    	    }
		    	    save();
			    localStorage["lastsync"+localStorage["auth"]] = localStorage["spisok"+localStorage["auth"]];
			});
		    } else { //уаление
			s.splice(i,1);
			last.splice(i,1);
			i--;
//			continue;
		    }
		    
		}
		
	    }
	    for (j=0; j<remote.length; j++) {
		for(var i=0; i<s.length; i++) {
		    if (remote[j].id == s[i].id) break;
		}
		if (i==s.length) {
		    s.push(remote[j]);
		}
	    }
//console.log(s);
	    save();


	    localStorage["lastsync"+localStorage["auth"]] = localStorage["spisok"+localStorage["auth"]];
	    if ($.mobile.activePage.attr('id') == "view") spisokView();
	    if ($.mobile.activePage.attr('id') == "spisok") spisokList();
//	    if ($.mobile.activePage.attr('id') == "edit") spisokEdit();
    });
    }    
}

var postWait = function(){
    postProgress=1;
}
var postComplete = function(){
    postProgress=0;
}

var post = function(params,callback,errorcallback) {
    postWait();
    console.log("POST: "+params.action);
    if (params.login == undefined) {
	$.extend(params,{login:localStorage["login"+localStorage["auth"]],password:localStorage["password"+localStorage["auth"]]})
    }
    $.ajax({
	url:"http://zitenet.ru/spisok/ajax.php",
	timeout:5000,
	type:"POST",
	data:params,
	dataType:"json",
	success: function(data){
	    postComplete();
	    if (data==null) data={};
	    onlineMode();
	    if (data.error){
		alert(data.error);
	    } else {
		callback(data);
	    }
	},
	error:function(a,b,c){
	    postComplete();
	    offlineMode();
	    errorcallback();
	}
    });
}

var offlineMode = function() {
//    localStorage['offline']=1;
}	
var onlineMode = function(){

}
var init=function(){
    if (init.called) {
        return;
    }
    init.called = true;


    document.addEventListener("menubutton", function(e){
	accounts();
    },false);
    document.addEventListener("backbutton", function(e){
	if($.mobile.activePage.is('#spisok')){
	    if (confirm("Выйти из приложения?")){
    		e.preventDefault();
    		navigator.app.exitApp();
    	    }
	}
	else if ($.mobile.activePage.is('#edit')) {
	    $.mobile.changePage('#view',{changeHash: false});
	}
	else if ($.mobile.activePage.is('#loginform')) {
	    $.mobile.changePage('#accounts',{changeHash: false});
	}
	else if ($.mobile.activePage.is('#signupform')) {
	    $.mobile.changePage('#loginform',{changeHash: false});
	}
	else {
	    $.mobile.changePage('#spisok',{changeHash: false});
	}
    }, false);
    init1();
}

function init1(){
    if (!localStorage["auth"]) localStorage["auth"] = 0;
        
    post({action:"testauth"},function(data){
	//$(".username").html(data.name);
//	if (data.id>0)	{ localStorage["auth"]=data.id;	authMode();}
//	else {		  localStorage["auth"]=0;	unauthMode();}
	spisokList();
	sync();
    },
    function(){
	spisokList();
    });

}

var editSave=function(name,data,callback){
    
    sI.name=name;
    sI.data=data;
    
    if (name==undefined) {
	sI.name=$("#editname").val();
	sI.data=$("#editdata").val();
    }
    if (sID==0) {
	sI.id=-Math.random();
	sID = sI.id;
	var i=s.push({})-1;
	s[i]=sI;
    }
    save();
    needSync=1;
    spisokView();
/*    
    clearTimeout(sTimeout[id]);
    sTimeout[id] = setTimeout( function(){
	post({action:"save",id:id,name:sI.name,data:sI.data,dt:sI.dt},function(d){
	    if (id==0)sID=d.id;
    	    sI.dt=d.dt;
	    if (d.errorcode=="sync") {spisokSync(d);}
	    else {   spisokView();}
	});
    },1000);
*/
};

var spisokList = function() {
    $.mobile.changePage('#spisok',{changeHash: false});
    
    accNavbar();
    try {
	s = JSON.parse(localStorage['spisok'+localStorage['auth']]);
    } catch(e){s=[];}
    if (!s) s=[];
    
	var html = "";
	for (i in s){
	    if (s[i].del != 1)
		html += "<div class=spisoklist data-id="+s[i].id+">"+s[i].name+"&nbsp;</div>";
	}
	$("#spisok .ui-content").html(html);
	$(".spisoklist").button().click(function(){
	    spisokView($(this).data("id"));
	});
}
var spisokEdit = function(id) {
    $.mobile.changePage('#edit',{changeHash: false});
    var i;
    var found=false;
    if (id==0) {
	sID=id;
	sI = {name:"",data:""};
    }
    if (id >0){
	sID=id;
	for (i in s) if (s[i].id==id) {found=true;break;}
//	if (!found) {
//	    i=s.push({})-1;	
//	}
	sI = s[i];
    }
    $("#editname").val(sI.name);
    $("#editdata").val(sI.data);
}
var spisokView = function(id) {
    if (id != undefined) {
	for (i in s) if (s[i].id==id) break;
	sI = s[i];
	sID = s[i].id;
    }
    if (sID == 0) {spisokList();return;}

    $.mobile.changePage('#view',{changeHash: false});

    $("#view h1").html(sI.name);

    var html = "<ul class='items'>";
    var arr=sI.data.split("\n");
    for (i in arr)  {
	if (arr[i].charAt(0)=="#"){
//	html += "<div class=\"viewitem\">";
	    html += "<span class=\"item hidden\">"+arr[i]+"</span>";
	}

	else if (arr[i].charAt(0)=="*") {
	    arr[i]=arr[i].slice(1);
	    html += "<li class=\"ui-li\" data-theme=\"b\"><span class=\"item big\">"+arr[i]+"</span></li>";
	}
	else if (arr[i]=="") {
	    html += "<li><span class=\"item space\"></span></li>";
	}
	else {
	    var checked=0;
	    if (arr[i].charAt(0)=="+") checked=1;
	    // class=\"ui-checkbox\"
	    html += "<label>";
	    html += "<input type=\"checkbox\" "+(checked?"checked":"")+">";
	    if(checked) arr[i]=arr[i].slice(1);
	    html += "<span class=\"item "+(checked?"checked":"")+"\">"+arr[i]+"</span>";
	    html += "</label>";
	}
//	html += "</div>";
    }
    html +="</ul>";
    $("#view .ui-content").html(html);
    $("#view ul.items").controlgroup();
    $("#view input").change(function(){
	if ($(this).is(":checked")) {
//	    console.log($(this).next());
	    $(this).parent().find(".item").addClass("checked");
	} else {
	    $(this).parent().find(".item").removeClass("checked");
	}	
	var l = $("#view .item");
	var len = l.length;
	var data = "";
	var str;
	var o;
	for (var i=0; i<len; i++) {
	    o=$(l.get(i));
	    str = o.html();
//	    console.log(o);
	    if (o.is(".big")) str="*"+str;
	    if (o.is(".checked")) str="+"+str;
	    data+=str+(i==len-1?"":"\n");
	}
//	alert(data);
	sI.data=data;
	save();
	needSync=1;
	//editSave(sI.name,data);
//	store({action:"save",id:sID,name:sI.name,data:data,dt:sI.dt},function(d){
//	    sI.dt=d.dt;
//	    if (d.errorcode=="sync") {spisokSync(d);}
//	});

    });
    console.log("spisokView()");

    
}

var spisokDelete = function(){
    if (confirm("Удалить?")) {
	//store({action:"delete",id:sID},function(){spisokList();});
	sI.del=1;
	save();
	spisokList();
	needSync=1;
    }
}

var spisokSync = function(data){
    alert("Внимание! На сервере имеются изменения. Список будет синхронизирован.");
//    alert(sI.data+"\n-----\n"+data.data);
//    $.mobile.changePage('#sync');
//    $("#sync1area").val(data.data);
//    $("#sync2area").val(sI.data);
//    $("#sync3area").val(spisokMerge(data.data,sI.data));
//    $( "#tabs" ).tabs({ active: 1 });
    
//    $(".syncsave").click(function(){
//	editSave(sI.name,$(this).prev().val());
//    });
    
//    sI.data=data.data;
//    sI.dt=data.dt;
    
//    editSave(sI.name,spisokMerge(data.data,sI.data));
    
}

var spisokMerge = function(text1,text2,last3) {
//    alert("merge");
    var remote=text1.split(/\n/);
    var local=text2.split(/\n/);
    var last=last3.split(/\n/);
    var found = 0;
    for(var i = 0; i<local.length;i++) {
	found=0;
	lo=local[i];
	if (lo.charAt(0)=="+") {lo=lo.slice(1); plusLo=1;}
	else {plusLo=0;}
	for(var j = 0; j<remote.length;j++) {
	    re=remote[j];
	    if (re.charAt(0)=="+") {re=re.slice(1); plusRe=1;}
	    else{plusRe=0;}
	    if (lo==re) {
		found=1;
		break;
	    }
	}
	if (found) {
	    bylPlus = 0;
	    for(var k = 0; k<last.length;k++) {
		la = last[k];
		if (la.charAt(0)=="+") {la=la.slice(1); plusLa=1;}
		else {plusLa = 0;}
		if (la==lo){bylPlus = plusLa;}
	    }
	    //if(plusLo && !plusRe) remote[j]="+"+remote[j];
	    if (bylPlus && !plusLo && plusRe) remote[j] = re;
	    if (!bylPlus && plusLo && !plusRe) remote[j] = "+"+re;
	    
	    //remote[j]=(plusRe?"+":"")+re;
	} else{
	    bylo = 0;
	    for(var k = 0; k<last.length;k++) {
		la = last[k];
		if (la.charAt(0)=="+") {la=la.slice(1); plusLa=1;}
		else {plusLa = 0;}
		if (la==lo) bylo=1;
	    }
	    if (!bylo) remote.splice(i,0,local[i]);
	} 
    }
    return remote.join("\n");
}



var logout = function(){

//    post({action:"logout"},function(){
//	loginShow();
//    });
}

var accNavbar = function() {
//    $.mobile.changePage('#accounts');
    var accs = [0];
    try {
	accs = JSON.parse(localStorage["accounts"]);
    } catch(e){}
    var html = "<div data-role=\"navbar\" data-id=\"dasnav\" data-iconpos=\"right\"><ul>";
//    html += "<li><a class=\""+(localStorage['auth']==0?"ui-btn-active":"" )+"\" onclick=\"changeAccount(0)\">Локальный</a></li>";
    for (var i in accs) {
//	if (accs[i]>0) {
	html +="<li><a class=\""+(
    !($.mobile.activePage.attr('id') == "loginform" ||
    $.mobile.activePage.attr('id') == "accounts"||
    $.mobile.activePage.attr('id') == "signupform") &&
	    
	localStorage['auth']==accs[i]?"ui-btn-active":"" )+"\" onclick=\"changeAccount("+accs[i]+")\">"+(accs[i]==0?"Локальный":localStorage["login"+accs[i]])+"</a></li>";
//	}
    }
    html += "<li><a class=\""+(
    $.mobile.activePage.attr('id') == "loginform" ||
    $.mobile.activePage.attr('id') == "accounts"||
    $.mobile.activePage.attr('id') == "signupform"
     ?"ui-btn-active":"" )+"\" onClick=\"accounts()\" data-icon=\"gear\">Настройка</a></li>";
    html +="</ul></div>";
    $(".footer").html(html).find("[data-role=navbar]").navbar();
//    alert(2);
//    $("#accounts .ui-content button").button();
}

function accounts() {
    $.mobile.changePage('#accounts',{changeHash: false});
    var accs = [0];
    try {
	accs = JSON.parse(localStorage["accounts"]);
    } catch(e){}
    var html = "";
    html += "<button class=\"ui-btn ui-input-btn ui-corner-all ui-shadow ui-disabled ui-btn-icon-left\">Локальный</button>";
    for (var i in accs) {
	if (accs[i]>0) {
	    html +="<button class=\"ui-btn ui-input-btn ui-corner-all ui-shadow ui-icon-delete ui-btn-icon-left\" data-icon=\"user\" class=\""+(localStorage['auth']==accs[i]?"ui-btn-active":"" )+"\" onclick=\"deleteAccount("+accs[i]+")\">"+localStorage["login"+accs[i]]+"</button>";
	}
    }
    html += "<button class=\"ui-btn ui-input-btn ui-corner-all ui-shadow ui-icon-plus ui-btn-icon-left\" data-icon=\"plus\" onClick=\"loginShow()\">Добавить онлайн аккаунт</button>";
    html +="Браузерная интернет-версия находится по адресу <b>http://zitenet.ru/spisok/</b><br>Скачать приложение: ";
    html +="<a href=\"https://play.google.com/store/apps/details?id=com.phonegap.dasspisok\">Google Play</a>";
//    $(".footer").html(html).find("[data-role=navbar]").navbar();
//    alert(2);
    $("#accounts .ui-content").html(html);
//    $("#accounts .ui-content button").button();

}

var changeAccount = function(n){
    if (postProgress==1) {
	setTimeout(function(){changeAccount(n);},500);
	return;
    }
    localStorage['auth'] = n;
    init1();
}
var deleteAccount = function(n){
    if (confirm("Удалить акаунт из списка?")) {
	var accs = [0];
	try {
	    accs = JSON.parse(localStorage["accounts"]);
	} catch(e){}
	for (var i in accs) {
	    if (accs[i]==n){ accs.splice(i,1); break;}
	}
	localStorage["auth"]=accs[i-1];
	localStorage["accounts"] = JSON.stringify(accs);
	delete localStorage["lastsync"+n];
	delete localStorage["login"+n];
	delete localStorage["password"+n];
	delete localStorage["spisok"+n];

	init1();
    }
}
var loginShow=function(){
    $.mobile.changePage('#loginform',{changeHash: false});
}
var loginSignin=function(){
    post({action:"testauth",login:$("#loginform_login").val(), password:$("#loginform_password").val()},
	function(data){
	    if (data.id==0) {
		alert("Пользователь не найден!");
		return;
	    }
	    localStorage["auth"]=data.id;	
	    localStorage["login"+localStorage["auth"]] = $("#loginform_login").val();
	    localStorage["password"+localStorage["auth"]] = $("#loginform_password").val();
	    var accs = [0];
	    try {
		accs = JSON.parse(localStorage["accounts"]);
	    } catch(e){}
	    var i;
	    for ( i=0; i<accs.length;i++) if (accs[i]==data.id) break;
	    if (i==accs.length) {
		accs.push(data.id);
		localStorage["accounts"] = JSON.stringify(accs);
	    }


	    authMode();
	    init1();
	},function() {
	    alert("Ошибка сетевого соединения");
	}
    )
}
var loginSignup = function(){
    if($("#signupform_password").val() != $("#signupform_password2").val()) {
	alert("Пароли не совпадают");
	return;
    }
    post({action:"signup",login:$("#signupform_login").val(),password:$("#signupform_password").val()},
	function(data){
	    localStorage["auth"]=data.id;	
	    localStorage["login"+localStorage["auth"]] = $("#signupform_login").val();
	    localStorage["password"+localStorage["auth"]] = $("#signupform_password").val();
	    var accs = [0];
	    try {
		accs = JSON.parse(localStorage["accounts"]);
	    } catch(e){}
	    accs.push(data.id);
	    localStorage["accounts"] = JSON.stringify(accs);
	    
	    init1();
    },function() {
        alert("Ошибка сетевого соединения");
    });
};

var authMode = function(){
    $(".footer h4").html("Аккаунт: "+localStorage["login"+localStorage['auth']]+" <button style='' data-inline='true' onClick=sync()>Синхронизация</button>");
    $(".btn-auth").css({display:"none"});
    $(".btn-logout").css({display:"block"});
}
var unauthMode = function () {
//alert(1);
    $(".footer h4").html("Локальный оффлайн без синхронизации с интернетом");
    $(".btn-auth").css({display:"block"});
    $(".btn-logout").css({display:"none"});
}


init.called=false;

document.addEventListener("deviceready", init, true);
$(init); 
