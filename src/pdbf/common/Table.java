package pdbf.common;

public class Table extends Visualization {

    public Table(String query, double x1, double x2,
	    double y1, double y2, long page) {
	super(query, x1, x2, y1, y2, page);
    }

    /*
     * Needed for GSON
     */
    public Table() {
    }

}
