<?php

/*
 * Copyright (c) 2014 - Copyright holders CIRSFID and Department of
 * Computer Science and Engineering of the University of Bologna
 * 
 * Authors: 
 * Monica Palmirani – CIRSFID of the University of Bologna
 * Fabio Vitali – Department of Computer Science and Engineering of the University of Bologna
 * Luca Cervone – CIRSFID of the University of Bologna
 * 
 * Permission is hereby granted to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The Software can be used by anyone for purposes without commercial gain,
 * including scientific, individual, and charity purposes. If it is used
 * for purposes having commercial gains, an agreement with the copyright
 * holders is required. The above copyright notice and this permission
 * notice shall be included in all copies or substantial portions of the
 * Software.
 * 
 * Except as contained in this notice, the name(s) of the above copyright
 * holders and authors shall not be used in advertising or otherwise to
 * promote the sale, use or other dealings in this Software without prior
 * written authorization.
 * 
 * The end-user documentation included with the redistribution, if any,
 * must include the following acknowledgment: "This product includes
 * software developed by University of Bologna (CIRSFID and Department of
 * Computer Science and Engineering) and its authors (Monica Palmirani, 
 * Fabio Vitali, Luca Cervone)", in the same place and form as other
 * third-party acknowledgments. Alternatively, this acknowledgment may
 * appear in the software itself, in the same form and location as other
 * such third-party acknowledgments.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

require_once('./../dbInterface/class.dbInterface.php');

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

$condition = TRUE;
$init_db = TRUE;
$host = 'http://'.$_SERVER['HTTP_HOST'] . substr($_SERVER['REQUEST_URI'], 0,
												 strrpos($_SERVER['REQUEST_URI'],'/php/'));
$dbhost = 'http://'.$_SERVER['HTTP_HOST'].':8080/exist/';
$uname = 'admin'; $pwd = 'exist'; $abipath = '/path/to/AbiWord';

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

if($_POST){
	$host = $_POST['host'];$dbhost = $_POST['dbhost'];
	$uname = $_POST['uname']; $pwd = $_POST['pwd']; $abipath = $_POST['abipath'];
	if(write_lime_config()) header( 'Location: ' . $host);
};

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

function check_AbiWord() {
	if(strpos(PHP_OS,'WIN') === 0){
		$path = exec('where AbiWord');
	} 
	else {
		$path = exec('which abiword');
	}
	return $path;
}

function check_tmp_permission() {
	$TMPFOLDER = '../tmp/';
	!realpath($TMPFOLDER) ? mkdir($TMPFOLDER, 0700) : NULL; 
	chmod($TMPFOLDER, 0700);
	if(!is_writable($TMPFOLDER)) {
		global $condition;$condition = FALSE;	
		return '<tr><td/><td class="warn"><p>Please set the folder <code>' . realpath($TMPFOLDER) .
			   '</code> writable.</td></tr>';
	}
}

function check_php_version() {
	$PHPVERSION = '5.3.2';
	if(!version_compare(phpversion(),$PHPVERSION,'>=')) {
		global $condition;$condition = FALSE;	
		return '<tr><td/><td class="warn"><p>Please install a version of <code>PHP</code> equal or higher to <code>v'.$PHPVERSION.
	           '</code></td></tr>';
	}
}

function check_required_extensions() {
	
	$required_extensions = Array('curl',
							 'fileinfo',
						  	 'dom', 
						  	 'json',
						  	 'libxml',
						  	 'SimpleXML',
						  	 'xml',
						  	 'xmlreader',
						  	 'xmlwriter',
						  	 'xsl');
			
	$missing_extensions = Array();				 
	foreach($required_extensions as $extension) {
    	if(!in_array($extension, get_loaded_extensions())) {
    		$missing_extensions[] = $extension;
    	}
	}
	if(!empty($missing_extensions)) {
		global $condition;$condition = FALSE;	
		return '<tr><td/><td class="warn"><p>Please install the following PHP extensions:<ol>' .
				'<li><code>' . implode('<li><code>', $missing_extensions) . '</code></li>' . 
				'</ol></p></td></tr>';
	}
}

function write_lime_config() {
	$lime_config_content = file_get_contents(dirname(__FILE__) . '/data/lime-config.template');
	global $init_db,$uname,$pwd,$dbhost;	
	$credential = $uname . ':' . $pwd;
	
	$DBInterface = new DBInterface($dbhost,$credential);
	if(!$DBInterface->init_db()) {
		$init_db = FALSE;
	} else { 	
		$lime_config_filepath = dirname(__FILE__) . '/../lime-config.php';
		foreach ($_POST as $key=>$value)
			 $lime_config_content = str_replace ('<<'.$key.'>>',$value,$lime_config_content);
		file_put_contents($lime_config_filepath,$lime_config_content);
	}
	return $init_db;
}

function check_db() {
	global $init_db;
	if(!$init_db) {
		return '<tr><td/><td class="warn"><p>Something goes wrong initializing eXist-db.
		Please check eXist-db URL, your credential and permissions.</p></td></tr>';
	}
}

?>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta name="viewport" content="width=device-width" />
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Lime Editor Installation Script</title>
<link rel="stylesheet" href="data/setup.css" type="text/css" />
</head>

<body>
<h1 id="logo">
<a href='http://lime.cirsfid.unibo.it/'>Lime Editor</a>
</h1>
<div id="mainContainer">
<p> Welcome to Lime Editor Installation Script. Before getting started, we need some information. You will need to know the following items before proceeding.</p>
<form method="POST" action=".">
	<table class="form-table">
		<tr>
			<td id="heading"><label for="host">lime url</label></th>
			<td><input name="host" id="host" type="text" size="25" value="<?php global $host;echo $host; ?>"</td>
		</tr>
		
		<tr>
			<td id="heading"><label for="dbhost">exist url</label></th>
			<td><input name="dbhost" id="dbhost" type="text" size="25" value="<?php global $dbhost;echo $dbhost; ?>" /></td>
		</tr>

		<tr>
			<td id="heading"><label for="uname">exist username</label></th>
			<td ><input name="uname" id="uname" type="text" size="25" value="<?php global $uname;echo $uname; ?>"</td>

		</tr>
		<tr>
			<td	id="heading"><label for="pwd">exist password</label></th>
			<td><input name="pwd" id="pwd" type="text" size="25" value="<?php global $pwd;echo $pwd; ?>" /></td>
		</tr>
		
<?php

$die = check_php_version().check_required_extensions().check_tmp_permission().check_db();
$abi_path = check_AbiWord();

if($die) {
	echo "<tr><td/><td><p>To continue installation check the following requisites</p></td></tr>";
	echo $die;
}

if(!$abi_path) {
	global $abipath;
	echo '
<tr><td/><td>
<p>Moreover, Lime Editor requires some external tools to provide all the services it offers</p>
<p><a href="http://www.abisource.com/">AbiWord</a> seems not to be installed on your server, please check if it is installed and specify its path.</p>
<input name="abipath" id="abipath" type="text" size="25" value="' . $abipath . '" />
</td>
</tr>';
} else {
	echo '<input type="hidden" name="abipath" id="abipath" value="'.$abi_path.'">';
}
?>
</table>
<p class="step"><input value ="Initialize" type="submit" class="button button-large" <?php if(!$condition) echo 'disabled';  ?> /></p>
</form>
</div>
</body>
</html>