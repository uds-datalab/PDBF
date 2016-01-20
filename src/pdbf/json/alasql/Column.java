package pdbf.json.alasql;

/*
 * JSON class defining a column for alasql
 */

public class Column {
    String columnid;
    String dbtypeid;
    
    public Column(String columnid, String dbtypeid) {
	super();
	this.columnid = columnid;
	this.dbtypeid = dbtypeid;
    }
    
}
