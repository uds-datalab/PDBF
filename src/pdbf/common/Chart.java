package pdbf.common;

public abstract class Chart extends Visualization {
    public boolean logScale;
    public String xUnitName;
    public String yUnitName;
    public String options;
    public String legendpos;
    public double zoom;
    public double quality;

    public Chart(String query, double x1, double x2, double y1, double y2, long page, boolean logScale, String xUnitName, String yUnitName, double zoom, double quality, String legendpos, String options) {
	super(query, x1, x2, y1, y2, page);
	this.logScale = logScale;
	this.xUnitName = xUnitName;
	this.yUnitName = yUnitName;
	this.options = options;
	this.zoom = zoom;
	this.quality = quality;
	this.legendpos = legendpos;
    }

    /*
     * Needed for GSON
     */
    public Chart() {
    }

}
