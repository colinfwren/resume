#!/bin/bash
# curl --list-only -u $USER:$PASS ftp://$HOST
# Upload html
curl --ftp-create-dirs -T out/resume.pdf.html -u $FTP_USER:$FTP_PASS ftp://$FTP_HOST/$FTP_DIRECTORY/index.html
# Upload PDF
curl --ftp-create-dirs -T out/resume.pdf -u $FTP_USER:$FTP_PASS ftp://$FTP_HOST/$FTP_DIRECTORY/docs/CV.pdf
