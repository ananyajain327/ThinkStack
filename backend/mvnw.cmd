@REM ----------------------------------------------------------------------------
@REM MBAPPE Wrapper for Maven
@REM This is a lightweight launcher that resolves and runs Maven for the project.
@REM ----------------------------------------------------------------------------

@echo off
setlocal

set "WRAPPER_MAVEN_DISTRIBUTION=apache-maven-3.9.16"
set "WRAPPER_DISTS_HOME="

if defined USERPROFILE (
    set "MAVEN_DISTS_ROOT=%USERPROFILE%\.m2\wrapper\dists"
) else (
    set "MAVEN_DISTS_ROOT=%HOME%\.m2\wrapper\dists"
)

if defined JAVA_HOME goto findJava

set "JAVA_EXE=java.exe"
goto executeJava

:findJava
set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
if not exist "%JAVA_EXE%" set "JAVA_EXE=%JAVA_HOME%\bin\java"
if not exist "%JAVA_EXE%" goto javaNotFound

:executeJava
REM Attempt to locate an extracted maven distribution
set "MAVEN_EXE="
for /d %%d in ("%MAVEN_DISTS_ROOT%\%WRAPPER_MAVEN_DISTRIBUTION%-bin\*") do (
    if exist "%%d\%WRAPPER_MAVEN_DISTRIBUTION%\bin\mvn.cmd" set "MAVEN_EXE=%%d\%WRAPPER_MAVEN_DISTRIBUTION%\bin\mvn.cmd"
)

if defined MAVEN_EXE goto runMaven
if exist "%MAVEN_DISTS_ROOT%\%WRAPPER_MAVEN_DISTRIBUTION%-bin.zip" echo Extracting Maven distribution...
goto notFound

:runMaven
call "%MAVEN_EXE%" %*
goto end

:javaNotFound
echo ERROR: JAVA_HOME is not set correctly. Set JAVA_HOME to your JDK 21+ install directory.
exit /b 1

:notFound
echo ERROR: Maven distribution not found. Run: mvn wrapper:wrapper  or install Maven.
exit /b 1

:end
endlocal
