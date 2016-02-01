package pdbf.compilers;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;

import org.apache.commons.io.FileUtils;

import pdbf.misc.Tools;

import static pdbf.compilers.VM_Compiler.*;
import static pdbf.compilers.HTML_PDF_Compiler.pdfHTML_Header;

public class TAR_Compiler {

    public static DecimalFormat df = new DecimalFormat("0000000000");

    public static void main(String[] args) {
	System.out.println("Compiling VM...");

	String a = new File(args[1]).getName();
	if (!a.toUpperCase().endsWith(".HTML")) {
	    System.err.println("Error: Only .HTML files are supported as first argument!");
	    System.exit(1);
	}
	if (!args[2].toUpperCase().endsWith(".TAR")) {
	    System.err.println("Error: Only .TAR files are supported as second argument!");
	    System.exit(1);
	}
	String basename = args[1].substring(0, args[1].length() - 5);

	try {
	    String vmcontent = FileUtils.readFileToString(new File(args[2]), StandardCharsets.ISO_8859_1);
	    if (vmcontent.toLowerCase().contains("</script>")) {
		System.err
			.println("The tar file cannot be used to generate a pdbf document! Try to change the content of the tar file such that it doesnt contain the string \"</script>\" and then try again.");
		System.exit(1);
	    }
	    StringBuilder sb = new StringBuilder(vmcontent);

	    // Add empty dummy file to tar because of PDF file header
	    String name = "%PDF-1.5\n%ª«¬­\n%DO_NOT_DELETE\0\n1 0 obj\nstream\n<head><meta charset=UTF-8><script>";
	    String n = name + sb.substring(name.length(), 512);
	    int von = 0;
	    sb = new StringBuilder(n + vmcontent);

	    tarHeaderLength(sb, von, 0);
	    tarHeaderChecksum(sb, von);
	    // Double padding makes tar programs think that there is no more
	    // data in tar after this entry
	    tarPadding(sb);
	    tarPadding(sb);

	    // Add new file to tar
	    String removeFromHTML = "%PDF-1.X\n" + pdfHTML_Header;
	    String addToHTML = "";
	    String html = FileUtils.readFileToString(new File(args[1]), StandardCharsets.ISO_8859_1).substring(removeFromHTML.length());
	    html = addToHTML + html;

	    String vm = sb.toString();

	    sb.append(html);

	    int offset = (vm.length() - removeFromHTML.length() + addToHTML.length());
	    Tools.fixXref(sb, offset);

	    FileUtils.writeStringToFile(new File(basename + ".tar"), sb.toString(), StandardCharsets.ISO_8859_1);
	} catch (Exception e) {
	    e.printStackTrace();
	}

	System.out.println("Finished...");
    }

}
