<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
    <table id="xapiresults" border="1">
      <tr>
        <th>Node</th>
        <th>Tags</th>
      </tr>

      <xsl:for-each select="osm/node">
        <xsl:choose>
        <xsl:when test="tag"><!-- we only display items with tags -->
	      <tr>
		<td><div class="xapiresults_objid">node <a><xsl:attribute name='href'>http://www.openstreetmap.org/browse/node/<xsl:value-of select="@id"/></xsl:attribute>
			<xsl:value-of select="@id"/></a></div>
		    <a class="xapiresults_latlon"><xsl:attribute name='href'>http://www.openstreetmap.org/?lat=<xsl:value-of select="@lat"/>&amp;lon=<xsl:value-of select="@lon"/>&amp;zoom=18</xsl:attribute><xsl:value-of select="@lat"/>, <xsl:value-of select="@lon"/></a></td>
		<td class="xapiresults_tagcell">
                  <xsl:for-each select="tag">
                    <xsl:choose>
                      <xsl:when test="@k='name'">
                        <div class="tag_hi">
			  <span class="tagk"><xsl:value-of select="@k"/>:</span><span class="tagv"><xsl:value-of select="@v"/></span>
                        </div>
                      </xsl:when>
                      <xsl:otherwise>
                        <div class="tag">
			  <span class="tagk"><xsl:value-of select="@k"/>:</span><span class="tagv"><xsl:value-of select="@v"/></span>
                        </div>
                      </xsl:otherwise>
                    </xsl:choose>
                  </xsl:for-each>
		</td>
	      </tr>
       </xsl:when>
       </xsl:choose>
     </xsl:for-each>

    </table>
</xsl:template>

</xsl:stylesheet>
