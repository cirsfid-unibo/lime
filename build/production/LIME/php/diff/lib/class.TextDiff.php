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
/*

class.Diff.php

A class containing a diff implementation

Created by Stephen Morley - http://stephenmorley.org/ - and released under the
terms of the CC0 1.0 Universal legal code:

http://creativecommons.org/publicdomain/zero/1.0/legalcode
  
modified by Francesco Draicchio <fdraicchio@gmail.com>
  
*/

require_once('class.Diff.php');

class TextDiff extends Diff {

  public static function toTable($diff, $indentation = '', $separator = '<br>'){

    // initialise the HTML
    $html = $indentation . "<table class=\"diff\">\n";

    // loop over the lines in the diff
    $index = 0;
    while ($index < count($diff)){

      // determine the line type
      switch ($diff[$index][1]){

        // display the content on the left and right
        case self::UNMODIFIED:
          $leftCell =
              self::getCellContent(
                  $diff, $indentation, $separator, $index, self::UNMODIFIED);
          $rightCell = $leftCell;
          break;

        // display the deleted on the left and inserted content on the right
        case self::DELETED:
          $leftCell =
              self::getCellContent(
                  $diff, $indentation, $separator, $index, self::DELETED);
          $rightCell =
              self::getCellContent(
                  $diff, $indentation, $separator, $index, self::INSERTED);
          break;

        // display the inserted content on the right
        case self::INSERTED:
          $leftCell = '';
          $rightCell =
              self::getCellContent(
                  $diff, $indentation, $separator, $index, self::INSERTED);
          break;

      }

      // extend the HTML with the new row
      $html .=
          $indentation
          . "  <tr>\n"
          . $indentation
          . '    <td class="diff'
          . ($leftCell == $rightCell
              ? 'Unmodified'
              : ($leftCell == '' ? 'Blank' : 'Deleted'))
          . '">'
          . $leftCell
          . "</td>\n"
          . $indentation
          . '    <td class="diff'
          . ($leftCell == $rightCell
              ? 'Unmodified'
              : ($rightCell == '' ? 'Blank' : 'Inserted'))
          . '">'
          . $rightCell
          . "</td>\n"
          . $indentation
          . "  </tr>\n";

    }

    // return the HTML
    return $html . $indentation . "</table>\n";

  }

  /* Returns the content of the cell, for use in the toTable function. The
   * parameters are:
   *
   * $diff        - the diff array
   * $indentation - indentation to add to every line of the generated HTML
   * $separator   - the separator between lines
   * $index       - the current index, passes by reference
   * $type        - the type of line
   */
  private static function getCellContent(
      $diff, $indentation, $separator, &$index, $type){

    // initialise the HTML
    $html = '';

    // loop over the matching lines, adding them to the HTML
    while ($index < count($diff) && $diff[$index][1] == $type){
      $html .=
          htmlspecialchars($diff[$index][0])
          . $separator;
      $index ++;
    }

    // return the HTML
    return $html;

  }		
}

?>
