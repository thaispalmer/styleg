# StyleG

## Description

**StyleG** is a command line tool to generate and visualize style guides for the web.

Useful for artists and developers who wants to create guides for consistent visual implementations, this tool generates a `.json` file that has all the parameters needed. And optionally it can build this data visually into a HTML file.

Currently, it has support for color palettes and font families. View [example folder](https://github.com/thoso/styleg/tree/master/examples) for more information.

## Installation

Just run `npm i -g styleg` and it'll be installed globally.

## Usage

### `styleg [options] [command] [file]`

Shows style guide in browser for a given file (defaults to styleg.json)

### Options

#### `-V, --version`

Output the version number

#### `-p, --port <port>`

Change default listen port (default: 9800)

#### `-b, --build <file>`

Build style guide into a HTML file

#### `-h, --help`

Output usage information

### Commands

#### `create [file]`

Create a new style guide file
