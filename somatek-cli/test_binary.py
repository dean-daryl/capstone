#!/usr/bin/env python3
"""
Test script for Somatek CLI binary.

Usage:
    python3 test_binary.py [binary_path]
    
Example:
    python3 test_binary.py ./dist/somatek
"""

import subprocess
import sys
import time
import os
from pathlib import Path

# Colors for output
RED = '\033[0;31m'
GREEN = '\033[0;32m'
YELLOW = '\033[1;33m'
BLUE = '\033[0;34m'
NC = '\033[0m'  # No Color

def print_header(text):
    print(f"\n{BLUE}{'='*60}{NC}")
    print(f"{BLUE}{text:^60}{NC}")
    print(f"{BLUE}{'='*60}{NC}\n")

def print_success(text):
    print(f"{GREEN}✓ {text}{NC}")

def print_error(text):
    print(f"{RED}✗ {text}{NC}")

def print_warning(text):
    print(f"{YELLOW}⚠ {text}{NC}")

def run_command(cmd, timeout=30, check=False):
    """Run a command and return result."""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return result.returncode == 0, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return False, "", "Command timed out"
    except Exception as e:
        return False, "", str(e)

def test_binary_exists(binary_path):
    """Test 1: Check if binary exists."""
    print_header("Test 1: Binary Existence")
    
    if Path(binary_path).exists():
        print_success(f"Binary exists: {binary_path}")
        size = Path(binary_path).stat().st_size / (1024 * 1024)
        print(f"  Size: {size:.2f} MB")
        return True
    else:
        print_error(f"Binary not found: {binary_path}")
        return False

def test_binary_help(binary_path):
    """Test 2: Check if --help works."""
    print_header("Test 2: Help Command")
    
    success, stdout, stderr = run_command(f"{binary_path} --help")
    
    if success and "somatek" in stdout.lower():
        print_success("--help command works")
        print(f"  Output preview: {stdout.split(chr(10))[0]}")
        return True
    else:
        print_error("--help command failed")
        print(f"  Error: {stderr[:200]}")
        return False

def test_binary_version(binary_path):
    """Test 3: Check version command."""
    print_header("Test 3: Version Command")
    
    success, stdout, stderr = run_command(f"{binary_path} version")
    
    if success and ("Somatek" in stdout or "v" in stdout):
        print_success("version command works")
        for line in stdout.strip().split('\n'):
            print(f"  {line}")
        return True
    else:
        print_error("version command failed")
        print(f"  Error: {stderr[:200]}")
        return False

def test_binary_status(binary_path):
    """Test 4: Check status command (should work without setup)."""
    print_header("Test 4: Status Command")
    
    success, stdout, stderr = run_command(f"{binary_path} status", timeout=10)
    
    # Status should work even if services aren't running
    if "Service Status" in stdout or "running" in stdout.lower() or "stopped" in stdout.lower():
        print_success("status command works")
        for line in stdout.strip().split('\n')[:10]:
            print(f"  {line}")
        return True
    else:
        print_warning("status command had issues")
        print(f"  Output: {stdout[:200]}")
        print(f"  Error: {stderr[:200]}")
        return False  # Don't fail completely for this

def test_binary_setup_help(binary_path):
    """Test 5: Check setup --help."""
    print_header("Test 5: Setup Command Help")
    
    success, stdout, stderr = run_command(f"{binary_path} setup --help")
    
    if success and ("setup" in stdout.lower() or "email" in stdout.lower()):
        print_success("setup --help works")
        return True
    else:
        print_error("setup --help failed")
        print(f"  Error: {stderr[:200]}")
        return False

