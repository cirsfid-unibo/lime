<?xml version="1.0" encoding="UTF-8"?>
<!-- 
    CC-by 4.0 CIRSFID- University of Bologna
    Author: CIRSFID, University of Bologna
    Developers: Monica Palmirani, Luca Cervone, Matteo Nardi
    Contacts: monica.palmirani@unibo.it
 -->
<xsl:stylesheet version="1.0"
    xmlns="http://www.normeinrete.it/nir/2.2/"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:dsp="http://www.normeinrete.it/nir/disposizioni/2.2/"
    xmlns:akn="http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD13"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:h="http://www.w3.org/HTML/1998/html4"
    xmlns:cirsfid="http://www.cirsfid.unibo.it/norma/proprietario/"
    exclude-result-prefixes="xsl dsp akn">
    <xsl:output indent="yes"/>
    <xsl:strip-space elements="*"/>
    

    <FRBRalias value="urn:nir:regione.piemonte:legge:1992-01-14;1" name="urn:nir"/>
    <!-- Variabili -->
    <xsl:variable name="urn">
        <xsl:choose>
            <xsl:when test="//akn:FRBRalias[@name='urn:nir']">
                <xsl:value-of select="//akn:FRBRalias[@name='urn:nir']/@value"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:call-template name="convertiURN">
                    <xsl:with-param name="urn" select="//akn:FRBRWork/akn:FRBRuri/@value"/>
                </xsl:call-template>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:variable>
    
    <!-- Radice -->
    <xsl:template match="akn:akomaNtoso">
        <NIR>
            <xsl:apply-templates select="node()|@*"/>
        </NIR>
    </xsl:template>
    
    <xsl:template match="akn:doc|akn:act">
        <DocumentoNIR nome="{@name}">
            <xsl:apply-templates/>
        </DocumentoNIR>
    </xsl:template>
    
    <!-- Meta -->
    <xsl:template match="akn:meta">
        <meta>
            <!-- descrittori -->
            <xsl:call-template name="generaDescrittori"/>
            <!-- inquadramento -->
            <xsl:call-template name="generaInquadramento"/>
            <!-- ciclodivita -->
            <xsl:call-template name="generaCiclodivita"/>
            <!-- redazionale -->
            <xsl:call-template name="generaRedazionale"/>
            <!-- modifiche -->
            <xsl:call-template name="generaModificheAttive"/>
            <!-- proprietario -->
            <xsl:call-template name="generaProprietario"/>
        </meta>
    </xsl:template>
    
    <xsl:template name="generaDescrittori">
        <descrittori>
            <pubblicazione
                tipo="{//akn:publication/@name}"
                num="{//akn:publication/@number}"
                norm="{translate(//akn:publication/@date, '-', '')}"/>
            
            <entratainvigore norm="{translate(//akn:eventRef[@type='generation']/@date, '-', '')}"/>
            
            <!-- Todo: Redazione -->
            
            <urn valore="{$urn}"/>
            
            <xsl:if test="//akn:keyword">
                <materie>
                    <xsl:for-each select="//akn:keyword">
                        <materia valore="{@value}"/>
                    </xsl:for-each>
                </materie>
            </xsl:if>
        </descrittori>
    </xsl:template>
    
    <xsl:template name="generaInquadramento">
        <inquadramento>
            <infodoc>
                <xsl:attribute name="normativa">
                    <xsl:if test="//akn:FRBRprescriptive/@value='true'">si</xsl:if>
                    <xsl:if test="//akn:FRBRprescriptive/@value='false'">no</xsl:if>
                </xsl:attribute>
                <!-- Todo: mancano natura="decreto" funzione="regolativa" fonte="primario" -->
            </infodoc>
            
            <infomancanti>
                <mTipodoc valore="{//akn:FRBRname/@value}"/>
                <Emanante valore="{//akn:TLCOrganization[@eId='emanante']/@showAs}"/>
                <!--<mTitolodoc valore=""/>-->
                <!--<mDatadoc valore=""/>-->
                <!--<mNumdoc valore=""/>-->
            </infomancanti>
        </inquadramento>
    </xsl:template>
    
    <xsl:template name="generaCiclodivita">
        <ciclodivita>
            <eventi>
                <xsl:for-each select="//akn:eventRef">
                    <evento id="{@eId}" data="{translate(@date, '-', '')}" fonte="{@source}">
                        <xsl:attribute name="tipo">
                            <xsl:if test="@type='generation'">originale</xsl:if>
                            <xsl:if test="@type='amendment'">modifica</xsl:if>
                        </xsl:attribute>
                    </evento>
                </xsl:for-each>
            </eventi>
            <relazioni>
                <!-- Originale -->
                <xsl:for-each select="//akn:references/akn:original">
                    <originale id="{@eId}" xlink:href="urn:nir:ministero.sviluppo.economico:decreto:2009-12-09;nir-n2100396">
                        <xsl:attribute name="xlink:href">
                            <xsl:call-template name="convertiURN">
                                <xsl:with-param name="urn" select="@href"/>
                            </xsl:call-template>
                        </xsl:attribute>
                    </originale>
                </xsl:for-each>
                <!-- Modifiche attive -->
                <xsl:for-each select="//akn:references/akn:activeRef">
                    <attiva id="{@eId}">
                        <xsl:attribute name="xlink:href">
                            <xsl:call-template name="convertiURN">
                                <xsl:with-param name="urn" select="@href"/>
                            </xsl:call-template>
                        </xsl:attribute>
                    </attiva>
                </xsl:for-each>
            </relazioni>
        </ciclodivita>
    </xsl:template>
    
    <xsl:template name="generaRedazionale">
        <xsl:if test="//akn:notes | //akn:authorialNote">
            <redazionale>
                <xsl:for-each select="//akn:authorialNote">
                    <avvertenza><xsl:apply-templates/></avvertenza>
                </xsl:for-each>
                <xsl:for-each select="//akn:note">
                    <nota id="{@eId}"><xsl:apply-templates/></nota>
                </xsl:for-each>
            </redazionale>
        </xsl:if>
    </xsl:template>
    
    <xsl:template name="generaModificheAttive">
        <xsl:if test="//akn:activeModifications">
            <modificheattive>
                <!-- attuadelegifica -->
                <xsl:apply-templates select="//akn:activeModifications/*"/>
            </modificheattive>
        </xsl:if>
    </xsl:template>
       
    <xsl:template name="generaProprietario">
        <xsl:copy-of select="//proprietario"/>
    </xsl:template>
    
    <!-- Disposizioni -->
    <xsl:template match="akn:source">
        <dsp:pos xlink:href="{@href}"/>
    </xsl:template>
    
    <!--    urn:nir:stato:decreto.legislativo:1999-07-30;300/ita/1999-07-30#art4-com4"
