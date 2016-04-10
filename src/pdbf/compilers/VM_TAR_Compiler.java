package pdbf.compilers;

import java.io.File;
import java.io.RandomAccessFile;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.Arrays;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import pdbf.PDBF_Compiler;
import pdbf.misc.Tools;
import pdbf.tests.CheckAttached;

public class VM_TAR_Compiler {

    public static DecimalFormat df = new DecimalFormat("0000000000");

    public static String fileType = "ova";

    public static String ova_Header = "%PDF-1.5\n%ª«¬­.ovf\0\n1337 0 obj\nstream\n<head><meta charset=UTF-8><script>";
    public static String tar_Header = "%PDF-1.5\n%ª«¬­DO_NOT_DELETE\0\n1337 0 obj\nstream\n<head><meta charset=UTF-8><script>";

    public static void main(String[] args) {
	boolean isVM = fileType.equals("ova");
	if (isVM) {
	    System.out.println("Compiling VM...");
	} else {
	    System.out.println("Compiling TAR...");
	}

	String a = new File(args[0]).getName();
	// TODO: sanity checks. compare beginning of html/pdbf file with
	// "removeFromHTML".
	if (!a.toLowerCase().endsWith(".html")) {
	    System.err.println("Error: Only .html files are supported as first argument!");
	    System.exit(1);
	}
	// TODO: sanity checks. use "testTar" to check if ova/tar file is valid.
	// for ova we should even test if name of the first file in tar ends
	// with ".ovf"
	if (!args[1].toLowerCase().endsWith("." + fileType)) {
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
	    String removeFromPdbf = "%PDF-1.5\n" + HTML_PDF_Compiler.pdfHTML_Header;
	    String addToPdbf = "</script>";
	    RandomAccessFile ovaOrTarFile = new RandomAccessFile(new File(args[1]), "rw");
	    RandomAccessFile pdbfFile = new RandomAccessFile(new File(args[0]), "rw");
	    NumberFormat nf = NumberFormat.getPercentInstance();
	    nf.setMinimumFractionDigits(2);
	    long totalRemaining = ovaOrTarFile.length() + pdbfFile.length() + addToPdbf.length() - removeFromPdbf.length() + 512;

	    // Replace beginning of the ovaOrTarFile file with our
	    // (ova/tar)/pdf/html file header
	    String replaceInOvaOrTar;
	    if (isVM) {
		replaceInOvaOrTar = ova_Header;
		ovaOrTarFile.seek(replaceInOvaOrTar.length());
		outFile.write(replaceInOvaOrTar.getBytes(StandardCharsets.ISO_8859_1));
	    } else {
		replaceInOvaOrTar = "";
		byte[] b = new byte[512];
		ovaOrTarFile.read(b, 0, b.length);
		StringBuilder tarHeader = new StringBuilder(new String(b, StandardCharsets.ISO_8859_1));
		tarHeader.replace(0, tar_Header.length(), tar_Header);
		tarHeader.replace(156, 157, "0"); // could be a pax header block
						  // http://pubs.opengroup.org/onlinepubs/009695399/utilities/pax.html#tag_04_100_13_02
		tarHeaderLength(tarHeader, 0, 0);
		ovaOrTarFile.seek(0);
		outFile.write(tarHeader.toString().getBytes(StandardCharsets.ISO_8859_1));
	    }

	    // Read the ovaOrTarFile in chunks, check that it doesnt contain
	    // "</script>" or "endstream", and then write it to outFile
	    // We read the file in overlapping chunks to avoid missing something
	    // at the chunk boundaries
	    Pattern p = Pattern.compile("(?:</script>|(?: ?\r| ?\n|\r\n)endstream(?: ?\r| ?\n|\r\n))", Pattern.CASE_INSENSITIVE);
	    int halfbuffer = PDBF_Compiler.bytearray.length / 2;
	    long remaining = ovaOrTarFile.length() - replaceInOvaOrTar.length();
	    int readbytes = (int) Math.min(halfbuffer, remaining);
	    ovaOrTarFile.readFully(PDBF_Compiler.bytearray, halfbuffer, readbytes);
	    remaining -= readbytes;
	    outFile.write(PDBF_Compiler.bytearray, halfbuffer, readbytes);

	    do {
		System.out.println(nf.format((double) outFile.length() / totalRemaining) + " done");
		System.arraycopy(PDBF_Compiler.bytearray, halfbuffer, PDBF_Compiler.bytearray, 0, halfbuffer);
		readbytes = (int) Math.min(halfbuffer, remaining);
		ovaOrTarFile.readFully(PDBF_Compiler.bytearray, halfbuffer, readbytes);
		remaining -= readbytes;
		outFile.write(PDBF_Compiler.bytearray, halfbuffer, readbytes);
		String search = new String(PDBF_Compiler.bytearray, StandardCharsets.ISO_8859_1);
		Matcher m = p.matcher(search);
		if (m.find()) {
		    if (isVM) {
			System.err.println("The OVA file cannot be used to generate a pdbf document! Try to change the content of the OVA"
				+ " file such that it doesnt contain the string \"</script>\" or \"endobj\" and then try again.");
		    } else {
			System.err
				.println("The TAR file cannot be used to generate a pdbf document! You can try to put the data into a "
					+ "compressed fileformat such as tar.gz or zip and then wrap that file again into a tar archive and then try again with that file.");
		    }
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
	    outFile.write(sb.toString().getBytes(StandardCharsets.ISO_8859_1));
	    outFile.seek(oldPos);

	    // Add dummy file to tar which holds the html/pdf data
	    String name = "DO_NOT_DELETE\0";
	    sb.replace(0, name.length(), name);
	    String n = sb.toString();
	    long von = outFile.length();
	    outFile.write(n.getBytes(StandardCharsets.ISO_8859_1));

	    // write pdbfFile to outFile
	    pdbfFile.seek(removeFromPdbf.length());
	    long pdbfLength = pdbfFile.length() - removeFromPdbf.length() + addToPdbf.length();
	    long vm = outFile.length();
	    outFile.write(addToPdbf.getBytes(StandardCharsets.ISO_8859_1));
	    // write pdbfFile to outFile

	    remaining = pdbfFile.length() - removeFromPdbf.length();
	    readbytes = (int) Math.min(halfbuffer, remaining);
	    pdbfFile.readFully(PDBF_Compiler.bytearray, halfbuffer, readbytes);
	    remaining -= readbytes;
	    outFile.write(PDBF_Compiler.bytearray, halfbuffer, readbytes);
	    do {
		System.out.println(nf.format((double) outFile.length() / totalRemaining) + " done");
		System.arraycopy(PDBF_Compiler.bytearray, halfbuffer, PDBF_Compiler.bytearray, 0, halfbuffer);
		Arrays.fill(PDBF_Compiler.bytearray, halfbuffer, 2 * halfbuffer, (byte) 0);
		readbytes = (int) Math.min(halfbuffer, remaining);
		pdbfFile.readFully(PDBF_Compiler.bytearray, halfbuffer, readbytes);
		remaining -= readbytes;
		outFile.write(PDBF_Compiler.bytearray, halfbuffer, readbytes);
		String search = new String(PDBF_Compiler.bytearray, StandardCharsets.ISO_8859_1);
		StringBuilder sb2 = new StringBuilder(search);
		int i = sb2.lastIndexOf("%%EOF\n");
		sb2.setLength(i + "%%EOF\n".length());

		long oldLength = sb2.length();
		long offset = (vm - removeFromPdbf.length() + addToPdbf.length());
		if (remaining == 0) {
		    if (!Tools.fixXref(sb2, offset)) {
			System.err.println("Fix XREF failed!");
			System.exit(1);
		    }
		    outFile.seek(outFile.length() - oldLength);
		    // Special PDF padding with % because PDF does not like zero
		    // bytes
		    // after %%EOF
		    i = sb2.lastIndexOf("%%EOF");
		    while ((outFile.length() - oldLength + sb2.length()) % 512 != 0) {
			sb2.insert(i, '\n');
		    }
		    outFile.write(sb2.toString().getBytes(StandardCharsets.ISO_8859_1));
		    // Fix tar header
		    long diffLength = sb2.length() - oldLength;
		    tarHeaderLength(sb, 0, (int) (pdbfLength + diffLength)); // Assuming
									     // we
									     // have
									     // a
									     // pdbfFile
									     // under
									     // 4GB
		    tarHeaderChecksum(sb, 0);
		    long curPos = outFile.getFilePointer();
		    outFile.seek(von);
		    outFile.write(sb.toString().getBytes(StandardCharsets.ISO_8859_1));
		    outFile.seek(curPos);
		}
	    } while (remaining > 0);

	    ovaOrTarFile.close();
	    pdbfFile.close();
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
