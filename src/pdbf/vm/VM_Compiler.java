package pdbf.vm;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;

import org.apache.commons.io.FileUtils;

import pdbf.common.Tools;

public class VM_Compiler {

    public static DecimalFormat df = new DecimalFormat("0000000000");

    public static void main(String[] args) {
	System.out.println("Compiling VM...");

	String a = new File(args[1]).getName();
	if (!a.toUpperCase().endsWith(".HTML")) {
	    System.err.println("Error: Only .HTML files are supported!");
	    System.exit(-1);
	}
	String basename = args[1].substring(0, args[1].length() - 5);

	try {
	    String vmcontent = FileUtils.readFileToString(new File(args[2]), StandardCharsets.ISO_8859_1);
	    if (vmcontent.toLowerCase().contains("</script>")) {
		System.err.println("The ova file cannot be used to generate a pdbf document! Try to somehow change the content of the ova file and then try again.");
		System.exit(-1);
	    }
	    StringBuilder sb = new StringBuilder(vmcontent);
	    String replace = "%PDF-1.5\n%ª«¬­.ovf\0\n1 0 obj\nstream\n<head><meta charset=UTF-8><script>";
	    sb.replace(0, replace.length(), replace);

	    // Fix tar
	    int checksum = 0;
	    sb.setCharAt(148, ' ');
	    sb.setCharAt(149, ' ');
	    sb.setCharAt(150, ' ');
	    sb.setCharAt(151, ' ');
	    sb.setCharAt(152, ' ');
	    sb.setCharAt(153, ' ');
	    sb.setCharAt(154, ' ');
	    sb.setCharAt(155, ' ');
	    for (int i = 0; i < 512; ++i) {
		checksum += sb.charAt(i);
	    }
	    // six digit octal number with leading zeroes
	    String chk = Integer.toOctalString(checksum);
	    sb.replace(148, 155, "0000000");
	    sb.replace(155 - chk.length(), 155, chk);
	    sb.setCharAt(155, '\0');

	    // Add new file to tar
	    String name = "DO_NOT_DELETE\0";
	    String n = name + sb.substring(name.length(), 513);
	    int von = sb.length();
	    sb.append(n);

	    String removeFromHTML = "%PDF-1.5\n%ª«¬­<!DOCTYPE html><html dir=\"ltr\" mozdisallowselectionprint moznomarginboxes>" + "<head><meta charset=\"utf-8\"><!--\n1337 0 obj\nstream";
	    String addToHTML = "</script>";
	    String html = FileUtils.readFileToString(new File(args[1]), StandardCharsets.ISO_8859_1).substring(removeFromHTML.length());
	    html = addToHTML + html;

	    // Fix tar
	    sb.replace(von + 124, von + 136, "00000000000\0");
	    String si = Integer.toOctalString(html.length());
	    sb.replace(von + 135 - si.length(), von + 135, si);

	    checksum = 0;
	    sb.setCharAt(von + 148, ' ');
	    sb.setCharAt(von + 149, ' ');
	    sb.setCharAt(von + 150, ' ');
	    sb.setCharAt(von + 151, ' ');
	    sb.setCharAt(von + 152, ' ');
	    sb.setCharAt(von + 153, ' ');
	    sb.setCharAt(von + 154, ' ');
	    sb.setCharAt(von + 155, ' ');
	    for (int i = 0; i < 512; ++i) {
		checksum += sb.charAt(von + i);
	    }
	    // six digit octal number with leading zeroes
	    chk = Integer.toOctalString(checksum);
	    sb.replace(von + 148, von + 155, "0000000");
	    sb.replace(von + 155 - chk.length(), von + 155, chk);
	    sb.setCharAt(von + 155, '\0');

	    String vm = sb.toString();

	    sb.append(html);

	    int offset = (vm.length() - removeFromHTML.length() + addToHTML.length());
	    Tools.fixXref(sb, offset);

	    FileUtils.writeStringToFile(new File(basename + ".ova"), sb.toString(), StandardCharsets.ISO_8859_1);
	} catch (Exception e) {
	    e.printStackTrace();
	}

	System.out.println("Finished...");
    }

}
