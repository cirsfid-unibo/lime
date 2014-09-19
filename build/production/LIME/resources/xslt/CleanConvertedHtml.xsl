<xsl:stylesheet version="1.0" 
 xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
 <xsl:output omit-xml-declaration="yes"
  doctype-public="-//ABISOURCE//DTD XHTML plus AWML 2.2//EN"
  doctype-system="http://www.abisource.com/2004/xhtml-awml/xhtml-awml.mod" encoding="UTF-8"/>
 <xsl:strip-space elements="*"/>
 
 <xsl:template match="/">
  <xsl:choose>
   <xsl:when test="//*[@id = 'main']">
    <xsl:apply-templates select="//*[@id = 'main']"/>
   </xsl:when>
   <xsl:otherwise>
    <xsl:apply-templates select="//*[name()='body']"/>
   </xsl:otherwise>
  </xsl:choose>
 </xsl:template>
 
 <xsl:template match="*[name()='body']">
   <xsl:apply-templates />
 </xsl:template>
 
 <xsl:template match="*[@id = 'main']">
  <xsl:apply-templates />
 </xsl:template>

 <xsl:template match="*[name()='br']">
  <br/>
 </xsl:template>
 
 <xsl:template match="*[name()='p']">
  <xsl:apply-templates />
  <br/>
 </xsl:template>
 
 <xsl:template match="*[not(name()='a') and not(name()='body') and not(name()='br') and not(name()='p')]">
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