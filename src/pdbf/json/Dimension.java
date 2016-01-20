package pdbf.json;

/*
 * Defines the height and width of a pdf document in sp ( http://www.golatex.de/wiki/LaTeX-Einheiten )
 */

public class Dimension {
    public double width;
    public double height;

    public Dimension(double width, double height) {
	this.width = width;
	this.height = height;
    }

}
