package pdbf.common;

public abstract class Chart extends Visualization {
    public boolean logScale;
    public String xUnitName;
    public String yUnitName;
    public Long yUnitFrom;
    public Long yUnitTo;
    public String options;

    public Chart(String query, double x1, double x2, double y1, double y2,
	    long page, boolean logScale, String xUnitName, String yUnitName,
	    long yUnitFrom, long yUnitTo, String options) {
	super(query, x1, x2, y1, y2, page);
	this.logScale = logScale;
	this.xUnitName = xUnitName;
	this.yUnitName = yUnitName;
	this.yUnitFrom = yUnitFrom;
	this.yUnitTo = yUnitTo;
	this.options = options;
    }

    public Chart(String query, double x1, double x2, double y1, double y2,
	    long page, boolean logScale, String xUnitName, String yUnitName) {
	super(query, x1, x2, y1, y2, page);
	this.logScale = logScale;
	this.xUnitName = xUnitName;
	this.yUnitName = yUnitName;
    }

    /*
     * Needed for GSON
     */
    public Chart() {
    }

}