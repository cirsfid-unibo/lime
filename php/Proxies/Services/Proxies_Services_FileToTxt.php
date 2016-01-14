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

require_once('utils.php');

class Proxies_Services_FileToTxt implements Proxies_Services_Interface
{
	private $_filePath;
	private $_fileSize;
	private $_fileName;

	/**
	 * The constructor of the service
	 * @return the service object
	 * @param Array the params that are passed to the service
	 */
	public function __construct($params)
	{
		if (isset($_FILES['file'])
	        && $_FILES['file']['error'] == UPLOAD_ERR_OK               //checks for errors
		    && is_uploaded_file($_FILES['file']['tmp_name'])) { //checks that file is uploaded
		  		$this->_filePath = $_FILES['file']['tmp_name'];
				$this->_fileName = $_FILES['file']['name'];
				$this->_fileSize = $_FILES['file']['size'];
		}
	}

	/**
	 * this method is used to retrive the result by the service
	 * @return The result that the service computed
	 */
	public function getResults()
	{
		$output = Array(
			"success" => false
		);
		if (isset($this->_filePath) && isset($this->_fileSize)) {
			$fileType = $this->getFileType();
            // Check if the type of the given document is supported
			if ($this->isTypeAllowed($fileType)) {
				$tmpDir = dirname($this->_filePath);
				$fileName = "conv_".basename($this->_filePath);
				$filePath = tempnam($tmpDir, "cnv");
				$cmd = ABIWORD_PATH.' --to=txt '.$this->_filePath.' -o '.$filePath;
				exec($cmd);
				$output['content'] = file_get_contents($filePath);
				if ( strlen($output['content']) != 0 ) {
					$output['success'] = true;
				}
				unlink($filePath);
			} else
				$output['content'] = $fileType." files are not supported";
		}

		if(array_key_exists('content', $output) && strlen($output['content'])) {
			$lang = detectLanguage($output['content'], 3);
			if($lang) {
				$output['language'] = $lang;
			}
		}
		return str_replace('\/','/',json_encode($output));
	}

	private function isTypeAllowed($mime) {
		$allowedTypes = array("text/html", "application/msword", "application/pdf", "application/vnd.oasis.opendocument.text", "text/plain",
							   "application/rtf","text/rtf","application/vnd.ms-office", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
		$docxExtension = ".docx";
		$fileExtension = (false === $pos = strrpos($this->_fileName, '.')) ? '' : substr($this->_fileName, $pos);

		if ($mime === "application/zip" && $fileExtension==$docxExtension) {
			return true;
		}

		return in_array($mime, $allowedTypes);
	}

	private function getFileType() {
		$finfo = finfo_open(FILEINFO_MIME_TYPE);
		return finfo_file($finfo, $this->_filePath);
	}
}
?>
