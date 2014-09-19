<xsl:stylesheet version="1.0" 
 xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
 <xsl:output omit-xml-declaration="yes"
  doctype-public="-//ABISOURCE//DTD XHTML plus AWML 2.2//EN"
  doctype-system="http://www.abisource.com/2004/xhtml-awml/xhtml-awml.mod" encoding="UTF-8"/>
 <xsl:strip-space elements="*"/>
 
 <xsl:template match="/">
  <xsl:apply-templates select="//*[name()='body']"/> 
 </xsl:template>
 
 <xsl:template match="*[name()='body']">
   <xsl:apply-templates />
 </xsl:template>

 <xsl:template match="*[name()='br']">
  <br/>
 </xsl:template>
 
 <xsl:template match="*[not(name()='a') and not(name()='body') and not(name()='br')]">
  <xsl:if test="not(.='')">
   <xsl:element name="{name()}">
    <xsl:for-each select="@*[not(name() = 'class') and 
                             not(name() = 'style') and 
                             not(name() = 'lang') and
                             not(name() = 'xml:lang') and 
                             not(name() = 'dir') and 
                             not(contains(name(), 'awml'))]">
     <xsl:attribute name="{name()}">
      <xsl:value-of select="."/>
     </xsl:attribute>
    </xsl:for-each>
    <xsl:apply-templates />
   </xsl:element>
  </xsl:if>
 </xsl:template>
</xsl:stylesheet>