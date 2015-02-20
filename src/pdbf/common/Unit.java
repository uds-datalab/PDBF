package pdbf.common;

public abstract class Unit {
    public String name;
    public Long rangeFrom; // Can be null
    public Long rangeTo; // Can be null

    public Unit(String name, Long rangeFrom, Long rangeTo) {
	super();
	this.name = name;
	this.rangeFrom = rangeFrom;
	this.rangeTo = rangeTo;
    }

    public Unit(String name) {
	super();
	this.name = name;
    }

    /*
     * Needed for GSON
     */
    public Unit() {
    }

}
