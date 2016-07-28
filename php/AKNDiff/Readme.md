# AKNDiff
AKNDiff is a web service which computes the difference of two AkomaNtoso documents based on *passiveModifications* metadata returning an HTML page as output showing the differences by highlighting the text and drawing arrows.

## How to use it

The service accepts HTTP GET requests.

Parameters:
 * **from**: the URL of the first document no matter if is the old or the new version, in the result it will be shown on the left.
 * **to**: the URL of the second document no matter if is the old or the new version, in the result it will be shown on the right.
 * [**edit**]: if setted, the passed URL will be included in the output.

Example:
```
http://localhost/AKNDiff/index.php?from=http://localhost/doc1.xml&to=http://localhost/doc2.xml
```

The output will be a HTML page containing a table with the first document on the left and the second on the right in which the differences between documents are highlighted. The service is maid to be included mainly in an *iframe* element, if opened directly in the browser it will prepare the page for printing.

## How it works

* Download the passed documents.
* Check if the documents are marked in AkomaNtoso.
* Determine the old and the new version by comparing these elements:
	* *FRBRExpression FRBRdate*
	* Number of *lifecycle* elements
	* If the elements before are equal, the *from* document is considered old and the *to* is the new one.
* Convert the documents in HTML.
* Fetch the modifications from the *passiveModifications* metadata element from the new version.
* Build a *table* element containing the documents, in which every first column contains an element from the *from* document and the second column from the *to* document.
* Apply the modifications on the *table* element, the managed modifications are:
	* insertion
	* substitution
	* repeal
	* renumbering
	* split
	* join

	This step is the most important, because here each modification is processed, the added or removed text is marked and the needed elements are found.
* Align the column trying to have the same element in the left and right columns.
* End of the server side, the output is an HTML page containing the built table.
* Draw arrows, on the clinet side, if there are renumbering, split or join modifications. 

