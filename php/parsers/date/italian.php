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
global $day,$year,$num_month,$date_sep;
$monthsNames = array(
	"gennaio",
	"febbraio",
	"marzo",
	"aprile",
	"maggio",
	"giugno",
	"luglio",
	"agosto",
	"settembre",
	"ottobre",
	"novembre",
	"dicembre"
);

$localpatterns = array(
	"dd mm yyyy" => "/(?P<day>$day)\s*$date_sep\s*(?P<month>$num_month)\s*$date_sep\s*(?P<year>$year)/i",
	"pubblicazione"    => "/(?:(?P<name>GU) n\.(?P<number>\d+) del )(?P<date_match>(?P<day>$day)\s*$date_sep\s*(?P<month>$num_month)\s*$date_sep\s*(?P<year>$year))/i",
    "vigenza"    => "/(?<=Vigente al: )(?P<day>$day)\s*$date_sep\s*(?P<month>$num_month)\s*$date_sep\s*(?P<year>$year)/i",
) ;


$examples = <<<END
	<li>28 giugno 2012</li>
	<li>28 Maggio 2012</li>
	<li>Delle date.. 28 giugno 2012   28 maggio 2012    aprile, 12, 2012</li>
	<li>17-03-2000</li>
	<li>Agosto 12, 2012</li>
	<li>Agosto 2012, 12</li>
	<li>Agosto 2012 12</li>
	<li>Agosto 12 2012</li>
	<li>12 Agosto, 2012</li>
	<li>Riconosce molte date insieme Agosto 12, 2012  dopo Agosto 2012, 12 e anche Agosto 2012 12 poi 12 Agosto, 2012</li>
END;

?>