package pdbf.common;

/* 
 * We need this because dates have different counting scheme on the axis
 */
public class Date extends Unit {

    public Date(Long rangeFrom, Long rangeTo) {
	super("Datum", rangeFrom, rangeTo);
    }

    public Date() {
	super("Datum");
    }

}
