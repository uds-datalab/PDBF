package pdbf.common;

public abstract class Chart extends Visualization {
    public boolean logScale;
    public Unit xUnit;
    public Unit yUnit;

    public Chart(String query, double x1, double x2,
	    double y1, double y2, boolean logScale, Unit xUnit, Unit yUnit, long page) {
	super(query, x1, x2, y1, y2, page);
	this.logScale = logScale;
	this.xUnit = xUnit;
	this.yUnit = yUnit;
    }

    /*
     * Needed for GSON
     */
    public Chart() {
    }

}
