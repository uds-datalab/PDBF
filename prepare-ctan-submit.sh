#!/bin/sh
git pull
find . -exec file {} \; | grep CRLF
read -p "Continue?" yn
cd ..
cp -R PDBF pdbf-toolkit
cd pdbf-toolkit
rm -f -R .git
rm -f -R referenceImages
rm -f -R .gitignore
rm -f -R data/.gitignore
rm -f -R prepare-ctan-submit.sh
rm -f -R index.html
zip -r -9 pdbf-src src pom.xml
rm -f -R src
rm -f pom.xml
cd ..
zip -r -9 pdbf-toolkit pdbf-toolkit 
rm -f -R pdbf-toolkit


