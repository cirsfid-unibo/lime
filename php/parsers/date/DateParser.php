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

class DateParser {
    
    public $lang;
    private $patterns = array();
    private $monthsNames = array();
    private $dates = array();
    
    public function __construct($lang) {
        $this->lang = $lang;
        $this->dirName = dirname(__FILE__);
        $this->dates = array();

        $this->loadConfiguration($lang);
    }

    public function parse($content, $jsonOutput = FALSE) {
        $return = array();
        $preg_result = array();
        $element = array();
        $dates = array();
        foreach ($this->patterns as $key => $value) {
            $success = preg_match_all($value, $content, $n, PREG_OFFSET_CAPTURE);
            if ($success) {
                $preg_result[] = $n;
                $element[] = $key;
                /*To avoid another pattern match with the same string remove it*/
                //$content = preg_replace($value, "", $content);
            }
        }

        if (isset($preg_result[0])) {
            //if exist the  first of result than success
            $return['dates'] = array();
            foreach ($preg_result as $key => $n) {
                $counter = array();
                foreach ($n["0"] as $k => $value) {
                    $offset = $n["0"][$k][1];
                    $match = $n["0"][$k][0];
                    $offsetEnd = $offset+strlen($match);
                    // Skip imcomplete or already saved matches
                    if(!$this->isValidMatch($match, $offset, $offsetEnd)) {
                        continue;
                    }
                    if (!isset($counter[$match]))
                        $counter[$match] = 0;
                    $counter[$match]++;
                    if (!isset($return['dates'][$match]))
                        $return['dates'][$match] = array();
                    if (!isset($return['dates'][$match]["offsets"]))
                        $return['dates'][$match]["offsets"] = array();
                    $return['dates'][$match]["offsets"][] = Array("start" => $offset,
                                                                  "end" => $offsetEnd);

                    $this->dates[] = Array("start" => $offset, "end" => $offsetEnd, "match"=> $match);

                    if ($counter[$match] == 1) {
                        $return['dates'][$match]['rule'] = $element[$key];
                        $return['dates'][$match]['match'] = $match;
                        /*if ($debug) {
                            $return['dates'][$match]['pattern'] = $this->patterns[$element[$key]];
                        }*/
                        if (isset($n['day'][$k][0])) {
                            $tmp_day = $n['day'][$k][0];
                        }
                        if (isset($n['month'][$k][0])) {
                            $tmp_month = $n['month'][$k][0];
                            if (!is_numeric($tmp_month)) {
                                $mouthNumber = (array_search(strtolower($tmp_month), $this->monthsNames));
                                /* check if the case is a month with multiple different names */
                                if ($mouthNumber === FALSE) {
                                    for ($i = 0; $i < count($this->monthsNames); $i++) {
                                        if (stristr($this->monthsNames[$i], $tmp_month) !== FALSE) {
                                            $mouthNumber = $i;
                                            break;
                                        }
                                    }
                                }
                                $tmp_month = $mouthNumber + 1;
                            }
                        }
                        if (isset($n['year'][$k][0])) {
                            $tmp_year = $n['year'][$k][0];
                        }
                        /* Relax the rule, a date without day is ok, we assume that the day is the first day */
                        if (!$tmp_day) {
                            $tmp_day = "1";
                        }
                        if ($tmp_month && $tmp_year) {
                            $return['dates'][$match]['day'] = $tmp_day;
                            $return['dates'][$match]['month'] = $n['month'][$k][0];
                            $return['dates'][$match]['year'] = $n['year'][$k][0];

                            if (!checkdate($tmp_month, $tmp_day, $tmp_year)) {
                                $return['dates'][$match]['date'] = "invalid date";
                            } else {
                                $datetime = new DateTime($tmp_year . "/" . $tmp_month . "/" . $tmp_day);
                                $return['dates'][$match]['date'] = $datetime -> format('Y-m-d');
                            }
                        }
                    }
                    $return['dates'][$match]['counter'] = $counter[$match];

                }

            }
        }

        $ret = array("response" => $return);
        if($jsonOutput) {
            return json_encode($ret);    
        } else {
            return $ret;
        }
        
    }

    private function isValidMatch($match, $start, $end) {
        $dates = array_filter($this->dates, function($date) use ($match, $start, $end)  {
            return ((strpos($date["match"], $match) || strpos($match, $date["match"]))
                    && $date["start"] <= $start && $date["end"] >= $end 
                    && !($date["start"] == $start && $date["end"] == $end));
        });
     
        return empty($dates);
    }

    public function loadConfiguration() {
        global $patterns, $monthsNames;
        global $day,$year,$num_month,$date_sep;
        $vocs = array("ita" => "italian.php", 
                      "eng" => "english.php", 
                      "esp" => "espanol.php", 
                      "spa" => "espanol.php",);
        
        $day = "(\d){1,2}";
        $year = "(\d){4}";
        $num_month = "(\d){1,2}";
        $date_sep = "(?:\\\\|\\/|-|\.)";

        // It's important to use "require" and not "require_once"
        require realpath($this->dirName."/standard.php");
        if (isset($vocs[$this->lang])) {
            require realpath($this->dirName."/".$vocs[$this->lang]);
        }

        $months = implode("|", $monthsNames);
        $patterns = array("(day) month-name year" => "/((?P<day>$day)(\s*°)?\W?\s+)?(?P<month>$months)\W?\s+(?P<year>$year)/i", 
                    "month-name (day) year" => "/(?P<month>$months)\W?\s+((?P<day>$day)\W?\s+)?(?P<year>$year)/i", 
                    "month-name year (day)" => "/(?P<month>$months)\W?\s+(?P<year>$year)(\W?\s+(?P<day>$day))?/i");

        if (isset($localpatterns)) {
            $patterns = array_merge($localpatterns, $patterns);
        }
        $this->patterns = $patterns;
        $this->monthsNames = $monthsNames;
    }
}

?>