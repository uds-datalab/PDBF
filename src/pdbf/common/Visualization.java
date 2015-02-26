package pdbf.common;

public abstract class Visualization {
    public String query;
    public double x1;
    public double x2;
    public double y1;
    public double y2;
    public long page;

    public Visualization(String query, double x1, double x2, double y1, double y2, long page) {
	super();
	this.query = query;
	this.x1 = x1;
	this.x2 = x2;
	this.y1 = y1;
	this.y2 = y2;
	this.page = page;
    }

    /*
     * Needed for GSON
     */
    public Visualization() {
    }

}
