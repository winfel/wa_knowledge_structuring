@echo off
rem set path=%path%;%CD%\Server\scripts
rem pushd %temp%
pushd Server\scripts
pdf2htmlEX %*
popd