package pdbf.common;

public class BarChart extends Chart {

    public BarChart(String query, double x1, double x2,
	    double y1, double y2, boolean logScale, Unit xUnit, Unit yUnit, long page) {
	super(query, x1, x2, y1, y2, logScale, xUnit, yUnit, page);
    }

    /*
     * Needed for GSON
     */
    public BarChart() {
    }

}
