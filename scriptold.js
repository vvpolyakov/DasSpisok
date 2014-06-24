var s,sI,sID,sTimeout={};
//localStorage["1"]=22;
//alert(localStorage["1"]);
//console.log(localStorage);
s = JSON.parse(localStorage["spisok"]);

var store = function(params,callback) {
    
//    var offlineData = {};
//    if(params.action=="testauth") {if(localStorage["auth"]) offlineData={ok:1};else offlineData={error:"не было авторизации"}}
    if(params.action=="save") {
	var tmp = JSON.parse(localStorage["spisok"]);
	for (var i=0;i<tmp.length;i++) {
	    if (tmp[i].id = params.id) tmp[i].data=params.data
	}
	localStorage["spisok"] = JSON.stringify(tmp);
    }
    if(params.action=="spisok") { offlineData=JSON.parse(localStorage["spisok"]);}
    
/*    $.ajax({
	url:"ajax.php",
	timeout:5000,
	type:"POST",
	data:params,
	dataType:"json",
	success: function(data){
	    onlineMode();
	    if (data.error){
		alert(data.error);
	    } else {
		if(params.action=="testauth") {localStorage["auth"]=data.id;}
	        if(params.action=="spisok") { localStorage["spisok"] = JSON.stringify(data);}
		
		callback(data);
	    }
	},
	error:function(a,b,c){
//	    alert(b);
	    if (b=="timeout") {
		offlineMode();
		callback(offlineData);
	    }
	}
    });
*/
}

var offlineMode = function() {
    localStorage['offline']=1;
}	
var onlineMode = function(){
    if ( localStorage['offline']==1) {
	var local = JSON.parse(localStorage["spisok"]);
	$.post("ajax.php",{action:"spisok"},function(remote) {
	    for(var i=0; i<local.length; i++) {
		for (j=0; j<remote.length; j++) {
		    if (remote[i].id == local[i].id) {
			if(remote[j].data!=local[i].data) {
			    editSave(local[i].name,spisokMerge(local[i].data,remote[i].data),function(){},local[i].id);
			}
		    }
		}
	    }
	},"json");
	for (var i=0;i<tmp.length;i++) {
	    editSave(tmp[i].name,tmp[i].)
	}
	
    }
}
var init=function(){
    if (init.called) {
        return;
    }
    init.called = true;
    store({action:"testauth"},function(data){
	//$(".username").html(data.name);
	if (data.id>0)	spisokList();
	else loginShow();
	
    });

}
var loginShow=function(){
    $.mobile.changePage('#loginform');
}
var loginSignin=function(){
    store({action:"signin",login:$("#loginform_login").val(), password:$("#loginform_password").val()},
	function(data){
	    init.called=false;
	    init();
	}
    )
}
var loginSignup = function(){
    if($("#signupform_password").val() != $("#signupform_password2").val()) {
	alert("Пароли не совпадают");
	return;
    }
    store({action:"signup",login:$("#signupform_login").val(),password:$("#signupform_password").val()},
	function(data){
	    store({action:"signin",login:$("#signupform_login").val(), password:$("#signupform_password").val()},
		function(data){
		    init.called=false;
		    init();
		}
	    );
	}
    );
};

var editSave=function(name,data,callback,id=sID){
    sI.name=name;
    sI.data=data;
    
    if (name==undefined) {
	sI.name=$("#editname").val();
	sI.data=$("#editdata").val();
    }
    clearTimeout(sTimeout[id]);
    sTimeout[id] = setTimeout( function(){
	store({action:"save",id:id,name:sI.name,data:sI.data,dt:sI.dt},function(d){
	    if (id==0)sID=d.id;
    	    sI.dt=d.dt;
	    if (d.errorcode=="sync") {spisokSync(d);}
	    else {   spisokView();}
	});
    },1000);
};

var spisokList = function() {
    $.mobile.changePage('#spisok');
    store({action:"spisok"},function(data){
	s = data;
	if (!s) s=[];
	var html = "";
	for (i in s){
	    html += "<div class=spisoklist data-id="+s[i].id+">"+s[i].name+"</div>";
	}
	$("#spisok .ui-content").html(html);
	$(".spisoklist").button().click(function(){
	    spisokView($(this).data("id"));
	});
//	console.log(s);
    });
}
var spisokEdit = function(id) {
    $.mobile.changePage('#edit');
    var i;
    var found=false;
    if (id != undefined){
	sID=id;
	for (i in s) if (s[i].id==id) {found=true;break;}
	if (!found) {
	    i=s.push({})-1;	
	}
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
    $.mobile.changePage('#view');
    $("#view h1").html(sI.name);
    var html = "<ul>";
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
    $("#view ul").controlgroup();
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
	//sI.data=data;
	editSave(sI.name,data);
//	store({action:"save",id:sID,name:sI.name,data:data,dt:sI.dt},function(d){
//	    sI.dt=d.dt;
//	    if (d.errorcode=="sync") {spisokSync(d);}
//	});

    });
    
}

var spisokDelete = function(){
    if (confirm("Удалить?")) store({action:"delete",id:sID},function(){spisokList();});
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
    
    editSave(sI.name,spisokMerge(data.data,sI.data));
    
}

var spisokMerge = function(text1,text2) {
    a1=text1.split(/\n/);
    a2=text2.split(/\n/);
    var found = 0;
    for(var i = 0; i<a2.length;i++) {
	found=0;
	t2=a2[i];
	if (t2.charAt(0)=="+") {t2=t2.slice(1); plus2=1;}
	else {plus2=0;}
	for(var j = 0; j<a1.length;j++) {
	    t1=a1[j];
	    if (t1.charAt(0)=="+") {t1=t1.slice(1); plus1=1;}
	    else{plus1=0;}
	    if (t1==t2) {
		found=1;
		break;
	    }
	}
	if (found) {
	    if(plus2 && !plus1) a1[j]="+"+a1[j];
	} else{
	    a1.splice(i,0,a2[i]);
	} 
    }
    return a1.join("\n");
}



var logout = function(){
    store({action:"logout"},function(){
	loginShow();
    });
}

init.called=false;

document.addEventListener("deviceready", init, true);
$(init); 
