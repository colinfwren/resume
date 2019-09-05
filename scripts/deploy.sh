#!/bin/bash
# curl --list-only -u $USER:$PASS ftp://$HOST
# Upload html
curl --ftp-create-dirs -T out/resume.html -u $FTP_USER:$FTP_PASS ftp://$FTP_HOST/$FTP_DIRECTORY/awesome/index.html
# Upload PDF
curl --ftp-create-dirs -T out/CV.pdf -u $FTP_USER:$FTP_PASS ftp://$FTP_HOST/$FTP_DIRECTORY/docs/CV.pdf
# Upload LinkedIn Changes
curl --ftp-create-dirs -T out/linkedin-changes.html -u $FTP_USER:$FTP_PASS ftp://$FTP_HOST/$FTP_DIRECTORY/docs/linkedin-changes.html
