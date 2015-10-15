package pdbf.tests;

import static org.junit.Assert.fail;

import java.io.File;
import java.io.IOException;

import org.apache.commons.io.FileUtils;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TestWatcher;
import org.junit.runner.Description;

import pdbf.common.Tools;

public class compileIT {
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

    public void compile(String workingDir, String documentPath) throws IOException, InterruptedException {
	ProcessBuilder pb = new ProcessBuilder("java", "-jar", baseDir + "pdbf.jar", documentPath);
	pb.directory(new File(workingDir));
	Process p = pb.start();
	p.waitFor();
	if (p.exitValue() != 0) {
	    fail();
	}
	
	ProcessBuilder pb2 = new ProcessBuilder("java", "-jar", baseDir + "pdbf.jar", documentPath);
	pb.directory(new File(workingDir));
	Process p2 = pb2.start();
	p2.waitFor();
	if (p2.exitValue() != 0) {
	    fail();
	}
    }

    @Test(timeout = 300000)
    public void compileDocumentation() throws IOException, InterruptedException {
	File f = new File(baseDir + "pdbf-doc.html");
	f.delete();
	compile(baseDir, "pdbf-doc.tex");
	if (!f.exists()) {
	    fail();
	}
    }

    @Test(timeout = 300000)
    public void compileMinimal() throws IOException, InterruptedException {
	File f = new File(baseDir + "minimal.html");
	f.delete();
	compile(baseDir, "minimal.tex");
	if (!f.exists()) {
	    fail();
	}
    }

    @Test(timeout = 300000)
    public void compileNoPDBF() throws IOException, InterruptedException {
	File f = new File(baseDir + "kein_pdbf.html");
	f.delete();
	compile(baseDir, "kein_pdbf.tex");
	if (!f.exists()) {
	    fail();
	}
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
