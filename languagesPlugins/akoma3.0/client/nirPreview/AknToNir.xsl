<?xml version="1.0" encoding="UTF-8"?>
<!-- 
    CC-by 4.0 CIRSFID- University of Bologna
    Author: CIRSFID, University of Bologna
    Developers: Monica Palmirani, Luca Cervone, Matteo Nardi
    Contacts: monica.palmirani@unibo.it
 -->
<xsl:stylesheet version="1.0"
    xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:nir="http://www.normeinrete.it/nir/2.2/"
    xmlns:dsp="http://www.normeinrete.it/nir/disposizioni/2.2/"
    xmlns:akn="http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:h="http://www.w3.org/HTML/1998/html4"
    xmlns:cirsfid="http://www.cirsfid.unibo.it/norma/proprietario/"
    exclude-result-prefixes="xsl nir dsp akn">
    <xsl:output indent="yes"/>
    <xsl:strip-space elements="*"/>
    <xsl:namespace-alias stylesheet-prefix="akn" result-prefix="#default"/>
    
    <!-- Variabili -->
    <xsl:variable name="urn">
        <xsl:call-template name="convertiURN">
            <xsl:with-param name="urn" select="//akn:FRBRWork/akn:FRBRuri/@value"/>
        </xsl:call-template>
    </xsl:variable>
    
    <!-- Radice -->
    <xsl:template match="akn:akomaNtoso">
        <nir:NIR>
            <xsl:apply-templates/>
        </nir:NIR>
    </xsl:template>
    
    <xsl:template match="akn:doc">
        <nir:DocumentoNIR>
            <xsl:apply-templates/>
        </nir:DocumentoNIR>
    </xsl:template>
    
    <!-- Meta -->
    <xsl:template match="akn:meta">
        <nir:meta>
            <!-- descrittori -->
            <xsl:call-template name="generaDescrittori"/>
            <!-- inquadramento -->
            <xsl:call-template name="generaInquadramento"/>
            <!-- ciclodivita -->
            <xsl:call-template name="generaCiclodivita"/>
            <!-- redazionale -->
            <xsl:call-template name="generaRedazionale"/>
            <!-- proprietario -->
            <xsl:call-template name="generaProprietario"/>
        </nir:meta>
    </xsl:template>
    
    <xsl:template name="generaDescrittori">
        <nir:descrittori>
            <nir:pubblicazione
                tipo="{//akn:publication/@name}"
                num="{//akn:publication/@number}"
                norm="{translate(//akn:publication/@date, '-', '')}"/>
            
            <nir:entratainvigore norm="{translate(//akn:eventRef[@type='generation']/@date, '-', '')}"/>
            
            <!-- Todo: Redazione -->
            
            <nir:urn valore="{$urn}"/>
            
            <nir:materie>
                <xsl:for-each select="//akn:keyword">
                    <nir:materia valore="{@value}"/>
                </xsl:for-each>
            </nir:materie>
        </nir:descrittori>
    </xsl:template>
    
    <xsl:template name="generaInquadramento">
        <nir:inquadramento>
            <nir:infodoc>
                <xsl:attribute name="normativa">
                    <xsl:if test="//akn:FRBRprescriptive/@value='true'">si</xsl:if>
                    <xsl:if test="//akn:FRBRprescriptive/@value='false'">no</xsl:if>
                </xsl:attribute>
                <!-- Todo: mancano natura="decreto" funzione="regolativa" fonte="primario" -->
            </nir:infodoc>
            
            <nir:infomancanti>
                <nir:mTipodoc valore="{//akn:FRBRname/@value}"/>
                <nir:Emanante valore="{//akn:TLCOrganization[@eId='emanante']/@showAs}"/>
                <!--<mTitolodoc valore=""/>-->
                <!--<mDatadoc valore=""/>-->
                <!--<mNumdoc valore=""/>-->
            </nir:infomancanti>
        </nir:inquadramento>
    </xsl:template>
    
    <xsl:template name="generaCiclodivita">
        <nir:ciclodivita>
            <nir:eventi>
                <xsl:for-each select="//akn:eventRef">
                    <nir:evento id="{@eId}" data="{translate(@date, '-', '')}" fonte="{@source}">
                        <xsl:attribute name="tipo">
                            <xsl:if test="@type='generation'">originale</xsl:if>
                            <xsl:if test="@type='amendment'">modifica</xsl:if>
                        </xsl:attribute>
                    </nir:evento>
                </xsl:for-each>
            </nir:eventi>
            <nir:relazioni>
                <xsl:for-each select="//akn:references/akn:original">
                    <nir:originale id="{@eId}" xlink:href="urn:nir:ministero.sviluppo.economico:decreto:2009-12-09;nir-n2100396">
                        <xsl:attribute name="xlink:href">
                            <xsl:call-template name="convertiURN">
                                <xsl:with-param name="urn" select="@href"/>
                            </xsl:call-template>
                        </xsl:attribute>
                    </nir:originale>
                </xsl:for-each>
            </nir:relazioni>
        </nir:ciclodivita>
    </xsl:template>
    
    <xsl:template name="generaRedazionale">
        <xsl:if test="//akn:notes | //akn:authorialNote">
            <nir:redazionale>
                <xsl:for-each select="//akn:authorialNote">
                    <nir:avvertenza><xsl:apply-templates/></nir:avvertenza>
                </xsl:for-each>
                <xsl:for-each select="//akn:note">
                    <nir:nota id="{@eId}"><xsl:apply-templates/></nir:nota>
                </xsl:for-each>
            </nir:redazionale>
        </xsl:if>
    </xsl:template>
    
    
    <xsl:template name="generaProprietario">
        <xsl:copy-of select="//nir:proprietario"/>
    </xsl:template>
    
    
    <!-- Intestazione -->
    <xsl:template match="akn:preface">
        <nir:intestazione><xsl:apply-templates/></nir:intestazione>
    </xsl:template>
    
    <xsl:template match="akn:docAuthority">
        <nir:emanante><xsl:apply-templates/></nir:emanante>
    </xsl:template>
    
    <xsl:template match="akn:docType">
        <nir:tipoDoc><xsl:apply-templates/></nir:tipoDoc>
    </xsl:template>
    
    <xsl:template match="akn:docDate">
        <nir:dataDoc norm="{translate(@date, '-', '')}"><xsl:apply-templates/></nir:dataDoc>
    </xsl:template>
    
    <xsl:template match="akn:docTitle">
        <nir:titoloDoc><xsl:apply-templates/></nir:titoloDoc>
    </xsl:template>
    
    <xsl:template match="akn:docNumber">
        <nir:numDoc><xsl:apply-templates/></nir:numDoc>
    </xsl:template>
    
    <!-- Formula iniziale -->
    <xsl:template match="akn:preamble">
        <nir:formulainiziale><xsl:apply-templates/></nir:formulainiziale>
    </xsl:template>
    
    <xsl:template match="akn:container[@name='preambolo_nir']">
        <nir:preambolo><xsl:apply-templates/></nir:preambolo>
    </xsl:template>
    
    
    <!-- Body -->
    <xsl:template match="akn:mainBody">
        <nir:articolato><xsl:apply-templates/></nir:articolato>
    </xsl:template>
    
    <xsl:template match="akn:num">
        <nir:num><xsl:apply-templates/></nir:num>
    </xsl:template>
    
    <xsl:template match="akn:heading">
        <nir:rubrica><xsl:apply-templates/></nir:rubrica>
    </xsl:template>
    
    <xsl:template match="akn:content">
        <nir:corpo><xsl:apply-templates/></nir:corpo>
    </xsl:template>
    
    <xsl:template match="akn:article">
        <nir:articolo><xsl:apply-templates/></nir:articolo>
    </xsl:template>
    
    <xsl:template match="akn:paragraph">
        <nir:comma><xsl:apply-templates/></nir:comma>
    </xsl:template>
    
    <!-- Conclusioni -->
    <xsl:template match="akn:conclusions">
        <xsl:apply-templates mode="conclusion" 
            select="akn:container[@name='formulafinale'] | *[not(self::akn:container[@name='formulafinale'])][1]"/>
    </xsl:template>
    
    <xsl:template mode="conclusion" match="akn:container[@name='formulafinale']">
        <nir:formulafinale><xsl:apply-templates/></nir:formulafinale>
    </xsl:template>
    
    <xsl:template mode="conclusion" match="*">
       <nir:conclusione>
           <xsl:apply-templates select="../*[not(self::akn:container[@name='formulafinale'])]"/>
        </nir:conclusione>
    </xsl:template>
    
    <xsl:template match="akn:conclusions//akn:date">
        <nir:dataeluogo norm="{translate(@date, '-', '')}"><xsl:apply-templates/></nir:dataeluogo>
    </xsl:template>
    
    <xsl:template match="akn:signature">
        <xsl:variable name="refersTo" select="@refersTo"/>
        <nir:firma>
            <xsl:if test="//akn:TLCConcept[$refersTo=concat('#', @eId)][@href='/ontology/concepts/it/visto']">
                <xsl:attribute name="tipo">visto</xsl:attribute>
            </xsl:if>
            <xsl:if test="//akn:TLCConcept[$refersTo=concat('#', @eId)][@href='/ontology/concepts/it/sottoscrizione']">
                <xsl:attribute name="tipo">sottoscrizione</xsl:attribute>
            </xsl:if>
            <xsl:apply-templates/>
        </nir:firma>
    </xsl:template>
    
    <!-- Elementi interni del contenuto -->
    <xsl:template match="akn:p">
        <h:p><xsl:apply-templates/></h:p>
    </xsl:template>
    
    <xsl:template match="akn:p/akn:omissis">
        <h:p><xsl:apply-templates/></h:p>
    </xsl:template>
    
    <xsl:template match="akn:eol">
        <h:br><xsl:apply-templates/></h:br>
    </xsl:template>
    
    <xsl:template match="akn:container">
        <nir:contenitore nome="{@name}"><xsl:apply-templates/></nir:contenitore>
    </xsl:template>
    
    <xsl:template match="akn:noteRef">
        <nir:ndr num="{@href}"><xsl:apply-templates/></nir:ndr>
    </xsl:template>
    
    <xsl:template match="akn:ref">
        <nir:rif>
            <xsl:attribute name="xlink:href">
                <xsl:call-template name="convertiURN">
                    <xsl:with-param name="urn" select="@href"/>
                </xsl:call-template>
            </xsl:attribute>
            <xsl:apply-templates/>
        </nir:rif>
    </xsl:template>

    <xsl:template match="akn:date">
        <nir:data norm="{translate(@date, '-', '')}"><xsl:apply-templates/></nir:data>
    </xsl:template>
    
    <!-- Utility -->
  
    <xsl:template name="convertiURN">
        <xsl:param name="urn"/>
        <!-- Es. urn:nir:ministero.sviluppo.economico:decreto:2009-12-09;nir-n2100396 -->
        <!-- Split FRBRuri by / 
             /akn/it/act/decreto/ministero.sviluppo.economico/2009-12-09/nir-n2100396
              p0  p1 p2  p3      p4                           p5         p6
        -->
        <xsl:variable name="p0" select="substring-after($urn, '/')"/>
        <xsl:variable name="p1" select="substring-after($p0, '/')"/>
        <xsl:variable name="p2" select="substring-after($p1, '/')"/>
        <xsl:variable name="p3" select="substring-after($p2, '/')"/>
        <xsl:variable name="p4" select="substring-after($p3, '/')"/>
        <xsl:variable name="p5" select="substring-after($p4, '/')"/>
        <xsl:variable name="p6" select="substring-after($p5, '/')"/><!--
        emanante: -->urn:nir:<xsl:value-of select="substring-before($p4, '/')"/><!--
        docType:  -->:<xsl:value-of select="substring-before($p3, '/')"/><!--
        data:     -->:<xsl:value-of select="substring-before($p5, '/')"/><!--
        docNum:   -->;<xsl:value-of select="$p6"/>
    </xsl:template>
  
</xsl:stylesheet>