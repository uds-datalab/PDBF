package pdbf.common;

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
import java.util.StringTokenizer;
import java.util.zip.Deflater;
import java.util.zip.DeflaterOutputStream;
import java.util.zip.InflaterOutputStream;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.FileUtils;

import pdbf.html.CompleteRun_HTML;

public class Tools {

    public static DecimalFormat df = new DecimalFormat("0000000000");

    public static Charset utf8 = Charset.forName("UTF-8");

    public static String baseDir = new File(getBaseDir()).getParent() + File.separator;
    public static String refDir = baseDir + "src" + File.separator + "pdbf" + File.separator + "referenceImages" + File.separator;
    public static String testDir = baseDir + "src" + File.separator + "pdbf" + File.separator + "tests" + File.separator;
    public static String suffix = getOS();

    public static ArrayList<File> deleteList = new ArrayList<File>();
    public static ArrayList<Process> processes = new ArrayList<Process>();

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

    public static String getOS() {
	String OS = System.getProperty("os.name").toLowerCase();
	System.out.println(OS);
	if (OS.contains("win")) {
	    return "win";
	} else if (OS.contains("mac")) {
	    return "mac";
	} else if (OS.contains("nix") || OS.contains("nux") || OS.contains("aix")) {
	    return "unix";
	} else if (OS.contains("BSD")) {
	    return "bsd";
	} else {
	    System.err.println("Sorry, your operating system is not supported!");
	    System.exit(-1);
	    return null;
	}
    }

    public static String encodeFileToBase64Binary(File file) {
	String encodedfile = null;
	try {
	    byte[] bytes = FileUtils.readFileToByteArray(file);
	    encodedfile = Base64.encodeBase64String(bytes);
	} catch (Exception e) {
	    e.printStackTrace();
	}
	return encodedfile;
    }

    public static String encodeStringToBase64Binary(String string) throws UnsupportedEncodingException {
	return Base64.encodeBase64String(string.getBytes(utf8));
    }

    public static String escapeSpecialChars(File file) throws IOException {
	String tmp = FileUtils.readFileToString(file);
	tmp = tmp.replace("\\", "\\\\");
	tmp = tmp.replace("\"", "\\\"");
	return tmp;
    }

    public static String getBaseDir() {
	String tmp = null;

	try {
	    CodeSource codeSource = CompleteRun_HTML.class.getProtectionDomain().getCodeSource();
	    File jarFile = new File(codeSource.getLocation().toURI().getPath());
	    tmp = jarFile.getParentFile().getPath() + File.separator;
	} catch (URISyntaxException e) {
	    e.printStackTrace();
	    System.exit(-1);
	}
	return tmp;
    }

    public static String getBaseDirData() {
	String tmp = getBaseDir() + "data" + File.separator;
	return tmp;
    }

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

    public static void fixXref(StringBuilder sb, int offset) throws IOException {
	int b, e;
	// Fix xref
	if ((e = sb.lastIndexOf("/Type /XRef")) != -1) {
	    // xref stream
	    b = sb.indexOf("/W [", e) + "/W [".length();
	    e = sb.indexOf("]", b);
	    StringTokenizer stok = new StringTokenizer(sb.substring(b, e), " ");
	    int f1Len = Integer.parseInt(stok.nextToken());
	    int f2Len = Integer.parseInt(stok.nextToken());
	    int f3Len = Integer.parseInt(stok.nextToken());
	    int newlength = 4;
	    sb.replace(b, e, "" + newlength + " " + newlength + " " + newlength);
	    b = skipNewline(sb, sb.indexOf("stream", e) + "stream".length(), true);
	    e = skipNewline(sb, sb.indexOf("endstream", b), false);
	    int from = b;
	    int to = e;
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
		int bd1 = bb.getInt();
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
		int bd2 = bb.getInt();
		if (bd1 == 1) {
		    bd2 += offset;
		    bb.clear();
		    bb.putInt(bd2);
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
	    sb.replace(from, to, baos2.toString("ISO_8859_1"));
	} else {
	    // xref table
	    b = sb.lastIndexOf("\nxref\n") + "\nxref\n".length();
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
	}
	b = sb.lastIndexOf("startxref\n") + "startxref\n".length();
	e = sb.indexOf("\n", b);
	sb.replace(b, e, "" + (Integer.parseInt(sb.substring(b, e)) + offset));
    }
}
