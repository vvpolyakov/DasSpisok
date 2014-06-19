<?
//    header("")
session_start();
mysql_connect("localhost","root","");
mysql_select_db("spisok");
mysql_query("set character set utf8");

$user = mysql_fetch_assoc(mysql_query("SELECT * FROM user JOIN session ON user.id=session.user WHERE session.sid = '".session_id()."'"));
unset( $user['password']);

if ($_POST['action']=='testauth') testauth();
if ($_POST['action']=='signin') signin();
if ($_POST['action']=='logout') logout();
if ($_POST['action']=='signup') signup();
if ($_POST['action']=='spisok') spisok();
if ($_POST['action']=='save') save();
if ($_POST['action']=='delete') deletes();



function testauth(){
    global $user;
    if ($user['id']) {
	print json_encode($user);
    } else {
	print json_encode(array("id"=>"0"));
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
    print json_encode(array("ok"=>1));
}

function create(){
    global $user;
    mysql_query("INSERT INTO spisok (name,user) VALUES ('".mysql_real_escape_string($_POST['name'])."',".$user['id'].")");
    print json_encode(array("ok"=>1));
}
function spisok() {
    global $user;
    print json_encode(mysql_fetch_all(mysql_query("SELECT * FROM spisok WHERE user=".$user['id']."")));
}
function save() {
    global $user;
    if (!is_numeric($_POST['id'])){
	print json_encode(array("error"=>"Ошибка"));
    } else {
	if ($_POST['id']==0) {
	    mysql_query("INSERT INTO spisok (name,user) VALUES ('".mysql_real_escape_string($_POST['name'])."',".$user['id'].")");
	    $_POST['id'] = mysql_insert_id();
	} else {
	    $d=mysql_fetch_assoc(mysql_query("SELECT * FROM spisok WHERE id=".$_POST['id']));
	    if ($d['dt']!=$_POST['dt']) {
		print json_encode(array("errorcode"=>"sync","dt"=>$d['dt'],"data"=>$d['data'],"id"=>$_POST['id']));
		return;
	    }
	}
	mysql_query("UPDATE spisok SET data='".mysql_real_escape_string($_POST['data'])."' where id=".$_POST['id']);
	$d=mysql_fetch_assoc(mysql_query("SELECT dt FROM spisok WHERE id=".$_POST['id']));
	print json_encode(array("ok"=>1,"id"=>$_POST['id'],"dt"=>$d['dt']));
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



  function mysql_fetch_all ($result, $result_type = MYSQL_BOTH)
    {
        if (!is_resource($result) || get_resource_type($result) != 'mysql result')
        {
            trigger_error(__FUNCTION__ . '(): supplied argument is not a valid MySQL result resource', E_USER_WARNING);
            return false;
        }
        if (!in_array($result_type, array(MYSQL_ASSOC, MYSQL_BOTH, MYSQL_NUM), true))
        {
            trigger_error(__FUNCTION__ . '(): result type should be MYSQL_NUM, MYSQL_ASSOC, or MYSQL_BOTH', E_USER_WARNING);
            return false;
        }
        $rows = array();
        while ($row = mysql_fetch_array($result, $result_type))
        {
            $rows[] = $row;
        }
        return $rows;
    }

?>
