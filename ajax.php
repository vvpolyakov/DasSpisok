<?
//    header("")
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

session_start();
mysql_connect("localhost","root","");
mysql_select_db("spisok");
mysql_query("set character set utf8");

if ($_POST['action']=='signup') signup();

$user = mysql_fetch_assoc(mysql_query("SELECT * FROM user WHERE login='".$_POST['login']."' AND password='".$_POST['password']."'"));
unset( $user['password']);
if ($_POST['action']=='testauth') {
    testauth();
    exit;
}

if (!$user){
    print json_encode(array("error"=>"Пользователь не найден"));
    exit;
}

if ($_POST['action']=='spisok') spisok();
if ($_POST['action']=='save') save();
if ($_POST['action']=='delete') deletes();



function testauth(){
    global $user;
    if ($user['id']) {
	print json_encode($user);
    } else {
	print json_encode(array("error"=>"Пользователь не найден"));
    }
}

function signin() {
    $s = mysql_fetch_assoc(mysql_query("SELECT * FROM user WHERE login='".mysql_real_escape_string($_POST['login'])."' AND password='".mysql_real_escape_string($_POST['password'])."'"));
    if ($s['id']) {
	mysql_query("INSERT INTO session (user,sid) VALUES(".$s['id'].",'".session_id()."')");
	print json_encode(array("ok"=>1));
    } else {
	print json_encode(array("error"=>"Пользователь не найден"));
    }
}

function logout(){
    mysql_query("DELETE FROM session WHERE sid='".session_id()."'");
    print json_encode(array("ok"=>1));
}

function signup() {
    $s = mysql_fetch_assoc(mysql_query("SELECT * FROM user WHERE login='".mysql_real_escape_string($_POST['login'])."'"));
    if ($s['id']) {
	print json_encode(array("error"=>"Пользователь с таким логином уже существует"));
	return;	
    }
    mysql_query("INSERT INTO user (login,password) VALUES ('".mysql_real_escape_string($_POST['login'])."','".mysql_real_escape_string($_POST['password'])."')");
    
    print json_encode(array("ok"=>1,"id"=>mysql_insert_id()));
}

function create(){
    global $user;
    mysql_query("INSERT INTO spisok (name,user) VALUES ('".mysql_real_escape_string($_POST['name'])."',".$user['id'].")");
    print json_encode(array("ok"=>1));
}
function spisok() {
    global $user;
    print json_encode(mysql_fetch_all(mysql_query("SELECT id,UNIX_TIMESTAMP(dt) as dt,data,name FROM spisok WHERE user=".$user['id']."")));
}
function save() {
    global $user;
    $id=$_POST['id'];
    if (!is_numeric($_POST['id'])){
	print json_encode(array("error"=>"Ошибка"));
    } else {
	if ($id<=0) {
	    mysql_query("INSERT INTO spisok (name,user) VALUES ('".mysql_real_escape_string($_POST['name'])."',".$user['id'].")");
	    $id = mysql_insert_id();
	} else if ($_POST['dt']!=0) {
	    $d=mysql_fetch_assoc(mysql_query("SELECT UNIX_TIMESTAMP(dt) as dt,data FROM spisok WHERE id=".$id));
	    if ($d['dt']!=$_POST['dt']) {
		print json_encode(array("errorcode"=>"sync","dt"=>$d['dt'],"data"=>$d['data'],"id"=>$id));
		return;
	    }
	}
	mysql_query("UPDATE spisok SET data='".mysql_real_escape_string($_POST['data'])."' where id=".$id);
	$d=mysql_fetch_assoc(mysql_query("SELECT UNIX_TIMESTAMP(dt) as dt FROM spisok WHERE id=".$id));
	print json_encode(array("ok"=>1,"id"=>$id,"postid"=>$_POST['id'],"dt"=>$d['dt']));
    }
}

function deletes() {
    global $user;
    if (!is_numeric($_POST['id'])){
	print json_encode(array("error"=>"Ошибка"));
    } else {
	mysql_query("DELETE FROM spisok where id=".$_POST['id']);
	print json_encode(array("ok"=>1));
    }
}



  function mysql_fetch_all ($result)
    {
        while ($row = mysql_fetch_assoc($result))
        {
            $rows[] = $row;
        }
        return $rows;
    }

?>
