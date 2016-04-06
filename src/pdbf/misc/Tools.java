package pdbf.misc;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;
import java.nio.ByteBuffer;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.security.CodeSource;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.Deflater;
import java.util.zip.DeflaterOutputStream;
import java.util.zip.InflaterOutputStream;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.FileUtils;

import pdbf.PDBF_Compiler;

/*
 * Useful functions
 */
public class Tools {

    public static DecimalFormat df = new DecimalFormat("0000000000");

    public static Charset utf8 = Charset.forName("UTF-8");

    public static String baseDir = getBaseDir();
    public static String testDir = baseDir + "src" + File.separator + "pdbf" + File.separator + "tests" + File.separator;
    public static String suffix = getOS();

    public static ArrayList<File> deleteList = new ArrayList<File>();
    public static ArrayList<Process> processes = new ArrayList<Process>();

    /*
     * Helper function of fixXref. Skips all \n and \r characters in a
     * stringbuilder either in forward or backward direction
     */
    public static int skipNewline(StringBuilder sb, int i, boolean forward) {
	if (i == -1) {
	    return -1;
	}
	if (!forward) {
	    --i;
	}
	while (sb.charAt(i) == '\n' || sb.charAt(i) == '\r') {
	    i = forward ? i + 1 : i - 1;
	}
	return forward ? i : i + 1;
    }

    /*
     * Check if operating system is supported and return corresponding short
     * name of the OS
     */
    public static String getOS() {
	String OS = System.getProperty("os.name").toLowerCase();
	if (OS.contains("win")) {
	    return "win";
	} else if (OS.contains("mac")) {
	    return "mac";
	} else if (OS.contains("nix") || OS.contains("nux") || OS.contains("aix")) {
	    return "unix";
	} else if (OS.contains("bsd")) {
	    return "bsd";
	} else {
	    System.err.println("Sorry, your operating system is not supported!");
	    System.exit(1);
	    return null;
	}
    }

    /*
     * Converts a file to a base64 encoded string
     */
    public static String encodeFileToBase64Binary(File file) {
	String encodedfile = null;
	try {
	    byte[] bytes = FileUtils.readFileToByteArray(file);
	    encodedfile = Base64.encodeBase64String(bytes);
	} catch (Exception e) {
	    e.printStackTrace();
	    System.exit(1);
	}
	return encodedfile;
    }

    /*
     * Converts a string to a base64 encoded string
     */
    public static String encodeStringToBase64Binary(String string) throws UnsupportedEncodingException {
	return Base64.encodeBase64String(string.getBytes(utf8));
    }

    /*
     * Reads a file and escapes \ to \\ and then " to \"
     */
    // TODO: check if this function is needed
    public static String escapeSpecialChars(File file) throws IOException {
	String tmp = FileUtils.readFileToString(file);
	tmp = tmp.replace("\\", "\\\\");
	tmp = tmp.replace("\"", "\\\"");
	return tmp;
    }

    /*
     * Returns the directory in which pdbf.jar resides
     */
    public static String getBaseDir() {
	String tmp = null;

	try {
	    CodeSource codeSource = PDBF_Compiler.class.getProtectionDomain().getCodeSource();
	    File jarFile = new File(codeSource.getLocation().toURI().getPath());
	    tmp = jarFile.getParentFile().getPath() + File.separator;
	} catch (URISyntaxException e) {
	    e.printStackTrace();
	    System.exit(1);
	}
	return tmp;
    }

    /*
     * Returns the directory in which javascript files for PDBF files reside
     * (data/)
     */
    public static String getBaseDirData() {
	String tmp = getBaseDir() + "data" + File.separator;
	return tmp;
    }

    /*
     * Run a javascript file with phantomjs
     */
    public static void runJsFile(String jsName, String htmlDir, String htmlName, String workingDir) throws IOException, InterruptedException {
	String phantomjs = baseDir + "external-tools" + File.separator + "phantomjs-" + suffix;
	String script = testDir + jsName;
	boolean delete = true;

	File destFile = new File(workingDir + File.separator + htmlName);
	try {
	    FileUtils.copyFile(new File(htmlDir + htmlName), destFile);
	} catch (Exception e) {
	    delete = false;
	}
	ProcessBuilder pb = new ProcessBuilder(phantomjs, script, htmlName, workingDir);
	pb.directory(new File(workingDir));
	pb.inheritIO();
	Process p = pb.start();

	Tools.processes.add(p);
	if (delete) {
	    Tools.deleteList.add(destFile);
	}
    }