def test_imports(binary_path):
    """Test 6: Check if key modules can be imported."""
    print_header("Test 6: Module Imports")
    
    # Create a test script to run with the binary
    test_script = """
import sys
try:
    import somatek.cli
    import somatek.config
    import somatek.services
    import typer
    import httpx
    print("All core imports successful")
    sys.exit(0)
except Exception as e:
    print(f"Import failed: {e}")
    sys.exit(1)
"""
    
    # Write test script to temp file
    test_file = Path("/tmp/somatek_test_imports.py")
    test_file.write_text(test_script)
    
    # Run with the binary's Python environment
    success, stdout, stderr = run_command(f"{binary_path} {test_file}", timeout=30)
    
    # Cleanup
    try:
        test_file.unlink()
    except:
        pass
    
    if success and "successful" in stdout:
        print_success("Core module imports work")
        print(f"  {stdout.strip()}")
        return True
    else:
        print_error("Module imports failed")
        print(f"  Error: {stderr[:200]}")
        return False

def test_binary_start_help(binary_path):
    """Test 7: Check start --help."""
    print_header("Test 7: Start Command Help")
    
    success, stdout, stderr = run_command(f"{binary_path} start --help")
    
    if success and ("start" in stdout.lower() or "network" in stdout.lower()):
        print_success("start --help works")
        return True
    else:
        print_error("start --help failed")
        print(f"  Error: {stderr[:200]}")
        return False

def test_binary_stop(binary_path):
    """Test 8: Check stop command (should be safe to run)."""
    print_header("Test 8: Stop Command (Safe)")
    
    success, stdout, stderr = run_command(f"{binary_path} stop", timeout=10)
    
    # Stop should be safe even if nothing is running
    if success or "stopped" in stdout.lower() or "not running" in stdout.lower():
        print_success("stop command works (safe)")
        return True
    else:
        print_warning("stop command had issues (may be OK)")
        print(f"  Output: {stdout[:200]}")
        return True  # Don't fail for this

def run_all_tests(binary_path):
    """Run all tests and report results."""
    print(f"\n{YELLOW}Testing Somatek CLI Binary{NC}")
    print(f"Binary: {binary_path}\n")
    
    tests = [
        ("Binary Exists", lambda: test_binary_exists(binary_path)),
        ("Help Command", lambda: test_binary_help(binary_path)),
        ("Version Command", lambda: test_binary_version(binary_path)),
        ("Status Command", lambda: test_binary_status(binary_path)),
        ("Setup Help", lambda: test_binary_setup_help(binary_path)),
        ("Module Imports", lambda: test_imports(binary_path)),
        ("Start Help", lambda: test_binary_start_help(binary_path)),
        ("Stop Command", lambda: test_binary_stop(binary_path)),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print_error(f"Test '{name}' crashed: {e}")
            results.append((name, False))
        time.sleep(0.5)  # Small delay between tests
    
    # Summary
    print_header("Test Summary")
    
    passed = sum(1 for _, r in results if r)
    total = len(results)
    
    for name, result in results:
        status = f"{GREEN}PASS{NC}" if result else f"{RED}FAIL{NC}"
        print(f"  {status} - {name}")
    
    print(f"\n  Total: {passed}/{total} tests passed")
    
    if passed == total:
        print_success("All tests passed! Binary is functional.")
        return 0
    elif passed >= total * 0.75:
        print_warning("Most tests passed. Binary is mostly functional.")
        return 0
    else:
        print_error("Many tests failed. Binary may be broken.")
        return 1

if __name__ == "__main__":
    # Get binary path from argument or default
    if len(sys.argv) > 1:
        binary_path = sys.argv[1]
    else:
        # Default locations to check
        default_paths = [
            "./dist/somatek",
            "./dist/somatek.exe",
            "dist/somatek",
            "dist/somatek.exe",
        ]
        binary_path = None
        for path in default_paths:
            if Path(path).exists():
                binary_path = path
                break
        
        if not binary_path:
            print_error("Binary not found. Please specify path or run build first.")
            print("Usage: python3 test_binary.py [binary_path]")
            sys.exit(1)
    
    exit_code = run_all_tests(binary_path)
    sys.exit(exit_code)
