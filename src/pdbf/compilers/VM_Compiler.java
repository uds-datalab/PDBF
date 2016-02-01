package pdbf.compilers;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;

import org.apache.commons.io.FileUtils;

import pdbf.misc.Tools;

public class VM_Compiler {

    public static DecimalFormat df = new DecimalFormat("0000000000");

    public static void main(String[] args) {
	System.out.println("Compiling VM...");

	String a = new File(args[1]).getName();
	if (!a.toUpperCase().endsWith(".HTML")) {
	    System.err.println("Error: Only .HTML files are supported as first argument!");
	    System.exit(-1);
	}
	if (!args[2].toUpperCase().endsWith(".OVA")) {
	    System.err.println("Error: Only .OVA files are supported as second argument!");
	    System.exit(-1);
	}
	String basename = args[1].substring(0, args[1].length() - 5);

	try {
	    String vmcontent = FileUtils.readFileToString(new File(args[2]), StandardCharsets.ISO_8859_1);
	    if (vmcontent.toLowerCase().contains("</script>")) {
		System.err
			.println("The ova file cannot be used to generate a pdbf document! Try to change the content of the ova file such that it doesnt contain the string \"</script>\" and then try again.");
		System.exit(-1);
	    }
	    StringBuilder sb = new StringBuilder(vmcontent);
	    String replace = "%PDF-1.5\n%ª«¬­.ovf\0\n1 0 obj\nstream\n<head><meta charset=UTF-8><script>";
	    sb.replace(0, replace.length(), replace);

	    tarHeaderChecksum(sb, 0);

	    // Add new file to tar
	    String name = "DO_NOT_DELETE\0";
	    String n = name + sb.substring(name.length(), 512);
	    int von = sb.length();
	    sb.append(n);

	    String removeFromHTML = "%PDF-1.5\n%ª«¬­<!DOCTYPE html><html dir=\"ltr\" mozdisallowselectionprint moznomarginboxes>"
		    + "<head><meta charset=\"utf-8\"><!--\n1337 0 obj\nstream";
	    String addToHTML = "</script>";
	    String html = FileUtils.readFileToString(new File(args[1]), StandardCharsets.ISO_8859_1).substring(removeFromHTML.length());
	    html = addToHTML + html;

	    String vm = sb.toString();

	    sb.append(html);
	    int oldLength = sb.length();

	    int offset = (vm.length() - removeFromHTML.length() + addToHTML.length());
	    Tools.fixXref(sb, offset);

	    int diffLength = sb.length() - oldLength;

	    tarHeaderLength(sb, von, html.length() + diffLength);
	    tarHeaderChecksum(sb, von);
	    tarPadding(sb);

	    FileUtils.writeStringToFile(new File(basename + ".ova"), sb.toString(), StandardCharsets.ISO_8859_1);
	} catch (Exception e) {
	    e.printStackTrace();
	}

	System.out.println("Finished...");
    }

    static void tarHeaderChecksum(StringBuilder sb, int offset) {
 	int checksum = 0;
 	sb.setCharAt(offset + 148, ' ');
 	sb.setCharAt(offset + 149, ' ');
 	sb.setCharAt(offset + 150, ' ');
 	sb.setCharAt(offset + 151, ' ');
 	sb.setCharAt(offset + 152, ' ');
 	sb.setCharAt(offset + 153, ' ');
 	sb.setCharAt(offset + 154, ' ');
 	sb.setCharAt(offset + 155, ' ');
 	for (int i = 0; i < 512; ++i) {
 	    checksum += sb.charAt(offset + i);
 	}
 	// six digit octal number with leading zeroes
 	String chk = Integer.toOctalString(checksum);
 	sb.replace(offset + 148, offset + 155, "0000000");
 	sb.replace(offset + 155 - chk.length(), offset + 155, chk);
 	sb.setCharAt(offset + 155, '\0');
     }
     
     static void tarPadding(StringBuilder sb) {
 	int addZeros = 512 - sb.length() % 512;
 	for (int i = 0; i < addZeros; ++i) {
 	    sb.append('\0');
 	}
     }
     
     static void tarHeaderLength(StringBuilder sb, int offset, int length) {
 	// Tar length field
 	sb.replace(offset + 124, offset + 136, "00000000000\0");
 	String si = Integer.toOctalString(length);
 	sb.replace(offset + 135 - si.length(), offset + 135, si);
     }

}
