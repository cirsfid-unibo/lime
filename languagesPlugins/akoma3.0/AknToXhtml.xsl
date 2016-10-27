<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xml="http://www.w3.org/XML/1998/namespace"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:akn="http://docs.oasis-open.org/legaldocml/ns/akn/3.0/WD17"
    exclude-result-prefixes="xs"
    version="1.0">
    <xsl:output method="xml" indent="yes" encoding="UTF-8" />

    <xsl:template match="/">
    		<xsl:apply-templates />
    </xsl:template>

    <xsl:template match="*[local-name()='akomaNtoso']">
    	<div>
        	<xsl:apply-templates />
    	</div>
    </xsl:template>

	<!-- ATTRIBUTE'S GENERIC TEMPLATE -->
	<xsl:template mode="elementAttributes" match="@*" >
    	<xsl:choose>
    		<xsl:when test="not(starts-with(local-name(.),'xml'))">
    			<xsl:variable name="attName" select="concat('akn_',local-name(.))"/>
    			<xsl:attribute name="{$attName}">
    				<xsl:value-of select="." />
    			</xsl:attribute>
    		</xsl:when>
    		<xsl:otherwise>
    			<xsl:attribute name="{local-name(.)}">
    				<xsl:value-of select="." />
    			</xsl:attribute>
    		</xsl:otherwise>
    	</xsl:choose>
    </xsl:template>

	<!-- UNDEFINED ATTRIBUTE'S GENERIC TEMPLATE -->
	<xsl:template mode="undefinedElementAttributes" match="@*" >
			<xsl:choose>
	    		<xsl:when test="local-name(.) = 'currentId' or local-name(.) = 'currentid' or local-name(.) = 'href' or local-name(.) = 'showAs' or local-name(.) = 'showas'">
	    			<xsl:variable name="attName" select="concat('akn_',local-name(.))"/>
	    			<xsl:attribute name="{$attName}">
	    				<xsl:value-of select="." />
	    			</xsl:attribute>
	    		</xsl:when>
	    		<xsl:otherwise>
	    			<xsl:attribute name="{local-name(.)}">
	    				<xsl:value-of select="." />
	    			</xsl:attribute>
	    		</xsl:otherwise>
	    	</xsl:choose>
	</xsl:template>


	<!--<xsl:template match="*[not(local-name(.)='akomaNtoso')]">
	        <div>
	        	<xsl:attribute name="class">
		         	<xsl:value-of select="local-name(.)" />
		         </xsl:attribute>
		         <xsl:attribute name="internalid">
		         	<xsl:value-of select="local-name(.)" />
		         </xsl:attribute>

	        	 ATTRIBUTE'S GENERIC TEMPLATE
	        	<xsl:apply-templates select="@*" mode="elementAttributes" />
	            <xsl:apply-templates />
	        </div>
	</xsl:template> -->

	<!-- Document type -->
	<xsl:template match="*[local-name()='bill'] |
		*[local-name()='act'] |
		*[local-name()='doc'] |
		*[local-name()='judgement'] |
		*[local-name()='judgment'] |
		*[local-name()='documentCollection'] |
		*[local-name()='amendmentList'] |
		*[local-name()='amendment'] |
		*[local-name()='debateReport'] |
		*[local-name()='officialGazette'] |
		*[local-name()='statement'] |
		*[local-name()='debate']">
		<div>
			<xsl:attribute name="class">
				<xsl:value-of select="concat('document ',local-name(.))" />
			</xsl:attribute>

			<!-- ATTRIBUTE'S GENERIC TEMPLATE -->
			<xsl:apply-templates select="@*" mode="elementAttributes" />
			<xsl:apply-templates/>
		</div>
	</xsl:template>

	<!-- Container elements xml-->
	<xsl:template match="*[local-name()='blockList'] |
					     *[local-name()='blockContainer'] |
					     *[local-name()='intro'] |
					     *[local-name()='wrap'] |
					     *[local-name()='tblock'] |
					     *[local-name()='toc'] |
					     *[local-name()='foreign'] |
					     *[local-name()='coverPage'] |
					     *[local-name()='container'] |
					     *[local-name()='preface'] |
					     *[local-name()='preamble'] |
					     *[local-name()='recital'] |
					     *[local-name()='citation'] |
					     *[local-name()='conclusions'] |
					     *[local-name()='administrationOfOath'] |
					     *[local-name()='speechGroup'] |
					     *[local-name()='speech'] |
					     *[local-name()='question'] |
					     *[local-name()='answer'] |
					     *[local-name()='body'] |
					     *[local-name()='formula'] |
					     *[local-name()='mainBody'] |
 						*[local-name()='judgementBody'] |
 						*[local-name()='judgmentBody'] |
					     *[local-name()='amendmentHeading'] |
						 *[local-name()='amendmentContent'] |
						 *[local-name()='amendmentReference'] |
						 *[local-name()='header'] |
						 *[local-name()='amendmentJustification'] |
						 *[local-name()='introduction'] |
						 *[local-name()='background'] |
					     *[local-name()='collectionBody'] |
					     *[local-name()='component'] |
						 *[local-name()='arguments'] |
						 *[local-name()='remedias'] |
						 *[local-name()='motivation'] |
						 *[local-name()='decision'] |
						 *[local-name()='components'] |
						 *[local-name()='fragmentBody']
						">
	        <div>
	        	<xsl:attribute name="class">
		         	<xsl:value-of select="concat('container ',local-name(.))" />
		         </xsl:attribute>
		         <xsl:attribute name="internalid">
		         	<xsl:value-of select="local-name(.)" />
		         </xsl:attribute>

	        	<!-- ATTRIBUTE'S GENERIC TEMPLATE -->
	        	<xsl:apply-templates select="@*" mode="elementAttributes" />
	        	<xsl:apply-templates />
	        </div>
	</xsl:template>

	<!-- Block elements -->
	<xsl:template match="*[local-name()='block'] |
						*[local-name()='longTitle'] |
						*[local-name()='p'] |
						*[local-name()='interstitial'] |
						*[local-name()='other'] |
						*[local-name()='wrapUp']">
	        <div>
	        	<xsl:attribute name="class">
		         	<xsl:value-of select="concat('block ',local-name(.))" />
		         </xsl:attribute>
		         <xsl:attribute name="internalid">
		         	<xsl:value-of select="local-name(.)" />
		         </xsl:attribute>

	        	<!-- ATTRIBUTE'S GENERIC TEMPLATE -->
	        	<xsl:apply-templates select="@*" mode="elementAttributes" />
	        	<xsl:apply-templates />
	        </div>
	</xsl:template>

	<!-- Marker elements -->
	<xsl:template match="*[local-name()='noteRef'] |
						 *[local-name()='eop'] |
						 *[local-name()='marker']
						">
	        <span>
	        	<xsl:attribute name="class">
		         	<xsl:value-of select="concat('marker ',local-name(.))" />
		         </xsl:attribute>
		         <xsl:attribute name="internalid">
		         	<xsl:value-of select="local-name(.)" />
		         </xsl:attribute>

	        	<!-- ATTRIBUTE'S GENERIC TEMPLATE -->
	        	<xsl:apply-templates select="@*" mode="elementAttributes" />
	        	<xsl:apply-templates />
	        </span>
	</xsl:template>

	<xsl:template match="*[local-name()='eol']">
	        <br>
	        	<!-- ATTRIBUTE'S GENERIC TEMPLATE -->
	        	<xsl:apply-templates select="@*" mode="elementAttributes" />
	        	<xsl:apply-templates />
	        </br>
	</xsl:template>

	<!-- Popup elements -->
	<xsl:template match="*[local-name()='quotedStructure'] |
						 *[local-name()='authorialNote']">
			<div>
	        	<xsl:attribute name="class">
		         	<xsl:value-of select="concat('popup ',local-name(.))" />
		         </xsl:attribute>
		         <xsl:attribute name="internalid">
		         	<xsl:value-of select="local-name(.)" />
		         </xsl:attribute>

	        	<!-- ATTRIBUTE'S GENERIC TEMPLATE -->
	        	<xsl:apply-templates select="@*" mode="elementAttributes" />
	        	<xsl:apply-templates />
	        </div>
	</xsl:template>

	<!-- Mod elements -->
	<xsl:template match="*[local-name()='mod']">
			<div>
	        	<xsl:attribute name="class">
		         	<xsl:value-of select="concat('inline ',local-name(.))" />
		         </xsl:attribute>
		         <xsl:attribute name="internalid">
		         	<xsl:value-of select="local-name(.)" />
		         </xsl:attribute>

	        	<!-- ATTRIBUTE'S GENERIC TEMPLATE -->
	        	<xsl:apply-templates select="@*" mode="elementAttributes" />
	        	<xsl:apply-templates />
	        </div>
	</xsl:template>


	<!-- Hcontainer elements -->
	<xsl:template match="*[local-name()='clause'] |
						*[local-name()='recitals'] |
						*[local-name()='citations'] |
						*[local-name()='item'] |
						*[local-name()='hcontainer'] |
						*[local-name()='rollCall'] |
						*[local-name()='pryers'] |
						*[local-name()='oralStatements'] |
						*[local-name()='writtenStatements'] |
						*[local-name()='personalStatements'] |
						*[local-name()='ministerialStatements'] |
						*[local-name()='resolutions'] |
						*[local-name()='nationalInterest'] |
						*[local-name()='declarationOfVote'] |
						*[local-name()='comunication'] |
						*[local-name()='petitions'] |
						*[local-name()='papers'] |
						*[local-name()='noticesOfMotion'] |
						*[local-name()='questions'] |
						*[local-name()='address'] |
						*[local-name()='proceduralMotions'] |
						*[local-name()='pointOfOrder'] |
						*[local-name()='adjournement'] |
						*[local-name()='debateSection'] |
						*[local-name()='section'] |
						*[local-name()='part'] |
						*[local-name()='paragraph'] |
						*[local-name()='chapter'] |
						*[local-name()='title'] |
						*[local-name()='article'] |
						*[local-name()='book'] |
						*[local-name()='tome'] |
						*[local-name()='division'] |
						*[local-name()='list'] |
						*[local-name()='point'] |
						*[local-name()='indent'] |
						*[local-name()='alinea'] |
						*[local-name()='rule'] |
						*[local-name()='subrule'] |
						*[local-name()='proviso'] |
						*[local-name()='subsection'] |
						*[local-name()='subpart'] |
						*[local-name()='subparagraph'] |
						*[local-name()='subchapter'] |
						*[local-name()='subtitle'] |
						*[local-name()='subdivision'] |
						*[local-name()='subclause'] |
						*[local-name()='sublist'] |
						*[local-name()='transitional']
						">
	        <div>
	        	<xsl:attribute name="class">
		         	<xsl:value-of select="concat('hcontainer ',local-name(.))" />
		         </xsl:attribute>
		         <xsl:attribute name="internalid">
		         	<xsl:value-of select="local-name(.)" />
		         </xsl:attribute>

	        	<!-- ATTRIBUTE'S GENERIC TEMPLATE -->
	        	<xsl:apply-templates select="@*" mode="elementAttributes" />
	        	<xsl:apply-templates />
	        </div>
	</xsl:template>

	<!-- Undefined elements -->
	<xsl:template match="*[local-name()='amendmentList'] |
						*[local-name()='meta'] |
						*[local-name()='identification'] |
						*[local-name()='FRBRWork'] |
						*[local-name()='FRBRthis'] |
						*[local-name()='FRBRuri'] |
						*[local-name()='FRBRalias'] |
						*[local-name()='FRBRdate'] |
						*[local-name()='FRBRauthor'] |
						*[local-name()='componentInfo'] |
						*[local-name()='componentData'] |
						*[local-name()='preservation'] |
						*[local-name()='FRBRcountry'] |
						*[local-name()='FRBRsubtype'] |
						*[local-name()='FRBRnumber'] |
						*[local-name()='FRBRname'] |
						*[local-name()='FRBRprescriptive'] |
						*[local-name()='FRBRauthoritative'] |
						*[local-name()='FRBRExpression'] |
						*[local-name()='FRBRlanguage'] |
						*[local-name()='FRBRtranslation'] |
						*[local-name()='FRBRManifestation'] |
						*[local-name()='FRBRformat'] |
						*[local-name()='FRBRItem'] |
						*[local-name()='publication'] |
						*[local-name()='classification'] |
						*[local-name()='keyword'] |
						*[local-name()='lifecycle'] |
						*[local-name()='eventRef'] |
						*[local-name()='workflow'] |
						*[local-name()='step'] |
						*[local-name()='analysis'] |
						*[local-name()='activeModifications'] |
						*[local-name()='textualMod'] |
						*[local-name()='source'] |
						*[local-name()='destination'] |
						*[local-name()='force'] |
						*[local-name()='efficacy'] |
						*[local-name()='application'] |
						*[local-name()='duration'] |
						*[local-name()='condition'] |
						*[local-name()='old'] |
						*[local-name()='new'] |
						*[local-name()='meaningMod'] |
						*[local-name()='domain'] |
						*[local-name()='scopeMod'] |
						*[local-name()='forceMod'] |
						*[local-name()='efficacyMod'] |
						*[local-name()='legalSystemMod'] |
						*[local-name()='passiveModifications'] |
						*[local-name()='judicial'] |
						*[local-name()='result'] |
						*[local-name()='supports'] |
						*[local-name()='isAnalogTo'] |
						*[local-name()='applies'] |
						*[local-name()='extends'] |
						*[local-name()='restricts'] |
						*[local-name()='derogates'] |
						*[local-name()='contrasts'] |
						*[local-name()='overrules'] |
						*[local-name()='dissentsFrom'] |
						*[local-name()='putsInQuestion'] |
						*[local-name()='distingushes'] |
						*[local-name()='parliamentary'] |
						*[local-name()='quprumVerification'] |
						*[local-name()='quorum'] |
						*[local-name()='count'] |
						*[local-name()='voting'] |
						*[local-name()='recount'] |
						*[local-name()='otherAnalysis'] |
						*[local-name()='temporalData'] |
						*[local-name()='temporalGroup'] |
						*[local-name()='timeInterval'] |
						*[local-name()='renamberingInfo'] |
						*[local-name()='references'] |
						*[local-name()='original'] |
						*[local-name()='passiveRef'] |
						*[local-name()='activeRef'] |
						*[local-name()='jurisprudence'] |
						*[local-name()='hasAttachment'] |
						*[local-name()='attachmentOf'] |
						*[local-name()='TLCPerson'] |
						*[local-name()='TLCOrganization'] |
						*[local-name()='TLCConcept'] |
						*[local-name()='TCLObject'] |
						*[local-name()='TLCEvent'] |
						*[local-name()='TLCLocation'] |
						*[local-name()='TLCProcess'] |
						*[local-name()='TLCRole'] |
						*[local-name()='TLCTerm'] |
						*[local-name()='TLCReference'] |
						*[local-name()='notes'] |
						*[local-name()='note'] |
						*[local-name()='proprietary'] |
						*[local-name()='presentation'] |
						*[local-name()='attachments'] |
						*[local-name()='debateBody'] |
						*[local-name()='amendmentBody'] |
						*[local-name()='fragment'] |
						*[local-name()='embeddedStructure'] |
						*[local-name()='subFlow']
						">
	        <div>
	        	<xsl:attribute name="class">
		         	<xsl:value-of select="local-name(.)" />
		         </xsl:attribute>
		         <!-- <xsl:attribute name="internalid">
		         	<xsl:value-of select="local-name(.)" />
		       </xsl:attribute> -->

	        	<!-- UNDEFINED ATTRIBUTE'S GENERIC TEMPLATE -->
	        	<xsl:apply-templates select="@*" mode="undefinedElementAttributes" />
	        	<xsl:apply-templates />
	        </div>
	</xsl:template>

	<!-- Inline elements -->
	<xsl:template match="*[local-name()='listIntroduction'] |
						 *[local-name()='listConclusion'] |
						 *[local-name()='docDate'] |
						 *[local-name()='docNumber'] |
						 *[local-name()='docTitle'] |
						 *[local-name()='location'] |
						 *[local-name()='docType'] |
						 *[local-name()='heading'] |
						 *[local-name()='num'] |
						 *[local-name()='proponent'] |
						 *[local-name()='signature'] |
						 *[local-name()='role'] |
						 *[local-name()='person'] |
						 *[local-name()='quotedText'] |
						 *[local-name()='subheading'] |
						 *[local-name()='ref'] |
						 *[local-name()='mref'] |
						 *[local-name()='rref'] |
						 *[local-name()='date'] |
						 *[local-name()='time'] |
						 *[local-name()='organization'] |
						 *[local-name()='concept'] |
						 *[local-name()='object'] |
						 *[local-name()='event'] |
						 *[local-name()='process'] |
						 *[local-name()='from'] |
						 *[local-name()='term'] |
						 *[local-name()='quantity'] |
						 *[local-name()='def'] |
						 *[local-name()='entity'] |
						 *[local-name()='courtType'] |
						 *[local-name()='neutralCitation'] |
						 *[local-name()='party'] |
						 *[local-name()='judge'] |
						 *[local-name()='lower'] |
						 *[local-name()='scene'] |
						 *[local-name()='opinion'] |
						 *[local-name()='argument'] |
						 *[local-name()='affectedDocument'] |
						 *[local-name()='relatedDocument'] |
						 *[local-name()='change'] |
						 *[local-name()='inline'] |
						 *[local-name()='mmod'] |
						 *[local-name()='rmod'] |
						 *[local-name()='remark'] |
						 *[local-name()='recorderedTime'] |
						 *[local-name()='vote'] |
						 *[local-name()='outcome'] |
						 *[local-name()='ins'] |
						 *[local-name()='del'] |
						 *[local-name()='legislature'] |
						 *[local-name()='session'] |
						 *[local-name()='shortTitle'] |
						 *[local-name()='lawyer'] |
						 *[local-name()='docPurpose'] |
						 *[local-name()='docCommittee'] |
						 *[local-name()='docIntroducer'] |
						 *[local-name()='docAuthority'] |
						 *[local-name()='docStage'] |
						 *[local-name()='docStatus'] |
						 *[local-name()='docJurisdiction'] |
						 *[local-name()='docketNumber'] |
						 *[local-name()='placeholder'] |
						 *[local-name()='fillIn'] |
						 *[local-name()='decoration'] |
						 *[local-name()='docProponent'] |
						 *[local-name()='omissis'] |
						 *[local-name()='embeddedText'] |
						 *[local-name()='narrative'] |
						 *[local-name()='summery'] |
						 *[local-name()='tocItem']">
	        <span>
	        	<xsl:attribute name="class">
		         	<xsl:value-of select="concat('inline ',local-name(.))" />
		         </xsl:attribute>
		         <xsl:attribute name="internalid">
		         	<xsl:value-of select="local-name(.)" />
		         </xsl:attribute>

	        	<!-- ATTRIBUTE'S GENERIC TEMPLATE -->
	        	<xsl:apply-templates select="@*" mode="elementAttributes" />
	        	<xsl:apply-templates />
	        </span>
	</xsl:template>

	<xsl:template match="*[local-name()='componentRef']">
		<div>
			<xsl:attribute name="class">
				<xsl:value-of select="local-name(.)" />
			</xsl:attribute>
			<!-- UNDEFINED ATTRIBUTE'S GENERIC TEMPLATE -->
			<xsl:apply-templates select="@*" mode="elementAttributes" />
			<br></br>
		</div>
	</xsl:template>

	<xsl:template match="*[local-name()='documentRef']">
	        <xsl:variable name="idref" select="substring-after(@href,'#')" />
	        <xsl:variable name="uri" select="//*[local-name()='component'][@currentId=$idref or @eId=$idref]//*[local-name()='FRBRManifestation']//*[local-name()='FRBRthis']/@value"/>
	        <span>
	        	<xsl:attribute name="class">
		         	<xsl:value-of select="concat('inline ',local-name(.))" />
		         </xsl:attribute>
		         <xsl:attribute name="internalid">
		         	<xsl:value-of select="local-name(.)" />
		         </xsl:attribute>


	        	<!-- ATTRIBUTE'S GENERIC TEMPLATE -->
	        	<xsl:apply-templates select="@*" mode="elementAttributes" />
	        	<xsl:choose>
	        		<xsl:when test="$uri">
	        			<xsl:value-of select="$uri" />
	        		</xsl:when>
	        		<xsl:otherwise>
	        			<xsl:value-of select="' '" />
	        		</xsl:otherwise>
	        	</xsl:choose>
	        	<xsl:apply-templates />
	        </span>
	</xsl:template>

	<!-- Html elements -->
	<xsl:template match="*[local-name()='span'] |
						*[local-name()='a'] |
						*[local-name()='b'] |
						*[local-name()='i']|
						*[local-name()='u'] |
						*[local-name()='sub'] |
						*[local-name()='sup'] |
						*[local-name()='abbr'] |
						*[local-name()='br'] |
						*[local-name()='div'] |
						*[local-name()='img'] |
						*[local-name()='li'] |
						*[local-name()='ol'] |
						*[local-name()='ul'] |
						*[local-name()='table'] |
						*[local-name()='td'] |
						*[local-name()='th'] |
						*[local-name()='caption'] |
						*[local-name()='tr']">
	        <xsl:element name="{local-name(.)}">
	        	<!-- TODO: check the specific HTML elements attributes -->

	        	<!-- ATTRIBUTE'S GENERIC TEMPLATE -->
	        	<xsl:apply-templates select="@*" mode="undefinedElementAttributes" />

	        	<xsl:apply-templates />
    	</xsl:element>
	</xsl:template>

	<xsl:template match="*[local-name()='td'][count(./*)=1]/*[local-name()='p']">
		<xsl:apply-templates select="@*" mode="undefinedElementAttributes" />
		<xsl:apply-templates />
	</xsl:template>

    <!-- <xsl:template match="text()">
        <xsl:value-of select="normalize-space(.)"/>
    </xsl:template> -->

    <!-- Elements to remove -->
    <xsl:template match="content">
    		<xsl:apply-templates />
    </xsl:template>

    <xsl:template match="meta">
    	<div class="meta">
    		<xsl:apply-templates />
    	</div>
    </xsl:template>
</xsl:stylesheet>
