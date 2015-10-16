package pdbf.tests;

import static org.junit.Assert.fail;

import java.awt.image.BufferedImage;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;

import org.apache.commons.io.FileUtils;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TestWatcher;
import org.junit.runner.Description;

import pdbf.common.Tools;

public class CompileAndCheckIT {
    // TODO: write test for database with ugly "\"values\""

    @Rule
    public TimeTestWatcher watcher = new TimeTestWatcher();

    public class TimeTestWatcher extends TestWatcher {
	private long startTime;

	protected void starting(Description description) {
	    startTime = System.currentTimeMillis();
	}

	protected void finished(Description description) {
	    long elapsed = System.currentTimeMillis() - startTime;
	    String testName = description.getMethodName();
	    System.out.println(String.format("Test %s took %d ms.", testName, elapsed));
	}
    };

    private static String baseDir = new File(Tools.getBaseDir()).getParent() + File.separator;

    public static boolean compareImages(BufferedImage i1, BufferedImage i2) {
	int height = i1.getHeight();
	int width = i1.getWidth();
	if (height != i2.getHeight()) {
	    return false;
	}
	if (width != i2.getWidth()) {
	    return false;
	}
	int sum = 0;
	for (int y = 0; y < height; y++) {
	    for (int x = 0; x < width; x++) {
		int color1 = i1.getRGB(x, y);
		int color2 = i2.getRGB(x, y);
		int r1 = (color1 & 0xFF0000) >> 16;
	    	int r2 = (color2 & 0xFF0000) >> 16;
	    	int g1 = (color1 & 0x00FF00) >> 8;
	    	int g2 = (color2 & 0x00FF00) >> 8;
	    	int b1 = (color1 & 0x0000FF);
	    	int b2 = (color2 & 0x0000FF);
	    	sum += Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
	    }
	}
	double n = width * height * 3;
    	double p = sum / n / 255.0;
	System.out.println(p);
	return true;
    }
    
    public static void compile(String workingDir, String documentName) throws IOException, InterruptedException {
	ProcessBuilder pb = new ProcessBuilder("java", "-jar", baseDir + "pdbf.jar", documentName);
	pb.directory(new File(workingDir));
	pb.inheritIO();
	Process p = pb.start();
	p.waitFor();
	if (p.exitValue() != 0) {
	    fail();
	}
    }

    public static void check(String workingDir, String documentName) throws IOException, InterruptedException {
	CreateReferencePictures.processes.clear();
	CreateReferencePictures.deleteList.clear();
	// Create current images
	CreateReferencePictures.getReferencePictures(workingDir, documentName, baseDir);
	for (Process p : CreateReferencePictures.processes) {
	    p.waitFor();
	    if (p.exitValue() != 0) {
		throw new IllegalStateException();
	    }
	}
	for (File f : CreateReferencePictures.deleteList) {
	    f.delete();
	}
	// Compare current images to reference images
	File dir = new File(baseDir);
	for(File file : dir.listFiles()) {
	    if(file.getName().startsWith(documentName)) {
		BufferedImage i1 = ImageIO.read(file);
		BufferedImage i2 = ImageIO.read(new File(baseDir + "src" + File.separator + "pdbf" + File.separator + "referenceImages" + File.separator + file.getName()));
		if (!compareImages(i1, i2)) {
		    fail();
		}
		file.delete();
	    }
	}
    }

    @Test(timeout = 600000)
    public void compileAndCheckDocumentation() throws IOException, InterruptedException {
	File f = new File(baseDir + "pdbf-doc.html");
	f.delete();
	compile(baseDir, "pdbf-doc.tex");
	if (!f.exists()) {
	    fail();
	}
	check(baseDir, "pdbf-doc.html");
    }

    @Test(timeout = 600000)
    public void compileAndCheckMinimal() throws IOException, InterruptedException {
	File f = new File(baseDir + "minimal.html");
	f.delete();
	compile(baseDir, "minimal.tex");
	if (!f.exists()) {
	    fail();
	}
	check(baseDir, "minimal.html");
    }

    @Test(timeout = 600000)
    public void compileAndCheckNoPDBF() throws IOException, InterruptedException {
	File f = new File(baseDir + "src" + File.separator + "pdbf" + File.separator + "tests" + File.separator + "no_pdbf.html");
	f.delete();
	compile(baseDir + "src" + File.separator + "pdbf" + File.separator + "tests" + File.separator, "no_pdbf.tex");
	if (!f.exists()) {
	    fail();
	}
	check(baseDir + "src" + File.separator + "pdbf" + File.separator + "tests" + File.separator, "no_pdbf.html");
    }

    @Test(timeout = 300000)
    public void compileMinimalOtherDir() throws IOException, InterruptedException {
	// Create Folder and copy tex file
	String otherFolder = baseDir + "otherFolder" + File.separator;
	new File(otherFolder).mkdirs();
	FileUtils.copyFile(new File(baseDir + "minimal.tex"), new File(otherFolder + "minimal.tex"));

	compile(otherFolder, "minimal.tex");
	if (!new File(otherFolder + "minimal.html").exists()) {
	    fail();
	}

	// Delete test folder and contents
	FileUtils.deleteDirectory(new File(otherFolder));
    }

}
