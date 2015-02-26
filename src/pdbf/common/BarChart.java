package pdbf.common;

public class BarChart extends Chart {

    public BarChart(String query, double x1, double x2, double y1, double y2, long page, boolean logScale, String xUnitName, String yUnitName, String options) {
	super(query, x1, x2, y1, y2, page, logScale, xUnitName, yUnitName, options);
    }

    public BarChart(String query, double x1, double x2, double y1, double y2, long page, boolean logScale, String xUnitName, String yUnitName) {
	super(query, x1, x2, y1, y2, page, logScale, xUnitName, yUnitName);
    }

    /*
     * Needed for GSON
     */
    public BarChart() {
    }

}
