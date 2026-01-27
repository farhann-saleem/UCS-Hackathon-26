#!/usr/bin/env python3
"""CheckMate CLI - Security vulnerability scanner with human-in-the-loop feedback."""

import os
import sys
import subprocess
import webbrowser
import time
from pathlib import Path

import click
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich import box

from checkmate.scanner import scan_file, scan_directory, save_results, reset_data, get_whitelist

console = Console()

# Get the root directory (parent of checkmate package)
PACKAGE_DIR = Path(__file__).parent
ROOT_DIR = PACKAGE_DIR.parent
BACKEND_DIR = ROOT_DIR / "backend"
DASHBOARD_DIR = ROOT_DIR / "dashboard"


@click.group()
@click.version_option(version="1.0.0", prog_name="CheckMate")
def cli():
    """♞ CheckMate - AI Code Security Scanner with Human Feedback"""
    pass


@cli.command()
@click.argument("path", type=click.Path(exists=True))
@click.option("--output", "-o", help="Output format: table, json", default="table")
def scan(path, output):
    """Scan a file or directory for security vulnerabilities."""
    console.print(Panel.fit(
        "[bold green]♞ CheckMate Scanner[/bold green]",
        subtitle="Detecting vulnerabilities..."
    ))

    path = Path(path)

    try:
        if path.is_file():
            console.print(f"Scanning file: [cyan]{path}[/cyan]")
            flags = scan_file(str(path))
        else:
            console.print(f"Scanning directory: [cyan]{path}[/cyan]")
            flags = scan_directory(str(path))

        # Save results
        results = save_results(flags, str(path))

        if output == "json":
            import json
            console.print_json(json.dumps(results, indent=2))
        else:
            display_results(flags, results)

    except Exception as e:
        console.print(f"[red]Error:[/red] {e}")
        sys.exit(1)


def display_results(flags, results):
    """Display scan results in a formatted table."""
    summary = results.get("summary", {})

    # Summary panel
    summary_text = (
        f"[red]Critical: {summary.get('critical', 0)}[/red] | "
        f"[yellow]Danger: {summary.get('danger', 0)}[/yellow] | "
        f"[blue]High Risk: {summary.get('high_risk', 0)}[/blue]"
    )
    console.print(Panel(summary_text, title="Scan Summary", expand=False))

    if not flags:
        console.print("[green]✓ No vulnerabilities detected![/green]")
        return

    # Flags table
    table = Table(title="Detected Vulnerabilities", box=box.ROUNDED)
    table.add_column("Severity", style="bold")
    table.add_column("Rule", style="cyan")
    table.add_column("Line", justify="right")
    table.add_column("Issue", style="white", max_width=50)

    severity_colors = {
        "critical": "red",
        "danger": "yellow",
        "high_risk": "blue",
    }

    for flag in flags:
        color = severity_colors.get(flag.severity, "white")
        table.add_row(
            f"[{color}]{flag.severity.upper()}[/{color}]",
            flag.rule_id,
            str(flag.line_number),
            flag.explanation[:50] + "..." if len(flag.explanation) > 50 else flag.explanation,
        )

    console.print(table)
    console.print(f"\n[dim]Results saved. Run [bold]checkmate dashboard[/bold] to review and provide feedback.[/dim]")


@cli.command()
def dashboard():
    """Start the CheckMate dashboard (server + web UI)."""
    console.print(Panel.fit(
        "[bold green]♞ CheckMate Dashboard[/bold green]",
        subtitle="Starting server and dashboard..."
    ))

    # Check if backend directory exists
    if not BACKEND_DIR.exists():
        console.print("[red]Error: Backend directory not found at {BACKEND_DIR}[/red]")
        sys.exit(1)

    # Start FastAPI server (using backend)
    console.print("[cyan]Starting API server on port 8001...[/cyan]")
    server_process = subprocess.Popen(
        ["python", "main.py"],
        cwd=BACKEND_DIR,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    time.sleep(2)  # Give server time to start

    # Start Next.js dashboard
    console.print("[cyan]Starting dashboard on port 3000...[/cyan]")
    dashboard_process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=DASHBOARD_DIR,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    time.sleep(3)  # Give dashboard time to start

    # Open browser
    console.print("[green]Opening dashboard in browser...[/green]")
    webbrowser.open("http://localhost:3000")

    console.print(Panel(
        "[bold]Dashboard is running![/bold]\n\n"
        "API Server: http://localhost:8001\n"
        "Dashboard:  http://localhost:3000\n\n"
        "[dim]Press Ctrl+C to stop[/dim]",
        title="♞ CheckMate",
        expand=False,
    ))

    try:
        # Keep running until interrupted
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        console.print("\n[yellow]Shutting down...[/yellow]")
        server_process.terminate()
        dashboard_process.terminate()
        console.print("[green]Goodbye![/green]")


@cli.command()
def whitelist():
    """Show current whitelist patterns."""
    console.print(Panel.fit(
        "[bold green]♞ CheckMate Whitelist[/bold green]",
        subtitle="Patterns marked as safe"
    ))

    patterns = get_whitelist()

    if not patterns:
        console.print("[dim]No patterns whitelisted yet.[/dim]")
        console.print("[dim]Mark flags as safe in the dashboard to add patterns.[/dim]")
        return

    table = Table(title="Whitelisted Patterns", box=box.ROUNDED)
    table.add_column("#", style="dim")
    table.add_column("Pattern", style="cyan")

    for i, pattern in enumerate(patterns, 1):
        table.add_row(str(i), pattern)

    console.print(table)


@cli.command()
@click.confirmation_option(prompt="Are you sure you want to reset all data?")
def reset():
    """Reset all scan data, feedback, and whitelist."""
    console.print("[yellow]Resetting all data...[/yellow]")
    reset_data()
    console.print("[green]✓ All data has been reset![/green]")


@cli.command()
def version():
    """Show version information."""
    console.print(Panel(
        "[bold green]♞ CheckMate[/bold green]\n"
        "Version: 1.0.0\n"
        "AI Code Security Scanner with Human-in-the-Loop Feedback",
        expand=False,
    ))


if __name__ == "__main__":
    cli()
