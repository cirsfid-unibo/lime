var idStr = {
	"clause": "cla" ,
	"section": "sec" ,
	"part": "prt" ,
	"paragraph": "par" ,
	"chapter": "chp" ,
	"title": "tit" ,
	"article": "art" ,
	"book": "bok" ,
	"tome": "tom" ,
	"division": "div" ,
	"list": "lst" ,
	"point": "pnt" ,
	"indent": "ind" ,
	"alinea": "aln" ,
	"subsection": "ssc" ,
	"subpart": "spt" ,
	"subparagraph": "spa" ,
	"subchapter": "sch" ,
	"subtitle": "stt" ,
	"subclause": "scl" ,
	"sublist": "sls" 
}
var	pattern = "<$part id='$id'>\n\t<num>$num</num>\n\t<heading>$heading</heading>\n\t<content>...</content>\n</$part>\n"
var serviceURI = "index.php?s=xxx&l=yyy&f=zzz"

		$(function(){
						$('#tabs').tabs();
						$( "#language" ).buttonset();
						$( "#format" ).buttonset();
						$( "#debug" ).button();
						$( "#parse" ).button();
		}) ;	

		$(document).ready(function(){
			$('#examplesEng li').each(function(index) {
				var id = '"exEng'+index+'"'
				$(this).html("<a id="+id+" href='javascript:show("+id+",\"eng\")'>"+$(this).html()+"</a>")			
			})
			$('#examplesIta li').each(function(index) {
				var id = '"exIta'+index+'"'
				$(this).html("<a id="+id+" href='javascript:show("+id+",\"ita\")'>"+$(this).html()+"</a>")			
			})
			$('#examplesEsp li').each(function(index) {
				var id = '"exEsp'+index+'"'
				$(this).html("<a id="+id+" href='javascript:show("+id+",\"esp\")'>"+$(this).html()+"</a>")			
			})
		})

		function show(x,l) {
			t = $("#"+x).val()!=""?$("#"+x).val():$("#"+x).text()
			if (l==undefined) l=$('input[name="language"]:checked').val()
			f=$('input[name="format"]:checked').val()
			d=$('#debug').is(":checked")
			$.ajax({ 
				url: serviceURI.replace("xxx",encodeURI(t)).replace("yyy",l).replace("zzz",f)+(d?"&debug":"") ,
				success: function(data,r,s) { 
					update(data)
				},
				error: function(r) { 
					alert("Error "+r.status+" on resource '"+this.url+"':\n\n"+r.statusText); 
				}
			})
		}
		
		function update(j) {
			if (j.indexOf("<?xml") == 0) {
				$("#result").text(j)
			} else {
				r = jQuery.parseJSON(j)
				$("#result").text(JSON.stringify(r, undefined, 2))
				$("#akoma").text(akoma(r.response))
			}
		}

		function fillTemplate(t,v) {
			p = t
			for (x in v) {
				p = p.replace(new RegExp("\\$"+x,"ig"),v[x])
			}
			return p
		}		

		function akoma(r) {
			if (r.numString!="") {
				if (r.part == undefined || r.part=="") 
					if (r.numType=='number')
						r.part = 'clause'
					else
						r.part = 'point'
				r.id =  [idStr[r.part],r.numValue,r.decoration].join("")
				r.num = $.trim([r.partString,r.numString,r.decoration].join(" "))
				if (r.heading == undefined) r.heading=""
				return fillTemplate(pattern,r)
			} else 
				return ""
		}
