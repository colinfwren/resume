#!/bin/bash
# curl --list-only -u $USER:$PASS ftp://$HOST
# Upload html
curl --ftp-create-dirs -T out/resume.pdf.html -u $USER:$PASS ftp://$HOST/$DIRECTORY/index.html
# Upload PDF
curl --ftp-create-dirs -T out/resume.pdf -u $USER:$PASS ftp://$HOST/$DIRECTORY/docs/CV.pdf
