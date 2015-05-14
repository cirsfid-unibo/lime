<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns="http://www.normeinrete.it/nir/2.2/"  
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
                xmlns:xlink="http://www.w3.org/1999/xlink" 
                xmlns:h="http://www.w3.org/HTML/1998/html4" 
                xmlns:nir="http://www.normeinrete.it/nir/2.0"
                xmlns:disposizioni="http://www.normeinrete.it/nir/disposizioni/2.0"
                xmlns:dsp="http://www.normeinrete.it/nir/disposizioni/2.2"
                xmlns:cirsfid="http://www.cirsfid.unibo.it/norma/proprietario/"
                version="1.0" exclude-result-prefixes="xlink h dsp disposizioni xml" >
    
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
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.2/">
            <!--<xsl:namespace name="h" select="'http://www.w3.org/HTML/1998/html4'" />
            <xsl:namespace name="xlink" select="'http://www.w3.org/1999/xlink'" />
            <xsl:namespace name="dsp" select="'http://www.normeinrete.it/nir/disposizioni/2.2/'" />
            <xsl:namespace name="cirsfid" select="'http://www.cirsfid.unibo.it/norma/proprietario/'" />-->
             <xsl:apply-templates mode="attributesSelector" select="." />
            <xsl:apply-templates />
        </xsl:element>
    </xsl:template>
  
    <xsl:template match="nir:*">
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.2/">
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
        
    <!--     
        1.2) ALL THE ELEMENTS THE METADATA ELEMENTS THAT HAVE A TEXT CONTENT NOW ARE REPLACED WITH ELEMENTS HAVING THE SAME NAME AND A "VALORE" ATTRIBUTE
        CONTAINING THE OLD TEXT VALUE
    -->
    <xsl:template match="nir:urn">
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.2/">
            <xsl:for-each select="@*">
                <xsl:attribute name="{name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each>
            <xsl:attribute name="valore"><xsl:value-of select="." /></xsl:attribute>
        </xsl:element>
    </xsl:template>
    
    <xsl:template match="nir:alias">
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.2/">
            <xsl:for-each select="@*">
                <xsl:attribute name="{name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each>
            <xsl:attribute name="valore"><xsl:value-of select="." /></xsl:attribute>
        </xsl:element>
    </xsl:template>
    
    <xsl:template match="nir:mTitolodoc">
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.2/">
            <xsl:for-each select="@*">
                <xsl:attribute name="{name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each>
            <xsl:attribute name="valore"><xsl:value-of select="." /></xsl:attribute>
        </xsl:element>
    </xsl:template>
    
    <xsl:template match="nir:mTipodoc">
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.2/">
            <xsl:for-each select="@*">
                <xsl:attribute name="{name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each>
            <xsl:attribute name="valore"><xsl:value-of select="." /></xsl:attribute>
        </xsl:element>
    </xsl:template>
    
    <xsl:template match="nir:mDatadoc">
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.2/">
            <xsl:for-each select="@*">
                <xsl:attribute name="{name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each>
            <xsl:attribute name="valore"><xsl:value-of select="." /></xsl:attribute>
        </xsl:element>
    </xsl:template>
    
    <xsl:template match="nir:mNumdoc">
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.2/">
            <xsl:for-each select="@*">
                <xsl:attribute name="{name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each>
            <xsl:attribute name="valore"><xsl:value-of select="." /></xsl:attribute>
        </xsl:element>
    </xsl:template>
    
    <xsl:template match="nir:mEmanante">
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.2/">
            <xsl:for-each select="@*">
                <xsl:attribute name="{name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each>
            <xsl:attribute name="valore"><xsl:value-of select="." /></xsl:attribute>
        </xsl:element>
    </xsl:template>
    
    <xsl:template match="nir:finalita">
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.2/">
            <xsl:for-each select="@*">
                <xsl:attribute name="{name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each>
            <xsl:attribute name="valore"><xsl:value-of select="." /></xsl:attribute>
        </xsl:element>
    </xsl:template>
    
    <xsl:template match="nir:destinatario">
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.2/">
            <xsl:for-each select="@*">
                <xsl:attribute name="{name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each>
            <xsl:attribute name="valore"><xsl:value-of select="." /></xsl:attribute>
        </xsl:element>
    </xsl:template>
    
    <xsl:template match="nir:territorio">
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.2/">
            <xsl:for-each select="@*">
                <xsl:attribute name="{name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each>
            <xsl:attribute name="valore"><xsl:value-of select="." /></xsl:attribute>
        </xsl:element>
    </xsl:template>
    
    <xsl:template match="nir:attivita">
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.2/">
            <xsl:for-each select="@*">
                <xsl:attribute name="{name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each>
            <xsl:attribute name="valore"><xsl:value-of select="." /></xsl:attribute>
        </xsl:element>
    </xsl:template>
   
    <xsl:template match="nir:materia">
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.2/">
            <xsl:for-each select="@*[not(name()='val')]">
                <xsl:attribute name="{name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each>
            <xsl:attribute name="valore"><xsl:value-of select="@val" /></xsl:attribute>
        </xsl:element>
    </xsl:template>
    
    <xsl:template match="nir:proponente">
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.2/">
            <xsl:for-each select="@*">
                <xsl:attribute name="{name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each>
            <xsl:attribute name="valore"><xsl:value-of select="." /></xsl:attribute>
        </xsl:element>
    </xsl:template>
    <!-- END 1.2) -->
    
    <!-- 1.3) FOR ALL THE ELEMENTS HAVING AN IDREF, CHANGES THE IDREF TO A HREF POINTER  -->
    <xsl:template match="nir:ndr">
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.2/">
            <xsl:for-each select="@*[not(name()='xml:lang')]">
                <xsl:choose>
                    <xsl:when test="name()='value'">
                        <xsl:attribute name="valore">
                            <xsl:value-of select="." />
                        </xsl:attribute>
                    </xsl:when>
                    <xsl:when test="name()!='num'">
                        <xsl:attribute name="{name(.)}">
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

    <xsl:template match="nir:evento">
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.2/">
            <xsl:for-each select="@*">
                <xsl:choose>
                    <xsl:when test="name()!='fonte'">
                        <xsl:attribute name="{name(.)}">
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
    
    <xsl:template match="nir:termine">
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.2/">
            <xsl:for-each select="@*">
                <xsl:choose>
                    <xsl:when test="name()!='da' and name()!='a'">
                        <xsl:attribute name="{name(.)}">
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
    
    <xsl:template match="nir:vigenza">
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.2/">
            <xsl:for-each select="@*">
                <xsl:choose>
                    <xsl:when test="name()!='rel'">
                        <xsl:attribute name="{name(.)}">
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
    
    <xsl:template match="nir:irif">
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.2/">
            <xsl:for-each select="@*">
                <xsl:choose>
                    <xsl:when test="name()!='finoa'">
                        <xsl:attribute name="{name(.)}">
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
    
    <xsl:template match="nir:altradata">
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.2/">
            <xsl:for-each select="@*">
                <xsl:choose>
                    <xsl:when test="name()!='rif'">
                        <xsl:attribute name="{name(.)}">
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
    <!-- END 1.3) -->
    
    <!-- this resolves the problem of the hyerarchies that have a rubrica without a num -->
    <xsl:template match="nir:rubrica[not(./preceding-sibling::nir:num)]">
        <xsl:element name="num" namespace="http://www.normeinrete.it/nir/2.2/" />
        <xsl:element name="{local-name(.)}" namespace="http://www.normeinrete.it/nir/2.2/">
            <xsl:for-each select="@*[not(name()='xml:lang')]">
                <xsl:attribute name="{name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each>
            <xsl:apply-templates />
        </xsl:element>
    </xsl:template>
    
    <!-- translates the elements allegatimultimediali and allegatomultimediale in risoluzioni and risoluzione -->
    <xsl:template match="nir:allegatimultimediali">
        <xsl:element name="risoluzioni" namespace="http://www.normeinrete.it/nir/2.2/">
            <xsl:for-each select="@*[not(name()='xml:lang')]">
                <xsl:attribute name="{name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each>
            <xsl:apply-templates />
        </xsl:element>
    </xsl:template>
    
    <xsl:template match="nir:allegatomultimediale">
        <xsl:element name="risoluzione" namespace="http://www.normeinrete.it/nir/2.2/">
            <xsl:for-each select="@*[not(name()='xml:lang') and not(name()='path')]">
                <xsl:attribute name="{name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each>
            <xsl:attribute name="url"><xsl:value-of select="@path" /></xsl:attribute>
            <xsl:apply-templates />
        </xsl:element>
    </xsl:template>
    <!-- END 1) -->
    
    <!-- 2) HTML ELEMENTS -->
    <!-- 2.1) THIS SIMPLY MAKES A COPY OF THE HTML ELEMENTS -->
    <xsl:template match="h:*">
        <xsl:element name="h:{local-name(.)}">
            <xsl:apply-templates mode="attributesSelector" select="." />
            <xsl:apply-templates />
        </xsl:element>
    </xsl:template>
   
    <xsl:template match="h:td">
        <xsl:element name="h:{local-name(.)}">
            <xsl:for-each select="./@*[not(name(.)='xml:lang') and not(name()='rowspan') and not(name()='colspan')]">
                <xsl:attribute name="{name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each> <xsl:apply-templates />
        </xsl:element>
    </xsl:template>

    <!-- Trick -->
    <xsl:template match="nir:l1/h:table">
        <xsl:element name="contenitore" namespace="http://www.normeinrete.it/nir/2.2/">
            <xsl:attribute name="id"><xsl:value-of select="generate-id()" /></xsl:attribute>
            <xsl:attribute name="nome"><xsl:value-of select="concat('contenitoreGenerico_',generate-id())" /></xsl:attribute>
            <xsl:element name="h:{local-name(.)}">
                <xsl:apply-templates mode="attributesSelector" select="." />
                <xsl:apply-templates />
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <!-- END 2.1) -->
    <!-- END 2) -->

    <!-- 3) XLINK ELEMENTS -->
    <!-- 3.1) THIS SIMPLY MAKES A COPY OF THE XLINK ELEMENTS -->
    <xsl:template match="xlink:*">
        <xsl:element name="xlink:{local-name(.)}">
            <xsl:apply-templates mode="attributesSelector" select="." />
            <xsl:apply-templates />
        </xsl:element>
    </xsl:template>
    <!-- END 3.1) -->
    <!-- END 3) -->
    
    
    <!-- 4) DSP ELEMENTS -->
    <!-- 4.1) THIS TRANSFORMS ALL THE ELEMENTS IN THE NAMESPACE DSP 2.0 TO THE SAME ELEMENTS BUT IN THE NAMESPACE DSP 2.2  -->
    <xsl:template match="disposizioni:*">
        <xsl:element name="dsp:{local-name(.)}" namespace="http://www.normeinrete.it/nir/disposizioni/2.2/">
            <xsl:for-each select="@*">
                <xsl:choose>
                    <xsl:when test="name() != 'iniziovigore' and name() != 'inizioefficacia' and name() != 'finevigore' and name() != 'fineefficacia'">
                        <xsl:attribute name="{name(.)}">
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
    <!-- END 4.1) -->
    
    <!-- 4.2) THE CONTENT OF THE ELEMENT DSP:NORMA AND DSP:CONDIZIONE USED TO MARK UP THE MODIFIES IS CHANGED -->
    <xsl:template match="disposizioni:norma">
        <xsl:element name="dsp:{local-name(.)}" namespace="http://www.normeinrete.it/nir/disposizioni/2.2/">
            <xsl:for-each select="@*">
                <xsl:attribute name="{name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each>
            <xsl:apply-templates select="*[not(name()='dsp:sub')]"></xsl:apply-templates>
            <xsl:element name="dsp:subarg" namespace="http://www.normeinrete.it/nir/disposizioni/2.2/">
                <xsl:apply-templates select="disposizioni:isub/disposizioni:sub | disposizioni:sub | disposizioni:negativa | disposizioni:fattispecie | disposizioni:sospesoperevento | disposizioni:luogo | disposizioni:evento" mode="withoutContainer"></xsl:apply-templates>
            </xsl:element>
        </xsl:element>
    </xsl:template>

    <xsl:template match="disposizioni:condizione">
        <xsl:element name="dsp:{local-name(.)}" namespace="http://www.normeinrete.it/nir/disposizioni/2.2/">
            <xsl:for-each select="@*">
                <xsl:attribute name="{name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each>
            <xsl:apply-templates select="*[not(name()='dsp:sub')]"></xsl:apply-templates>
            <xsl:element name="dsp:subarg" namespace="http://www.normeinrete.it/nir/disposizioni/2.2/">
                <xsl:apply-templates select="disposizioni:isub/disposizioni:sub | disposizioni:sub | disposizioni:negativa | disposizioni:fattispecie | disposizioni:sospesoperevento | disposizioni:luogo | disposizioni:evento" mode="withoutContainer"></xsl:apply-templates>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <!-- END 4.2)-->
  
    <xsl:template match="disposizioni:sub" mode="withoutContainer">
            <xsl:element name="cirsfid:{local-name(.)}">
                <xsl:for-each select="@*">
                    <xsl:attribute name="{name(.)}">
                        <xsl:value-of select="." />
                    </xsl:attribute>
                </xsl:for-each>
               <xsl:apply-templates />
           </xsl:element>
           <xsl:apply-templates select="../disposizioni:decorrenza" mode="altradata" />
    </xsl:template>
    
    <xsl:template match="disposizioni:isub"></xsl:template>
  
    <!-- 4.3) THE ELEMENT DSP:DECORRENZA IS DEPRECATED. IT MUST BE TRANSLATED INTO A "ALTRADATA" ELEMENT WITH A "TIPO" ATTRIBUTE HAVING VALUE "decorrenza"  -->
    <xsl:template match="disposizioni:decorrenza" mode="altradata">
        <xsl:element name="dsp:altradata" namespace="http://www.normeinrete.it/nir/disposizioni/2.2/">
            <xsl:attribute name="nome">decorrenza</xsl:attribute>
            <xsl:attribute name="rif">
                <xsl:value-of select="concat('#',@da)" />
            </xsl:attribute>
            <xsl:apply-templates />
        </xsl:element>
    </xsl:template>
   
    <xsl:template match="disposizioni:decorrenza">
    </xsl:template>
    
    <xsl:template match="disposizioni:negativa[not(./parent::disposizioni:norma) and not(./parent::disposizioni:condizione)] | disposizioni:fattispecie[not(./parent::disposizioni:norma) and not(./parent::disposizioni:condizione)] | disposizioni:sospesoperevento[not(./parent::disposizioni:norma) and not(./parent::disposizioni:condizione)] | disposizioni:luogo[not(./parent::disposizioni:norma) and not(./parent::disposizioni:condizione)] | disposizioni:evento[not(./parent::disposizioni:norma) and not(./parent::disposizioni:condizione)]">
        <xsl:element name="dsp:subarg" namespace="http://www.normeinrete.it/nir/disposizioni/2.2/">
            <xsl:element name="cirsfid:{local-name(.)}">
                <xsl:for-each select="@*">
                    <xsl:attribute name="{name(.)}">
                        <xsl:value-of select="." />
                    </xsl:attribute>
                </xsl:for-each>
                <xsl:apply-templates />
            </xsl:element>
        </xsl:element>
    </xsl:template>

    <xsl:template match="disposizioni:negativa[./parent::disposizioni:norma or ./parent::disposizioni:condizione] | disposizioni:fattispecie[./parent::disposizioni:norma or ./parent::disposizioni:condizione] | disposizioni:sospesoperevento[./parent::disposizioni:norma or ./parent::disposizioni:condizione] | disposizioni:luogo[./parent::disposizioni:norma or ./parent::disposizioni:condizione] | disposizioni:evento[./parent::disposizioni:norma or ./parent::disposizioni:condizione]">
    </xsl:template>
    
    <xsl:template match="disposizioni:negativa | disposizioni:fattispecie | disposizioni:sospesoperevento | disposizioni:luogo | disposizioni:evento" mode="withoutContainer">
            <xsl:element name="cirsfid:{local-name(.)}">
                <xsl:for-each select="@*">
                    <xsl:attribute name="{name(.)}">
                        <xsl:value-of select="." />
                    </xsl:attribute>
                </xsl:for-each>
                <xsl:apply-templates />
            </xsl:element>
    </xsl:template>
    
    <xsl:template match="disposizioni:incompleta">
    </xsl:template>
    
    <xsl:template match="disposizioni:dominio">
        <xsl:element name="dsp:{local-name(.)}" namespace="http://www.normeinrete.it/nir/disposizioni/2.2/">
            <xsl:for-each select="@*">
                <xsl:attribute name="{name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each> 
            <xsl:apply-templates select=".//*/node()"/>
            <xsl:element name="dsp:testo" namespace="http://www.normeinrete.it/nir/disposizioni/2.2/">
                <xsl:attribute name="valore">
                    <xsl:value-of select=".//text()" />
                </xsl:attribute>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    
    <!-- this resolve the elements that have a novellando child -->
   <xsl:template match="disposizioni:integrazione[./child::disposizioni:novellando]">
        <xsl:element name="dsp:{local-name(.)}" namespace="http://www.normeinrete.it/nir/disposizioni/2.2/">
            <xsl:for-each select="@*">
                <xsl:attribute name="{name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each> 
            <xsl:apply-templates select="./disposizioni:pos"/>
            <xsl:apply-templates select="./disposizioni:norma"/>
            <xsl:apply-templates select="./disposizioni:novellando" mode="changePosition"/>
            <xsl:apply-templates select="*[not(local-name()='norma') and not(local-name()='pos') and not(local-name()='novellando')]"></xsl:apply-templates>
        </xsl:element>
    </xsl:template>
    
    <xsl:template match="disposizioni:novellando" mode="changePosition">
        <xsl:element name="dsp:posizione" namespace="http://www.normeinrete.it/nir/disposizioni/2.2/">
            <xsl:for-each select="@*">
                <xsl:attribute name="{name(.)}">
                    <xsl:value-of select="." />
                </xsl:attribute>
            </xsl:for-each> 
            <xsl:apply-templates />
        </xsl:element>
    </xsl:template> 
    <!-- END 4.3)-->
    
    <!-- END 4) -->
    
    <!-- THIS RESOLVES THE ISSSUE NUMBER 11 IN THE DOCUMENT 'Analisi delle differenze tra DTD 2v4.doc' -->
    <!-- 
        THE CONCLUSIONE ELEMENT CANNOT CONTAIN THE ELEMENTS 'SOTTOSCRIVENTE' AND 'VISTO' ANYMORE. NOW IT MUST CONTAIN THE ELEMENT 'FIRMA' THAT MUST HAVE A
        'TIPO' ATTRIBUTE HAVING VALUE 'sottoscrizione' OR 'visto'
    -->
    <xsl:template match="nir:sottoscrivente">
        <xsl:element name="firma" namespace="http://www.normeinrete.it/nir/2.2/">
            <xsl:attribute name="tipo">sottoscrizione</xsl:attribute>     
            <xsl:apply-templates />
        </xsl:element>
    </xsl:template>

    <xsl:template match="nir:visto">
        <xsl:element name="firma" namespace="http://www.normeinrete.it/nir/2.2/">
            <xsl:attribute name="tipo">visto</xsl:attribute>     
            <xsl:apply-templates />
        </xsl:element>
    </xsl:template>
    
    <!-- THIS RESOLVES THE ISSSUE NUMBER 14 IN THE DOCUMENT 'Analisi delle differenze tra DTD 2v4.doc' -->
    <!-- EACH GENERIC ELEMENT MUST HAVE A NAME ATTRIBUTE -->
    <xsl:template match="nir:inlinea | nir:blocco | nir:contenitore | nir:gerarchia | nir:l1 | nir:l2 | nir:l3 | nir:l4 | nir:l5 | nir:l6 | nir:l7 | nir:l8 | nir:l9 | nir:partizione">
        <xsl:element name="{name(.)}" namespace="http://www.normeinrete.it/nir/2.2/">
            <xsl:apply-templates mode="attributesSelector" select="." />
            <xsl:attribute name="nome">
                <xsl:value-of select="concat(name(.),'-',generate-id())" />
            </xsl:attribute>
            <xsl:apply-templates />
        </xsl:element>
    </xsl:template>

    <!-- THIS RESOLVES THE ISSSUE NUMBER 15 IN THE DOCUMENT 'Analisi delle differenze tra DTD 2v4.doc' -->
    <!-- THE ELEMENTS OF TYPE 'blocco' OR 'h:p' CONTAINED IN A HIERARCHICAL ELEMENT (l1, l2 and so on) MUST BE INSERTED IN A 'contenitore' ELEMENT -->
    <xsl:template match="nir:l1/h:p | nir:l1/nir:blocco | nir:l2/h:p | nir:l2/nir:blocco | nir:l3/h:p | nir:l3/nir:blocco | nir:l4/h:p | nir:l4/nir:blocco
        | nir:l5/h:p | nir:l5/nir:blocco | nir:l6/h:p | nir:l6/nir:blocco | nir:l7/h:p | nir:l7/nir:blocco | nir:l8/h:p | nir:l8/nir:blocco | nir:l9/h:p | nir:l9/nir:blocco">
        <xsl:element name="contenitore" namespace="http://www.normeinrete.it/nir/2.2/">
             <xsl:attribute name="nome">
                 <xsl:value-of select="concat('contenitoreGenerico_',generate-id())" />
             </xsl:attribute>
             <xsl:attribute name="id" select="generate-id()" />
             <xsl:element name="{name(.)}">
                 <xsl:if test="./@id = ''">
                     <xsl:attribute name="id">
                         <xsl:value-of select="generate-id()" />
                     </xsl:attribute>
                 </xsl:if>
                 <xsl:for-each select="@*">
                     <xsl:apply-templates mode="attributesSelector" select="." />
                 </xsl:for-each>
                 <xsl:apply-templates />
             </xsl:element>   
        </xsl:element>
    </xsl:template>
     
    <!-- THESE TEMPLATES DELETE THE PROPRIETARIO ELEMENTS THAT ARE NOT USED  -->
    <!--<xsl:template match="*:std | *:rnq | *:mat | *:stds | *:cls | *:metaURN">
    </xsl:template>-->
</xsl:stylesheet>

