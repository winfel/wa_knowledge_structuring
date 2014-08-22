@echo off
call :GETTEMPNAME
call npm prefix > "%TMPFILE%"
pushd < "%TMPFILE%"
call npm link
popd

del "%TMPFILE%"

rem goto :EOF


rem #########################################
rem #  These lines could install wkhtmltox  #
rem #########################################
if %PROCESSOR_ARCHITECTURE%=="AMD64" (
call :DOWNLOADFILE "http://downloads.sourceforge.net/project/wkhtmltopdf/0.12.1/wkhtmltox-0.12.1_msvc2013-win64.exe?r=&ts=1408704982&use_mirror=garr" wkhtmltox_setup.exe
) else (
call :DOWNLOADFILE "http://downloads.sourceforge.net/project/wkhtmltopdf/0.12.1/wkhtmltox-0.12.1_msvc2013-win32.exe?r=&ts=1408704982&use_mirror=garr" wkhtmltox_setup.exe
)
call wkhtmltox_setup.exe /S
del wkhtmltox_setup.exe

rem ######################
rem #  Helper functions  #
rem ######################
goto :EOF

:DOWNLOADFILE
bitsadmin /transfer Download %1 %CD%\%2
goto :EOF

:GETTEMPNAME
set TMPFILE=%TMP%\mytempfile-%RANDOM%.tmp
if exist "%TMPFILE%" GOTO :GETTEMPNAME
goto :EOF