xlink:href="urn:nir:stato:decreto.legislativo:1999-07-30;300">
    -->
    <xsl:template match="akn:destination">
        <xsl:variable name="urn">
            <xsl:call-template name="convertiURN">
                <xsl:with-param name="urn" select="@href"/>
            </xsl:call-template>
        </xsl:variable>
        <xsl:variable name="id" select="substring-after(@href, '#')"/>
        <dsp:norma xlink:href="{$urn}">
            <dsp:subarg>
                <cirsfid:sub xlink:href="urn{concat($urn, '#', $id)}"/>
            </dsp:subarg>
        </dsp:norma>
    </xsl:template>
    
    <xsl:template match="akn:legalSystemMod[@type='deregulation']">
        <dsp:attuadelegifica><xsl:apply-templates/></dsp:attuadelegifica>
    </xsl:template>
    <xsl:template match="akn:textualMod[@type='repeal']">
        <dsp:abrogazione><xsl:apply-templates/></dsp:abrogazione>
    </xsl:template>
    <xsl:template match="akn:textualMod[@type='substitution']">
        <dsp:sostituzione><xsl:apply-templates/></dsp:sostituzione>
    </xsl:template>
    <xsl:template match="akn:textualMod[@type='insertion']">
        <dsp:integrazione><xsl:apply-templates/></dsp:integrazione>
    </xsl:template>
    <xsl:template match="akn:textualMod[@type='renumbering']">
        <dsp:ricollocazione><xsl:apply-templates/></dsp:ricollocazione>
    </xsl:template>
    <xsl:template match="akn:meaningMod[@type='authenticInterpretation']">
        <dsp:intautentica><xsl:apply-templates/></dsp:intautentica>
    </xsl:template>
    <xsl:template match="akn:meaningMod[@type='variation']">
        <dsp:variazione><xsl:apply-templates/></dsp:variazione>
    </xsl:template>
    <xsl:template match="akn:meaningMod[@type='termModification']">
        <dsp:modtermini><xsl:apply-templates/></dsp:modtermini>
    </xsl:template>
    <xsl:template match="akn:forceMod[@type='entryIntoForce']">
        <dsp:vigenza><xsl:apply-templates/></dsp:vigenza>
    </xsl:template>
    <xsl:template match="akn:forceMod[@type='uncostitutionality']">
        <dsp:annullamento><xsl:apply-templates/></dsp:annullamento>
    </xsl:template>
    <xsl:template match="akn:efficacyMod[@type='prorogationOfEfficacy']">
        <dsp:proroga><xsl:apply-templates/></dsp:proroga>
    </xsl:template>
    <!-- ??? -> dsp:reviviscenza -->
    <xsl:template match="akn:efficacyMod[@type='retroactivity']">
        <dsp:retroattivita><xsl:apply-templates/></dsp:retroattivita>
    </xsl:template>
    <xsl:template match="akn:efficacyMod[@type='extraEfficacy']">
        <dsp:ultrattivita><xsl:apply-templates/></dsp:ultrattivita>
    </xsl:template>
    <xsl:template match="akn:efficacyMod[@type='inapplication']">
        <dsp:inapplicazione><xsl:apply-templates/></dsp:inapplicazione>
    </xsl:template>
    <xsl:template match="akn:scopeMod[@type='exceptionOfScope'][@incomplete='true']">
        <dsp:deroga><xsl:apply-templates/></dsp:deroga>
    </xsl:template>
    <xsl:template match="akn:scopeMod[@type='extensionOfScope']">
        <dsp:estensione><xsl:apply-templates/></dsp:estensione>
    </xsl:template>
    <!--Bug
    <xsl:template match="akn:scopeMod[@type='exceptionOfScope'][@incomplete='true']">
        <dsp:estensione><xsl:apply-templates/></dsp:estensione>
    </xsl:template>
    -->
    <xsl:template match="akn:legalSystemMod[@type='application']">
        <dsp:recepisce><xsl:apply-templates/></dsp:recepisce>
    </xsl:template>
    <xsl:template match="akn:legalSystemMod[@type='implementation']">
        <dsp:attua><xsl:apply-templates/></dsp:attua>
    </xsl:template>
    <xsl:template match="akn:legalSystemMod[@type='ratification']">
        <dsp:ratifica><xsl:apply-templates/></dsp:ratifica>
    </xsl:template>
    <xsl:template match="akn:legalSystemMod[@type='legislativeDelegation']">
        <dsp:attuadelega><xsl:apply-templates/></dsp:attuadelega>
    </xsl:template>
    <xsl:template match="akn:legalSystemMod[@type='deregulation']">
        <dsp:attuadelegifica><xsl:apply-templates/></dsp:attuadelegifica>
    </xsl:template>
    <xsl:template match="akn:legalSystemMod[@type='conversion']">
        <dsp:converte><xsl:apply-templates/></dsp:converte>
    </xsl:template>
    <xsl:template match="akn:legalSystemMod[@type='reiteration']">
        <dsp:reitera><xsl:apply-templates/></dsp:reitera>
    </xsl:template>  
    <!--??? -\-> dsp:modifica--> 
    <xsl:template match="akn:legalSystemMod[@type='reiteration']">
        <dsp:reitera><xsl:apply-templates/></dsp:reitera>
    </xsl:template>
    <xsl:template match="akn:legalSystemMod[@type='expiration']">
        <dsp:decadimento><xsl:apply-templates/></dsp:decadimento>
    </xsl:template>    
    
    <!-- Intestazione -->
    <xsl:template match="akn:preface">
        <intestazione><xsl:apply-templates select="node()|@*"/></intestazione>
    </xsl:template>
    
    <xsl:template match="akn:docAuthority">
        <emanante><xsl:apply-templates select="node()|@*"/></emanante>
    </xsl:template>
    
    <xsl:template match="akn:docType">
        <tipoDoc><xsl:apply-templates select="node()|@*"/></tipoDoc>
    </xsl:template>
    
    <xsl:template match="akn:docDate">
        <dataDoc norm="{translate(@date, '-', '')}"><xsl:apply-templates select="node()|@*"/></dataDoc>
    </xsl:template>
    
    <xsl:template match="akn:docTitle">
        <titoloDoc><xsl:apply-templates select="node()|@*"/></titoloDoc>
    </xsl:template>
    
    <xsl:template match="akn:docNumber">
        <numDoc><xsl:apply-templates select="node()|@*"/></numDoc>
    </xsl:template>
    
    <!-- Formula iniziale -->
    <xsl:template match="akn:preamble">
        <formulainiziale><xsl:apply-templates select="node()|@*"/></formulainiziale>
    </xsl:template>
    
    <xsl:template match="akn:container[@name='preambolo_nir']">
        <preambolo><xsl:apply-templates select="node()|@*"/></preambolo>
    </xsl:template>
    
    
    <!-- Body -->
    <xsl:template match="akn:mainBody">
        <articolato><xsl:apply-templates select="node()|@*"/></articolato>
    </xsl:template>
    
    <xsl:template match="akn:body">
        <articolato><xsl:apply-templates select="node()|@*"/></articolato>
    </xsl:template>
    
    <xsl:template match="akn:num">
        <num><xsl:apply-templates select="node()|@*"/></num>
    </xsl:template>
    
    <xsl:template match="akn:heading">
        <rubrica><xsl:apply-templates select="node()|@*"/></rubrica>
    </xsl:template>
    
    <xsl:template match="akn:content">
        <corpo><xsl:apply-templates select="node()|@*"/></corpo>
    </xsl:template>
    
    <xsl:template match="akn:article">
        <articolo><xsl:apply-templates select="node()|@*"/></articolo>
    </xsl:template>
    
    <xsl:template match="akn:paragraph">
        <comma><xsl:apply-templates select="node()|@*"/></comma>
    </xsl:template>
    
    <!-- Conclusioni -->
    <xsl:template match="akn:conclusions">
        <xsl:apply-templates mode="conclusion" 
            select="akn:container[@name='formulafinale'] | *[not(self::akn:container[@name='formulafinale'])][1]"/>
    </xsl:template>
    
    <xsl:template mode="conclusion" match="akn:container[@name='formulafinale']">
        <formulafinale><xsl:apply-templates select="node()|@*"/></formulafinale>
    </xsl:template>
    
    <xsl:template mode="conclusion" match="*">
       <conclusione>
           <xsl:apply-templates select="../*[not(self::akn:container[@name='formulafinale'])]"/>
        </conclusione>
    </xsl:template>
    
    <xsl:template match="akn:conclusions//akn:date">
        <dataeluogo norm="{translate(@date, '-', '')}"><xsl:apply-templates select="node()|@*"/></dataeluogo>
    </xsl:template>
    
    <xsl:template match="akn:signature">
        <xsl:variable name="refersTo" select="@refersTo"/>
        <firma>
            <xsl:if test="//akn:TLCConcept[$refersTo=concat('#', @eId)][@href='/ontology/concepts/it/visto']">
                <xsl:attribute name="tipo">visto</xsl:attribute>
            </xsl:if>
            <xsl:if test="//akn:TLCConcept[$refersTo=concat('#', @eId)][@href='/ontology/concepts/it/sottoscrizione']">
                <xsl:attribute name="tipo">sottoscrizione</xsl:attribute>
            </xsl:if>
            <xsl:apply-templates select="node()|@*"/>
        </firma>
    </xsl:template>
    
    <!-- Elementi interni del contenuto -->
    <xsl:template match="akn:p">
        <h:p><xsl:apply-templates select="node()|@*"/></h:p>
    </xsl:template>
    
    <xsl:template match="akn:p/akn:omissis">
        <h:p><xsl:apply-templates select="node()|@*"/></h:p>
    </xsl:template>
    
    <xsl:template match="akn:eol">
        <h:br><xsl:apply-templates select="node()|@*"/></h:br>
    </xsl:template>
    
    <xsl:template match="akn:container">
        <contenitore nome="{@name}"><xsl:apply-templates select="node()|@*"/></contenitore>
    </xsl:template>
    
    <xsl:template match="akn:noteRef">
        <ndr num="{@href}"><xsl:apply-templates select="node()|@*"/></ndr>
    </xsl:template>
    
    <xsl:template match="akn:ref">
        <rif>
            <xsl:attribute name="xlink:href">
                <xsl:call-template name="convertiURN">
                    <xsl:with-param name="urn" select="@href"/>
                </xsl:call-template>
            </xsl:attribute>
            <xsl:apply-templates select="node()|@*"/>
        </rif>
    </xsl:template>

    <xsl:template match="akn:date">
        <data norm="{translate(@date, '-', '')}"><xsl:apply-templates select="node()|@*"/></data>
    </xsl:template>
    
    <xsl:template match="akn:list/akn:point">
        <el><xsl:apply-templates select="node()|@*"/></el>
    </xsl:template>
    
    <xsl:template match="akn:intro">
        <alinea><xsl:apply-templates select="node()|@*"/></alinea>
    </xsl:template>
    
    <!-- Utility -->
  
    <xsl:template match="@eId">
        <!-- Preserva l'id degli elementi a cui si hanno riferimenti -->
        <xsl:if test="//@href=concat('#', .)">
            <xsl:attribute name="id">
                <xsl:value-of select="."/>
            </xsl:attribute>
        </xsl:if>
    </xsl:template>
    
    <xsl:template match="@*"></xsl:template>
  
    <xsl:template name="convertiURN">
        <xsl:param name="urn"/>
        <xsl:param name="safeurn" select="concat($urn, '////')"/>
        <!-- Es. urn:nir:ministero.sviluppo.economico:decreto:2009-12-09;nir-n2100396 -->
        <!-- Split FRBRuri by / 
             /akn/it/act/decreto/ministero.sviluppo.economico/2009-12-09/nir-n2100396
              p0  p1 p2  p3      p4                           p5         p6
        -->
        <xsl:variable name="p0" select="substring-after($safeurn, '/')"/>
        <xsl:variable name="p1" select="substring-after($p0, '/')"/>
        <xsl:variable name="p2" select="substring-after($p1, '/')"/>
        <xsl:variable name="p3" select="substring-after($p2, '/')"/>
        <xsl:variable name="p4" select="substring-after($p3, '/')"/>
        <xsl:variable name="p5" select="substring-after($p4, '/')"/>
        <xsl:variable name="p6" select="substring-after($p5, '/')"/>
        <xsl:variable name="p7" select="substring-after($p6, '/')"/><!--
        emanante: -->urn:nir:<xsl:value-of select="substring-before($p4, '/')"/><!--
        docType:  -->:<xsl:value-of select="substring-before($p3, '/')"/><!--
        data:     -->:<xsl:value-of select="substring-before($p5, '/')"/><!--
        docNum:   -->;<xsl:value-of select="substring-before($p6, '/')"/>
    </xsl:template>
  
</xsl:stylesheet>