<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
  <html>
  <head>
    <style type="text/css">
       .tagk {color: gray;}
    </style>
  </head>
  <body>
  <h2>OSM pubs</h2>
    <table border="1">
      <tr bgcolor="#9acd32">
        <th>type</th>
        <th>id</th>
        <th>loc</th>
        <th>Name</th>
        <th>Tags</th>
      </tr>
      <xsl:for-each select="osm/node">
        <xsl:choose>
        <xsl:when test="tag[@k='amenity'][@v='pub']">
	      <tr>
		<td>node</td>
		<td><a><xsl:attribute name='href'>http://www.openstreetmap.org/browse/node/<xsl:value-of select="@id"/></xsl:attribute><xsl:value-of select="@id"/></a></td>
		<td><a><xsl:attribute name='href'>http://www.openstreetmap.org/?lat=<xsl:value-of select="@lat"/>&amp;lon=<xsl:value-of select="@lon"/>&amp;zoom=18</xsl:attribute><xsl:value-of select="@lat"/>, <xsl:value-of select="@lon"/></a></td>
		<td>n<xsl:value-of select="tag[@k='name']"/>e</td>
		<td>
                  <xsl:for-each select="tag">
			<span class="tagk"><xsl:value-of select="@k"/>:</span><span class="tagv"><xsl:value-of select="@v"/></span><br />
                  </xsl:for-each>
		</td>
	      </tr>
       </xsl:when>
       </xsl:choose>
     </xsl:for-each>
    </table>
  </body>
  </html>
</xsl:template>
</xsl:stylesheet>
