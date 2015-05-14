<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns="http://www.normeinrete.it/nir/2.0"  
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
                xmlns:xlink="http://www.w3.org/1999/xlink" 
                xmlns:h="http://www.w3.org/HTML/1998/html4" 
                xmlns:nir="http://www.normeinrete.it/nir/1.0"
                xmlns:disposizioni="http://www.normeinrete.it/nir/disposizioni/1.0"
                xmlns:dsp="http://www.normeinrete.it/nir/disposizioni/2.0"
                xmlns:cirsfid="http://www.cirsfid.unibo.it/norma/proprietario/"
                version="1.0" exclude-result-prefixes="xlink h dsp disposizioni xml">
    
    <xsl:output indent="yes" method="xml" />
    
    <xsl:template match="/">
        <xsl:apply-templates />
    </xsl:template>
    
    <xsl:template match="*" mode="attributesSelector">
        <xsl:for-each select="./@*[not(name(.)='xml:lang')]">
            <xsl:attribute name="{name(.)}">
                <xsl:value-of select="." />
            </xsl:attribute>
        </xsl:for-each>
    </xsl:template>
    
    
    
    <!-- 1) NIR ELEMENTS -->
    <!-- 1.1) THIS TRANSFORMS ALL THE ELEMENTS IN THE NAMESPACE NIR 2.0 TO THE SAME ELEMENTS BUT IN THE NAMESPACE NIR 2.2  -->
    <xsl:template match="nir:NIR">
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.0">
            <!--<xsl:namespace name="h" select="'http://www.w3.org/HTML/1998/html4'" />
            <xsl:namespace name="xlink" select="'http://www.w3.org/1999/xlink'" />-->
            <!--<xsl:namespace name="dsp" select="'http://www.normeinrete.it/nir/disposizioni/2.0'" /> -->
            <!--<xsl:namespace name="cirsfid" select="'http://www.cirsfid.unibo.it/norma/proprietario/'" /> -->
            <xsl:apply-templates mode="attributesSelector" select="." />
            <xsl:apply-templates />
        </xsl:element>
    </xsl:template>
    
    <xsl:template match="nir:*">
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.0">
            <xsl:for-each select="@*[not(name()='xml:lang')]">
                <xsl:choose>
                    <xsl:when test="name() != 'iniziovigore' and name() != 'inizioefficacia' and name() != 'finevigore' and name() != 'fineefficacia'">
                        <xsl:attribute name="{name(.)}">
                            <xsl:value-of select="." />
                        </xsl:attribute>
                    </xsl:when>
                    <!-- 4) TRANSLATES ALL THE "VALUE" AND "VAL" ATTRIBUTES TO THE "VALORE" ATTRIBUTE  -->
                    <xsl:when test="name(.) = 'val' or name(.) = 'value'">
                        <xsl:attribute name="valore">
                            <xsl:value-of select="." />
                        </xsl:attribute>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:attribute name="{name(.)}">
                            <xsl:value-of select="concat('#',.)" />
                        </xsl:attribute>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:for-each>
            <xsl:apply-templates />
        </xsl:element>
    </xsl:template>
    <!-- END 1.1) -->
    
    <!-- 1.2) THESE ARE ALL THE ELEMENT THAT MUST BE DELETED EVEN IF THEIR CHILDS MUST BE PROCESSED-->
    <xsl:template match="nir:sottoscrizioni">
        <xsl:apply-templates />
    </xsl:template>
    <!-- END 1.2) -->
    <!-- END 1) -->
    
    <!-- 2) META ELEMENTS -->
    <!-- 2.1) THIS MANAGE THE DESCRITTORI ELEMENT IN ORDER TO MAKE IT COMPLIANT TO THE 2.0 VERSION -->
    <xsl:template match="nir:descrittori">
        <xsl:element name="descrittori"  namespace="http://www.normeinrete.it/nir/2.0">
            <xsl:apply-templates select="nir:pubblicazione" />
            <xsl:element name="redazione" namespace="http://www.normeinrete.it/nir/2.0">
                <xsl:attribute name="id">rd1</xsl:attribute>
                <xsl:attribute name="norm"><xsl:value-of select="//nir:pubblicazione/@norm" /></xsl:attribute>
                <xsl:attribute name="nome">CIRSFID</xsl:attribute>
                <xsl:attribute name="url">http://www.cirsfid.unibo.it</xsl:attribute>
            </xsl:element> 
            <xsl:apply-templates select="*[local-name(.) != 'pubblicazione']"/>
        </xsl:element>
    </xsl:template>
    
    <xsl:template match="nir:pubblicazione">
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.0">
            <xsl:for-each select="@*">
                <xsl:attribute name="{name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each>
        </xsl:element>
    </xsl:template>
    <!-- END 2.1) -->
    
    <!-- 2.2) THIS TRANSFORMS THE ELEMENT "altriatti" TO THE ELEMENT "ciclodivita" -->
    <xsl:template match="nir:altriatti">
        <xsl:element name="ciclodivita" namespace="http://www.normeinrete.it/nir/2.0">
            <xsl:apply-templates />
        </xsl:element>
    </xsl:template>
    <!-- END 2.2) -->
      
    <!-- 2.3) THIS TRANSFORMS THE ATTRIBUTE "inizio" OF THE ELEMENT "evento" TO THE ATTRIBUTE "data" -->
    <xsl:template match="nir:evento">
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.0">
            <xsl:attribute name="id"><xsl:value-of select="substring(./@id,1)"></xsl:value-of></xsl:attribute>
            <xsl:attribute name="fonte"><xsl:value-of select="substring(./@fonte,1)"></xsl:value-of></xsl:attribute>
            <xsl:attribute name="data"><xsl:value-of select="./@inizio"></xsl:value-of></xsl:attribute>
        </xsl:element>
    </xsl:template>
    <!-- END 2.3) -->
    
    <!-- 2.4) THIS MANAGES THE ELEMENT modifiche. IT MUST BE TRANSLATED TO modificheattive OR modifichepassive ACCORDING TO POSITION OF THE ELEMENT pos -->
    <xsl:template match="nir:modifiche">
        <xsl:if test="count(*/*[not(text()) and position()=1 and local-name() = 'pos']) > 0">
            <xsl:element name="modificheattive" namespace="http://www.normeinrete.it/nir/2.0">
                <xsl:for-each select="*">
                    <xsl:element name="dsp:{local-name()}" namespace="http://www.normeinrete.it/nir/disposizioni/2.0">
                        <xsl:apply-templates select="nir:pos"/>
                        <xsl:apply-templates select="nir:termine"/>
                        <xsl:apply-templates select="nir:norma"/>
                    </xsl:element>
                </xsl:for-each>
            </xsl:element>
        </xsl:if>
        <xsl:if test="count(*/*[not(text()) and position()=2 and local-name() = 'pos']) > 0">
            <xsl:element name="modifichepassive" namespace="http://www.normeinrete.it/nir/2.0">
            </xsl:element>
        </xsl:if>
    </xsl:template>
    
    <xsl:template match="nir:disposizioni">
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.0">
            <xsl:namespace name="dsp" select="'http://www.normeinrete.it/nir/disposizioni/2.0'" />
            <xsl:for-each select="@*">
                <xsl:attribute name="{name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each>
            <xsl:apply-templates />
        </xsl:element>
    </xsl:template>
    
    <xsl:template match="nir:pos | nir:termine | nir:norma">
        <xsl:element name="dsp:{local-name(.)}" namespace="http://www.normeinrete.it/nir/disposizioni/2.0">
            <xsl:for-each select="@*[not(local-name()='href')]">
                <xsl:attribute name="{name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each>
            <xsl:for-each select="@*[name()='href']">
                <xsl:attribute name="xlink:{local-name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each>
        </xsl:element>
    </xsl:template>
    <!-- END 2.4) -->
    
    <!-- 3) CONTENT ELEMENTS -->
    <!-- 3.1) THIS MANAGES THE ELEMENTS OF THE CONCLUSION -->
    <xsl:template match="nir:dataeluogo">
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.0">
            <xsl:for-each select="@*[not(local-name()='codice')]">
                <xsl:attribute name="{name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each>
            <xsl:attribute name="codice">roma</xsl:attribute>
        </xsl:element>
    </xsl:template>
    <!-- END 3.1) -->
    
    
</xsl:stylesheet>