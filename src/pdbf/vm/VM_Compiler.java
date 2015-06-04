package pdbf.vm;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;

import org.apache.commons.io.FileUtils;

public class VM_Compiler {

    public static DecimalFormat df = new DecimalFormat("0000000000");

    public static void main(String[] args) {
	System.out.println("Compiling VM...");

	try {
	    StringBuilder sb = new StringBuilder(FileUtils.readFileToString(new File("DOS.vdi"), StandardCharsets.ISO_8859_1));
	    String replace = "%PDF-1.5\n1 0 obj\nstream\n<head><meta charset=UTF-8><script>";
	    sb.replace(0, replace.length(), replace);
	    String vm = sb.toString();
	    
	    String removeFromHTML = "%PDF-1.5\n%<!DOCTYPE html><html dir=\"ltr\" mozdisallowselectionprint moznomarginboxes>" + "<head><meta charset=\"utf-8\"><!--\n1337 0 obj\nstream";
	    String addToHTML = "</script>";
	    String html = FileUtils.readFileToString(new File("minimal.html"), StandardCharsets.ISO_8859_1).substring(removeFromHTML.length());
	    html = addToHTML + html;
	    sb.append(html);

	    // Fix xref
	    int offset = (vm.length() - removeFromHTML.length() + addToHTML.length());
	    int b = sb.lastIndexOf("\nxref\n") + "\nxref\n".length();
	    int e;
	    int x;
	    // skip first entry
	    b = sb.indexOf("\n", b + 1) + 1;
	    e = sb.indexOf(" ", b);
	    try {
		while (true) {
		    b = sb.indexOf("\n", b + 1) + 1;
		    e = sb.indexOf(" ", b);
		    String tmp = sb.substring(b, e);
		    x = Integer.parseInt(tmp);
		    sb.replace(b, e, df.format(x + offset));
		}
	    } catch (NumberFormatException ex) {
	    }

	    b = sb.indexOf("startxref\n") + "startxref\n".length();
	    e = sb.indexOf("\n", b);
	    x = Integer.parseInt(sb.substring(b, e));
	    sb.replace(b, e, "" + (x + offset));

	    FileUtils.writeStringToFile(new File("out/web/test.html"), sb.toString(), StandardCharsets.ISO_8859_1);
	} catch (Exception e) {
	    e.printStackTrace();
	}

    }

}
