<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
	xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0/WD17"
	xmlns:uy="http://uruguay/propetary.xsd" version="1.0">

	<xsl:template match="uy:*">
	        <div class="{name()}">
	            <xsl:apply-templates/>
	        </div>
	</xsl:template>

	<xsl:template match="*[local-name(.) = 'div' and substring-before(./@class,':') = 'uy']">
        <xsl:element name="{@class}">
       		<xsl:apply-templates />
		</xsl:element>
	</xsl:template>
	
	<xsl:template match="div[contains(@class,'meta')]//div[@class = 'textualMod']/div[@class = 'old']">
		<xsl:element name="old">
			<xsl:apply-templates select="@*" mode="aknPrefixAttributes" />
	    	<xsl:apply-templates select="@*[not(name() =  'class')]" mode="notAknPrefixAttributes" />
	        <uy:text>
	            <xsl:value-of select="normalize-space(./text())"/>
	        </uy:text>
	        <xsl:call-template name="addBefore"/>
	        <xsl:call-template name="addAfter"/>
    	</xsl:element>
    </xsl:template>
    <xsl:template name="addBefore">
    	<xsl:if test="./div[@class='before']">
	        <uy:before>
	            <xsl:value-of select="./div[@class='before']"/>
	        </uy:before>
        </xsl:if>
    </xsl:template>
    <xsl:template name="addAfter">
    	<xsl:if test="./div[@class='after']">
	        <uy:after>
	            <xsl:value-of select="./div[@class='after']"/>
	        </uy:after>
        </xsl:if>
    </xsl:template>

</xsl:stylesheet>