    /*
     * Repairs the XREF table of our polyglot PDBF file
     */
    public static boolean fixXref(StringBuilder sb, long offset) {
	try {
	    Pattern p3 = Pattern.compile("/Type /XRef(?: ?\r| ?\n|\r\n).*?(?: ?\r| ?\n|\r\n)stream(?: ?\r| ?\n|\r\n).*?(?: ?\r| ?\n|\r\n)endstream(?: ?\r| ?\n|\r\n).*?startxref(?: ?\r| ?\n|\r\n)(\\d+)(?: ?\r| ?\n|\r\n)%*EOF(?: ?\r| ?\n|\r\n)*$", Pattern.DOTALL);
	    Matcher m3 = p3.matcher(sb);
	    if (m3.find()) {
		int b, e;
		int start;
		int end;
		if ((start = e = sb.lastIndexOf("/Type /XRef")) != -1) {
		    end = sb.indexOf("endstream", start) + "endstream".length();
		    // xref stream
		    // TODO: If the first element is zero, the type field shall
		    // not be present, and shall default to type 1.
		    Pattern p = Pattern.compile("/W \\[(\\d+) (\\d+) (\\d+)\\]");
		    Matcher m = p.matcher(sb.toString()).region(start, end);
		    m.find();
		    int f1Len = Integer.parseInt(m.group(1));
		    int f2Len = Integer.parseInt(m.group(2));
		    int f3Len = Integer.parseInt(m.group(3));
		    int newlength = 8;
		    sb.replace(m.start(1), m.end(3), "" + newlength + " " + newlength + " " + newlength);
		    b = skipNewline(sb, sb.indexOf("stream", start) + "stream".length(), true);
		    e = skipNewline(sb, sb.indexOf("endstream", start), false);
		    int from = b;
		    int to = e;
		    // TODO: if /Filter /FlateDecode is missing we dont need to
		    // inflate/deflate
		    ByteArrayOutputStream baos = new ByteArrayOutputStream();
		    InflaterOutputStream ios = new InflaterOutputStream(baos);
		    ios.write(sb.substring(b, e).getBytes(StandardCharsets.ISO_8859_1));
		    ios.close();
		    baos.close();
		    ByteArrayInputStream bais = new ByteArrayInputStream(baos.toByteArray());

		    ByteArrayOutputStream baos2 = new ByteArrayOutputStream();
		    DeflaterOutputStream dos = new DeflaterOutputStream(baos2, new Deflater(7, false));

		    ByteBuffer bb = ByteBuffer.allocate(newlength);
		    while (bais.available() > 0) {
			for (int i = 0; i < newlength; ++i) {
			    if (i >= newlength - f1Len) {
				bb.put((byte) bais.read());
			    } else {
				bb.put((byte) 0);
			    }
			}
			bb.rewind();
			long bd1 = bb.getLong();
			dos.write(bb.array(), 0, newlength);
			bb.clear();
			for (int i = 0; i < newlength; ++i) {
			    if (i >= newlength - f2Len) {
				bb.put((byte) bais.read());
			    } else {
				bb.put((byte) 0);
			    }
			}
			bb.rewind();
			long bd2 = bb.getLong();
			if (bd1 == 1) {
			    bd2 += offset;
			    bb.clear();
			    bb.putLong(bd2);
			}
			dos.write(bb.array(), 0, newlength);
			bb.clear();
			for (int i = 0; i < newlength; ++i) {
			    if (i >= newlength - f3Len) {
				bb.put((byte) bais.read());
			    } else {
				bb.put((byte) 0);
			    }
			}
			dos.write(bb.array(), 0, newlength);
			bb.clear();
		    }
		    baos.close();
		    dos.close();
		    String newxref = baos2.toString("ISO_8859_1");
		    sb.replace(from, to, newxref);
		    p = Pattern.compile("/Length (\\d+)");
		    m = p.matcher(sb.toString()).region(start, end);
		    m.find();
		    sb.replace(m.start(1), m.end(1), Integer.toString(newxref.length()));

		    m3 = p3.matcher(sb);
		    m3.find();
		    long x = Long.parseLong(m3.group(1));
		    sb.replace(m3.start(1), m3.end(1), "" + (x + offset));
		    return true;
		}
	    }

	    // Fix classical xref
	    Pattern p = Pattern
		    .compile("((?: ?\r| ?\n|\r\n)xref(?: ?\r| ?\n|\r\n).*?)((?:\\d{10,10} \\d{5,5} [nf](?: \r| \n|\r\n))+)(.*?(?: ?\r| ?\n|\r\n)startxref(?: ?\r| ?\n|\r\n))(\\d+)((?: ?\r| ?\n|\r\n)%*EOF(?: ?\r| ?\n|\r\n)*)$", Pattern.DOTALL);
	    Matcher m = p.matcher(sb);
	    if (m.find()) {
		// xref table
		long x;
		// skip first entry
		Pattern p2 = Pattern.compile("(\\d{10,10}) \\d{5,5}");
		Matcher m2 = p2.matcher(sb).region(m.start(2), m.end(2));
		m2.find();
		while (m2.find()) {
		    x = Long.parseLong(m2.group(1));
		    sb.replace(m2.start(1), m2.end(1), df.format(x + offset));
		}
		x = Long.parseLong(m.group(4));
		sb.replace(m.start(4), m.end(4), "" + (x + offset));
		return true;
	    }
	} catch (Exception e) {
	    System.err.println("Fix XREF failed!");
	    e.printStackTrace();
	    System.exit(1);
	}
	return false;
    }
}
