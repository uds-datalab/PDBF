package pdbf.common;

public abstract class Chart extends Visualization {
    /*Keep all options here. 
     * This is beneficial because then you can also set options 
     * on how other representations of this chart look like*/
    
    //General Chart Options
    public String options;
    public double zoom;
    public double quality;
    
    //LineChart and BarChart
    public boolean logScale;
    public String legendpos;
    public String xUnitName;
    public String yUnitName;
    public boolean includeZero;
    public boolean drawPoints;
    public boolean fillGraph;
    public boolean showRangeSelector;
    
    //BarChart
    public int overlap;
    
    //Pivot
    public String rows;
    public String cols;
    public String aggregation;
    public String aggregationattribute;
    public String aggregationBig;
    public String aggregationattributeBig;
}
