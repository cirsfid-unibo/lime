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
global $day,$year;
$monthsNames = array(
	"enero",
	"febrero",
	"marzo",
	"abril",
	"mayo",
	"junio",
	"julio",
	"agosto",
	"septiembre|setiembre",
	"octubre",
	"noviembre",
	"diciembre"
);
/*
$monthsNamesExceptions = array(
	9 =>  "setiembre"
);
*/
$months = implode("|",$monthsNames);

$localpatterns = array( 
	"month-name day de year"=> "/(?P<month>$months)\s(?P<day>$day)\sde\s(?P<year>$year)/i",
	"day de month-name de year"=> "/(?P<day>$day)\sde\s(?P<month>$months)\sde\s(?P<year>$year)/i"
) ;
$examples = <<<END
	<li>- En virtud de lo dispuesto en los artÍculos 1º y 2º de la presente ley:

A) Toda intervención judicial que haya sido interrumpida, suspendida y/o archivada por aplicación de la Ley Nº 15.848, de 22 de diciembre de 1986, continuará de oficio, por la mera solicitud del interesado o del Ministerio Público y no se podrá invocar la validez de dicha ley ni de actos administrativos que se hubieran dictado en su aplicación, con el fin de obstaculizar, impedir o archivar, o mantener suspendidas y/o archivadas, indagatorias o acciones penales.

B) Sin perjuicio de los delitos imprescriptibles, cuando se tratara de delitos de naturaleza prescriptibles, hayan o no sido incluidos en la caducidad establecida en el artÍculo 1º de la Ley Nº 15.848, de 22 de diciembre de 1986, no se computará en ningún caso para el tÉrmino de prescripción, el comprendido entre el 22 de diciembre de 1986 y la fecha de promulgación de la presente ley.</li>
END;

?>
