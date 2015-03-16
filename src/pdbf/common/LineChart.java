package pdbf.common;

public class LineChart extends Chart {

    public LineChart(String query, double x1, double x2, double y1, double y2, long page, boolean logScale, String xUnitName, String yUnitName, double zoom, double quality, String legendpos, String options) {
	super(query, x1, x2, y1, y2, page, logScale, xUnitName, yUnitName, zoom, quality, legendpos, options);
    }

    /*
     * Needed for GSON
     */
    public LineChart() {
    }

}
