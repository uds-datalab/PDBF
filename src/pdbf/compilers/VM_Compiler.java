package pdbf.compilers;

import java.io.File;
import java.io.RandomAccessFile;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import pdbf.PDBF_Compiler;
import pdbf.tests.CheckAttached;

public class VM_Compiler {

    public static DecimalFormat df = new DecimalFormat("0000000000");

    public static String fileType = "ova";

    public static void main(String[] args) {
	System.out.println("Compiling VM...");

	String a = new File(args[0]).getName();
	// TODO: sanity checks. compare beginning of html/pdbf file with
	// "removeFromHTML".
	if (!a.toUpperCase().endsWith(".HTML")) {
	    System.err.println("Error: Only .HTML files are supported as first argument!");
	    System.exit(1);
	}
	// TODO: sanity checks. use "testTar" to check if ova/tar file is valid.
	// for ova we should even test if name of the first file in tar ends
	// with ".ovf"
	if (!args[1].toUpperCase().endsWith("." + fileType)) {
	    System.err.println("Error: Only ." + fileType + " files are supported as second argument!");
	    System.exit(1);
	}
	String basename = args[0].substring(0, args[0].length() - 5);

	if (CheckAttached.checkAttached(new File(args[0]))) {
	    System.err.println("Error: This PDBF file has already an tar or ova file attached!");
	    System.exit(1);
	}

	try {
	    // The order of contents in the outFile is the following: first
	    // ova/tar, then html, then pdf
	    RandomAccessFile outFile = new RandomAccessFile(new File(basename + "." + fileType), "rw");
	    outFile.setLength(0);

	    // For keeping track of progress
	    String removeFromHTML = "%PDF-1.5\n%ª«¬­<!DOCTYPE html><html dir=\"ltr\" mozdisallowselectionprint moznomarginboxes>" + "<head><meta charset=\"utf-8\"><!--\n1337 0 obj\nstream";
	    String addToHTML = "</script>";
	    RandomAccessFile ovaOrTarFile = new RandomAccessFile(new File(args[1]), "rw");
	    RandomAccessFile pdbfFile = new RandomAccessFile(new File(args[0]), "rw");
	    NumberFormat nf = NumberFormat.getPercentInstance();
	    nf.setMinimumFractionDigits(2);
	    double totalRemaining = ovaOrTarFile.length() + pdbfFile.length() + addToHTML.length() - removeFromHTML.length();

	    // Replace beginning of the ovaOrTarFile file with our
	    // (ova/tar)/pdf/html file header
	    String replaceInOvaOrTar = "%PDF-1.5\n%ª«¬­.ovf\0\n1 0 obj\nstream\n<head><meta charset=UTF-8><script>";
	    ovaOrTarFile.seek(replaceInOvaOrTar.length());
	    outFile.write(replaceInOvaOrTar.getBytes(StandardCharsets.ISO_8859_1));

	    // Read the ovaOrTarFile in chunks, check that it doesnt contain
	    // "</script>", and then write it to outFile
	    // We read the file in overlapping chunks to avoid missing something
	    // at the chunk boundaries
	    Pattern p = Pattern.compile("</script>", Pattern.CASE_INSENSITIVE);
	    int halfbuffer = PDBF_Compiler.bytearray.length / 2;
	    long remaining = ovaOrTarFile.length() - replaceInOvaOrTar.length();
	    int readbytes = (int) Math.min(halfbuffer, remaining);
	    ovaOrTarFile.readFully(PDBF_Compiler.bytearray, halfbuffer, readbytes);
	    remaining -= readbytes;
	    outFile.write(PDBF_Compiler.bytearray, halfbuffer, readbytes);

	    do {
		System.out.println(nf.format(outFile.length() / totalRemaining) + " done");
		System.arraycopy(PDBF_Compiler.bytearray, halfbuffer, PDBF_Compiler.bytearray, 0, halfbuffer);
		readbytes = (int) Math.min(halfbuffer, remaining);
		ovaOrTarFile.readFully(PDBF_Compiler.bytearray, halfbuffer, readbytes);
		remaining -= readbytes;
		outFile.write(PDBF_Compiler.bytearray, halfbuffer, readbytes);
		String search = new String(PDBF_Compiler.bytearray, StandardCharsets.ISO_8859_1);
		Matcher m = p.matcher(search);
		if (m.matches()) {
		    System.err.println("The " + fileType + " file cannot be used to generate a pdbf document! Try to change the content of the " + fileType + " file such that it doesnt contain the string \"</script>\" and then try again.");
		    outFile.close();
		    new File(basename + "." + fileType).delete();
		    System.exit(1);
		}
	    } while (remaining > 0);

	    // We use a 512 byte buffer for the tar/ova header
	    // The checksum in the tar header of the first file in the tar has
	    // to be fixed because we changed the name of the file (see variable
	    // "replaceInOvaOrTar")
	    StringBuilder sb = new StringBuilder(512);
	    byte[] tmp = new byte[512];
	    long oldPos = outFile.getFilePointer();
	    outFile.seek(0);
	    outFile.readFully(tmp);
	    sb.append(new String(tmp, StandardCharsets.ISO_8859_1));
	    tarHeaderChecksum(sb, 0);
	    outFile.seek(0);
	    tmp = sb.toString().getBytes(StandardCharsets.ISO_8859_1);
	    outFile.write(tmp);
	    outFile.seek(oldPos);

	    // Add dummy file to tar which holds the html/pdf data
	    String name = "DO_NOT_DELETE\0";
	    sb.replace(0, name.length(), name);
	    String n = name + sb.substring(name.length(), 512);
	    long von = outFile.length();
	    sb.append(n);

	    String html = FileUtils.readFileToString(new File(args[0]), StandardCharsets.ISO_8859_1).substring(removeFromHTML.length());
	    html = addToHTML + html;

	    long vm = outFile.length();

	    sb.append(html);
	    long oldLength = sb.length();

	    long offset = (vm - removeFromHTML.length() + addToHTML.length());
	    Tools.fixXref(sb, offset);

	    int diffLength = sb.length() - oldLength;

	    tarHeaderLength(sb, von, html.length() + diffLength);
	    tarHeaderChecksum(sb, von);
	    // Special PDF padding with % because PDF does not like zero bytes
	    // after %%EOF
	    int i = sb.lastIndexOf("%%EOF");
	    while (sb.length() % 512 != 0) {
		sb.insert(i, '%');
	    }

	    ovaOrTarFile.close();
	    outFile.close();
	} catch (Throwable e) {
	    e.printStackTrace();
	    System.exit(1);
	}
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
