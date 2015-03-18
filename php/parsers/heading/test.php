<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/> 
	<link rel="stylesheet" type="text/css" href="../framework/aknssg.css"/>
	<title>Test page: parser for headings</title>
	<link type="text/css" href="../framework/jquery-ui/css/fv/jquery-ui-1.8.8.custom.css" rel="stylesheet" />	
	<script type="text/javascript" src="../framework/jquery-ui/js/jquery-1.4.4.min.js"></script>
	<script type="text/javascript" src="../framework/jquery-ui/js/jquery-ui-1.8.7.custom.min.js"></script>
	<script type="text/javascript" src="./test.js">	</script>
</head>
<body>
		<div id="portal-top"></div>
		<div id="main-container">
			<div id="portal-divisor"></div>
	<h1>Test Unit per il parser di heading</h1>
	
	<p class="content">Il servizio prende in input una stringa della forma "Art 12 bis - Rubrica dell'articolo"  
	e restituisce un JSON con nome della parte, numero, decorazione, rubrica (eventualmente vuoti). Gestisce un elenco fisso di nomi di parti, numeri interi, lettere e numeri romani, e una varietà di separatori.</p> 

<table width="90%" align="center" border="1" cellspacing="0" cellpadding="5">
	<col width="50%" />
	<col width="50%" />
	<tr>
		<th width="50%">Examples</th>
		<th width="50%" >Result</th>
	</tr>
	<tr valign="top" height="250px" >
		<td>
			<div id="tabs">
				<ul>
					<li><a href="#tabs-1">English</a></li>
					<li><a href="#tabs-2">Italian</a></li>
					<li><a href="#tabs-3">Español</a></li>
				</ul>
				<div id="tabs-1">
					<ul id="examplesEng">
<?php require_once "english.php" ; echo $examples ; ?>
					</ul>
				</div>
				<div id="tabs-2">
					<ul id="examplesIta">
<?php require_once "italian.php" ; echo $examples ; ?>
					</ul>
				</div>
				<div id="tabs-3">
					<ul id="examplesEsp">
<?php require_once "espanol.php" ; echo $examples ; ?>
					</ul>
				</div>
	 		</div>
 		</td>
		<td><div id="result" class="code"></div></td>
	</tr>
	<tr>
		<th width="50%">Try it out</th>
		<th width="50%" >Corresponding Akoma Ntoso snippet</th>
	</tr>
	<tr height="90px" valign="top">
		<td>
			<p class="item content" style="text-align:center;">
				<textarea cols="50" rows="2" id="area">Paragraph 123 bis - Some text</textarea>
				<button onClick="show('area')" style="vertical-align:top;" id="parse">Parse</button>
			</p>
			<p class="buttons">
				<span id="language">
					<input type="radio" id="language2" name="language"  value="eng" checked="checked" /><label for="language2">English</label>
					<input type="radio" id="language1" name="language" value="ita"/><label for="language1">Italiano</label>
					<input type="radio" id="language3" name="language"  value="esp"/><label for="language3">Español</label>
				</span>
				<input type="checkbox" id="debug"  style="margin:0 40 0 40;"/><label for="debug">Debug</label>
				<span id="format">
					<input type="radio" id="format1" name="format" value="xml"/><label for="format1">XML</label>
					<input type="radio" id="format2" name="format"  value="json" checked="checked" /><label for="format2">Json</label>
				</span>
			</p>
		</td>
		<td><div id="akoma" class="code"></div></td>
	</tr>
</table>
<p class="content">Request format:</p>
<ul>
<li>GET http://www.site.com/dir/heading/?s=art+12+bis+-+Rubrica+dell'articolo</li>
<li>GET http://www.site.com/dir/heading/?s=art%2012%20bis%20-%20Rubrica%20dell'articolo</li>
</ul>

			<div class="copyright">
				<p class="content">The Heading service is a simple (and possibly incomplete) parser for 
					heading blocks. It was written by Fabio Vitali of the
					University of Bologna (contact: <a href="mailto:fabio@cs.unibo.it">fabio@cs.unibo.it</a>).</p>
				<p class="content">The current release is
					version <span id='version'>1.0</span>
					(<span id='version-date'>14 June 2012</span>).</p>
			</div>
		</div>
	</div>
</body>
</html>
